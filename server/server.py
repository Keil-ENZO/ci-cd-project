import mysql.connector
import os
import datetime

import bcrypt
import jwt
from fastapi import FastAPI, HTTPException, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

app = FastAPI()
origins = ["*"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

JWT_SECRET = os.getenv("JWT_SECRET", "dev-secret-change-me")
JWT_ALGORITHM = "HS256"
JWT_EXP_HOURS = 12


# ----- Connexion MySQL (paresseuse, compatible serverless + Aiven SSL) -----
_conn = None
_initialized = False


def get_conn():
    """Ouvre (ou réutilise) la connexion MySQL. Reconnecte si elle est tombée.

    On laisse le SSL au comportement par défaut du connecteur (TLS négocié si le
    serveur le supporte) : indispensable pour l'auth caching_sha2_password de
    MySQL 9.x en local, et fonctionne aussi avec Aiven (TLS requis).
    """
    global _conn
    if _conn is not None:
        try:
            if _conn.is_connected():
                return _conn
        except mysql.connector.Error:
            pass

    _conn = mysql.connector.connect(
        host=os.getenv("MYSQL_HOST"),
        port=int(os.getenv("MYSQL_PORT", "3306")),
        user=os.getenv("MYSQL_USER"),
        # MYSQL_PASSWORD en prod (Aiven) ; MYSQL_ROOT_PASSWORD en local (Docker).
        password=os.getenv("MYSQL_PASSWORD") or os.getenv("MYSQL_ROOT_PASSWORD"),
        database=os.getenv("MYSQL_DATABASE"),
        connection_timeout=10,
    )
    return _conn


def seed_admin(conn):
    """Crée le compte admin depuis les variables d'environnement si absent."""
    email = os.getenv("ADMIN_EMAIL")
    password = os.getenv("ADMIN_PASSWORD")
    if not email or not password:
        print("ADMIN_EMAIL / ADMIN_PASSWORD not set, skipping admin seed")
        return

    cursor = conn.cursor()
    cursor.execute("SELECT id FROM users WHERE mail = %s", (email,))
    if cursor.fetchone() is None:
        hashed = bcrypt.hashpw(password.encode(), bcrypt.gensalt()).decode()
        cursor.execute(
            "INSERT INTO users (nom, prenom, mail, birth, ville, cp, password, is_admin) "
            "VALUES (%s, %s, %s, %s, %s, %s, %s, 1)",
            ("Fenoll", "Loise", email, "1990-01-01", "Paris", "00000", hashed),
        )
        conn.commit()
        print(f"Admin account created: {email}")
    else:
        print(f"Admin account already exists: {email}")
    cursor.close()


def init_db():
    """Crée le schéma si besoin puis seed l'admin (une seule fois par process)."""
    global _initialized
    if _initialized:
        return
    conn = get_conn()
    cursor = conn.cursor()
    cursor.execute(
        """
        CREATE TABLE IF NOT EXISTS users(
          id int AUTO_INCREMENT PRIMARY KEY,
          nom varchar(50) NOT NULL,
          prenom varchar(50) NOT NULL,
          mail varchar(100) NOT NULL UNIQUE,
          birth date NOT NULL,
          ville varchar(50) NOT NULL,
          cp varchar(5) NOT NULL,
          password varchar(255) NULL,
          is_admin tinyint(1) NOT NULL DEFAULT 0
        )
        """
    )
    conn.commit()

    # Bases plus anciennes (ex: ancien volume Docker) : ajoute les colonnes manquantes.
    for ddl in (
        "ALTER TABLE users ADD COLUMN password varchar(255) NULL",
        "ALTER TABLE users ADD COLUMN is_admin tinyint(1) NOT NULL DEFAULT 0",
    ):
        try:
            cursor.execute(ddl)
            conn.commit()
        except mysql.connector.Error:
            conn.rollback()
    cursor.close()

    seed_admin(conn)
    _initialized = True


def db():
    """Connexion prête à l'emploi pour les endpoints (init garantie une fois)."""
    init_db()
    return get_conn()


# ----- Auth helpers -----
security = HTTPBearer(auto_error=False)


class LoginRequest(BaseModel):
    mail: str
    password: str


def create_token(user_id: int, mail: str) -> str:
    payload = {
        "sub": str(user_id),
        "mail": mail,
        "exp": datetime.datetime.utcnow() + datetime.timedelta(hours=JWT_EXP_HOURS),
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)


def require_admin(credentials: HTTPAuthorizationCredentials = Depends(security)):
    if credentials is None:
        raise HTTPException(status_code=401, detail="Token manquant")
    try:
        payload = jwt.decode(credentials.credentials, JWT_SECRET, algorithms=[JWT_ALGORITHM])
    except jwt.PyJWTError:
        raise HTTPException(status_code=401, detail="Token invalide ou expiré")

    cursor = db().cursor(dictionary=True)
    cursor.execute("SELECT id, is_admin FROM users WHERE id = %s", (payload.get("sub"),))
    user = cursor.fetchone()
    cursor.close()
    if user is None or not user["is_admin"]:
        raise HTTPException(status_code=403, detail="Accès réservé à l'administrateur")
    return user


# ----- Endpoints -----
@app.get("/")
async def health():
    return {"status": "ok"}


@app.post("/login")
async def login(creds: LoginRequest):
    cursor = db().cursor(dictionary=True)
    cursor.execute("SELECT id, mail, password, is_admin FROM users WHERE mail = %s", (creds.mail,))
    user = cursor.fetchone()
    cursor.close()

    if user is None or not user["password"]:
        raise HTTPException(status_code=401, detail="Identifiants invalides")
    if not bcrypt.checkpw(creds.password.encode(), user["password"].encode()):
        raise HTTPException(status_code=401, detail="Identifiants invalides")

    token = create_token(user["id"], user["mail"])
    return {"token": token, "is_admin": bool(user["is_admin"]), "mail": user["mail"]}


@app.get("/users")
async def get_users():
    """Liste publique des utilisateurs avec informations réduites."""
    cursor = db().cursor(dictionary=True)
    cursor.execute("SELECT id, nom, prenom, ville FROM users")
    records = cursor.fetchall()
    cursor.close()
    return records


@app.get("/users/details")
async def get_users_details(admin=Depends(require_admin)):
    """Informations privées complètes, admin uniquement."""
    cursor = db().cursor(dictionary=True)
    cursor.execute("SELECT id, nom, prenom, mail, birth, ville, cp, is_admin FROM users")
    records = cursor.fetchall()
    cursor.close()
    return records


@app.post("/users")
async def add_user(user: dict):
    conn = db()
    cursor = conn.cursor()
    sql_insert_query = "INSERT INTO users (nom, prenom, mail, birth, ville, cp) VALUES (%s, %s, %s, %s, %s, %s)"
    cursor.execute(sql_insert_query, (user['nom'], user['prenom'], user['mail'], user['birth'], user['ville'], user['cp']))
    conn.commit()
    new_id = cursor.lastrowid
    cursor.close()
    return {'message': 'Utilisateur ajouté avec succès', 'id': new_id, **user}


@app.delete("/users/{user_id}")
async def delete_user(user_id: int, admin=Depends(require_admin)):
    if user_id == admin["id"]:
        raise HTTPException(status_code=400, detail="L'administrateur ne peut pas se supprimer lui-même")
    conn = db()
    cursor = conn.cursor()
    cursor.execute("DELETE FROM users WHERE id = %s", (user_id,))
    conn.commit()
    deleted = cursor.rowcount
    cursor.close()
    if deleted == 0:
        raise HTTPException(status_code=404, detail="Utilisateur introuvable")
    return {"message": "Utilisateur supprimé avec succès", "id": user_id}

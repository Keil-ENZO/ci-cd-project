import mysql.connector
import os
import time
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()
origins = ["*"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Retry connection to DB (MySQL may still be initializing even after healthcheck)
conn = None
for attempt in range(10):
    try:
        conn = mysql.connector.connect(
            database=os.getenv("MYSQL_DATABASE"),
            user=os.getenv("MYSQL_USER"),
            password=os.getenv("MYSQL_ROOT_PASSWORD"),
            port=3306,
            host=os.getenv("MYSQL_HOST")
        )
        print(f"Connected to MySQL on attempt {attempt + 1}")
        break
    except mysql.connector.Error as e:
        print(f"Attempt {attempt + 1}/10 failed: {e}")
        time.sleep(3)

if conn is None:
    raise RuntimeError("Could not connect to MySQL after 10 attempts")

@app.get("/users")
async def get_users():
    cursor = conn.cursor()
    sql_select_query = "select * from users"
    cursor.execute(sql_select_query)
    # get all records
    records = cursor.fetchall()
    print("Total number of rows in table: ", cursor.rowcount)
    # renvoyer nos données et 200 status code OK
    return {'utilisateurs': records}


@app.post("/users")
async def add_user(user: dict):
    cursor = conn.cursor()
    sql_insert_query = "INSERT INTO users (nom, prenom, mail, birth, ville, cp) VALUES (%s, %s, %s, %s, %s, %s)"
    cursor.execute(sql_insert_query, (user['nom'], user['prenom'], user['mail'], user['birth'], user['ville'], user['cp']))
    conn.commit()
    return {'message': 'Utilisateur ajouté avec succès'}
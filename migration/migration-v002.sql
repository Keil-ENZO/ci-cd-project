USE ynov_ci;

CREATE TABLE users(
  id int AUTO_INCREMENT PRIMARY KEY,
  nom varchar(50) NOT NULL,
  prenom varchar(50) NOT NULL,
  mail varchar(100) NOT NULL UNIQUE,
  birth date NOT NULL,
  ville varchar(50) NOT NULL,
  cp varchar(5) NOT NULL,
  password varchar(255) NULL,
  is_admin tinyint(1) NOT NULL DEFAULT 0
);

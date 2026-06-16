USE ynov_ci;

CREATE TABLE users(
  id int AUTO_INCREMENT PRIMARY KEY,
  nom varchar(50) NOT NULL,
  prenom varchar(50) NOT NULL,
  mail varchar(50) NOT NULL,
  birth date NOT NULL,
  ville varchar(50) NOT NULL,
  cp varchar(5) NOT NULL
);
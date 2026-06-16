FROM mysql:9.3

COPY ./migration/*.sql /docker-entrypoint-initdb.d/

EXPOSE 3306
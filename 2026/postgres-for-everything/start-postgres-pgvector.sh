#!/bin/bash

docker compose --file docker-compose.pgvector.yml up -d
echo "See password in docker-compose.pgvector.yml"
docker exec -ti postgres-for-everything-pgvector psql --username=user --password --dbname postgres
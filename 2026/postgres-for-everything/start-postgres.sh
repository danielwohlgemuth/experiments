#!/bin/bash

docker compose up -d
echo "See password in docker-compose.yml"
docker exec -ti postgres-for-everything psql --username=user --password --dbname postgres
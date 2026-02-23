#!/bin/bash

echo "See password in docker-compose.yml"
docker exec -ti postgres-for-everything-postgis psql --username=user --password --dbname postgres

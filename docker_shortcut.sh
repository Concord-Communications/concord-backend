#!/bin/zsh

echo "This script is for development, it builds and then updates the docker cluster."
# Cluster is probably not the right word, but it works.
docker compose down
docker compose build
docker compose up -d
#!/bin/zsh

echo "This script is for development, it builds and then updates the docker cluster."
echo "DANGER: this script will destroy all data in the docker volumes."
echo "press CTRL-C to stop (5s)"
sleep 5
# Cluster is probably not the right word, but it works.
docker compose down -v
docker compose build
docker compose up -d
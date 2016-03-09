# Docker build utility

Copies docker configuration files to the correct places, and runs builds a
docker image. Additional configurations can be made by making a new folder with
a Dockerfile, docker-compose.yml, and docker.json, and calling docker.js with
the name of the directory.

Calling docker.js with `clean` will remove all of the copied files from the main
folder structure, leaving you back where you started.

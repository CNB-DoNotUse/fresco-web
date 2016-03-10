# fresco-web

## The Fresco Webserver

#### This is a node-based webserver

The site uses [`webpack`](https://github.com/webpack/webpack), [`gulp`](https://github.com/gulpjs/gulp), and [`bower`](https://github.com/bower/bower) to compile assets, and the platform is built in [`react`](https://github.com/facebook/react) as the front-end framework.

Steps to get running -


1. `npm install` to set up all npm dependencies
2. `bower install` to download assets
3. `gulp` to compile site assets; `gulp --production` to minify and dedup
4. `npm start`


Steps to get Dockerized version running -


1. Install [Docker Toolbox](https://www.docker.com/products/docker-toolbox)
    * On Windows 10, uninstall VirtualBox if it's already installed, and let the Docker Toolbox installer do it for you. This prevents an issue with VirtualBox not being able to start a VM from the command line.
2. Open a terminal with Docker setup, either through Kitematic (recommended), or using the Docker quickstart terminal.
3. `node docker/docker.js test` to copy configuration files into the correct places and kick off a docker build. The initial build will take a while, subsequent builds will be much quicker.
4. `docker-compose up` to start the server. Check Kitematic to see what the IP address of the container is.
5. `node docker/docker.js clean` to delete configuration files.

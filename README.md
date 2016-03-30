# fresco-web

## The Fresco Webserver

#### This is a node-based webserver

The site uses [`webpack`](https://github.com/webpack/webpack), [`gulp`](https://github.com/gulpjs/gulp), and [`bower`](https://github.com/bower/bower) to compile assets, and the platform is built in [`react`](https://github.com/facebook/react) for the front-end framework.

Refer to the Fresco [`Javascript`](https://github.com/fresconews/fresco-style/tree/master/javascript) and [`React`](https://github.com/fresconews/fresco-style/tree/master/react) style guide for proper coding & commenting practices in the webserver.

####Steps to get webserver running -


1. `npm install` to set up all npm dependencies
2. `bower install` to download assets
3. `gulp` to compile site assets; `gulp --production` to minify and dedup
4. `npm start`

####Steps to setup configuration -


1. Copy `base.json` from `./config/templates/` up a level into `./config/`
2. Copy the correct configuration (usually `dev.json`) from `./config/templates/` up a level into `./config/`
3. Put any environment specific overrides (ex different redis or api urls) into a new `./config/local.json`

####Configuration details -

Configuration is done by merging the json files in `./config/` in alphabetical order (so anything in `z.json` will overwrite `a.json`). Additionally, the `PORT`, `API_URL`, and `REDIS_SESSIONS` override the config files, and the command line overrides everything

####Steps to get Dockerized version running -


1. Install [Docker Toolbox](https://www.docker.com/products/docker-toolbox)
    * On Windows 10, uninstall VirtualBox if it's already installed, and let the Docker Toolbox installer do it for you. This prevents an issue with VirtualBox not being able to start a VM from the command line.
2. Open a terminal with Docker setup, either through Kitematic (recommended), or using the Docker quickstart terminal.
3. `node docker/docker.js test` to copy configuration files into the correct places and kick off a docker build. The initial build will take a while, subsequent builds will be much quicker.
4. `docker-compose up` to start the server. Check Kitematic to see what the IP address of the container is.
5. `node docker/docker.js clean` to delete configuration files.

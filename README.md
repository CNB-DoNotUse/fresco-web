# fresco-web

##The Fresco Webserver

####This is a node-based webserver

The site uses [`webpack`](https://github.com/webpack/webpack), [`gulp`](https://github.com/gulpjs/gulp), and [`bower`](https://github.com/bower/bower) to compile assets, and the platform is built in [`react`](https://github.com/facebook/react) as the front-end framework.

Steps to get running - 


1. `npm install` to set up all npm dependencies
2. `bower install` to download assets
3. `gulp` to complie site assets; `gulp --production` to minify and dedup
4. `npm start`
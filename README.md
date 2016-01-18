# fresco-web

##The Fresco Webserver

####This is a node-based webserver

The site uses [`webpack`](https://github.com/webpack/webpack), [`gulp`](https://github.com/gulpjs/gulp), and [`bower`](https://github.com/bower/bower) to compile assets, and the platform is built in [`react`](https://github.com/facebook/react) as the front-end framework.

Steps to get running - 


1. `npm install` to set up all npm dependencies
2. Run a `bower install`, assets will be placed in `public/vendor`
3. Run `gulp` to complie site assets; `gulp --production` will minify all assets for a production build
4. `npm start` on the root footer, or any node service to run the server
  
###*_Don't fuck up!_*

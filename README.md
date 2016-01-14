# fresco-web

The Fresco Webserver

The webserver runs off of node

The site uses `webpack`, `gulp`, and `bower` to compile assets.

The platform is built in `react` as the front-end framework.

Steps to get running - 

<ol>

  <li>`npm install` to set up all npm dependencies</li>

  <li>Run a `bower install`, assets will be placed in `public/vendor`</li>

  <li>Run `gulp` to complie site assets; `gulp --production` will minify all assets for a production build</li>
  
  <li>`npm start` on the root footer, or any node service to run the server</li>
  
</ol>

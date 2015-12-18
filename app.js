var config = require('./lib/config'),
    head = require('./lib/head'),
    global = require('./lib/global'),
    routes = require('./lib/routes'),
    express = require('express'),
    path = require('path'),
    favicon = require('serve-favicon'),
    morgan = require('morgan'),
    session = require('express-session'),
    redis = require('redis'),
    RedisStore = require('connect-redis')(session),
    cookieParser = require('cookie-parser'),
    bodyParser = require('body-parser'),
    multer  = require('multer'),
    fs  = require('fs'),
    https  = require('https'),
    requestJson = require('request-json'),
    app = express();

// If in dev mode, use local redis server as session store
var rClient = config.DEV ? redis.createClient() : redis.createClient(6379, config.REDIS.SESSIONS, { enable_offline_queue: false });
var redisConnection = { client: rClient };

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// uncomment after placing your favicon in /public
app.use(favicon(__dirname + '/public/favicon.ico'));

// app.use(morgan('dev'));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(multer({
  dest : './uploads/',
    rename : function(fieldname, filename){
        return Date.now() + filename.split('.').pop();
    },
    onFileUploadStart : function(file){
    },
    onFileUploadComplete : function(file){
        done = true;
    }
}));

//Cookie parser
app.use(
  cookieParser()
);

//Session config
app.use(
  session({
    store: new RedisStore(redisConnection),
    secret: config.SESSION_SECRET,
    resave: false,
    rolling: true,
    saveUninitialized: false,
    cookie: { path: '/', httpOnly: true, secure: false, maxAge: 24 * 60 * 60 * 1000 },
    unset: 'destroy'
  })
);


//Set up public direc.
app.use(
  express.static(path.join(__dirname, 'public'), { maxAge: 300 })
);


app.use(function(req, res, next){
  req.alerts = [];

  if (req.session && req.session.user && !req.session.user.verified)
    req.alerts.push('<p>Your email hasn\'t been verified.<br>Please click on the link sent to your inbox to verify your email!</p><div><a href="/scripts/user/verify/resend">RESEND EMAIL</a></div>');

  if (req.session && req.session.alerts){
    req.alerts = req.alerts.concat(req.session.alerts);
    req.alerts = req.alerts.length > 0 ? [req.alerts.pop()] : [];
    delete req.session.alerts;
    return req.session.save(function(){
      next();
    });
  }

  req.alerts = req.alerts.length > 0 ? [req.alerts.pop()] : [];
  next();
});

/**
 * Set up local head and global for all templates
 */

app.locals.head = head;
app.locals.global = global

//If user is not logged in, redirect to landing page
//Also, check if user's data is still valid, updating if not
app.use(function(req, res, next) {
      // if (!req.secure)
      //   return res.redirect('https://' + req.headers.host + req.url);

      if (req.method.toUpperCase() != 'GET')
        return next();

      if (req.path != '/' &&
        req.path.indexOf('/join') == -1 &&
        req.path.indexOf('/partners') == -1 &&
        req.path.indexOf('/scripts') == -1 &&
        req.path.indexOf('/verify') == -1 &&
        req.path.indexOf('/external') == -1 &&
        req.path.indexOf('/promo') == -1 &&
        req.path.indexOf('/gallery')) {

        if (req.session && req.session.user) {

          var now = Date.now();

          //Check if the session has expired
          if (!req.session.user.TTL || req.session.user.TTL - now < 0) {

            //Create client
            var api = requestJson.createClient(config.API_URL);

            //Send request for user profile
            api.get('/v1/user/profile?id=' + req.session.user._id, function(err, response, body) {

              //Check for request
              if (err || !body)
                return next();

              //Check for error on api payload
              if (body.err) {
                req.session.alerts = [config.resolveError(body.err)];
                delete req.session.user;
                return req.session.save(function() {
                  res.redirect('/');
                });
              }

              //Configure new session config for user
              var token = req.session.user ? req.session.user.token : null;
              req.session.user = body.data;
              req.session.user.token = token;
              req.session.user.TTL = now + config.SESSION_REFRESH_MS;

              if (!req.session.user.outlet){
                return req.session.save(function() {
                  next();
                });
              }

              api.get('/v1/outlet/purchases?shallow=true&id=' + req.session.user.outlet._id, function(err, response, body) {

                if (!err && body && !body.err)
                  req.session.user.outlet.purchases = body.data;

                req.session.save(function() {
                  next();
                });
              });
            });
          }
          else next();
        }
        else return res.redirect('/');
      }
      else next();
});

/**
 * Route config
 */

app.use((req, res, next) => {

  if(!req.fresco) {
    req.fresco = {};
  }

  res.locals.section = 'public';
  
  next();

});

/*
Loop through all public routes
 */

for (var i = 0; i < routes.public.length; i++) {
  
  var routePrefix = routes.public[i] == 'index' ? '' : routes.public[i] ,
      route = require('./routes/' + routes.public[i]);

  app.use('/' + routePrefix , route);

};

app.use((req, res, next) => {

  if(!req.fresco) {
    req.fresco = {};
  }

  res.locals.section = 'platform';

  next();

});

/*
Loop through all platform routes
 */

for (var i = 0; i < routes.platform.length; i++) {
  
  var routePrefix = routes.platform[i] ,
      route = require('./routes/' + routePrefix);

  if(i == 0 ) console.log(routePrefix);

  app.use('/' + routePrefix , route);

};
/**
 * Error Handlers
 */

// Development error handle will print stacktrace
if (app.get('env') === 'development') {

  app.use(function(err, req, res, next) {

    if (!err)
      return next();

    console.log('\n Path: ', req.path, 'Error: ', err + '\n');
    
    res.render('error', {
      user: req.session && req.session.user ? req.session.user : null,
      err: {
        message: config.ERR_PAGE_MESSAGES[err.status || 500],
        code: err.status || 500
      },
      section: 'public',
      page: 'error'
    });

  });

}
// Production error handler no stacktraces leaked to user
else{

  app.use(function(err, req, res, next) {

    if (!err)
      return next();
    
    res.render('error', {
      user: req.session && req.session.user ? req.session.user : null,
      err: {
        message: config.ERR_PAGE_MESSAGES[err.status || 500],
        code: err.status || 500
      },
      section: 'public',
      page: 'error'
    });
  
  });

}

var params  = {
    key: fs.readFileSync('cert/fresconews_com.key'),
    cert: fs.readFileSync('cert/fresconews_com.crt'),
    ca: [fs.readFileSync('cert/DigiCertCA.crt')]
};

// https.createServer(params, app).listen(4430);

module.exports = app;

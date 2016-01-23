var config        = require('./lib/config'),
    head          = require('./lib/head'),
    global        = require('./lib/global'),
    routes        = require('./lib/routes'),
    express       = require('express'),
    compression   = require('compression'),
    path          = require('path'),
    favicon       = require('serve-favicon'),
    morgan        = require('morgan'),
    session       = require('express-session'),
    redis         = require('redis'),
    RedisStore    = require('connect-redis')(session),
    cookieParser  = require('cookie-parser'),
    bodyParser    = require('body-parser'),
    multer        = require('multer'),
    fs            = require('fs'),
    http	       =  require('http'),
    https         = require('https'),
    requestJson   = require('request-json'),
    request       = require('superagent');
    app           = express();

// If in dev mode, use local redis server as session store
var rClient = config.DEV ? redis.createClient() : redis.createClient(6379, config.REDIS.SESSIONS, { enable_offline_queue: false });
var redisConnection = { client: rClient };

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// uncomment after placing your favicon in /public
app.use(favicon(__dirname + '/public/favicon.ico'));

// app.use(morgan('dev'));

//GZIP
app.use(compression())
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(multer({
  dest : './uploads/',
  rename: (fieldname, filename) => {
      return Date.now() + filename.split('.').pop();
  },
  onFileUploadStart: (file) => {
  },
  onFileUploadComplete: (file) => {
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
    name: 'FRSSID',
    store: new RedisStore(redisConnection),
    secret: config.SESSION_SECRET,
    resave: false,
    rolling: true,
    saveUninitialized: false,
    cookie: { httpOnly: true, secure: false, maxAge: 24 * 60 * 60 * 1000 },
    unset: 'destroy'
  })
);

//Set up public direc.
app.use(
  express.static(path.join(__dirname, 'public'), { maxAge: 1000 * 60 * 60 * 2 }) // 2 hour cache
);

/**
 * Verifications check
 */
app.use((req, res, next)=> {

  req.alerts = [];

  if (req.session && req.session.user && !req.session.user.verified){
    req.alerts.push('<p>Your email hasn\'t been verified.<br>Please click on the link sent to your inbox to verify your email!</p><div><a href="/scripts/user/verify/resend">RESEND EMAIL</a></div>');
  }

  if (req.session && req.session.alerts){
    req.alerts = req.alerts.concat(req.session.alerts);
    req.alerts = req.alerts.length > 0 ? [req.alerts.pop()] : [];
    delete req.session.alerts;
    return req.session.save(()=> {
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
app.locals.global = global;
app.locals.alerts = [];

/**
 * Route session check
 */

app.use(function(req, res, next) {

    var path = req.path.slice(1).split('/')[0],
        err = new Error('Page not found!'),
        now = Date.now(),
        api = requestJson.createClient(config.API_URL);
        err.status = 404;

    //Check if not a platform route, then send onwwards
    if(routes.platform.indexOf(path) == -1) {
      return next();
    }

    //Check if there is no sessioned user
    if (!req.session.user) {
      return next(err);
    }

    //Check if the session has expired
    if (req.session.user.TTL && req.session.user.TTL - now <= 0) {
      delete req.session.user;
      return next(err);
    }

    //Send request for user profile
    api.get('/v1/user/profile?id=' + req.session.user._id, (err, response, body) => {
        //Check request
        if (err || !body) return next(err);

        //Check for error on api payload
        if (body.err || body.error || !body.data._id) {

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

        //Check if the user has an outlet, otherwise save session and move onward
        if (!req.session.user.outlet) {
            return req.session.save(function() {
                return next();
            });
        }

        //Grab purchases because user does have an outlet, then move onward
        api.get('/v1/outlet/purchases?shallow=true&id=' + req.session.user.outlet._id, function(err, response, body) {

            if (!err && body && !body.err)
                req.session.user.outlet.purchases = body.data;

            req.session.save(function() {
                return next();
            });
        });
    });
});

/**
 * Route config for public facing pages
 */

app.use((req, res, next) => {

  if(!req.fresco)
    req.fresco = {};

  res.locals.section = 'public';
  next();

});

/**
 * Loop through all public routes
 */

for (var i = 0; i < routes.public.length; i++) {

  var routePrefix = routes.public[i] == 'index' ? '' : routes.public[i] ,
      route = require('./routes/' + routes.public[i]);

  app.use('/' + routePrefix , route);

};

/**
 * Loop through all script routes
 */

for (var i = 0; i < routes.scripts.length; i++) {

  var routePrefix = routes.scripts[i] ,
      route = require('./routes/scripts/' + routePrefix);

  app.use('/scripts' , route);

};


/**
 * Route config for private (platform) facing pages
 */

app.use((req, res, next) => {

  if(!req.fresco)
    req.fresco = {};

  res.locals.section = 'platform';
  next();

});


/**
 * Loop through all platform routes
 */

for (var i = 0; i < routes.platform.length; i++) {

  var routePrefix = routes.platform[i] ,
      route = require('./routes/' + routePrefix);

  app.use('/' + routePrefix , route);

};

/**
 * Webservery proxy for forwarding to the api
 */

// Special case for assignment create
// TODO: Remove this
app.post('/api/assignment/create', (req, res, next) => {
  req.body.outlet = req.session.user ? req.session.user.outlet ? req.session.user.outlet._id : undefined : undefined;
  next();
});

app.use('/api', (req, res, next) => {
  var token = req.session.user ? req.session.user.token ? req.session.user.token : '' : '';

  return request(req.method, config.API_URL + '/' + config.API_VERSION + req.url)
    .set('authtoken', token)
    .send(req.body)
    .end((err, response) => {
      if(err) {
        return res.json({err: 'API Error'});
      }

      var data = '';

      try {
        data = JSON.parse(response.text);
      } catch (ex) {
        return res.send({err: 'API Parse Error'});
      }

      return res.send(data);
    });
});

/**
 * Error Midleware
 */

app.use((err, req, res, next) => {
    // Development error handle will print stacktrace
    if (app.get('env') === 'development') {
        console.log('Method:', req.method,
                  '\nPath:', req.path,
                  '\nBody', req.body,
                  '\nError: ', err + '\n');
    }

    //Respond with code
    res.status(err.status || 500);

    res.render('error', {
        user: req.session && req.session.user ? req.session.user : null,
        err: {
            message: err.message || config.ERR_PAGE_MESSAGES[err.status || 500],
            code: err.status || 500
        },
        section: 'public',
        page: 'error'
    });

});

/**
 * 404 Handler Catch
 */

 app.use((req, res, next) => {

    //Respond with code
    res.status(404);

    // respond with html page
    if (req.accepts('html')) {
        res.render('error', {
           err: {
               message: 'Page not found!',
               code: 404
           },
           section: 'public',
           page: 'error'
        });
        return;
    }

    // respond with json
    if (req.accepts('json')) {
        res.send({ error: 'Page not found!' });
        return;
    }

    // default to plain-text. send()
    res.type('txt').send('Page not found!');

 });

if(!config.DEV) {

  var params  = {
      key: fs.readFileSync('cert/fresconews_com.key'),
      cert: fs.readFileSync('cert/fresconews_com.crt'),
      ca: [fs.readFileSync('cert/DigiCertCA.crt')]
  };

  http.createServer(function (req, res) {
	res.writeHead(302, { 'Location': config.WEB_ROOT + req.url });
        res.end();
  }).listen(3000);

  https.createServer(params, app).listen(4430);
  console.log('Listening on port 3000 (http) and port 4430 (https)');

} else {
  module.exports = app;
}

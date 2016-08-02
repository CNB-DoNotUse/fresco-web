const config        = require('./lib/config');
const head          = require('./lib/head');
const utils         = require('./lib/utils');
const routes        = require('./lib/routes');
const API           = require('./lib/api');
const User          = require('./lib/user');
const express       = require('express');
const compression   = require('compression');
const path          = require('path');
const favicon       = require('serve-favicon');
const morgan        = require('morgan');
const session       = require('express-session');
const redis         = require('redis');
const RedisStore    = require('connect-redis')(session);
const cookieParser  = require('cookie-parser');
const bodyParser    = require('body-parser');
const multer        = require('multer');
const fs            = require('fs');
const app           = express();


process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = '0';

// If in dev mode, use local redis server as session store
var rClient = redis.createClient(6379, config.REDIS.SESSIONS, { enable_offline_queue: false });
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

//Multer
var storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/')
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + '.' + file.originalname.split('.').pop())
    }
});

app.use(
    multer({ storage: storage }).any()
);

//Cookie parser
app.use( cookieParser() );

//Session config
app.use(
    session({
        name: 'FRSSID' + (config.COOKIE_SUFFIX ? ('_' + config.COOKIE_SUFFIX) : ''),
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
    express.static(path.join(__dirname, 'public'), {
        maxAge: 1000 * 60 * 60 * 2
    }) // 2 hour cache
);

/**
 * Verifications check
 */
app.use((req, res, next)=> {
    req.alerts = [];

    if (req.session && req.session.user && !req.session.user.verified){
        req.alerts.push('\
            <p>Your email hasn\'t been verified.\
              <br>Please click on the link sent to your inbox to verify your email!\
            </p>\
            <div>\
                <a href="/scripts/user/verify/resend">RESEND EMAIL</a>\
            </div>'
        );
    }

    if (req.session && req.session.alerts){
        req.alerts = req.alerts.concat(req.session.alerts);
        req.alerts = req.alerts.length > 0 ? [req.alerts.pop()] : [];
        delete req.session.alerts;
        return req.session.save(() => {
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
app.locals.utils = utils;
app.locals.assets = JSON.parse(fs.readFileSync('public/build/assets.json'));
app.locals.alerts = [];

/**
 * Route session check
 */
app.use((req, res, next) => {
    const route = req.path.slice(1).split('/')[0];
    const now = Date.now();

    // Check if not a platform route, then send onwwards
    if (routes.platform.indexOf(route) === -1) {
        return next();
    }

    // Check if there is no sessioned user
    if (!req.session.user) {
        return res.redirect('/account?next=' + req.url);
    }

    // Check if the session hasn't expired
    if (!req.session.user.TTL || req.session.user.TTL - now > 0) {
        return next();
    }

    return User.refresh(req, res, next);
});


/** Check if user rank exists (calc'd from permissions arr) */
app.use((req, res, next) => {
    if (req.session.user && !req.session.user.rank) {
        return User.updateRank(req, next);
    }

    return next();
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

}

/**
 * Loop through all script routes
 */
for (var i = 0; i < routes.scripts.length; i++) {

  const routePrefix = routes.scripts[i];
  const route = require(`./routes/scripts/${routePrefix}`);

  app.use(`/scripts/${routePrefix}` , route);
}


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

}

/**
 * Webservery proxy for forwarding to the api
 */
app.use('/api', API.proxy);

/**
 * Error Midleware
 */
app.use((error, req, res, next) => {
    var err = {};
    err.status = typeof(error.status) == 'undefined' ? 500 : error.status;

    // Development error handle will print stacktrace
    if(config.dev) {
        console.log('Method:', req.method,
                    '\nPath:', req.path,
                    '\nBody', req.body,
                    '\nError: ', error.message + '\n');
    }

    err.message = error.message || config.ERR_PAGE_MESSAGES[err.status || 500];

    //Respond with code
    res.status(err.status);

    if(req.accepts('html')) {
        return res.render('error', {
            err: err,
            section: 'public',
            page: 'error'
        });
    }

    if(req.accepts('json')) {
      return res.send({ error: 'Server Error' });
    }

    res.type('txt').send('Server Error');
});

/**
 * 404 Handler Catch
 */
app.use((req, res, next) => {
    //Respond with code
    res.status(404);

    // respond with html page
    if (req.accepts('html')) {
        return res.render('error', {
           err: {
               message: 'Page not found!',
               status: 404
           },
           section: 'public',
           page: 'error'
        });
    }

    // respond with json
    if (req.accepts('json')) {
        return res.send({ error: 'Page not found!' });
    }

    // default to plain-text. send()
    res.type('txt').send('Page not found!');
});

app.on('unhandledRejection', (err) => {
    console.log('unhandledRejection', err);
});


module.exports = app;

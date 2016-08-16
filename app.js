const config        = require('./lib/config');
const head          = require('./lib/head');
const utils         = require('./lib/utils');
const routes        = require('./lib/routes');
const API           = require('./lib/api');
const User          = require('./lib/user');
const express       = require('express');
const compression   = require('compression');
const path          = require('path');
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

/**
 * Set up local head and global for all templates
 */
app.locals.head = head;
app.locals.utils = utils;
app.locals.assets = JSON.parse(fs.readFileSync('public/build/assets.json'));
app.locals.section = 'public';

// If in dev mode, use local redis server as session store
const rClient = redis.createClient(6379, config.REDIS.SESSIONS, { enable_offline_queue: false });
const redisConnection = { client: rClient };

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// app.use(morgan('dev'));

//GZIP
app.use(compression())
app.use(bodyParser.json({limit: '50mb'}));
app.use(bodyParser.urlencoded({ extended: false, limit: '50mb' }));

//Multer
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/')
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + '.' + file.originalname.split('.').pop())
    }
});

app.use(
    multer({ 
        storage: storage 
    }).any()
);

//Cookie parser
app.use(cookieParser());

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

//Set up public directory
app.use(
    express.static(path.join(__dirname, 'public'), {
        maxAge: 1000 * 60 * 60 * 2 // 2 hour cache
    })
);


/**
 * Alert & Verifications check
 */
app.use((req, res, next) => {
    res.locals.alerts = [];

    if (req.session && req.session.user && !req.session.user.verified){
        res.locals.alerts.push('\
            <p>Your email hasn\'t been verified.\
                <br>Please click on the link sent to your inbox to verify your email!\
            </p>\
            <a href="/scripts/user/verify/resend">RESEND EMAIL</a>'
        );
    }

    if (req.session && req.session.alerts){
        res.locals.alerts = res.locals.alerts.concat(req.session.alerts);
        
        delete req.session.alerts;
        req.session.save(null);
    }

    next();
});


/**
 * Route session check
 */
app.use((req, res, next) => {
    const route = req.path.slice(1).split('/')[0];
    const now = Date.now();

    // Check if a public facing route, then send onwwards
    if (routes.platform.indexOf(route) === -1) {
        return next();
    }

    // Check if there is no sessioned user
    if (!req.session.user) {
        return res.redirect('/account?next=' + req.url);
    }

    // Check if the session hasn't expired
    if (req.session.user.TTL && req.session.user.TTL - now > 0) {
        return next();
    }

    //Session has expired, so refresh the user
    return User.refresh(req, res, next);
});


//Route config for public facing pag
app.use((req, res, next) => {
    res.locals.section = 'public';
    next();
});

//Loop through all public routes
for(routePrefix of routes.public) {
    routePrefix = routePrefix == 'index' ? '' : routePrefix;
    const route = require(`./routes/${routePrefix}`);
    app.use('/' + routePrefix , route);
}

//Loop through all script routes
for(routePrefix of routes.scripts) {
    const route = require(`./routes/scripts/${routePrefix}`);
    app.use(`/scripts/${routePrefix}` , route);
}

//Route config for private (platform) facing pages
app.use((req, res, next) => {
    res.locals.section = 'platform';
    next();
});

//Loop through all platform routes
for(routePrefix of routes.platform) {
    const route = require(`./routes/${routePrefix}`);
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
    //Define new error to send to `res`
    let err = {};

    // Development error handle will print stacktrace
    if(config.dev) {
        console.log('Method:', req.method,
                    '\nPath:', req.path,
                    '\nBody', req.body,
                    '\nError: ', error.message + '\n');
    }

    err.message = error.message || config.ERR_PAGE_MESSAGES[err.status || 500];
    err.status = typeof(error.status) == 'undefined' ? 500 : error.status;

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
        return res.send(err);
    }

    res.type('txt').send(err);
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
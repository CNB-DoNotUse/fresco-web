const config        = require('./lib/config');
const head          = require('./lib/head');
const utils         = require('./lib/utils');
const routes        = require('./lib/routes');
const API           = require('./lib/api');
const userMiddleware = require('./middleware/user');
const redis         = require('./lib/redis');
const express       = require('express');
const compression   = require('compression');
const path          = require('path');
const session       = require('express-session');
const RedisStore    = require('connect-redis')(session);
const cookieParser  = require('cookie-parser');
const bodyParser    = require('body-parser');
const helmet        = require('helmet');
const multer        = require('multer');
const fs            = require('fs');
const base64        = require('base-64');
const app           = express();

process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = '0';

/**
 * Set up local head and global for all templates
 */
app.locals.head = head;
app.locals.utils = utils;
app.locals.segmentKey = config.SEGMENT_WRITE_KEY;
app.locals.smoochKey = config.SMOOCH_KEY;
app.locals.assets = JSON.parse(fs.readFileSync('public/build/assets.json'));
app.locals.section = 'public';

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

//GZIP
app.use(compression())
app.use(bodyParser.json({limit: '50mb'}));
app.use(bodyParser.urlencoded({ extended: false, limit: '50mb' }));
//Set up public directory
app.use(
    express.static(path.join(__dirname, 'public'), {
        maxAge: 1000 * 60 * 60 * 24  // 1 day cache
    })
);

//Secure headers
app.use(helmet())

//Multer
//Define Storage
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/')
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + '.' + file.originalname.split('.').pop())
    }
});
//Use storage
app.use(multer({
    storage: storage
}).any());

//Cookie parser
app.use(cookieParser());

//Session config
app.use(
    session({
        name: 'FRSSID' + (config.COOKIE_SUFFIX ? ('_' + config.COOKIE_SUFFIX) : ''),
        store: new RedisStore({ client: redis }),
        secret: config.SESSION_SECRET,
        resave: false,
        rolling: true,
        saveUninitialized: false,
        cookie: { httpOnly: true, secure: false, maxAge: 24 * 60 * 60 * 1000 },
        unset: 'destroy'
    })
);


/**
 * Alert & Verifications check
 */
app.use((req, res, next) => {
    res.locals.alerts = [];

    if (req.session && req.session.alerts){
        res.locals.alerts = res.locals.alerts.concat(req.session.alerts);

        //Delete session alerts after attaching to the locals
        delete req.session.alerts;
        req.session.save();
    }

    next();
});


/**
 * Route session check
 */
app.use((req, res, next) => {
    if (!req.session) {
        return next({ message: 'Unable to establish a session. Please contact support@fresconews.com.' }) // handle error
    }

    if (req.query.referral) {
        // Don't fail the request if the there is a problem with the referral token
        try {
            req.session.referral = {};
            const referral_params = JSON.parse(base64.decode(req.query.referral));
            for (let param in referral_params) {
                req.session.referral['referral_' + param] = referral_params[param];
            }
        }
        catch (err) {
            console.error(`Error decoding referral token: ${req.query.referral} (${err})`);
        }
    }

    const route = req.path.slice(1).split('/')[0];
    const now = Date.now();

    // Check if not a platform route i.e. user is not needed, then send onwwards
    if (routes.platform.indexOf(route) === -1) {
        return next();
    }

    // Check if there is no sessioned user
    if (!req.session.user || !req.session.token || !req.session.token.token) {
        req.session.redirect = req.url;
        return req.session.save((error) => {
            res.redirect('/account');
        });
    }

    //Bearer token has expired
    const tokenExpired = new Date(req.session.token.expires_at) < now;

    // Check if the token has expired
    if (tokenExpired) {
        //Bearer token has expired, so refresh the token
        return userMiddleware.refreshBearer(req, res, next);
    }

    // Check if the session has expired
    if (!req.session.user.TTL || req.session.user.TTL - now < 0) {
       //Session has expired, so refresh the user
       return userMiddleware.refresh(req, res, next);
   }

    return next();
});


//Route config for public facing page
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
    // Development error handle will print stacktrace
    if(config.DEV) {
        console.log('Method:', req.method,
                    '\nPath:', req.path,
                    '\nBody', req.body,
                    '\nError: ', error.message + '\n');
    }

    //Define new error to send to `res`
    const err = {
        message: error.message || config.ERR_PAGE_MESSAGES[error.status || 500],
        status: typeof(error.status) == 'undefined' ? 500 : error.status,
        stack: config.DEV ? error.stack : null
    }

    //Respond with code
    res.status(err.status);

    if (req.accepts('html')) {
        return res.render('error', {
            err,
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
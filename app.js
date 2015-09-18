/// lmao hi guys
/// <reference path="typings/node/node.d.ts"/>
/// <reference path="typings/express/express.d.ts" />
/// <reference path="typings/passport/passport.d.ts" />
/// <reference path="typings/bunyan/bunyan.d.ts" />
/// <reference path="typings/mongodb/mongodb.d.ts" />
/// <reference path="typings/aws-sdk/aws-sdk.d.ts" />
/// <reference path="typings/request/request.d.ts" />
/// <reference path="typings/async/async.d.ts" />
/// <reference path="typings/parse/parse.d.ts" />

var express = require('express'),
    path = require('path'),
    favicon = require('serve-favicon'),
    bodyParser = require('body-parser'),
    multer = require('multer'),
    passport = require('passport'),

    config = require('./lib/config'),
    logger = require('./lib/logger'),
    
    //API V1
    route_apiv1_user = require('./routes/v1/user'),
    route_apiv1_gallery = require('./routes/v1/gallery'),
    route_apiv1_post = require('./routes/v1/post'),
    route_apiv1_story = require('./routes/v1/story'),
    route_apiv1_assignment = require('./routes/v1/assignment'),
    route_apiv1_notifs = require('./routes/v1/notification'),
    route_apiv1_outlet = require('./routes/v1/outlet'),
    route_apiv1_api = require('./routes/v1/api'),
    route_apiv1_auth = require('./routes/v1/auth'),
    route_apiv1_terms = require('./routes/v1/terms'),
    
    
    db = require('./lib/db'),
    logger = require('./lib/logger').child({route: 'request'}),
    https = require('https'),
    fs = require('fs'),
    app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(multer({dest : './uploads/',
                rename : function(fieldname, filename){
                    return new Date().getTime() + filename.split('.').pop();
                },
                onFileUploadStart : function(file){
                    console.log("Starting upload: " + file.originalname)
                },
                onFileUploadComplete : function(file){
                    console.log("Successful upload: " + file.fieldname + " to " + file.path);
                    done = true;
                }}));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

app.use(function(req,res,next){
    if (!req.secure)
        res.status(418).send('Using our API over HTTP... seriously?');
        
    next();
});

app.use(passport.initialize());

app.use(function(req,res,next){
    var req_id = new Date().getTime();
    logger.info({req_id: req_id, ip: req.ip, ips: req.ips, url: req.originalUrl}, "Request Recieved");
    req.req_id = req_id;
    next();
});

app.use(function(req,res,next){
    req.db = db;
    next();
});

//Set the headers, allow CORS
app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

function nocache(req, res, next){
    res.header('Cache-Control', 'private, no-cache, no-store, must-revalidate');
    res.header('Expires', '-1');
    res.header('Pragma', 'no-cache');
    next();
}

app.use('/v1/user', route_apiv1_user);
app.use('/v1/gallery', route_apiv1_gallery);
app.use('/v1/post', route_apiv1_post);
app.use('/v1/story', route_apiv1_story);
app.use('/v1/assignment', nocache, route_apiv1_assignment);
app.use('/v1/notification', nocache, route_apiv1_notifs);
app.use('/v1/outlet', nocache, route_apiv1_outlet);
app.use('/v1/auth', route_apiv1_auth);
app.use('/v1/api', route_apiv1_api);
app.use('/v1/terms', route_apiv1_terms);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        res.json({
            code: err.status,
            err: err.message
        }).end();
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.json({
        code: err.status,
        err: err.message
    }).end();
});

var params  = {
    key: fs.readFileSync('cert/fresconews_com.key'),
    cert: fs.readFileSync('cert/fresconews_com.crt'),
    ca: [fs.readFileSync('cert/DigiCertCA.crt')]
};

https.createServer(params, app).listen(4430);

module.exports = app;
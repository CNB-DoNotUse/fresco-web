var config = require('./lib/config'),
    express = require('express'),
    path = require('path'),
    favicon = require('serve-favicon'),
    session = require('express-session'),
    cookieParser = require('cookie-parser'),
    bodyParser = require('body-parser'),
    multer  = require('multer'),
    fs  = require('fs'),
    https  = require('https'),
    requestJson = require('request-json'),
    
    routes_admin = require('./routes/admin'),
    routes_index = require('./routes/index'),
    routes_dispatch = require('./routes/dispatch'),
    routes_assignment = require('./routes/assignment'),
    routes_outlet = require('./routes/outlet'),
    routes_story = require('./routes/story'),
    routes_user = require('./routes/user'),
    routes_gallery = require('./routes/gallery'),
    routes_post = require('./routes/post'),
    routes_purchases = require('./routes/purchases'),
    routes_scripts = require('./routes/scripts'),
    routes_content = require('./routes/content'),
    routes_external = require('./routes/external'),
    routes_search = require('./routes/search'),
    
    app = express(),
    FileStore = require('session-file-store')(session);

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// uncomment after placing your favicon in /public
app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(multer({dest : './uploads/',
                rename : function(fieldname, filename){
                    return Date.now() + filename.split('.').pop();
                },
                onFileUploadStart : function(file){
                    console.log("Starting upload: " + file.originalname)
                },
                onFileUploadComplete : function(file){
                    console.log("Successful upload: " + file.fieldname + " to " + file.path);
                    done = true;
                }}));
app.use(cookieParser());
app.use(session({
  store: new FileStore({
    path: './sessions'
  }),
  secret: config.SESSION_SECRET,
  resave: false,
  rolling: true,
  saveUninitialized: false,
  cookie: { path: '/', httpOnly: true, secure: false, maxAge: null },
  unset: 'destroy'
}));

app.use(express.static(path.join(__dirname, 'public'), { maxAge: 300 }));

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

//If user is not logged in, redirect to landing page
//Also, check if user's data is still valid, updating if not
app.use(function(req, res, next){
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
      req.path.indexOf('/gallery')){
    if (req.session && req.session.user){
      var now = Date.now();

      if (!req.session.user.TTL || req.session.user.TTL - now < 0){console.log('fetching user');
        var api = requestJson.createClient(config.API_URL);

	      api.get('/v1/user/profile?id=' + req.session.user._id, function(err,response,body){
          if (err || !body)
              return next();
          if (body.err){
            req.session.alerts = [config.resolveError(body.err)];
            delete req.session.user;
            return req.session.save(function(){
              res.redirect('/');
            });
          }

          var token = req.session.user ? req.session.user.token : null;
          req.session.user = body.data;
          req.session.user.token = token;
          req.session.user.TTL = now + config.SESSION_REFRESH_MS;

          if (!req.session.user.outlet)
            return req.session.save(function(){ next(); });

  	      api.get('/v1/outlet/purchases?shallow=true&id=' + req.session.user.outlet._id, function(err,response,body){
            if (!err && body && !body.err)
              req.session.user.outlet.purchases = body.data;
            req.session.save(function(){
              next();
            });
          });
        });
      }else next();
    }else return res.redirect('/');
  }else next();
});

app.use('/', routes_index);
app.use('/admin', routes_admin);
app.use('/dispatch', routes_dispatch);
app.use('/outlet', routes_outlet);
app.use('/assignment', routes_assignment);
app.use('/gallery', routes_gallery);
app.use('/post', routes_post);
app.use('/story', routes_story);
app.use('/user', routes_user);
app.use('/scripts', routes_scripts);
app.use('/content', routes_content);
app.use('/purchases', routes_purchases);
app.use('/external', routes_external);
app.use('/search', routes_search);

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
  if (err) console.log('Path: ', req.path, 'Session: ', req.session, 'Error: ', err);
    res.status(err.status || 500);
    res.render('error', {
      user: req.session ? req.session.user : null,
      error_message: config.ERR_PAGE_MESSAGES[err.status || 500],
      error_code: err.status || 500
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  if (err) console.log('Path: ', req.path, 'Session: ', req.session, 'Error: ', err);
  res.status(err.status || 500);
  res.render('error', {
    user: req.session ? req.session.user : null,
    error_message: config.ERR_PAGE_MESSAGES[err.status || 500],
    error_code: err.status || 500
  });
});

var params  = {
    key: fs.readFileSync('cert/fresconews_com.key'),
    cert: fs.readFileSync('cert/fresconews_com.crt'),
    ca: [fs.readFileSync('cert/DigiCertCA.crt')]
};

// https.createServer(params, app).listen(4430);

module.exports = app;

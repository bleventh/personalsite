var express   = require('express'),
    app       = express(),
    mysql     = require('mysql'),
    bcrypt    = require('bcrypt-nodejs'),
    config    = require('./config'),
    passport  = require('passport'),
    LocalStrategy = require('passport-local').Strategy,
    partials  = require('express-partials');

/**
 * Passport Auth Set-Up
 */
passport.serializeUser(function(user, done) {
   done(null, user.id);
});

passport.deserializeUser(function(id, done) {
   //find user
});

/**
 * Set Up
 */
app.set('view engine', 'ejs');
app.use(express.static(__dirname + '/public'));
app.use(express.cookieParser());
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(express.session({ secret: 'shhhSecrets'}));

app.use(passport.initialize());
app.use(passport.session());
var connection = mysql.createConnection({
      host     : config.host,
      user     : config.user,
      password : config.password
});

 connection.query('CREATE DATABASE IF NOT EXISTS resume_page', function (err) {
    if (err) throw err;
    connection.query('USE resume_page', function (err) {
       if (err) throw err;
       connection.query('CREATE TABLE IF NOT EXISTS admin_user('
             + 'id INT NOT NULL AUTO_INCREMENT,'
             + 'PRIMARY KEY(id),'
             + 'username VARCHAR(30),'
             + 'password VARCHAR(30),'
             + 'admin_privilege TINYINT'
             +  ')', function (err) {
                if (err) throw err;
       });
    });
 });
//app.engine('.html', require('ejs').__express);

/**
 * MiddleWare
 */
app.use(partials());

/**
 * Routes
 */
app.get('/', function(req, res) {
   res.render('index', {
      title : "Home"
   });
});

app.get('/about', function(req, res) {
   res.render('about', {
      title: "About Me"
   });
});

app.get('/resume', function(req, res) {
   res.render('resume', {
      title: "Resume"
   });
});

app.get('/admin', function(req, res) {

});

app.get('/login', function(req, res) {
   res.render('login', { user: req.user, messages: req.session.messages, title: 'Login' });
});

app.post('/login', function(req, res, next) {
      passport.authenticate('local', function(err, user, info) {
         if (err) { return next(err) }
         if (!user) {
            req.session.messages = [info.message];
            return res.redirect('/login');
         }
         req.logIn(user, function(err) {
            if (err) { return next(err); }
            return res.redirect('/');
         });
      })(req, res, next);
});

/**
 * Server
 */
app.listen(config.port);

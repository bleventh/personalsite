var express   = require('express'),
    app       = express(),
    mysql     = require('mysql'),
    bcrypt    = require('bcrypt-nodejs'),
    config    = require('./config'),
    passport  = require('passport'),
    flash     = require('connect-flash'),
    LocalStrategy = require('passport-local').Strategy,
    partials  = require('express-partials');

/**
 * Set Up Database
 */
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
connection.query('USE resume_page', function (err) {
connection.query("SELECT * FROM admin_user where username='bleventh'", function(err, rows, fields) {
   console.log(rows[0].password);
});
});

/**
 * Database helper function
 */
function findByUsername(username, fn) {
   connection.query("USE resume_page", function (err) {
      if (err) { return fn(null,null); }
      connection.query("SELECT * FROM admin_user WHERE username='" + username + "'", function (err, rows, fields) {
         if (err) { console.log("hi"); return fn(null,null); }
         if (rows[0]) {
            return fn(err, rows[0]);
         }
         return fn(null,null);
      });
   });
}

/**
 * Passport Auth Set-Up
 */
passport.serializeUser(function(user, done) {
   done(null, user.username);
});

passport.deserializeUser(function(id, done) {
   findByUsername(id, function(err, user) {
      done(err, user);
   });
});

passport.use(new LocalStrategy(
      function(username, password, done) {
         process.nextTick(function () {
            findByUsername(username, function(err, user) {
               if (err) { return done(err); }
               if (!user) { return done(null, false, { message: 'Unknown user ' + username }); }
               if (!bcrypt.compareSync(password, user.password)) { return done(null, false, { message: 'Invalid password' }); }
               return done(null, user);
            })
         });
      }
));


/**
 * MiddleWare
 */
app.use(partials());

app.set('view engine', 'ejs');
app.use(express.static(__dirname + '/public'));
app.use(express.logger());
app.use(express.cookieParser());
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(express.session({ secret: 'shhhSecrets'}));
app.use(flash());
app.use(passport.initialize());
app.use(passport.session());


/**
 * Routes
 */
app.get('/', function(req, res) {
   res.render('home', {
      title : "Welcome!"
   });
});

app.get('/resume', function(req, res) {
   res.render('resume', {
      title: "Resume"
   });
});

app.get('/projects', function(req, res) {
   res.render('projects', {
      title: "Projects"
   });
});

app.get('/admin', ensureAuthenticated, function(req, res) {
   res.send('hello');
});

app.get('/login', function(req, res) {
   res.render('login', { user: req.user, messages: req.session.messages, title: 'Login' });
});

app.post('/login', passport.authenticate('local', { failureRedirect: '/login', failureFlash: true }),
      function(req, res) {
         console.log('hello');
         res.redirect('/admin');
      }
);

app.get('/logout', function(req, res) {
   req.logout();
   res.redirect('/');
});

app.get('*', function(req, res) {
   res.send('404');
});

// app.post('/login', function(req, res, next) {
//       passport.authenticate('local', function(err, user, info) {
//          if (err) { return next(err) }
//          if (!user) {
//             req.session.messages = [info.message];
//             return res.redirect('/login');
//          }
//          req.logIn(user, function(err) {
//             if (err) { return next(err); }
//             return res.redirect('/');
//          });
//       })(req, res, next);
// });

/**
 * Server
 */
app.listen(config.port);

function ensureAuthenticated(req, res, next) {
   if (req.isAuthenticated()) { return next(); }
   res.redirect('/login');
}

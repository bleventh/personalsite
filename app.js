var express  = require('express'),
    app      = express(),
    mysql    = require('mysql'),
    partials = require('express-partials');

/**
 * Set Up
 */
app.set('view engine', 'ejs');
var connection = mysql.createConnection({
      host     : 'localhost',
      user     : 'root',
      password : 'password'
   });

// connection.query('CREATE DATABASE IF NOT EXISTS test', function (err) {
//    if (err) throw err;
//    connection.query('USE test', function (err) {
//       if (err) throw err;
//       connection.query('CREATE TABLE IF NOT EXISTS users('
//             + 'id INT NOT NULL AUTO_INCREMENT,'
//             + 'PRIMARY KEY(id),'
//             + 'name VARCHAR(30)'
//             +  ')', function (err) {
//                if (err) throw err;
//       });
//    });
// });
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
      title : "Index"
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

/**
 * Server
 */
app.listen(3000);

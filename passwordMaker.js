var bcrypt = require('bcrypt-nodejs');
var pass;
bcrypt.hash("cookies", null, null, function(err, hash) {
   console.log(hash);
   bcrypt.compare("cookies", hash, function(err, res) {
      console.log(res == true);
});
});


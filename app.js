// Usage example with ExpressJS
var gallery = require('./gallery'),
express = require('express'),
util = require('util');

var app = express();
app.set('view engine', 'ejs');

app.configure(function(){
  app.use(express.static(__dirname + '/resources'));
  app.use(gallery.middleware({static: 'resources', directory: '/photos', rootURL: "/gallery"}));
});

app.get('/', function(req, res){
  res.redirect('/gallery');
});

app.get('/gallery*', function(req, res){
  var data = req.gallery;
  res.render(data.type + '.ejs', data);
});

app.listen(3000);
// Usage example with ExpressJS
var gallery = require('./gallery'),
express = require('express'),
util = require('util'),
port = 3000;

var app = (parseFloat(express.version)<3.0) ? express.createServer() : express();
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
  data.layout = false; // Express 2.5.* support, don't look for layout.ejs

  res.render(data.type + '.ejs', data);
});

app.listen(port);
console.log('node-gallery listening on localhost:' + port);

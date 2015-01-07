// Usage example with ExpressJS
var gallery = require('./gallery'),
express = require('express'),
util = require('util'),
fs = require('fs'),
port = 3000;

var app = express();
app.set('view engine', 'ejs');
app.use(express.static(__dirname + '/resources'));

app.use('/gallery', require('./lib/gallery.js')({
  albumRoot : 'resources/photos'
}));


app.listen(port);
console.log('node-gallery listening on localhost:' + port);

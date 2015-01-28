// Usage example with ExpressJS
var express = require('express'),
util = require('util'),
fs = require('fs'),
port = 3000;

var app = express();
app.set('view engine', 'ejs');
app.use(express.static('resources'));

// In your project, this would be require('node-gallery')
app.use('/gallery', require('../lib/gallery.js')({
  staticFiles : 'resources/photos',
  urlRoot : 'gallery',
  title : 'Example Gallery'
}));


app.listen(port);
console.log('node-gallery listening on localhost:' + port);

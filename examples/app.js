// Usage example with ExpressJS
var express = require('express'),
port = process.env.OPENSHIFT_NODEJS_PORT || process.env.PORT || 3000,
host = process.env.OPENSHIFT_NODEJS_IP;

var app = express();
app.set('view engine', 'ejs');
app.use(express.static('resources'));

// In your project, this would be require('node-gallery')
app.use('/gallery', require('../lib/gallery.js')({
  staticFiles : 'resources/photos',
  urlRoot : 'gallery',
  title : 'Example Gallery'
}).middleware);


app.listen(port, host);
host = host || 'localhost';
console.log('node-gallery listening on ' + host  + ':' + port);

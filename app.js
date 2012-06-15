// Usage example with ExpressJS
var gallery = require('./gallery'),
express = require('express'),
util = require('util');
var rootURL = "/gallery";
gallery.init({static: 'resources', directory: '/photos', rootURL: rootURL}, function(err, album){
  if (err) console.log('[err] ' + err);
  //console.log(util.inspect(album, true, null, true));
});

var app = express();
app.set('view engine', 'ejs');

app.configure(function(){
  app.use(express.static(__dirname + '/resources')); // NB - Example only, in production NEVER set root as express's static dir
});
app.get('/', function(req, res){
  res.redirect('/gallery');
});

app.get('/gallery', function(req, res){
  gallery.request({}, function(err, data){
    res.render(data.type + '.ejs', data);
  });
});
app.get('/gallery/*', function(req, res){
  var path = req.params[0].trim(),
  isFile = /\b.(jpg|bmp|jpeg|gif|png|tif)\b$/,
  image = isFile.test(path),
  path = path.split("/");
  if (image){ // If we detect image file name at end, get filename
    image = path.pop();
  }
  path = path.join("/");
  gallery.request({
    params: {
      album: path,
      photo: image
    }
  }, function(err, data){
    console.log('cb');
    res.render(data.type + '.ejs', data);
  });
});

app.listen(3000);
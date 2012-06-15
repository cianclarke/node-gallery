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
  gallery.request({}, res);
});
app.get('/gallery/*', function(req, res){
  var path = req.params[0].trim(),
  rex = /\b.(jpg|bmp|jpeg|gif|png|tif)\b$/,
  image = rex.test(path),
  path = path.split("/");

  if (image){
    image = path.pop();
  }
  path = path.join("/");

  paramsObj = {};

  gallery.request({
    params: {
      album: path,
      photo: image
    }
  }, res);
});
//
//app.get('/' + rootUrl + '/*.:ext', function(req, res){
//  var path = req.params.ext.trim(), // this makes no sense
//  extension = '.' + req.params[0].trim(), // why are these out of order? Odd routing..
//  paramsObj = {};
//
//
//
//  // Split the photo name and the path
//  path = path.split("/");
//  var photo = path.splice(path.length-1, 1)[0];
//  path = path.join("/");
//
//
//  paramsObj['album'] = path;
//  paramsObj['photo'] = photo + extension;
//  gallery.request({
//    params: paramsObj
//  }, res);
//});

app.listen(3000);
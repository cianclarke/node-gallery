// Usage example with ExpressJS
var gallery = require('./gallery'),
express = require('express'),
util = require('util');

gallery.init({static: 'resources', directory: '/photos'}, function(err, album){
  if (err) console.log('[err] ' + err);
  //console.log(util.inspect(album, true, null, true));
});

var app = express();
app.set('view engine', 'ejs');

app.configure(function(){
  app.use(express.static(__dirname + '/resources')); // NB - Example only, in production NEVER set root as express's static dir
});

app.get('/?album', function(req, res){
  gallery.request({}, res);
});
app.get('/album/*', function(req, res){
  var resourcePath = req.params[0].trim(),
  paramsObj = {};

  paramsObj['album'] = resourcePath;
  gallery.request({
    params: paramsObj
  }, res);
});

app.get('/photo/*.:ext', function(req, res){
  var path = req.params.ext.trim(), // this makes no sense
  extension = '.' + req.params[0].trim(), // why are these out of order? Odd routing..
  paramsObj = {};



  // Split the photo name and the path
  path = path.split("/");
  var photo = path.splice(path.length-1, 1)[0];
  path = path.join("/");


  paramsObj['album'] = path;
  paramsObj['photo'] = photo + extension;
  gallery.request({
    params: paramsObj
  }, res);
});

app.listen(3000);
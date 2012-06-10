// Usage example with ExpressJS
var gallery = require('./gallery'),
express = require('express');

gallery.init({directory: 'photos'}, function(err, album){
  if (err) console.log('[err] ' + err);
});

var app = express();
app.set('view engine', 'ejs');

app.configure(function(){
  app.use(express.static(__dirname + '/')); // NB - Example only, in production NEVER set root as express's static dir
});

app.get('/', function(req, res){
  gallery.request({
    params: {
      photo: null,//'IMG_0229 _Medium_.JPG',
      album: 'photos/Ireland/Co. Dublin'
    }
  },
  res);
});
app.listen(3000);
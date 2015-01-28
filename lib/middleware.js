var express = require('express'),
fs = require('fs'),
path = require('path'),
common;

module.exports = function(config){
  var app = express(),
  staticFiles = config.staticFiles,
  common = require('./common')(config),
  album = require('./album')(config),
  photo = require('./photo')(config);
  
  app.set('views', path.join(__dirname, '..', 'views'));
  app.set('view engine', 'ejs');
  
  
  app.get('/gallery.css', function(req, res, next){
    var fstream = fs.createReadStream(path.join(__dirname, '..', 'css/gallery.css'));
    fstream.on('error', function(){
      return res.status(404).json({ error : 'CSS File not found'});
    });
    return fstream.pipe(res);
  });
  
  // Photo Page
  app.get(/.+(\.(jpg|bmp|jpeg|gif|png|tif)(\?tn=(1|0))?)$/i, function(req, res, next){
    var filePath = path.join(staticFiles, req.path);
    filePath = decodeURI(filePath);
    
    fs.stat(filePath, function(err){
      if (err){
        return res.status(404).json({ error : 'File not found'});
      }
      var fstream = fs.createReadStream(filePath);
      fstream.on('error', function(){
        return res.status(404).json({ error : 'File not found'});
      });
      return fstream.pipe(res);
    });
    
  });
  
  // Photo Pages - anything containing */photo/*
  app.get(/(.+\/)?photo\/(.+)/i, photo, common.render);
  // Album Page - everything that doesn't contain the photo string
  // regex source http://stackoverflow.com/questions/406230/regular-expression-to-match-string-not-containing-a-word
  app.get(/^((?!\/photo\/).)*$/, album, common.render);
  return app;
}

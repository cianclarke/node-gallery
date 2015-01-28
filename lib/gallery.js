var express = require('express'),
fs = require('fs'),
path = require('path');

module.exports = function(config){
  var router = new express.Router(),
  staticFiles = config.staticFiles;
  
  
  if (!staticFiles){
    throw new Error('No album root specified');
  }
  router.get('/gallery.css', function(req, res, next){
    var fstream = fs.createReadStream('resources/css/gallery.css');
    fstream.on('error', function(){
      return res.status(404).json({ error : 'File not found'});
    });
    return fstream.pipe(res);
  });
  
  // Photo Page
  router.get(/.+(\.(jpg|bmp|jpeg|gif|png|tif)(\?tn=(1|0))?)$/i, function(req, res, next){
    var filePath = path.join(staticFiles, req.path);
    filePath = decodeURI(filePath);
    console.log(filePath);
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
  
  // Photo Pages
  router.get(/(.+\/)?photo\/(.+)/i, require('./photo')(config));
  // Album Page
  router.get('/*', require('./album')(config));
  return router;
};

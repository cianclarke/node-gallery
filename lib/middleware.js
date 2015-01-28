var express = require('express'),
fs = require('fs'),
path = require('path'),
im = require('imagemagick-stream'),
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
    fstream.on('error', function(err){
      return common.error(req, res, next, 404, 'CSS File not found', err);
    });
    return fstream.pipe(res);
  });
  
  // Photo Page
  app.get(/.+(\.(jpg|bmp|jpeg|gif|png|tif)(\?tn=(1|0))?)$/i, function(req, res, next){
    var filePath = path.join(staticFiles, req.path),
    fstream, resizestream;
    
    filePath = decodeURI(filePath);
    
    fs.stat(filePath, function(err){
      if (err){
        return common.error(req, res, next, 404, 'File not found', err);
      }
      fstream = fs.createReadStream(filePath);
      fstream.on('error', function(err){
        return common.error(req, res, next, 404, 'File not found', err);
      });
      
      if (!req.query.tn){
        // return the fill size file
        return fstream.pipe(res);
      }else{
        // streaming resize our file
        var dimensions, w, h;
        if (req.query.tn.toString() === '1'){
          w = (config.thumbnail && config.thumbnail.width) || 200;
          h = (config.thumbnail && config.thumbnail.height) || 200;
          dimensions = w + 'x' + h;
        }else {
          w = (config.image && config.image.width) || '100%';
          h = (config.image && config.image.height) || '100%';
          dimensions = w + 'x' + h;
        }
        resizestream = im().resize(dimensions).quality(90);
        resizestream.on('error', function(err){
          return common.error(req, res, next, 500, 'Error in IM/GM converting file', err);
        });
        return fstream.pipe(resizestream).pipe(res);
      }
    });
    
  });
  
  // Photo Pages - anything containing */photo/*
  app.get(/(.+\/)?photo\/(.+)/i, photo, common.render);
  // Album Page - everything that doesn't contain the photo string
  // regex source http://stackoverflow.com/questions/406230/regular-expression-to-match-string-not-containing-a-word
  app.get(/^((?!\/photo\/).)*$/, album, common.render);
  return app;
}

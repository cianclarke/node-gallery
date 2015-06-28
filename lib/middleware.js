var express = require('express'),
fs = require('fs'),
path = require('path'),
crypto = require('crypto'),
cache = require('memory-cache'),
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
    res.type('text/css');
    fstream.on('error', function(err){
      return common.error(req, res, next, 404, 'CSS File not found', err);
    });
    return fstream.pipe(res);
  });
  
  // Photo Page
  app.get(/.+(\.(jpg|bmp|jpeg|gif|png|tif)(\?tn=(1|0))?)$/i, function(req, res, next){
    var filePath = path.join(staticFiles, req.path),
    fstream;
    
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
        // return the full size file
        return fstream.pipe(res);
      }else{
        // streaming resize our file
        var cachedResizedKey, cacheWriteStream, cachedResult,
        resizer, dimensions, w, h;
        if (req.query.tn.toString() === '1'){
          w = (config.thumbnail && config.thumbnail.width) || 200;
          h = (config.thumbnail && config.thumbnail.height) || 200;
          dimensions = w + 'x' + h;
        }else {
          w = (config.image && config.image.width) || '100%';
          h = (config.image && config.image.height) || '100%';
          dimensions = w + 'x' + h;
        }
        
        cachedResizedKey = filePath + dimensions;
        cachedResizedKey = crypto.createHash('md5').update(cachedResizedKey).digest('hex');
        
        // Check the cache for a previously rezized tn of matching file path and dimensions
        cachedResult = cache.get(cachedResizedKey)
        // TODO - eventualyl should just try the fs.read on cachedResult, existsSync is a bad hack
        if (cachedResult && fs.existsSync(cachedResult)){
          // cache hit - read & return
          var cacheReadStream = fs.createReadStream(cachedResult);
          cacheReadStream.on('error', function(){
            return common.error(req, res, next, 404, 'File not found', err);
          });
          return cacheReadStream.pipe(res);  
        }
        
        // No result, create a write stream so we don't have to reize this image again
        cacheWritePath = path.join('/tmp', cachedResizedKey);
        cacheWriteStream = fs.createWriteStream(cacheWritePath);
        
        
        
        resizer = im().resize(dimensions).quality(40);
        resizer.on('error', function(err){
          return common.error(req, res, next, 500, 'Error in IM/GM converting file', err);
        });
        
        var resizestream = fstream.pipe(resizer);
        
        // Pipe to our tmp cache file, so we can use this in future
        resizestream.pipe(cacheWriteStream);
        cache.put(cachedResizedKey, cacheWritePath);
        
        // Also stream the resized result back to the requestee
        return resizestream.pipe(res);
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

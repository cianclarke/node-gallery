var fs = require('fs'),
path = require('path'),
cache = require('memory-cache'),
isPhoto = /(\.(jpg|bmp|jpeg|gif|png|tif))$/i,
_ = require('underscore'),
common,
config;

module.exports = function(cfg){
  config = cfg;
  common = require('./common')(config);
  return function(req, res, next){
    
    // Retrieve the path, decoding %20s etc, replacing leading & trailing slash
    var pathFromReq = common.friendlyPath(req.path),
    staticFilesPath = './' + path.join(config.staticFiles, pathFromReq),
    data = _.clone(config);
    
    /*
     Request for an album thumbnail - TODO consider splitting out
     */
    if (req.query && req.query.tn){
      return _thumbnail(staticFilesPath, pathFromReq, function(err, thumb){
        if (err){
          return common.error(req, res, next, 404, 'No thumbnail found for this album', err);
        }
        var fstream = fs.createReadStream(path.join(thumb));
        fstream.on('error', function(err){
          return common.error(req, res, next, 404, 'No thumbnail found for this album', err);
        });
        return fstream.pipe(res);
      });
    }
    /*
      Determined we're not requesting the thumbnail file - render the album page
     */
    fs.readdir(staticFilesPath, function (err, files) { 
      if (err){
        return common.error(req, res, next, 404, 'No album found', err);
      }
      
      data.isRoot = (req.path === '/' || req.path === '');
      data.breadcrumb = common.breadcrumb(pathFromReq),
      data.name = _.last(data.breadcrumb).name || config.title;
      
      data.albums = _getAlbums(files, staticFilesPath, pathFromReq);
      data.photos = _getPhotos(files, staticFilesPath, pathFromReq);
      
      req.data = data;
      req.tpl = 'album.ejs';
      return next();
    });
  }
}

function _getAlbums(files, staticFilesPath, pathFromReq){
  files = _.filter(files, function(file){
    var stat = fs.statSync(path.join(staticFilesPath, file));
    return stat.isDirectory()
  });
  
  files = _.map(files, function(albumName){
    return {
      url : path.join(config.urlRoot, pathFromReq, albumName),
      name : albumName
    };
  });
  return files;
}

function _getPhotos(files, staticFilesPath, pathFromReq){
  files = _.filter(files, function(file){
    var stat = fs.statSync(path.join(staticFilesPath, file));
    return file.match(isPhoto) && !stat.isDirectory()
  });
  files = _.map(files, function(photoFileName){
    var photoName = photoFileName.replace(isPhoto, '');
    return {
      url : path.join(config.urlRoot, pathFromReq, 'photo', photoName),
      src : path.join(config.urlRoot, pathFromReq, photoFileName),
      path : path.join(pathFromReq, photoFileName),
      name : photoName
    };
  });
  return files;
}

function _thumbnail(albumPath, pathFromRequest, cb){
  var cached = cache.get(albumPath);
  if (cached){
    return cb(null, cached);
  }

  
  // TODO - This is a bit messy - reduce number of params we need to pass
  fs.readdir(albumPath, function (err, files) {
    var photos = _getPhotos(files, albumPath, pathFromRequest),
    albums = _getAlbums(files, albumPath, pathFromRequest);
    if (photos.length > 0){
      // We have a photo, let's return the first as the thumb
      var firstPhoto = _.first(photos).path;
      firstPhoto = path.join(config.staticFiles, firstPhoto);
      
      cache.put(albumPath, firstPhoto);
      return cb(null, firstPhoto)
    }else if (albums.length > 0){
      // No photos found - iterate thru the albums and find a suitable child to return
      // TODO: If this first sub-album is empty this will fail. Is this OK?
      var firstAlbum = _.first(albums).name;
      return _thumbnail(path.join(albumPath, firstAlbum), path.join(pathFromRequest, firstAlbum), cb);
    }else{
      // None exist
      return cb('No suitable thumbnail found');  
    }
    
  });
}

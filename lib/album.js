var fs = require('fs'),
path = require('path'),
isPhoto = /(\.(jpg|bmp|jpeg|gif|png|tif))$/i,
_ = require('underscore');

module.exports = function(config){
  
  return function(req, res, next){
    
    // Retrieve the path, decoding %20s etc, replacing leading & trailing slash
    var pathFromReq = decodeURI(req.path).replace(/^\//, '').replace(/\/$/, ''),
    albumPath = path.join(config.albumRoot, pathFromReq),
    fsPath = './' + albumPath,
    data = {};
    
    if (req.query && req.query.tn){
      return _thumbnail(fsPath, function(err, thumb){
        if (err){
          return res.status(404).end('No thumbnail found for this album');
        }
        res.sendFile(path.join(__dirname, '..', thumb), function(err){
          if (err){
            res.status(err.status).end(JSON.stringify(err));
          }
          
        });
      });
    }
    
    fs.readdir(fsPath, function (err, files) { 
      if (err){
        return res.status(500).end('No album found at ' + pathFromReq + '. <br />' + JSON.stringify(err));
      }
      
      data.isRoot = (req.path === '/' || req.path === '');
      data.breadcrumb = _breadcrumb(pathFromReq.split('/')),
      data.name = _.last(data.breadcrumb).name;
      
      data.albums = _getAlbums(files, fsPath, pathFromReq);
      data.photos = _getPhotos(files, fsPath, pathFromReq);
      
      return res.render('album.ejs', data);
    });
  }
}

function _getAlbums(files, fsPath, pathFromReq){
  files = _.filter(files, function(file){
    var stat = fs.statSync(path.join(fsPath, file));
    return stat.isDirectory()
  });
  
  files = _.map(files, function(albumName){
    return {
      url : path.join(pathFromReq, albumName),
      name : albumName
    };
  });
  return files;
}

function _getPhotos(files, fsPath, pathFromReq){
  files = _.filter(files, function(file){
    var stat = fs.statSync(path.join(fsPath, file));
    return file.match(isPhoto) && !stat.isDirectory()
  });
  files = _.map(files, function(photoName){
    return {
      url : path.join(pathFromReq, photoName),
      name : photoName.replace(isPhoto, '')
    };
  });
  return files;
}

function _breadcrumb(paths){
  var breadcrumb = [],
  joined = '';
  return _.map(paths, function(pathSeg){
    joined = path.join(joined, pathSeg);
    return {
      name : pathSeg,
      url : joined
    }
  });
}

function _thumbnail(fsPath, cb){
  // TODO - iterate recursively, trying to find a thumbnail for this album
  return cb(null, path.join(fsPath, 'Doo Lough.jpg'));
}

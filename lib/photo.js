var fs = require('fs'),
path = require('path'),
_ = require('underscore'),
exif = require('./exif'),
common;

module.exports = function(config){
  common = require('./common')(config);
  return function(req, res, next){
    var albumPath = req.params[0] || '', // This CAN be undefined, if a photo exists at root
    photoName = req.params[1] || '',
    photoBreadcrumbPath = path.join(albumPath, photoName), // Path for breadcrumb mostly
    albumFilesystemPath = './' + path.join(config.staticFiles, albumPath),
    photoFileSystemPath,
    photoWebPath;
    fs.readdir(albumFilesystemPath, function(err, files){
      if (err || _.isEmpty(files)){
        return res.status(404).json({error : 'Photo not found'});
      }
      var file = _.find(files, function(file){
        return file.indexOf(photoName) > -1;
      });
      if (!file){
        return res.status(404).json({error : 'Photo not found'});
      }
      // Include the /gallery/ or whatever
      photoWebPath = path.join(config.urlRoot, albumPath, file);
      photoFileSystemPath = path.join(albumFilesystemPath, file);
      
      exif(photoFileSystemPath, function(exifErr, exifInfo){
        if (exifErr){
          // TODO: At least log these errors
          // don't care about exif errors - they are frequent with malformed files
          exifInfo = {}; 
        }
        
        return res.render('photo.ejs', {
          name : photoName, 
          breadcrumb : common.breadcrumb(common.friendlyPath(photoBreadcrumbPath)),
          src : photoWebPath,
          path : photoBreadcrumbPath,
          exif : exifInfo
        });
      });
    });
    
  }
};
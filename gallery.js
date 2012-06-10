var fs = require('fs'),
util = require('util');

var gallery = {
  /*
   * Directory to initialize with
   */
  directory : undefined,
  /*
   * Our constructed album JSON lives here
   */
  album: undefined,
  /*
   * Filter string to use for excluding filenames. Defaults to a regular expression that excludes dotfiles.
   */
  filter: /^Thumbs.db|^\.[a-zA-Z0-9]+/,
  /*
   * Private function to walk a directory and return an array of files
   */
  readFiles: function(params, cb){
    var walk    = require('walk'),
    files   = [],
    me = this;

    var walker  = walk.walk(this.directory, { followLinks: false });

    walker.on('file', function(root, stat, next) {
      if (stat.name.match(me.filter) != null){
        return next();
      }

      var file = {
        type: stat.type,
        name: stat.name,
        root: root
      };

      files.push(file);
      return next();

      /*
       new ExifImage({ image : root + '/' + stat.name }, function (error, exifData) {
       if (error){

       file.exif = null;
       files.push(file);
       return next();
       }else{
       console.log('processing'); // Do something with your data!
       file.exif = exifData;
       files.push(file);
       return next();
       }
       });
       */
    });

    walker.on('end', function() {
      return cb(null, files);
    });
  },
  /*
   * Private function to build an albums object from the files[] array
   */
  buildAlbums: function(files, cb){
    var albums = {
      name: 'Root Album',
      photos: [],
      albums: []
    },
    dirHash = {};
    for (var i=0; i<files.length; i++){
      // Process a single file
      var file = files[i],
      dirs = file.root.split("/"),
      dirHashKey = "",
      curAlbum = albums; // reset current album to root at each new file

      // Iterate over it's directory path, checking if we've got an album for each
      for (var j=0; j<dirs.length; j++){
        var curDir = dirs[j];
        dirHashKey += curDir;


        if (!dirHash.hasOwnProperty(dirHashKey)){
          // If we've never seen this album before, let's create it
          dirHash[dirHashKey] = true; // TODO - consider binding the album to this hash, and even REDIS-ing..
          var newAlbum = {
            name: curDir,
            hash: dirHashKey,
            photos: [],
            albums: []
          };

          curAlbum.albums.push(newAlbum);
          curAlbum = newAlbum;
        }else{
          // we've seen this album, we need to drill into it
          // search for the right album & update curAlbum
          var curAls = curAlbum.albums;
          for (var k=0; k<curAls.length; k++){
            var al = curAls[k];
            if (al.hash === dirHashKey){
              curAlbum = al;
              break;
            }
          }
        }
      }

      var photo = {
        name: file.name,
        path: file.root + '/' + file.name
      };
      // Now we have an accurate ref to curAlbum
      // (either freshly created or located), push our file into it
      curAlbum.photos.push(photo);
    }
    return cb(null, albums);
  },
  /*
   * Public API to node-gallery, currently just returns JSON block
   */
  init: function(params, cb){
    var me =  this;
    this.directory = params.directory;
    this.filter = params.filter || this.filter;

    this.readFiles(null, function(err, files){
      if (err){
        return cb(err);
      }

      me.buildAlbums(files, function(err, album){
        me.album = album;
        return cb(err, album);
      })
    });
  },
  getPhoto: function(params, cb){
    // bind the album name to the request
    var photoName = params.photo,
    albumPath = params.album;
    this.getAlbum(params, function(err, album){
      if (err){
        return cb(err);
      }

      var photos = album.photos;
      for (var i=0; i<photos.length; i++){
        var photo = photos[i];
        if (photo.name===photoName){
          return cb(null, photo);
        }
      }

      return cb('Failed to load photo ' + photoName + ' in album ' + albumPath, null);
    });
  },
  getAlbum: function(params, cb){
    var album = this.album,
    albumPath = params.album,
    dirs = albumPath.split('/');


    for (var i=0; i<dirs.length; i++){
      var dir = dirs[i];
      var aChildren = album.albums;
      for (var j=0; j<aChildren.length; j++){
        var aChild = aChildren[j];
        if (aChild.name === dir){
          album = aChild;
        }
      }
    }
    if (album.hash !== albumPath.replace(/\//g, "")){
      return cb('Failed to load album ' + albumPath, null);
    }
    return cb(null, album);

  },
  request: function(req, res, next){
    var ret = null, // photo or album to be returned
    err = null; // error condition

    //getterFunction = (req.params.photo==null) ? this.getAlbum : this.getPhoto;
    if (req.params.photo && req.params.photo!==null){
      this.getPhoto(req.params, function(err, photo){
        req.photo = photo;
        end(err, { type: 'photo', photo: photo});

      });
    }else{
      this.getAlbum(req.params, function(err, album){
        req.album = album;
        end(err, {type: 'album', album: album});
      });
    }

    // figure out what to do with our req, res, next...
    function end(err, data){
      if (err){
        req.err = err;
        if (next) return next(new Error(err));
        return;
      }

      if (next){
        return next();
      }else{
        if (res.render){
          res.render(data.type + '.ejs', data);
        }
      }
    }
  }
};

module.exports = gallery;
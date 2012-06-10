var fs = require('fs'),
util = require('util'),
ins = util.inspect;

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
        console.log('Skipping ' + stat.name);
        return next();
      }
      var file = {
        type: stat.type,
        name: stat.name,
        root: root
      };
      files.push(file);
      next();
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
          dirHash[dirHashKey] = true;
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


      // Now we have an accurate ref to curAlbum
      // (either freshly created or located), push our file into it
      curAlbum.photos.push(file.name);
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
        return cb(err, files);
      })
    });
  }

};

module.exports = gallery.init;


gallery.init({directory: 'photos'}, function(err, album){
  console.log(ins(album, true, null, true));
});


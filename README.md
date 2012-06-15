node-gallery
============

NodeJS Photo Gallery. Expects a directory of photos, builds a JSON object from this & outputs a styled photo gallery.

Installation
============

    $ npm install node-gallery

Usage
===================

    gallery.init({
      static: 'resources',
      directory: '/photos',
      rootURL: rootURL
    }, function(err, album){
      // album is a JSON block representing the photo album.
      // watch for [exif] errors in the console at this point - any malformed images cause issues.
      // we've now imported the photos & their exif, good to go.
    });

    /*
     * Now we can use gallery.request to pass web requests through to node-gallery
     * Here's an example using Express - for more, see app.js
     */

    app.get('/gallery/*', function(req, res){
      var path = req.params[0].trim(),
      isFile = /\b.(jpg|bmp|jpeg|gif|png|tif)\b$/,
      image = isFile.test(path),
      path = path.split("/");
      if (image){ // If we detect image file name at end, get filename
        image = path.pop();
      }
      path = path.join("/");
      gallery.request({
        params: {
          album: path,
          photo: image
        }
      }, res);
    });
    gallery.request({}, res);


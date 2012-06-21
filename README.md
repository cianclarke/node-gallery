node-gallery
============

NodeJS Photo Gallery. Feed it a directory of photos, get back a JSON object & a styled photo gallery ready for the web.
* No database needed
* Reads EXIF data for comments etc
* No setup time - just throw some photos into a directory!

Installation
============

    $ npm install node-gallery

Examples
===================
A usage example using node-gallery with Express can be found in app.js. It should be simple to use with a framework of your choice - EJS templates are included.

Usage (ExpressJS)
===================
    /*
     * Tested using Express 3.0 alpha - full example in 'app.js'
     */

    // Setup our app to use gallery middleware - also does init
    app.configure(function(){
      app.use(gallery.middleware({static: 'resources', directory: '/photos', rootURL: "/gallery"}));
    });

    // now, our middleware does gallery lookups for every URL under rootURL - e.g. /gallery
    app.get('/gallery*', function(req, res){
      // We automatically have the gallery data available to us in req thanks to middleware
      var data = req.gallery;
      // and we can res.render using one of the supplied templates (photo.ejs/album.ejs) or one of our own
      res.render(data.type + '.ejs', data);
    });


Usage (Standalone)
===================

    gallery.init({
      static: 'resources',
      directory: '/photos',
      rootURL: '/gallery'
    });

    /*
     * Now we can use gallery.getPhoto or gallery.getAlbum to pass web requests through to node-gallery
     */
    gallery.getAlbum({
          album: 'Ireland/Co. Waterford',
        }, function(err, album){
          // photo contains a JSON object representing our album.
          // Now, we'd pass this photo to ejs.render('views/album.ejs', album);
    });

    gallery.getPhoto({
      album: 'Ireland/Co. Waterford',
      photo: 'IMG_2040.jpg'
    }, function(err, photo){
      // photo contains a JSON object representing our photo.
      // Now, we'd pass this photo to ejs.render('views/photo.ejs', photo);
    });


Tests
============
Tests are written in raw javascript. To run,

    $ npm test

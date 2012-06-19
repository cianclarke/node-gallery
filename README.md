node-gallery
============

NodeJS Photo Gallery. Expects a directory of photos, builds a JSON object from this & outputs a styled photo gallery.

Installation
============

    $ npm install node-gallery

Examples
===================
A usage example can be found in App.js of node-gallery being consumed by Express. It should be simple to use with a framework of your choice - EJS templates are included.

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
     * Now we can use gallery.request to pass web requests through to node-gallery
     */

    gallery.request({
      params: {
        album: 'Ireland/Co. Waterford',
        photo: 'IMG_2040.jpg'
      }
    }, res);


Tests
============
Tests are written in raw javascript. To run,

    $ npm test

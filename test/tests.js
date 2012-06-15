var assert = require('assert'),
colors = require('colors'),
// require the stuff actually being tested
exif = require('../exif.js'),
gallery = require('../gallery.js');

/*
 * Test the Exif module
 */
var aPhoto = { name: 'SomePhoto', path: 'photos/lake.jpg' };
exif("test/" + aPhoto.path, aPhoto, function(err, photo){
  console.log('[exif] Starting exif tests'.yellow);
  assert.equal(photo.name, aPhoto.name);
  assert.equal(photo.path, aPhoto.path);
  assert.ok(photo.exif);
  var ex = photo.exif;
  assert.equal(ex.Make, "Canon");
  assert.equal(ex.Model, "Canon EOS 20D");
  assert.equal(ex.ISO, "200");
  assert.ok(ex.Time);
  console.log('[exif] Pass ✓'.green);
});


/*
 * Test the Gallery module
 */
var galleryParams = {static: 'test', directory: '/photos', name: 'Test Gallery'};
gallery.init(galleryParams, function(err, album){
  console.log('[gallery] Starting gallery tests'.yellow);
  assert.ok(!err);
  assert.equal(album.name, galleryParams.name);
  assert.equal(album.albums.length, 1); // OK with empty directories being excluded - bit lazy..
  assert.equal(album.photos.length, 1);
  assert.equal(album.albums[0].photos.length, 1);
  assert.ok(album.thumb);
  console.log('[gallery] Pass ✓'.green);

  var req = {
    params: {
      photo: 'lake.jpg',
      album: 'album1'
    }
  };
  gallery.getPhoto(req, function(err, photo){
    console.log('[gallery.getPhoto()] Starting gallery tests'.yellow);
    assert.ok(!err);
    console.log('[gallery.getPhoto()] Pass ✓'.green);
  });

});
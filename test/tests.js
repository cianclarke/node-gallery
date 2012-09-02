var assert = require('assert'),
colors = require('colors'),
// require the stuff actually being tested
exif = require('../exif.js'),
gallery = require('../gallery.js');

/*
 * Test the Exif module
 */
var aPhoto = { name: 'SomePhoto', path: 'photos/lake.jpg' };
console.log('[exif] Starting exif tests'.yellow);
exif("test/" + aPhoto.path, aPhoto, function(err, photo){
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
console.log('[gallery] Starting gallery tests'.yellow);
gallery.init(galleryParams, function(err, album){
  assert.ok(!err);
  assert.equal(album.name, galleryParams.name);
  assert.equal(album.albums.length, 1); // OK with empty directories being excluded - bit lazy..
  assert.equal(album.photos.length, 1);
  assert.equal(album.albums[0].photos.length, 1);
  assert.ok(album.thumb);
  console.log('[gallery] Pass ✓'.green);

  var req = {
    photo: 'lake.jpg',
    album: 'album1'
  };

  console.log('[gallery.getPhoto()] Starting gallery tests'.yellow);
  gallery.getPhoto(req, function(err, photo){
    assert.ok(!err);
    console.log('[gallery.getPhoto()] Pass ✓'.green);
  });

});

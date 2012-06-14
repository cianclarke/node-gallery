var ExifImage = require('exif').ExifImage;

try {
  new ExifImage({ image : 'resources/photos/MG_4100.jpg' }, function (error, image) {
    if (error)
      console.log('Error: '+error.message);
    else
      console.log(image); // Do something with your data!
  });
} catch (error) {
  console.log('Error: ' + error);
}

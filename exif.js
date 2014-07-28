var ExifImage = require('exif').ExifImage;
/*
 * Utility function to convert exif data into something a bit more consumable
 * by a template
 */
var exif = function(staticPath, photo, callback) {
    // We don't care about errors in here - we can always return an undefined exif
    photo.exif = undefined;
    try {
        new ExifImage({
            image: staticPath //'resources/photos/Ireland/West Coast/_MG_4174.jpg'
        }, function(error, data) {
            if (error) {
                console.log('[exif.js] error in ' + staticPath + ': ' + JSON.stringify(error));
                photo.exif = false;
                return callback(null, photo);
            } else {
                var exifMap = {};
                var image = data.image,
                    exif = data.exif,
                    gps = data.gps,
                    arrays = image.concat(exif, gps);
                for (var i = 0; i < arrays.length; i++) {
                    var t = arrays[i],
                        careAbout = { // what props we're interested in, and what we call them in output, rather than silly exif-ey names
                            "Make": "Make",
                            "Model": "Model",
                            "DateTimeOriginal": "Time",
                            "ApertureValue": "aperture",
                            "FocalLength": "focalLength",
                            "ISOSpeedRatings": "ISO",
                            "ExposureTime": "Shutter Speed",
                            "GPSLatitude": "Lat",
                            "GPSLongitude": "Long",
                            "ImageDescription": "Description"
                        };
                    if (careAbout.hasOwnProperty(t.tagName)) {
                        var key = careAbout[t.tagName],
                            value = t.value;
                        if (key == "Shutter Speed") {
                            // Transform shutter speed to a fraction
                            value = dec2frac(value);
                        }
                        if (typeof value == "number") {
                            value = Math.round(value * 100) / 100; // no long decimals
                        }
                        exifMap[key] = value;
                    }
                }
                photo.exif = exifMap;
                return callback(null, photo);
            }
        });
    } catch (error) {
        return callback(null, photo);
    }
}
// source: http://stackoverflow.com/questions/95727/how-to-convert-floats-to-human-readable-fractions
    function dec2frac(d) {
        var df = 1;
        var top = 1;
        var bot = 1;
        while (df != d) {
            if (df < d) {
                top += 1;
            } else {
                bot += 1;
                top = parseInt(d * bot);
            }
            df = top / bot;
        }
        return top + '/' + bot;
    }
module.exports = exif;
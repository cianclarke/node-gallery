var mongoose = require('mongoose');
var album = require('./model/album');
var image = require('./model/image');
mongoose.connect('mongodb://localhost/gallery');
var mongoconnection = mongoose.connection;
var connected = false;
mongoconnection.on('error', console.error.bind(console, 'Error connecting to DB!'));
mongoconnection.on('open', function cb() {
	console.log("Connected to DB");
	connected = true;
});
mongoconnection.on('disconnected', function cb() {
	connected = false;
});
var imageSchema = image.imageSchema(mongoose);
var albumSchema = album.albumSchema(mongoose);

function isConnected() {
	return connected;
}

function newAlbum(attributes) {
	var Album = mongoose.model('Album', albumSchema);
	var album = new Album(attributes);
	album.save();
	return album;
}

function albumExists(hashKey) {
	mongoose.model('Album',albumSchema).find({ hash: hashKey}, function(err,result) {
		if(err) {
			console.log("Error in determining if album with has "+hashKey+" exists");
		}
		if(!result) {
			return false;
		} else {
			return true;
		}
	});
}

function newImage(attributes) {
	var Image = mongoose.model('Image', imageSchema);
	var image = new Image(attributes);
	image.save();
	return image;
}

function imageExists(album, name) {
	mongoose.model('Image', imageSchema).find({ albumHash: album, imageName: name}, function(err,result) {
		if(err) {
			console.log("Error in determining if image with ")
		}
		if(!result) {
			return false;
		} else {
			return true;
		}
 	});
}

function updateImage(attributes) {

}

imageSchema.methods = {
}

albumSchema.method = {
		imageCount: function() { return this.images.lenght; },
		getPath: function() { return this.images.path; },
		getName: function () { return this.images.albumName; },
		getPrintName: function() { return this.images.printName; }
};
exports.isConnected = isConnected;
exports.newAlbum = newAlbum;
exports.albumExists = albumExists;
exports.newImage = newImage;
exports.imageExists = imageExists;
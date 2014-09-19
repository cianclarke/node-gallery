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

imageSchema.methods = {
}

albumSchema.method = {
		imageCount: function() { return this.images.lenght; },
		getPath: function() { return this.images.path; },
		getName: function () { return this.images.albumName; },
		getPrintName: function() { return this.images.printName; }
};
exports.isConnected = isConnected;
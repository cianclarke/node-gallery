var mongoose = require('mongoose');
var album = require('./album');
var image = require('./image');
mongoose.connect('mongodb://localhost/gallery');
var mongoconnection = mongoose.connection;
mongoconnection.on('error', console.error.bind(console, 'Error connecting to DB!'));
mongoconnection.on('open', function cb() {
	console.log("Connected to DB");
});
var imageSchema = image.getSchema(mongoose);
var albumSchema = album.getSchema(mongoose);

imageSchema.methods = {
}

albumSchema.method = {
		imageCount: function() { return this.images.lenght; },
		getPath: function() { return this.images.path; },
		getName: function () { return this.images.albumName; }.
		getPrintName: function() { return this.images.printName; }
};


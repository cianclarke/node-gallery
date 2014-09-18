function imageSchema(mongoose) {
	return mongoose.Schema({
		id : {type String, required: 'id is required', unique: true},
		imageName: {type: String, required: 'imageName is required'},
		imageFilename: {type : String},
		imageThumbnail: {type : String},
		exif: {type Object}
	});
}
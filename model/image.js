function imageSchema(mongoose) {
	return mongoose.Schema({
		'albumHash': {type: String, required: 'image needs to be within an album'},
		'imageName': {type: String, required: 'imageName is required'},
		'imageFilename': {type : String},
		'imageThumbnail': {type : String},
		'exif': {type: Object}
	});
}
exports.imageSchema = imageSchema;
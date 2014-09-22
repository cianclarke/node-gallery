function imageSchema(mongoose) {
	return mongoose.Schema({
		'id' : {type: String, required: 'id is required', unique: true},
		'albumHash': {type: String, required: 'image needs to be within an album'},
		'imageName': {type: String, required: 'imageName is required'},
		'imageFilename': {type : String},
		'imageThumbnail': {type : String},
		'exif': {type: Object}
	});
}
exports.imageSchema = imageSchema;
function albumSchema(mongoose) {
	return mongoose.Schema({
		'name' : String,
		'prettyName' : String,
		'description' : String,
		'hash' : {type: String, required: 'hash is required', unique: true},
		'path' : String,
		'photos' : [String],
		'albums' : [String]
	});
}
exports.albumSchema = albumSchema;
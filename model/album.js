function albumSchema(mongoose) {
	return mongoose.Schema({
		'name' : String,
		'prettyName' : String,
		'description' : String,
		'hash' : String,
		'path' : String,
		'photos' : [String],
		'albums' : [String]
	});
}
exports.albumSchema = albumSchema;
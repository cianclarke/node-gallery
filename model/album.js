function albumSchema(mongoose) {
	return mongoose.Schema({
		'albumName' : String,
		'printName' : String,
		'fsPath' : String,
		'images' : [String]
	});
}
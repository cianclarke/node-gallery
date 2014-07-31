var fs = require('fs');

function saveFile(tmpPath,fileName,folderName) {
	fs.readFile(tempPath, function(err,data) {
		if(err) throw err;
		console.log("Saving file from "+tmpPath+" using name "+fileName+", to folder "+folderName);
	});
}

exports.receive = function(req) {
	console.log("Receive called on upload module...");
	console.log("Req.files is "+reg.files.length+" items long.");
	fileNames = keys(reg.files);
	for(var count = 0; count < reg.file.length; count ++) {
		saveFile(fileNames[i].path, filenames[i].name, "joopajoo"); 
	}
};


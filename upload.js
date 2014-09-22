var fs = require('fs'),
	busboy = require('connect-busboy'),
	util = require('util');

exports.receive = function(req,res) {
	console.log("Receive called on upload module...");
	var fstream;
	var folderName = undefined;
    req.pipe(req.busboy);

    req.busboy.on('field', function(fieldname, val) {
      console.log('Field [' + fieldname + ']: value: ' + util.inspect(val));
      if(fieldname == 'albumName') {
      	folderName = val;
      }
    }); 
    req.busboy.on('file', function (fieldname, file, filename) {
        console.log("Uploading: " + filename); 
        fstream = fs.createWriteStream(__dirname + '/resources/'+folderName+	'/' + filename);
        file.pipe(fstream);
        fstream.on('close', function () {
            res.redirect('back');
        });
    });
};


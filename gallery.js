var fs = require('fs'),
    exif = require('./exif.js'),
    walk = require('walk'),
    util = require('util'),
    path = require('path'),
    nodeCache = require('node-cache'),
    db = require('./db'),
    im = require('imagemagick'),
    md5 = require('MD5');

var gallery = {
    /*
     * Directory where the photos are contained
     */
    directory: undefined,
    /*
     * Optional static directory to prefix our directory references with
     * This won't get output in templates - only needed if we've defined a static
     * directory in a framework like express.
     */
    static: undefined,
    /*
     * root URL of the gallery - defaults to root, or '' - NOT '/'
     * an example would be '/gallery', NOT '/gallery/'
     * This has no reflection on where the static assets are stored
     * it's just where our gallery lies in a URL router
     */
    rootURL: '',
    /*
     * Our constructed album JSON lives here
     */
    album: undefined,
    /*
     * Name of our gallery
     */
    name: 'Ekukka Photo Gallery',
    /*
     * Image to display when no thumbnail could be located
     */
    noThumbnail: '', // TODO: Bundle a default no thumbnail image?
    /*
     * Filter string to use for excluding filenames. Defaults to a regular expression that excludes dotfiles.
     */
    filter: /^Thumbs.db|^\.[a-zA-Z0-9]+/,
    /*
     * Object used to store binary chunks that represent image thumbs
     */
    imageCache: new nodeCache(),

    /*
     * Reference to db connection
     */ 

    db: undefined,

    resourceType : {
        IMAGE : 0,
        ALBUM : 1,
        INTERFACE : 2
    },
    resourceName: undefined,
    /*
     * Private function to walk a directory and return an array of files
     */
    readFiles: function(params, cb) {
        var files = [],
            dircount = 0,
            directoryPath = (this.static) ? this.static + "/" + this.directory : this.directory,
            me = this;
        var walker = walk.walk(directoryPath, {
            followLinks: false
        });
        walker.on("directories", function(root, dirStatsArray, next) {
            // dirStatsArray is an array of `stat` objects with the additional attributes
            // * type
            // * error
            // * name
            dircount++;
            next();
        });
        walker.on('file', function(root, stat, next) {
            if (stat.name.match(me.filter) != null) {
                return next();
            }
            // Make the reference to the root photo have no ref to this.directory
            var rootlessRoot = root.replace(directoryPath + "/", "");
            rootlessRoot = rootlessRoot.replace(directoryPath, "");
            var file = {
                type: stat.type,
                name: stat.name,
                rootDir: rootlessRoot
            };
            files.push(file);
            return next();
        });
        walker.on('end', function() {
            console.log("Found "+files.length+ " files in "+dircount+" directories.");
            return cb(null, files);
        });
    },
    /*
     * Private function to build an albums object from the files[] array
     */
    buildAlbums: function(files, cb) {
        function _fullDirPathOf(file) {
            return "./"+gallery.static + "/" +gallery.directory + "/" + file.rootDir; 
        }

        function _fullPathOf(file) {
            return "./"+gallery.static + "/" +gallery.directory + "/" + file.rootDir + "/"+file.name;    
        }

        function _generateAlbumName(file) {
            return file.rootDir;
        }

        for (var i = 0; i < files.length; i++) {
            var file = files[i],
                dirHashKey = "";
            fullDirOfFile = _fullDirPathOf(file);
            console.log("Processing "+fullDirOfFile);
            if(fs.lstatSync(fullDirOfFile).isDirectory()) {
                dirHashKey = md5(_fullPathOf(file));
                if (!db.albumExists(dirHashKey)) {
                    console.log("Found a non-existing album with key "+dirHashKey);
                    // If we've never seen this album before, let's create it
                    var newAlbum = {
                         name: _generateAlbumName(file),
                         prettyName: decodeURIComponent(_generateAlbumName(file)),
                         description: "",
                         hash: dirHashKey,
                         path: file,
                         photos: [],
                         albums: []
                     };
                    // return should be cached...
                    var toBeSaved = db.newAlbum(newAlbum);

                } else {
                    console.log("Albums with hash "+dirHashKey+" already exists.");
                }
            }/*
            var filepath = file.rootDir + '/' + file.name
            
            var photoName = file.name.replace(/.[^\.]+$/, "");
            var photo = {
                name: photoName,
                path: filepath
            };
            (function(photo, curAlbum) {
                var fullPath = gallery.directory + "/" + photo.path;
                fullPath = (gallery.static) ? gallery.static + "/" + fullPath : fullPath;
                exif(fullPath, photo, function(err, exifPhoto) {
                        // no need to do anything with our result - we've altered
                        // the photo object..
                });
            })(photo, curAlbum);
            
            curAlbum.photos.push(photo);
            }
        }
        // Function to iterate over our completed albums, calling _buildThumbnails on each
        function _recurseOverAlbums(al) {
            if (!al.thumb) {
                al.thumb = _buildThumbnails(al); // only set this album's thumbanil if not already done in info.json
            }
            if (al.albums.length > 0) {
                for (var i = 0; i < al.albums.length; i++) {
                    _recurseOverAlbums(al.albums[i]);
                }
            }
        }
        var me = this;

        function _buildThumbnails(album) {
            var photoChildren = album.photos,
                albumChildren = album.albums;
            if (photoChildren.length && photoChildren.length > 0) {
                var albumThumb = photoChildren[0].path;
                return albumThumb;
            } else {
                if (albumChildren.length && albumChildren.length > 1) {
                    return _buildThumbnails(albumChildren[0]);
                } else {
                    // TODO: No image could be found
                    return me.noThumbnail;
                }
            }*/
        }
        //_recurseOverAlbums(albums);
        return cb(null);
    },
    /*
     * Public API to node-gallery, currently just returns JSON block
     */
    init: function(params, cb) {
        var me = this,
            directory = params.directory,
            staticDir = params.static;
        if (!cb || typeof cb !== "function") {
            cb = function(err) {
                if (err) {
                    throw new Error(err.toString());
                }
            };
        }
        if (!directory) throw new Error('`directory` is a required parameter');
        // Massage our static directory and directory params into our expected format
        // might be easier by regex..
        if (staticDir && staticDir.charAt(0) === "/") {
            staticDir = staticDir.substring(1, staticDir.length);
        }
        if (directory.charAt(0) === "/") {
            directory = directory.substring(1, directory.length);
        }
        if (directory.charAt(directory.length - 1) === "/") {
            directory.substring(0, directory.length - 1); // yes length-1 - .lenght is the full string remember
        }
        if (staticDir.charAt(staticDir.length - 1) === "/") {
            staticDir.substring(0, staticDir.length - 1); // yes length-1 - .lenght is the full string remember
        }
        this.rootURL = params.rootURL;
        this.directory = directory;
        console.log("Startup");
        console.log(".......");
        this.static = staticDir;
        console.log("Resource directory:"+this.static);
        console.log("Directory which will be part of gallery url:"+this.directory);
        this.name = params.name || this.name;
        console.log("Name of the gallery:"+this.name);
        this.filter = params.filter || this.filter;
        console.log("Waiting for connection...");
        while(db.isConnected()) { console.log(".")};
        this.readFiles(null, function(err, files) {
            if (err) {
                return cb(err);
            }
            me.buildAlbums(files, function(err) {
                return cb(err);
            })
        });
    },
    /*
     * Returns a photo. Usage:
     * getPhoto({ photo: 'test.jpg', album: 'Ireland'}, function(err, photo){
     *   console.log(photo.path);
     * );
     */
    getPhoto: function(params, cb) {
        // bind the album name to the request
        var photoName = params.photo.replace(/.[^\.]+$/, ""), // strip the extension
            albumPath = params.album;
        this.getAlbum(params, function(err, data) {
            if (err) {
                return cb(err);
            }
            var album = data.album;
            var photos = album.photos;
            for (var i = 0; i < photos.length; i++) {
                var photo = photos[i];
                if (photo.name === photoName) {
                    return gallery.afterGettingItem(null, {
                        type: 'photo',
                        photo: photo
                    }, cb);
                }
            }
            return cb('Failed to load photo ' + photoName + ' in album ' + albumPath, null);
        });
    },

    getInterface: function(params, cb) {
        if (params.photo == 'upload') {
            return cb(null, {type: 'upload', album: this.album, directory : "/"});
        } else if (params.photo == 'listing') {
            console.log("Seeking album "+params.album+" from "+this.album.albums.length+" albums.");
            for (var i = 0; i < this.album.albums.length; i++) {
                var album = this.album.albums[i];
                console.log("Comparing "+album.path+" and "+params.album);  
                console.log("i is "+i);         
                if (album.path == params.album) {
                    return cb(null, {type: 'listing', listing: JSON.stringify(this.album)});
                } 
            } 
            return cb(null, {type: 'listing', listing: JSON.stringify(null)});
        }
    },
    /*
     * Function to return a specific album. Usage:
     * gallery.getAlbum({ album: 'Ireland/Waterford', function(err, album){
     *   console.log(album.path);
     * });
     */
    getAlbum: function(params, cb) {
        var album = this.album,
            albumPath = params.album;
        if (!albumPath || albumPath == '') {
            //return cb(null, album);
            return this.afterGettingItem(null, {
                type: 'album',
                album: album
            }, cb);
        }
        var dirs = albumPath.split('/');
        for (var i = 0; i < dirs.length; i++) {
            var dir = dirs[i];
            var aChildren = album.albums;
            for (var j = 0; j < aChildren.length; j++) {
                var aChild = aChildren[j];
                if (aChild.name === dir) {
                    album = aChild;
                }
            }
        }
        if (album.hash !== albumPath.replace(/\//g, "")) {
            return cb('Failed to load album ' + albumPath, null);
        }
        return this.afterGettingItem(null, {
            type: 'album',
            album: album
        }, cb);
    },
    /*
     * Private function which massages the return type into something useful to a website.
     * Builds stuff like a breadcrumb, back URL..
     */
    afterGettingItem: function(err, data, cb) {
        var item = data[data.type];
        var breadcrumb = item.path.split("/");
        var back = data.back = breadcrumb.slice(0, item.path.split("/").length - 1).join("/"); // figure out up a level's URL
        // Construct the breadcrumb better.
        data.breadcrumb = [];
        var breadSoFar = "" + this.rootURL + "";
        // Add a root level to the breadcrumb
        data.breadcrumb.push({
            name: this.name,
            url: this.rootURL
        });
        for (var i = 0; i < breadcrumb.length; i++) {
            var b = breadcrumb[i];
            if (b == "") {
                continue;
            }
            breadSoFar += "/" + breadcrumb[i];
            data.breadcrumb.push({
                name: b,
                url: breadSoFar
            });
        }
        data.name = this.name;
        data.directory = this.directory;
        data.rootDir = this.rootURL;
        return cb(err, data);
    },
    middleware: function(options) {
        var me = this;
        var currentType = undefined;
        this.init(options);
        return function(req, res, next) {
            var url = req.url,
                rootURL = gallery.rootURL,
                params = req.params,
                requestParams = {};
            var staticTest = /\.png|\.jpg|\.css|\.js/i;
            console.log("Middleware: url is: "+url);
            if (rootURL == "" || url.indexOf(rootURL) === -1 /*|| staticTest.test(url)*/ ) {
                //     This isn't working just quite yet, let's skip over it
                var thumbTest = /[a-zA-Z0-9].*(\.png|\.jpg)&tn=1/i;
                if (thumbTest.test(url)) {
                    url = req.url = url.replace("&tn=1", "");
                    var imagePath = me.static + decodeURI(url);
                    var cacheObject = me.imageCache.get(imagePath);
                    if (Object.keys(cacheObject).length != 0) {
                        console.log("Cache hit for thumbnail: "+imagePath);
                        res.contentType('image/jpg');
                        res.end(cacheObject, 'binary');
                    } else {
                        console.log("Adding "+imagePath+" to thumbnail cache.");
                        fs.readFile(imagePath, 'binary', function(err, file) {
                            if (err) {
                                console.log(err);
                                return res.send(err);
                            }
                            try {
                                im.resize({
                                    srcData: file,
                                    width: 128
                                }, function(err, binary, stderr) {
                                    if (err) {
                                        util.inspect(err);
                                        res.send('Error generating thumb.');
                                    }
                                    res.contentType('image/jpg');
                                    res.end(binary, 'binary');
                                    me.imageCache.set(imagePath, binary);
                                });
                            } catch (error) {
                                console.log("Error in cache entry generation.");
                                console.log(error);
                                console.log(error.stack);
                            }
                        });
                    }
                    return;
                }
                // Not the right URL. We have no business here. Onwards!
                return next();
            }
            url = url.replace(rootURL, "");
            // Do some URL massaging - wouldn't have to do this if .params were accessible?
            if (url.charAt(0) === "/") {
                url = url.substring(1, url.length);
            }
            url = decodeURIComponent(url);
            console.log("Url used in routing: "+url);
            
            var filepath = url.trim(),
            isFile = /\b.(jpg|bmp|jpeg|gif|png|tif)\b$/;
            isUpload = /upload$/;
            isListing = /list$/;
            filepath = filepath.split("/");
            lastItem = filepath[filepath.length-1].toLowerCase();
            console.log("FilePath last item tested is: "+lastItem);
            if(isFile.test(lastItem)) {
                currentType = gallery.resourceType.IMAGE;
                resourceName = filepath.pop();
            } else if (isUpload.test(lastItem)) {
                currentType = gallery.resourceType.INTERFACE;
                resourceName = 'upload';
            } else if (isListing.test(lastItem)) {
                currentType = gallery.resourceType.INTERFACE;
                resourceName = 'listing';
                //for getting the folder's name in listing
                filepath = filepath[filepath.length-2];
            } else {
                filepath = filepath.join("/").trim();
                currentType = gallery.resourceType.ALBUM;
                resourceName = null;
            }
            requestParams = {
                album: filepath,
                photo: resourceName
            };
         
            var getterFunction;
            console.log("current type is "+currentType);
            if (currentType == gallery.resourceType.IMAGE) {
                console.log("Hander is getPhoto.");
                getterFunction = gallery.getPhoto;
            } else if(currentType == gallery.resourceType.INTERFACE) {
                console.log("Handler is getInterface.");
                getterFunction = gallery.getInterface;
            } else if(currentType == gallery.resourceType.ALBUM) {
                console.log("Handler is getAlbum.");
                getterFunction = gallery.getAlbum;
            } else {
                console.log("Handler is undefined!");
            }
            getterFunction.apply(gallery, [requestParams,
                function(err, data) {
                    req.gallery = data;
                    return next(err);
                    //Should we do this here? res.render(data.type + '.ejs', data);
                }
            ]);
        }
    }
};
module.exports = gallery;
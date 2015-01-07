var express = require('express'),
fs = require('fs'),
path = require('path');

module.exports = function(config){
  var router = new express.Router(),
  albumRoot = config.albumRoot;
  
  if (!albumRoot){
    throw new Error('No album root specified');
  }
  
  // Photo Page
  router.get(/.+(\.(jpg|bmp|jpeg|gif|png|tif))$/i, function(req, res, next){
    return res.end('pic');
  });
  
  // Album Page
  router.get('/*', require('./album')(config));
  return router;
};

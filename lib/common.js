var _ = require('underscore'),
path = require('path'),
config;

module.exports = function(cfg){
  config = cfg;
  return common;
};

var common = {};

common.breadcrumb = function(paths){
  paths = paths.split('/');
  var breadcrumb = [{
    name : 'Gallery',
    url : config.urlRoot
  }],
  joined = '';
  breadcrumb = breadcrumb.concat(_.map(paths, function(pathSeg){
    joined = path.join(joined, pathSeg);
    return {
      name : pathSeg,
      url : path.join(config.urlRoot, joined)
    }
  }));
  return breadcrumb;
}

common.friendlyPath = function(unfriendlyPath){
  return decodeURI(unfriendlyPath).replace(/^\//, '').replace(/\/$/, '');
}

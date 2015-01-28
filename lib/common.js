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
    name : config.title || 'Gallery',
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

common.render = function(req, res, next){
  var data = req.data,
  tpl = req.tpl;

  if (req.accepts('html')){
    return res.render(tpl, data);  
  }else{
    return res.json(data);
  }
  
}

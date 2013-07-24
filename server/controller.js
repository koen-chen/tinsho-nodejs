var url = require('url');
var path = require('path');
var fs = require('fs');
var mongo = require('mongodb');
var router = require('./router');

var mimeType = {
	'html': 'text/html',
	'css': 'text/css',
	'js': 'text/javascript',
	'png': 'image/png',
	'jpg': 'image/jpeg',
	'jpeg': 'image/jpeg',
	'ico': 'image/x-icon'
};

function Controller(request, response, db) {
	if (!(this instanceof Controller)) {
		return new Controller(request, response, db);
	}

	this.request = request;
	this.response = response;
	this.db = db;
	this.pathName = url.parse(this.request.url, true).pathname;
	this.extName = path.extname(this.pathName).substring(1);
	this.needAuth = ['/addQuote'];

	this.init();
}

Controller.prototype = {
	init: function(){
		this.extName ? this.feedStatic() : this.feedDynamic();
	},

	feedStatic: function(){
		fs.exists('./client' + this.pathName, function(exists){
			if (exists) {
				this.response.setHeader('Content-Type', mimeType[this.extName] + ';charset=utf-8');
				fs.createReadStream('./client' + this.pathName).pipe(this.response);
			}
			else {
				this.redirect('/');
			}
		}.bind(this));
	},

	feedDynamic: function() { 
		if (router[this.request.method] && router[this.request.method][this.pathName]) {
			var doFn = router[this.request.method][this.pathName];
			this.needAuth.indexOf(this.pathName) != -1 ? this.checkAuth(doFn) : doFn.call(this);
		}
		else {
			this.redirect('/');
		}
	},

	checkAuth: function(callback){
		var cookies = this.request.headers.cookie;
		
		if (cookies) {
			var result = cookies.match(/uid=(.*);?/);
			if (!result || !result[1]) {
				this.redirect('/');
			}
			
			var oid = new mongo.BSONPure.ObjectID(result[1]);
			this.db.collection('users').findOne({ _id:oid }, function(err, account){
				!account ? this.redirect('/') : callback.call(this);
			}.bind(this));
		}
		else {
			this.redirect('/');
		}
	},

	redirect: function(location){
		this.response.writeHead(301, { Location: location });
		this.response.end();
	},

	render: function(page){
		fs.createReadStream('./server/views/'+ page +'.html').pipe(this.response);
	}
};

module.exports = Controller;
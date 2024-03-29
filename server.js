var http = require('http');
var crypto = require('crypto');
var config = require('./config');
var Controller = require('./server/controller');
var MongoClient = require('mongodb').MongoClient;

MongoClient.connect('mongodb://127.0.0.1:'+ config.dbPort +'/' + config.dbName, function(err, db){
	db.admin().authenticate(config.adminUsername, config.adminPassword, function(err, reslut){
		if (!err) {
			initSuper(db);
		}
		else {
			console.error(err);
		}
	});
	
	http.createServer(function(request, response){
		new Controller(request, response, db);
	}).listen(3000);
});

function initSuper(db) {
	db.collection('users').count({ username: config.superUsername, role: 'super' }, function(err, count){
		if (count == 0) {
			var shaSum = crypto.createHash('sha256');
			shaSum.update(config.superPassword);

			db.collection('users').insert({
				username : config.superUsername,
				password: shaSum.digest('hex'),
				role: config.role,
				create_at: Date.now(),
				update_at: Date.now()
			}, function(){});
		}
	});
}

var http = require('http');
var crypto = require('crypto');
var config = require('./config');
var Controller = require('./server/controller');
var MongoClient = require('mongodb').MongoClient;

MongoClient.connect('mongodb://127.0.0.1:'+ config.dbport +'/' + config.dbname, function(err, db){
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
	db.collection('users').count({ role: 'super' }, function(err, count){
		if (count == 0) {
			var shaSum = crypto.createHash('sha256');
			shaSum.update(config.password);

			db.collection('users').insert({
				username : config.username,
				password: shaSum.digest('hex'),
				role: config.role,
				create_at: Date.now(),
				update_at: Date.now()
			}, function(){});
		}
	});
}

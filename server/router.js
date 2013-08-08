var qs = require('querystring');
var crypto = require('crypto');

function fetchPost(callback) {
	var bodyData = '';
	
	this.request.on('data', function(chunk){
		bodyData += chunk;
	});
	this.request.on('end', function(){
		var body = qs.parse(bodyData);
		callback.call(this, body);
	}.bind(this));
}

var Router = {
	home: function(){
		this.render('base');
	},

	admin: function(){
		this.render('admin');
	},

	login: function(){
		fetchPost.call(this, function(body){
			var shaSum = crypto.createHash('sha256');
			shaSum.update(body.password.trim()); 
			this.db.collection('users').findOne({ username: body.username.trim(), password: shaSum.digest('hex') }, function(err, account){
				this.response.statusCode = 200; 
				this.response.setHeader('Content-Type', 'text/plain');
				if (account) {
					this.response.setHeader('Set-cookie', 'uid=' + account._id);
					this.response.end('{ "auth": true }');
				}
				else {
					this.response.end('{ "auth": false }');
				}
			}.bind(this));
		});
	},

	fetchQuote: function(){
		fetchPost.call(this, function(body){
			var skip = body.skip;
			this.db.collection('quotes').count(function(err, count){
				var remain = count - skip * 5;
				var reskip = 0;
				if (remain > 5) {
					reskip = parseInt(skip) + 1;
				}

				this.db.collection('quotes').find().skip(skip * 5).limit(5).sort('create_at':1).toArray(function(err, docs){
					var res = '{ "skip" : ' + reskip +', "quotes" : '+ JSON.stringify(docs) +'}';
					this.response.write(res);
					this.response.end();
				}.bind(this));
			}.bind(this));
		});
	},

	addQuote: function(){
		fetchPost.call(this, function(body){
			var content = body.content.trim();
			var author = body.author.trim();

			if (content && author){
				this.db.collection('quotes').count({ content: content, author: author }, function(err, count){
					if (count == 0) {
						this.db.collection('quotes').insert({
							content: content,
							author: author,
							create_at: Date.now(),
							update_at: Date.now()
						}, function(err, quote){
							this.response.writeHead(200, {"Content-Type": "text/plain"});
							if (!err) {
								this.response.end('{ "message": true }');
							}
							else {
								this.response.end('{ "message": false }');
							}
						}.bind(this));
					}
				}.bind(this));		
			}
		});
	}
};

module.exports = {
	'GET': {
		'/' : Router.home,
		'/admin': Router.admin
	},

	'POST': {
		'/login': Router.login,
		'/fetchQuote': Router.fetchQuote,
		'/addQuote': Router.addQuote
	}
};
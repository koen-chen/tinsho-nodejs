function Admin() {
	if (!(this instanceof Admin)) {
		return new Admin();
	}

	this.init();
}

Admin.prototype = {
	init: function(){
		this.bindElement();
		this.showLoginPage();
	},

	makeRequest: function(options){
		var request = new XMLHttpRequest();
		request.onreadystatechange = function(){
			if (request.readyState == 4 && request.status == 200) {
				options.callback.call(this, request.responseText);
			}
		}.bind(this);
		request.open(options.method, options.url);
		request.setRequestHeader('Content-Type', 'text/plain');
		request.send(options.data);
	},

	bindElement: function(){
		this.main = document.querySelector('.main');
		this.loginPage = document.getElementById('loginPageTpl').innerHTML;
		this.addQuotePage = document.getElementById('addQuotePageTpl').innerHTML;
	},

	login: function(event){
		event.preventDefault();

		this.makeRequest({
			method: 'POST',
			url: '/login',
			data: 'username=' + this.username.value + '&password=' + this.password.value,
			callback: function(data){
				var data = JSON.parse(data);
				data.auth ? this.showAddQuotePage() : this.showLoginPage();
			}
		});
	},

	addQuote: function(event){
		event.preventDefault();

		this.makeRequest({
			method: 'POST',
			url: '/addQuote',
			data: 'content=' + this.content.value + '&author=' + this.author.value,
			callback: function(data){
				var data = JSON.parse(data);
				alert(data.message);
			}
		});
	},
	
	showLoginPage: function(){
		this.main.innerHTML = this.loginPage;
		this.loginForm = document.querySelector('form');
		this.username = document.querySelector('input[name="username"]');
		this.password = document.querySelector('input[name="password"]');

		this.loginForm.addEventListener('submit', this.login.bind(this), false);
	},

	showAddQuotePage: function(){
		this.main.innerHTML = this.addQuotePage;
		this.addQuoteForm = document.querySelector('form');
		this.content = document.querySelector('textarea[name="content"]');
		this.author = document.querySelector('input[name="author"]');

		this.addQuoteForm.addEventListener('submit', this.addQuote.bind(this), false);
	}
};

window.onload = function(){
	new Admin();
}
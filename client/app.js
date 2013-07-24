function Tinsho() {
	if (!(this instanceof Tinsho)) {
		return new Tinsho();
	}

	this.current = 0;
	this.init();
}

Tinsho.prototype = {
	init: function(){
		this.bindElement();
		this.bindEvent();
		this.fetchQuote(0);
		this.showQuotePage();
	},

	makeRequest: function(options){
		var request = new XMLHttpRequest();
		request.onreadystatechange = function(){
			if (request.readyState == 4 && request.status == 200) {
				options.callback.call(this, request.responseText);
			}
		}.bind(this);
		request.open(options.method, options.url);
		request.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
		request.send(options.data);
	},

	fetchQuote: function(skip){
		this.makeRequest({
			method: 'POST',
			url: '/fetchQuote',
			data: 'skip=' + skip,
			callback: this.processQuote
		});
	},

	processQuote: function(data){
		var resp = JSON.parse(data);
		this.skip = resp.skip;
		this.quotes = resp.quotes;
		this.updateQuote();
	},

	bindElement: function(){
		this.main = document.querySelector('.main');
		this.aboutBtn = document.querySelector('.aboutBtn');
		this.mobileBtn = document.querySelector('.mobileBtn');
		this.quotePage = document.getElementById('quotePageTpl').innerHTML;
		this.aboutPage = document.getElementById('aboutPageTpl').innerHTML;
		this.mobilePage = document.getElementById('mobilePageTpl').innerHTML;
	},

	bindEvent: function(){
		this.aboutBtn.addEventListener('click', this.showAboutPage.bind(this), false);
		this.mobileBtn.addEventListener('click', this.showMobilePage.bind(this), false);
	},

	updateQuote: function(){
		var q = this.quotes[this.current];
		this.current += 1;
		if (this.current >= this.quotes.length) {
			this.current = 0;
			this.fetchQuote(this.skip);
		}
		this.quoteAuthor.innerHTML = q.author;
		this.quoteContent.innerHTML = q.content;
	},

	shareQuote: function(){
		window.open('http://v.t.sina.com.cn/share/share.php?title=' + $('#quoteContent').text() + '——' + $('#quoteAuthor').text() + ' ( 分享自听说网http://tinsho.com )','','fullscreen=no,width=600,height=100');
	},

	showQuotePage: function(){
		this.main.innerHTML = this.quotePage;
		this.quoteAuthor = document.getElementById('quoteAuthor');
		this.quoteContent = document.getElementById('quoteContent');

		this.hearBtn = document.querySelector('.hearBtn');
		this.hearBtn.addEventListener('click', this.updateQuote.bind(this), false);
	},

	showAboutPage: function(){
		this.main.innerHTML = this.aboutPage;
		this.backBtn = document.querySelector('.backBtn');
		this.backBtn.addEventListener('click', this.showQuotePage.bind(this), false);
	},

	showMobilePage: function(){
		this.main.innerHTML = this.mobilePage;
		this.backBtn = document.querySelector('.backBtn');
		this.backBtn.addEventListener('click', this.showQuotePage.bind(this), false);
	}
};

window.onload = function(){
	Tinsho();
};
function Tinsho() {
	if (!(this instanceof Tinsho)) {
		return new Tinsho();
	}

	this.isIE = !!document.attachEvent;
	this.isOldBrowser = !Function.prototype.bind;

	if (this.isOldBrowser) {
		document.body.innerHTML = document.getElementById('browsers-tpl').innerHTML;
		return;
	}

	this.current = 0;
	this.quoteState = false;
	this.locked = true;
	this.init();
}

Tinsho.prototype = {
	init: function(){
		this.bindElement();
		this.bindEvent();
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
		this.quoteState = false;
		this.toggleLoader();
		this.makeRequest({
			method: 'POST',
			url: '/fetchQuote',
			data: 'skip=' + skip,
			callback: function(data){
				this.toggleLoader();
				this.processQuote(data);
			}.bind(this)
		});
	},

	processQuote: function(data){
		var resp = JSON.parse(data);
		this.skip = resp.skip;
		this.quotes = resp.quotes;
		
		this.updateQuote();
	},

	bindElement: function(){
		this.loader = document.getElementById('loader');
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

	toggleLoader: function(){
		this.loader.style.display = this.loader.style.display == 'block' ? 'none' : 'block';
	},

	toggleQuote: function(){
		if (this.isIE) {
			this.locked = false;
			this.quoteState = true;
			this.quote.style.opacity = 1;
			return;
		}

		var val = 1 - parseInt(this.quote.style.opacity);
		this.quoteState = val;
		this.quote.style.opacity = val;
	},

	updateQuote: function(){
		var q = this.quotes[this.current];
		this.current += 1;
		if (this.current > this.quotes.length) {
			this.current = 0;
			this.fetchQuote(this.skip);
			return;
		}

		this.quoteAuthor.innerHTML = q.author;
		this.quoteContent.innerHTML = q.content;	

		this.toggleQuote();
	},

	shareQuote: function(){
		window.open('http://v.t.sina.com.cn/share/share.php?title=' + this.quoteContent.innerHTML + '——' + this.quoteAuthor.innerHTML + ' ( 分享自听说网http://tinsho.com )','','fullscreen=no,width=600,height=100');
	},

	bindBack: function(){
		this.backBtn = document.querySelector('.backBtn');
		this.backBtn.addEventListener('click', this.showQuotePage.bind(this), false);
	},

	showQuotePage: function(){
		this.main.innerHTML = this.quotePage;
		this.quoteAuthor = document.getElementById('quoteAuthor');
		this.quoteContent = document.getElementById('quoteContent');

		this.quote = document.getElementById('quote');
		this.quote.addEventListener('transitionend', function(){
			!this.quoteState && this.updateQuote();
			if (this.quoteState) {
				this.locked = false;
			}
		}.bind(this), false);
		
		this.shareBtn = document.querySelector('.shareBtn');
		this.shareBtn.addEventListener('click', this.shareQuote.bind(this), false);

		this.hearBtn = document.querySelector('.hearBtn');
		this.hearBtn.addEventListener('click', function(){
			if (this.locked) {
				return;
			}
			this.locked = true;
			this.isIE ? this.updateQuote() : this.toggleQuote();
		}.bind(this), false);

		this.fetchQuote(this.current);
	},

	showAboutPage: function(){
		this.main.innerHTML = this.aboutPage;
		this.bindBack();
	},

	showMobilePage: function(){
		this.main.innerHTML = this.mobilePage;
		this.bindBack();
	}
};

window.onload = function(){
	Tinsho();
};
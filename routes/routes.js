var appRouter = function(app) {
    
    app.get('/', function(req, res) {
        res.send("Hello World");
    });
	
	app.post('/customer', function(req, res){
		var customer = require("./customer.js");
		customer.postCustomer(req, res);
	});
	
	app.get('/customer/:username', function(req, res){
		var customer = require("./customer.js");
		customer.getCustomer(req,res);
	});
	
	app.get('/customer/:username/verify', function(req, res){
		var customer = require("./customer.js");
		customer.getCustomerVerify(req,res);
	});
	
	app.post('/customer/:username/account', function(req, res){
		var account = require("./account.js");
		account.registerAccount(req,res);

	});
	
	app.get('/customer/account/list/:username', function(req, res){
		var account = require("./account.js");
		account.getAccountList(req,res);

	});
	
	app.post('/transaction', function(req, res){
		var transaction = require("./transaction.js");
		transaction.postTransaction(req,res);
	});
	
	app.get('/customer/transaction/list/:username', function(req, res){
		var transaction = require("./transaction.js");
		transaction.getTransaction(req,res);

	});
};

module.exports = appRouter;
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
	
	app.get('/customer/verify/:username', function(req, res){
		var account = require("./account.js");
		account.vefifyUsernamePwd(req,res);

	});
	
	app.get('/transaction', function(req, res){
		var transaction = require("./transaction.js");
		transaction.gettransaction(req,res);
	});
}

module.exports = appRouter;
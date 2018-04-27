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
	
	app.get('/account', function(req, res){
		res.send("hi this is mallika");
	});
	
	app.get('/transactions', function(req, res){
		res.send("Hello from Deepika");
	});
}

module.exports = appRouter;
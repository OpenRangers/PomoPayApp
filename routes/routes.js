var appRouter = function(app) {
    
    app.get("/", function(req, res) {
        res.send("Hello World");
    });
	
	app.get("/customer", function(req, res){
		var customer = require("./customer.js");
		customer.postCustomer(req, res);
	});
}

module.exports = appRouter;
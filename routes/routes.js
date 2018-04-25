var appRouter = function(app) {
    
    app.get("/", function(req, res) {
        res.send("Hello World");
    });
	
	app.get("/accounts", function(req, res){
		require("./accounts.js")(req, res);
	});
}

module.exports = appRouter;
var express = require("express");
var bodyParser = require("body-parser");
var app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

require("./routes/routes.js")(app);

var server = app.listen(process.env.VCAP_APP_PORT, function() {
    console.log("Listening on port %s...", server.address().port);
});
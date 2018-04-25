var postCustomer = function(req, res) {
    
    // Parse the VCAP Environment to get the Cloudant URL
    var vcap_env = JSON.parse(process.env.VCAP_SERVICES);
    var cloudant_credentials = vcap_env['cloudantNoSQLDB'][0]['credentials'];
    console.log("The Cloudant URL is : ",cloudant_credentials.url);
    
    // Connect to the pomopaycustomers DB
    var Cloudant = require('@cloudant/cloudant');
    var cloudant = Cloudant({url: cloudant_credentials.url});
    var pomopaycustomersdb = cloudant.db.use('pomopaycustomers');
    //  insert the incoming data into the DB
    var idValue = pomopaycustomersdb.insert(req.body, function(err, data) {
    console.log('Error:', err);
    console.log('Data:', data);
    });
    
    
    
    res.send("Document created with _id"+idValue);
}

var getCustomer = function(req, res){
	res.send("Hi this is the GET customer service");
}

exports.postCustomer = postCustomer;
exports.getCustomer = getCustomer;
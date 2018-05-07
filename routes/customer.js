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
    pomopaycustomersdb.insert(req.body, function(err, data) {
    
 	if(err){
 		res.status(500).send(err);
 	}else{
 		res.status(200).send(data);
 	}
 	
	return;
	
    });
};

var getCustomer = function(req, res){

    // Parse the VCAP Environment to get the Cloudant URL
    var vcap_env = JSON.parse(process.env.VCAP_SERVICES);
    var cloudant_credentials = vcap_env['cloudantNoSQLDB'][0]['credentials'];
    console.log("The Cloudant URL is : ",cloudant_credentials.url);
    
    // Connect to the pomopaycustomers DB
    var Cloudant = require('@cloudant/cloudant');
    var cloudant = Cloudant({url: cloudant_credentials.url});
    var pomopaycustomersdb = cloudant.db.use('pomopaycustomers');
	
	// Read the document from the database
	pomopaycustomersdb.get(req.params.username, function(err, data) {

 	if(err){
 		res.status(500).send(err);
 	}else{
 		res.status(200).send(data);
 	}
 	
	return;
	
	});
};

var getCustomerVerify = function(req, res){

    // Parse the VCAP Environment to get the Cloudant URL
    var vcap_env = JSON.parse(process.env.VCAP_SERVICES);
    var cloudant_credentials = vcap_env['cloudantNoSQLDB'][0]['credentials'];
    console.log("The Cloudant URL is : ",cloudant_credentials.url);
    
    // Connect to the pomopaycustomers DB
    var Cloudant = require('@cloudant/cloudant');
    var cloudant = Cloudant({url: cloudant_credentials.url});
    var pomopaycustomersdb = cloudant.db.use('pomopaycustomers');
	
	// Read the document from the database
	pomopaycustomersdb.get(req.params.username, function(err, data) {

 	if(err){
 		res.status(500).send(err);
 	}else{
 		if(data.password == req.query.password){
 			var responseObj = {"status":"OK","descrpition":"passwords match"};
 			res.status(200).send(responseObj);
 		}else{
 			var responseObj = {"status":"FAILURE","descrpition":"passwords do not match"};
 			res.status(200).send(responseObj);
 		}
 		
 	}
 	
	return;
	
	});
};

exports.postCustomer = postCustomer;
exports.getCustomer = getCustomer;
exports.getCustomer = getCustomerVerify;
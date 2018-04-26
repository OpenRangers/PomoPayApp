var postCustomer = function(req, res) {
    
    
    var cloudantDoc = null; // Define a variable to hold the coudant return document.
    var cloudantErr = null; //Define a variable to hold the cloudant error.
    
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
    
    cloudantDoc = data; //store the cloudant return document.
    cloudantErr = err; // store the cloudant return error.

    console.log('Error:', cloudantErr);
    console.log('Data:', cloudantDoc);
    
    });
    
    if(cloudantErr === null){
		res.status(200);
		res.contentType("application/json");
    	res.send({"status":"SUCCESS","id":cloudantDoc.body.id,"version":cloudantDoc.body.ver});
    }else{
		res.status(404);
		res.contentType("application/json");
    	res.send({"status":"FAILURE","error":cloudantErr.message});	
    }
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
 		res.send(err.message, err['status-code']);
 	}else{
 		res.send(data, 200);
 	}
 	
	return;
	
	});
};

exports.postCustomer = postCustomer;
exports.getCustomer = getCustomer;
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
    	res.send({"status":"SUCCESS","id":cloudantDoc.id,"version":cloudantDoc.ver});
    }else{
    	res.send({"status":"FAILURE","error":cloudantErr});	
    }
}

var getCustomer = function(req, res){

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
	
	// Read the document from the database
	pomopaycustomersdb.get(req.params.username, function(err, data) {
 
    cloudantDoc = data; //store the cloudant return document.
    cloudantErr = err; // store the cloudant return error.
    
    console.log('Error:', cloudantErr);
    console.log('Data:', cloudantDoc);
   
	});
	
	if(cloudantErr === null){
		res.send({"status":"SUCCESS","document":{cloudantDoc}});
	}else{
    	res.send({"status":"FAILURE","error":cloudantErr});	
    }
}

exports.postCustomer = postCustomer;
exports.getCustomer = getCustomer;
var postCustomer = function(req, res) {
    
    //Verify whether the user name being registered is valid as per bank records.
	//This step fetches all accounts from the OB API and verifies against the owner name.
	
	const options = {
			hostname:"ob-api.innovationwide.co.uk",
			uri:"http://ob-api.innovationwide.co.uk/api/accounts",
			method:"GET"
	};

	var httprequest = require("request");
	httprequest(options, function(error, response, body){
		//console.log("ERROR => ",error);
		//console.log("RESPONSE => ",response);
		//console.log("BODY => ",body);
		
		if(body){
			
			var isMatch = false;
			var requestedCustomer = req.body.fname + " " + req.body.lname;
			var responsebody = JSON.parse(body);
			if(responsebody.Data.length > 0){
				//console.log("Requested Customer => ",requestedCustomer);
				for(dataindex in responsebody.Data){
					var nextCustomer = responsebody.Data[dataindex].Account.Owners[0]; 
					//console.log("Next Customer => ",nextCustomer.toLowerCase());
					if(nextCustomer.toLowerCase() === requestedCustomer.toLowerCase()){
						isMatch = true;
						break;
					}
				}
				//console.log("Do the customer names match? ",isMatch);
				if(isMatch){
				    // Parse the VCAP Environment to get the Cloudant URL
				    var vcap_env = JSON.parse(process.env.VCAP_SERVICES);
				    var cloudant_credentials = vcap_env['cloudantNoSQLDB'][0]['credentials'];
				    //console.log("The Cloudant URL is : ",cloudant_credentials.url);
				    
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
				    });
				}else{
					res.status(404).send({"status":"INVALIDDATA","description":"Customer name does not match with account data"});
				}
			}else{
				res.status(500).send({"status":"FAILURE","description":"Could not fetch accounts from ob-api"});
			}
			
			
		}else{
			res.status(500).send({"status":"FAILURE","description":"Could not fetch accounts from ob-api"});
		}
			
		
	});
	
	return;
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
exports.getCustomerVerify = getCustomerVerify;
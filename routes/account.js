var getAccountList =  function(req, res) {
	
	var vcap_env = JSON.parse(process.env.VCAP_SERVICES);
    var cloudant_credentials = vcap_env['cloudantNoSQLDB'][0]['credentials'];
    console.log("The Cloudant URL is : ",cloudant_credentials.url);
    
    // Connect to the pomopaycustomers DB
    var Cloudant = require('@cloudant/cloudant');
    var cloudant = Cloudant({url: cloudant_credentials.url});
    var pomopaycustomersdb = cloudant.db.use('pomopaycustomers');
	var pomopayaccountdb = cloudant.db.use('pomopayaccounts');
	var accountlist =[];
	
	// Read the document from the database
	pomopaycustomersdb.get(req.params.username, function(err, data) {

 	if(err){
 		res.send(err, 500);
 		
 	}else{
 		
 		for (var i in data.account)
 		{
 		pomopayaccountdb.get(data.account[i], function(accerr, accdata) {
 			if(accerr){
 				res.send(accerr, 500);
 		
 			}else{
 				accountlist.push(accdata.accountnumber);
 				}
 	

	
			});
 		}
 		res.send(accountlist);
 	}
 	
	return;
	
	});
	
	};
var vefifyUsernamePwd = function(req, res) {
	
	
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
 		res.send(err, 500);
 		
 	}else{
 		
 		
 		var obj = data.password;
 		
 		if (obj==req.params.password)
 		{
 			res.send("match");
 		}
 		else
 		res.send("no match");
 	}
 	
	return;
	
	});
	
	};
	exports.getAccountList = getAccountList;
exports.vefifyUsernamePwd = vefifyUsernamePwd;
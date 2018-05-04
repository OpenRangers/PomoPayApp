var getAccountList =  function(req, res) {
	
	var vcap_env = JSON.parse(process.env.VCAP_SERVICES);
    var cloudant_credentials = vcap_env['cloudantNoSQLDB'][0]['credentials'];
    console.log("The Cloudant URL is : ",cloudant_credentials.url);
    
    // Connect to the pomopaycustomers DB
    var Cloudant = require('@cloudant/cloudant');
    var cloudant = Cloudant({url: cloudant_credentials.url});
    var pomopaycustomersdb = cloudant.db.use('pomopaycustomers');
    
    
    var vcap_env2 = JSON.parse(process.env.VCAP_SERVICES);
    var cloudant_credentials2 = vcap_env2['cloudantNoSQLDB'][0]['credentials'];
    console.log("The Cloudant URL is : ",cloudant_credentials2.url);
    
    // Connect to the pomopaycustomers DB
    var Cloudant2 = require('@cloudant/cloudant');
    var cloudant2 = Cloudant2({url: cloudant_credentials2.url});
	var pomopayaccountdb = cloudant2.db.use('pomopayaccounts');
	var accountlist =[];
	pomopaycustomersdb.get(req.params.username, function(err, data) {

 	if(err){
 		res.send(err, 500);
 		
 	}else{
	for (var i in data.account)
 		{
 			accountlist.push(data.account[i]);
 		}
 		
 	}
 	//res.send(accountlist);
	return;
	
	});
 	for (var j in accountlist)	{
	pomopayaccountdb.get(accountlist[j], function(accerr, accdata) {
 			if(accerr){
 				res.send(accerr, 500);
 		
 			}else{
 				
 				accountlist.push(accdata.accountnumber);
 				}
 	
	return;
	
			});
}
	res.send(accountlist);
	
	// Read the document from the database
	/*pomopaycustomersdb.get(req.params.username, function(err, data) {

 	if(err){
 		res.send(err, 500);
 		
 	}else{
 		
 		for (var i in data.account)
 		{
 			accountlist.push(data.account[i]);
 		pomopayaccountdb.get("5f8d5a45c55c0f07954df4f9c1e8fe74", function(accerr, accdata) {
 			if(accerr){
 				res.send(accerr, 500);
 		
 			}else{
 				res.send(accdata.accountnumber);
 				accountlist.push(accdata.accountnumber);
 				}
 	
return;
	
			});
 		}
 		res.send(accountlist);
 	}
 	
	return;
	
	});*/
	
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
 		
 		if (obj==req.query.password)
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
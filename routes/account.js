
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
	
	pomopaycustomersdb.get(req.params.username, function(err, data){
		if(err){
			res.status(500).send({"status":"FAILURE", "description":err});
		}else{
			if(data.accounts!==undefined && data.accounts.length>0){
			for (var index in data.accounts){
				var done=false;
			pomopayaccountdb.get(data.accounts[index].accid, function(accerr, accdata){
				if(accerr){
					res.status(500).send({"status":"FAILURE", "description":accerr});
				}else{
					
					accountlist.push({"accountnumber":accdata.accountnumber
											, "accid":accdata._id , "bankname":accdata.bankname});
					
					done=true;
					
										
				}
				
			});
			while(!done) {
      		require('deasync').runLoopOnce();
    		}
		}
		
	res.status(200).send({"accounts":accountlist});
	}	
	else{
		res.status(404).send({"status":"INVALIDDATA" , "description":"No accounts registered for this customer"});
	}
		}
	});
	
	return;
};

var registerAccount=function(req,res){
	
	var vcap_env = JSON.parse(process.env.VCAP_SERVICES);
    var cloudant_credentials = vcap_env['cloudantNoSQLDB'][0]['credentials'];
    console.log("The Cloudant URL is : ",cloudant_credentials.url);
    
    // Connect to the pomopaycustomers DB
    var Cloudant = require('@cloudant/cloudant');
    var cloudant = Cloudant({url: cloudant_credentials.url});
    var pomopaycustomersdb = cloudant.db.use('pomopaycustomers');
	var pomopayaccountdb = cloudant.db.use('pomopayaccounts');
	
	pomopayaccountdb.insert(req.body, function(err, data) {
					 	if(err){
					 		res.status(500).send(err);
					 	}else{
					 		res.status(200).send({"status":"OK","description":"The account registered succesfully"});
					 	}
				    });
	
	pomopaycustomersdb.up
	//res.status(200).send({"status":"OK","description":"The account registered succesfully"});
	return;
};

exports.getAccountList = getAccountList;
exports.registerAccount = registerAccount;
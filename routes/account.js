/*eslint-disable semi */

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
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
			res.status(500).send(err);
		}else{
			for (var index in data.account){
				var done=false;
			pomopayaccountdb.get(data.account[index], function(accerr, accdata){
				if(accerr){
					res.status(500).send(accerr);
				}else{
					console.log("The accounts data is -> ",accdata);
					
					//var accountlist2=[];
					accountlist.push({"accountnumber":accdata.accountnumber
											, "accid":accdata._id , "bankname":accdata.bankname});
					//accountlist.push(accdata.accountnumber);
					done=true;
					//res.send({"accounts":accountlist});
										
				}
				
			});
			while(!done) {
      		require('deasync').runLoopOnce();
    		}
		}
		
	res.send({"accounts":accountlist});
			//var accdata=JSON.parse(dd);
			//accountlist.push({"accounts":[{"accountnumber":accdata.accountnumber
			//								, "accid":accdata._id}]});
			
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
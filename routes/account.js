var getAccountList =  function(req, res) {
	
	var vcap_env = JSON.parse(process.env.VCAP_SERVICES);
    var cloudant_credentials = vcap_env['cloudantNoSQLDB'][0]['credentials'];
    console.log("The Cloudant URL is : ",cloudant_credentials.url);
    
    // Connect to the pomopaycustomers DB
    var Cloudant = require('@cloudant/cloudant');
    var cloudant = Cloudant({url: cloudant_credentials.url});
    var pomopaycustomersdb = cloudant.db.use('pomopaycustomers');
	var pomopayaccountdb = cloudant.db.use('pomopayaccounts');
	
	pomopaycustomersdb.get(req.params.username, function(err, data){
		if(err){
			res.status(500).send(err);
		}else{
			console.log("The customer data is -> ",data);
			pomopayaccountdb.get(data.accounts[0].accid, function(accerr, accdata){
				if(accerr){
					res.status(500).send(accerr);
				}else{
					console.log("The accounts data is -> ",accdata);
					res.status(200).send({"accounts":[{"bankname":accdata.bankname
											, "accountnumber":accdata.accountnumber
											, "accid":accdata._id}]});
				}
			});
		}
	});
	return;
};

var registerAccount=function(req,res){
	res.status(200).send({"status":"OK","description":"The account registered succesfully"});
	return;
};

exports.getAccountList = getAccountList;
exports.registerAccount = registerAccount;
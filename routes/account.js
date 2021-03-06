
var getAccountList =  function(req, res) {
	
	var vcap_env = JSON.parse(process.env.VCAP_SERVICES);
    var cloudant_credentials = vcap_env['cloudantNoSQLDB'][0]['credentials'];
    console.log("The Cloudant URL is : ",cloudant_credentials.url);
    
    // Connect to the pomopaycustomers DB
    var Cloudant = require('@cloudant/cloudant');
    var cloudant = Cloudant({url: cloudant_credentials.url});
    var pomopaycustomersdb = cloudant.db.use('pomopaycustomers');
	//var pomopayaccountdb = cloudant.db.use('pomopayaccounts');
	var accountlist =[];
	
	pomopaycustomersdb.get(req.params.username, function(err, data){
		if(err){
			res.status(500).send({"status":"FAILURE", "description":err});
		}else{
			if(data.accounts!==undefined && data.accounts.length>0){
				for (var index in data.accounts){
					
					accountlist.push({"accountnumber":data.accounts[index].accountnumber
											, "accid":data.accounts[index].accid , "bankname":data.accounts[index].bankname});
					
				}

			/*for (var index in data.accounts){
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
		}*/
		
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
    var ilength=0;
    var Cloudant = require('@cloudant/cloudant');
    var cloudant = Cloudant({url: cloudant_credentials.url});
    var pomopaycustomersdb = cloudant.db.use('pomopaycustomers');
    var pomopayaccountdb = cloudant.db.use('pomopayaccounts');
    var pomopaycellphonesdb = cloudant.db.use('pomopaycellphones');
	var done=false;
	var requestedCustomer;
	var customerdata;
	var accountmatch=false;
	var firstaccount=false;
	// Read the document from the database
	pomopaycustomersdb.get(req.params.username, function(err, data) {

 	if(err){
 		res.status(500).send({"status":"FAILURE","description":err});
 	}else{
 		requestedCustomer = data.fname + " " + data.lname;
 		customerdata=data;
 		done =true;
 	
	
	/*while(!done) {
      		require('deasync').runLoopOnce();
    		}*/
	//res.send(customerdata);
	var url="http://ob-api.innovationwide.co.uk/api/accounts/"+req.body.accountnumber;
	
	const options = {
			hostname:"ob-api.innovationwide.co.uk",
			uri:url,
			method:"GET"
	};

	var httprequest = require("request");
	httprequest(options, function(error, response, body){
		
		
		if(body){
			var isMatch = false;
			
			
			//var requestedCustomer = req.body.fname + " " + req.body.lname;
			var responsebody = JSON.parse(body);
			//res.send(responsebody);
			if(responsebody.Data.length > 0){
				for(var dataindex in responsebody.Data){
					var nextCustomer = responsebody.Data[dataindex].Account.Owners[0]; 
					//console.log("Next Customer => ",nextCustomer.toLowerCase());
					if(nextCustomer.toLowerCase() === requestedCustomer.toLowerCase()){
						isMatch = true;
						break;
					}
				}
				//res.send(isMatch);
				var obbankname = responsebody.Data[0].Account.Account.SecondaryIdentification; 
				var ipbankname=req.body.bankname;
				
				if(isMatch){
					if(obbankname.toLowerCase()===ipbankname.toLowerCase()){
					if(customerdata.accounts!==undefined && customerdata.accounts.length>0){
						ilength=customerdata.accounts.length;
					for(var index in customerdata.accounts){
						if (req.body.accountnumber===customerdata.accounts[index].accountnumber){
						accountmatch=true;
						break;
						}
					}
					
					
					if(accountmatch)
					{res.status(400).send({"status":"INVALIDDATA", "description":"Duplicate registration, already registered"});
					return;
					}
					
				}
				else
				{
					ilength=0;
					firstaccount=true;
					//res.send(String(ilength));
					}
				//res.send(firstaccount);
				pomopayaccountdb.insert({"accountnumber": req.body.accountnumber,
  										"bankname": req.body.bankname,
  								"username": req.params.username}, function(err, data) {
					 	if(err){
					 		res.status(500).send({"status":"FAILURE","description":err});
					 	}else{
					 		//res.send(data.id);
					 		var accountlist=[];
					 		if (customerdata.accounts!==undefined){
					 		accountlist=customerdata.accounts;}
					 		accountlist.push({"accid":data.id,"accountnumber":req.body.accountnumber,"bankname":req.body.bankname
					 					,"username":req.params.username});
					 		customerdata.accounts=accountlist;
					 		/*customerdata.accounts[ilength].accid=data.id;
					 		customerdata.accounts[ilength].accountnumber= data.accountnumber;
					 		customerdata.accounts[ilength].bankname = data.bankname;
					 		customerdata.accounts[ilength].username= data.username;
					 		res.send(ilength);*/
					 		pomopaycustomersdb.insert(customerdata, function(custerr, custdata) {
					 			if(custerr){
					 		res.status(500).send({"status":"FAILURE","description":custerr});
					 	}else{
					 		if(firstaccount)
					 		{
					 			pomopaycellphonesdb.insert({
  											"_id": customerdata.cellphone,
  											"accid":data.id ,
										    "bankname": req.body.bankname,
  											"accountnumber": req.body.accountnumber
											}, function(cellerr, celldata) {
							if(cellerr){
					 		res.status(500).send({"status":"FAILURE","description":cellerr});
					 	}else{					
								res.status(200).send({"status":"OK","description":"The account registered succesfully"});				
						}					

											});
					 		}
					 		else{					
								res.status(200).send({"status":"OK","description":"The account registered succesfully"});				
						}	
					 		
				 		}

					 			
					 		});
					 		
					 		
					 	}
				    });
				
			}else{res.status(404).send({"status":"INVALIDDATA", "description":"entered account is not of mentioned bank"});}	

				}else{
					res.status(404).send({"status":"INVALIDDATA", "description":"Customer name on the account doesn't match customer profile on the app"});
				}
			}else{
				res.status(500).send({"status":"FAILURE","description":"Could not fetch accounts from ob-api"});
			}
			
	}else{
			res.status(500).send({"status":"FAILURE","description":"Could not fetch accounts from ob-api"});
		}
			
		
	});
	
	
	}
 	
	});
	return;
};

exports.getAccountList = getAccountList;
exports.registerAccount = registerAccount;
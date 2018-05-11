var postTransaction = function(req, res) {
    
    
    // Parse the VCAP Environment to get the Cloudant URL
    var vcap_env = JSON.parse(process.env.VCAP_SERVICES);
    var cloudant_credentials = vcap_env['cloudantNoSQLDB'][0]['credentials'];
    console.log("The Cloudant URL is : ",cloudant_credentials.url);
    
    // Connect to the pomopaycustomers DB
    var Cloudant = require('@cloudant/cloudant');
    var cloudant = Cloudant({url: cloudant_credentials.url});
    //var pomopaycustomersdb = cloudant.db.use('pomopaycustomers');
    //var pomopayaccountsdb =  cloudant.db.use('pomopayaccounts');
    var pomopaytransactionsdb = cloudant.db.use('pomopaytransactions');
    var doc= null;
    
    // Read the document from the database
	//var payer_username = req.body.payerusername;
	var payer_accid = req.body.payeraccid;
	var amount = req.body.amount;
	//var payee_accid = req.body.payeeaccid;
	//var payee_cellphone = req.body.payeecellphone;
	var remarks = req.body.remarks;
	console.log("outside get");
			
 		pomopaytransactionsdb.get(payer_accid, function(err, data) {
         	
 			if(err)
 	 {
 	 	if(err.statusCode == 404 && err.reason == "missing")
 	 	{
 	 		//  insert the incoming data into the DB
 	 		console.log("inside get if ");
 			pomopaytransactionsdb.insert({ _id: payer_accid, "transactions": [{ "amount": amount, "Type": "Debit", "remarks": remarks, "date": Date }] }, function(err, data1) {
 								 
    if(err)
    {
 		res.send(err, 500);
 		console.log("error");
 	}
 	else
 	{
		res.send(data1, 200);
 	}
 	
 	return;
 	
});
 	 	}
 	 	else{
 	 		
 	 		res.send(err, 500);
 	 	}
 	 }
	 	

 	 	else
 	 	{
 	 		if(data == null)
 	 			{
 	 			pomopaytransactionsdb.insert({ _id: payer_accid, "transactions": [{ "amount": amount, "Type": "Debit", "remarks": remarks, "date": Date }] }, function(err, data2) {
					 
 	 			    if(err)
 	 			    {
 	 			 		res.send(err, 500);
 	 			 		console.log("error");
 	 			 	}
 	 			 	else
 	 			 	{
 	 					res.send(data2, 200);
 	 			 	}
 	 			 	
 	 			 	return;
 	 			 	
 	 			});
 	 			}
 	 		else
 	 			{
 	 		//doc=data ;
 	 		//Object.keys(data.transactions).length;
			//var index = Object.keys(data.transactions).length;
			//data.transactions.push(index,{"amount": amount, "Type": "Debit", "remarks": remarks, "date": Date });
			pomopaytransactionsdb.insert(data,function(err, data3) {
			
			if(err)
		{
 		 res.send(err, 500);
 		}
 	else
 	   {
  		res.send(data3, 200);
 	   }
 	   return;
 	});
 	 			}
 	 		
 	 	}
 		
 	 
 	 return;
 	 });
 	 };
 	  
exports.postTransaction = postTransaction;
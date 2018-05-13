var postTransaction = function(req, res) {


	// Parse the VCAP Environment to get the Cloudant URL
	var vcap_env = JSON.parse(process.env.VCAP_SERVICES);
	var cloudant_credentials = vcap_env['cloudantNoSQLDB'][0]['credentials'];
	console.log("The Cloudant URL is : ",cloudant_credentials.url);

	// Connect to the pomopaycustomers DB
	var Cloudant = require('@cloudant/cloudant');
	var cloudant = Cloudant({url: cloudant_credentials.url});
	var pomopaycustomersdb = cloudant.db.use('pomopaycustomers');
	var pomopayaccountsdb =  cloudant.db.use('pomopayaccounts');
	var pomopaytransactionsdb = cloudant.db.use('pomopaytransactions');
	var body= req.body;

	// Read the document from the database
	var payeruname= body.payerusername;
	var payeraccid = body._id;
	var amount = body.amount;
	var payeeaccid = body.payeeaccid;
	//var payee_cellphone = req.body.payeecellphone;
	var remarks = body.remarks;
	var payeeresult = {status:1000, value:"test1"};
	var payerresult = {status:2000, value:"test2"};
	//var payeruserid= '1122';
	var payeeuname;
	var doc;

	pomopaycustomersdb.get(payeruname , function(err, data) {
		console.log("payer name"+payeruname);
		if(err)
		{
			console.log("payer name"+payeruname);
			console.log("error is"+err);
			payerresult = {status:404, value:err};

		}else
		{
			//doc=data;
			console.log("data for payer is:"+data);
			//console.log("data:"+JSON.stringfy(doc));
			//console.log("account:"+data.accounts);
			//console.log("account length is"+data.accounts.length);
			if(data.accounts!==undefined && data.accounts.length>0){
				var found = 0;
				var myacc;
				var index = 0;
				for (index = 0; index < data.accounts.length; index++) {
					console.log("index="+index);
					console.log("accid:"+data.accounts[index].accid );
					console.log("payerid:"+payeraccid);
					if (data.accounts[index].accid == payeraccid)
					{
						found = 1;
						myacc=data.accounts[index];
						console.log("We have found at index:" + index);
						break;
					} else {
						console.log("We did not find at index:" + index);
					}
				}
				if (found == 1) {

					pomopaytransactionsdb.get(payeraccid , function(err, data) {
						if(err)
						{
							console.log("error+++++++"+err);
							payerresult = {status:404, value:err};
							if(err.statusCode == 404 && err.reason == "missing")
							{
								console.log("inside if-first time insert");
								//  insert the incoming data into the DB
								pomopaytransactionsdb.insert({ _id: payeraccid , "transactions": [{ accountnumber: myacc.accountnumber,bankname: myacc.bankname,amount: amount, Type: 'Debit', remarks: remarks, date: Date() }] }, function(err, data) {

									if(err)
									{
										payerresult = {status:500, value:err};
									}
									else
									{

										payerresult = {status:200, value:data};									
									}
								});
							}
							else{								
								payerresult = {status:500, value:err};

							}
						}
						else
						{
							console.log("inside else:payerid is already present");
							doc=data ;
							doc.transactions.push({accountnumber: myacc.accountnumber,bankname: myacc.bankname,amount: amount, Type: 'Debit', remarks: remarks, date: Date() });
							pomopaytransactionsdb.insert(doc,function(err, data) {

								if(err)
								{								
									payerresult = {status:500, value:err};								
								}
								else
								{
									pomopaytransactionsdb.get(payeraccid, function(err, data) {
										if(err){
											payerresult = {status:500, value:err};
											//payeeresult["status"] = 500;
											//payeeresult["value"] = err;
										}
										else
										{
											//console.log('Error:', err);
											payerresult = {status:200, value:data};
											//console.log("payee status"+payeeresult["status"]);
											//console.log("payee value"+payeeresult["value"]);
											//payeeresult["value"] = data;
											//payeeresult["status"] = 200;
											console.log('Data for payer------:', data);
										}
									});

									payerresult = {status:200, value:data};
								}
							});
						}
					});
				}

				else{
					payerresult = {status:500, value:err};
				}

			}
			else{
				payerresult = {status:500, value:err};
			}
		}
	});

	console.log("post transaction for payee started");

	pomopayaccountsdb.get(payeeaccid, function(err,data){
		if(err){
			payeeresult = {status:404, value:err};
		}
		else
		{
			payeeuname= data.username;
			payeeresult = {status:200, value:data};
			console.log("name found"+payeeuname);
		}
	});

	pomopaycustomersdb.get(payeeuname, function(err, data) {
		if(err)
		{
			console.log("error is"+err);
			payeeresult = {status:404, value:err};
		}else
		{
			//doc=data;
			console.log("data for payee is:"+data);
			//console.log("data:"+JSON.stringfy(doc));
			//console.log("account:"+data.accounts);
			//console.log("account length is"+data.accounts.length);
			if(data.accounts!==undefined && data.accounts.length>0){

				var found = 0;
				var myacc;
				var index = 0;
				for (index = 0; index < data.accounts.length; index++) {
					console.log("index="+index);
					console.log("accid:"+data.accounts[index].accid );
					console.log("payeeid:"+payeeaccid);
					//console.log("accid:"+data.accounts[index].accid );
					if (data.accounts[index].accid == payeeaccid)
					{
						found = 1;
						myacc=data.accounts[index];
						console.log("We have found at index:" + index);
						break;
					} else {
						console.log("We did not find at index:" + index);
					}
				}
				if (found == 1) {

					pomopaytransactionsdb.get(payeeaccid , function(err, data) {

						if(err)
						{
							console.log("error+++++++"+err);
							payeeresult = {status:404, value:err};
							if(err.statusCode == 404 && err.reason == "missing")
							{
								console.log("inside if-first time insert");
								//  insert the incoming data into the DB
								pomopaytransactionsdb.insert({ _id: payeeaccid , "transactions": [{ accountnumber: myacc.accountnumber,bankname: myacc.bankname,amount: amount, Type: 'Debit', remarks: remarks, date: Date() }] }, function(err, data) {

									if(err)
									{
										payeeresult = {status:500, value:err};

									}
									else
									{
										payeeresult = {status:200, value:data};
									}
								});
							}
							else{
								payeeresult = {status:500, value:err};
							}
						}


						else
						{
							console.log("inside else:payeeid is already present");
							doc=data ;
							//var index = doc.transactions.length;
							doc.transactions.push({accountnumber: myacc.accountnumber,bankname: myacc.bankname,amount: amount, Type: 'Debit', remarks: remarks, date: Date() });
							pomopaytransactionsdb.insert(doc,function(err, data) {

								if(err)
								{
									payeeresult = {status:500, value:err};
								}
								else
								{
									payeeresult = {status:200, value:data};
								}
							});
						}
					});

				}
				else
				{
					payeeresult = {status:500, value:err};
				}
			}

			else
			{
				payeeresult = {status:500, value:err};
			}
		}

	}); 

	/*if (payeeresult["status"] == 200 && payerresult["status"] == 200) {
		console.log("check");
		res.status(200).send({status:"OK","description":"Post transaction successfully completed"});

	} else {
		if (payeeresult["status"] == 200) {
			console.log("check--1");
			res.status(payerresult["status"]).send({status:"OK","description":"Post transaction failed"});

		} else if (payerresult["status"] == 200) {
			console.log("check--2");
			res.status(payeeresult["status"]).send({status:"OK","description":"Post transaction failed"});

		} else {
			console.log("check--3");		
			res.status(payerresult["status"]).send({status:"OK","description":"Post transaction failed"});

		}
	}*/


};

/*var getTransaction = function(req, res) {

// Parse the VCAP Environment to get the Cloudant URL
var vcap_env = JSON.parse(process.env.VCAP_SERVICES);
var cloudant_credentials = vcap_env['cloudantNoSQLDB'][0]['credentials'];
console.log("The Cloudant URL is : ",cloudant_credentials.url);

// Connect to the pomopaytransactions DB
var Cloudant = require('@cloudant/cloudant');
var cloudant = Cloudant({url: cloudant_credentials.url});
var pomopaytransactionsdb = cloudant.db.use('pomopaytransactions');

// Read the document from the database
pomopaytransactionsdb.get(req.params.username, function(err, data) {

	if(err){
		res.status(500).send(err);
	}else{
		res.status(200).send(data);
	}

return;

});
}; */

exports.postTransaction = postTransaction;

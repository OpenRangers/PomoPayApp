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
	var payeeuname;
	var doc;

	pomopaycustomersdb.get(payeruname , function(err, data) {
		console.log("payer name"+payeruname);
		if(err)
		{
			res.status(404).send({"status":"INVALIDDATA", "description":"Payer or Payee information is invalid"});

		}else
		{
			//doc=data;
			console.log("data for payer is:"+data);
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

					pomopaytransactionsdb.get(payeruname , function(err, data) {
						if(err)
						{
							console.log("error+++++++"+err);
							payerresult = {status:404, value:err};
							if(err.statusCode == 404 && err.reason == "missing")
							{
								console.log("inside if-first time insert");
								//  insert the incoming data into the DB
								pomopaytransactionsdb.insert({ _id: payeruname , "transactions": [{ accountnumber: myacc.accountnumber,bankname: myacc.bankname,amount: amount, Type: 'Debit', remarks: remarks, date: Date() }] }, function(err, data) {

									if(err)
									{
										payerresult = {status:500, value:err};
										res.status(500).send({"status":"FAILURE", "description":err});
									}
									else
									{
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

														pomopaytransactionsdb.get(payeeuname , function(err, data) {

															if(err)
															{
																console.log("error+++++++"+err);
																payeeresult = {status:404, value:err};
																if(err.statusCode == 404 && err.reason == "missing")
																{
																	console.log("inside if-first time insert");
																	//  insert the incoming data into the DB
																	pomopaytransactionsdb.insert({ _id: payeeuname , "transactions": [{ accountnumber: myacc.accountnumber,bankname: myacc.bankname,amount: amount, Type: 'Debit', remarks: remarks, date: Date() }] }, function(err, data) {

																		if(err)
																		{

																			res.status(500).send({"status":"FAILURE", "description":err});

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

																		res.status(500).send({"status":"FAILURE", "description":err});
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
									}
								});
							}
							else {								

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

														pomopaytransactionsdb.get(payeeuname , function(err, data) {

															if(err)
															{
																console.log("error+++++++"+err);
																payeeresult = {status:404, value:err};
																if(err.statusCode == 404 && err.reason == "missing")
																{
																	console.log("inside if-first time insert");
																	//  insert the incoming data into the DB
																	pomopaytransactionsdb.insert({ _id: payeeuname , "transactions": [{ accountnumber: myacc.accountnumber,bankname: myacc.bankname,amount: amount, Type: 'Debit', remarks: remarks, date: Date() }] }, function(err, data) {

																		if(err)
																		{
																			res.status(500).send({"status":"FAILURE", "description":err});

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

																doc.transactions.push({accountnumber: myacc.accountnumber,bankname: myacc.bankname,amount: amount, Type: 'Debit', remarks: remarks, date: Date() });
																pomopaytransactionsdb.insert(doc,function(err, data) {

																	if(err)
																	{
																		res.status(500).send({"status":"FAILURE", "description":err});
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
									}
								});


							}							
						}

						res.status(200).send({status:"OK","description":"The payment posted succesfully"});

					});
				}


			}

		}
	});
};

var getTransaction =  function(req, res) {

	var vcap_env = JSON.parse(process.env.VCAP_SERVICES);
	var cloudant_credentials = vcap_env['cloudantNoSQLDB'][0]['credentials'];
	console.log("The Cloudant URL is : ",cloudant_credentials.url);

	// Connect to the pomopaycustomers DB
	var Cloudant = require('@cloudant/cloudant');
	var cloudant = Cloudant({url: cloudant_credentials.url});
	var pomopaycustomersdb = cloudant.db.use('pomopaycustomers');
	var transactionlist =[];

	pomopaycustomersdb.get(req.params.username, function(err, data){
		if(err){
			res.status(500).send({"status":"FAILURE", "description":err});
		}else{
			if(data.transactions!==undefined && data.transactions.length>0){
				for (var index in data.transactions){

					transactionlist.push({"accountnumber":data.transactions[index].accountnumber
						,"bankname":data.transactions[index].bankname, "amount":data.transactions[index].amount, "type":data.transactions[index].Type, "remarks":data.transactions[index].remarks, "date":data.transactions[index].date});

				}


				res.status(200).send({"transactions":transactionlist});
			}	
			else{
				res.status(404).send({"status":"INVALIDDATA" , "description":"No transactions found"});
			}
		}
	});

	return;
};


exports.postTransaction = postTransaction;
exports.getTransaction = getTransaction;

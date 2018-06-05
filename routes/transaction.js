var postTransaction = function(req, res) {
    
    
    // Parse the VCAP Environment to get the Cloudant URL
    var vcap_env = JSON.parse(process.env.VCAP_SERVICES);
    var cloudant_credentials = vcap_env['cloudantNoSQLDB'][0]['credentials'];
    console.log("The Cloudant URL is : ",cloudant_credentials.url);
    
    // Connect to the pomopaycustomers DB
    var Cloudant = require('@cloudant/cloudant');
    var cloudant = Cloudant({url: cloudant_credentials.url});
    //var pomopaycustomersdb = cloudant.db.use('pomopaycustomers');
    //
    var pomopaytransactionsdb = cloudant.db.use('pomopaytransactions');
    
    /**
     * Find out whether any transactions exist for the payer
     **/
    pomopaytransactionsdb.get(req.body.payerusername, function(err, payertrandata){
    	var payerTransaction = null;
    	if(err){
    		//Assuming an error means no transactions exist
    		//Create an entry for the payer with an empty transactions array
    		payerTransaction = {"_id":req.body.payerusername
    								, "transactions":[]};
    	}else{    		
    		payerTransaction = payertrandata;
    	}
    	
		// Now get the account details based on accid
		var pomopayaccountsdb =  cloudant.db.use('pomopayaccounts');
		pomopayaccountsdb.get(req.body.payeraccid, function(err, payeraccdata){
			if(err){
				//An error here means account doesn't exist for the payer.
				//Declare error as nothing else can be done.
				res.status(500).send(err);
			}else{
				//Add the transaction to the payer
				payerTransaction.transactions[payerTransaction.transactions.length] = {"bankname":payeraccdata.bankname
																						, "accountnumber":payeraccdata.accountnumber
																						, "amount":req.body.amount
																						, "type":"debit"
																						, "date":new Date().toJSON()
																						, "remarks":req.body.remarks};
				//Insert the data
				pomopaytransactionsdb.insert(payerTransaction, function(err, payeraccinserteddata){
					if(err){
						res.status(500).send(err);
					}else{
						/**
						 * Get the payee account details based on either accid or cellphone
						 **/
						if(req.body.payeeaccid){
							pomopayaccountsdb.get(req.body.payeeaccid, function(err, payeeaccdata){
								if(err){
									res.status(500).send(err);
								}else{
									/**
									 * Determine whether payee has any transactions
									 */
									pomopaytransactionsdb.get(payeeaccdata.username, function(err, payeetransdata){
										var payeeTransaction = null;
										if(err){
											//Assuming error means no transactions
											//Create an entry for payee with an empty transactions array
											payeeTransaction = {"_id":payeeaccdata.username
																, "transactions":[]};
										}else{
											payeeTransaction = payeetransdata;
										}
										
										//Add the transaction to the payee
										payeeTransaction.transactions[payeeTransaction.transactions.length] = {"bankname":payeeaccdata.bankname
																												, "accountnumber":payeeaccdata.accountnumber
																												, "amount":req.body.amount
																												, "type":"credit"
																												, "date":new Date().toJSON()
																												, "remarks":req.body.remarks};
										//Insert the transaction into the database
										pomopaytransactionsdb.insert(payeeTransaction, function(err, payeetransinserteddata){
											if(err){
												res.status(500).send(err);
											}else{
												res.status(200).send({"status":"OK","description":"Payment posted successfully"});
											}
										});
									});
								}
							});
						}else{
							if(req.body.payeecellphone){
								var pomopaycellphonesdb =  cloudant.db.use('pomopaycellphones');
								pomopaycellphonesdb.get(req.body.payeecellphone, function(err, payeecellphonedata){
									if(err){
										res.status(500).send(err);
									}else{
										
										//Get the Payees Account Details
										pomopayaccountsdb.get(payeecellphonedata.accid, function(err, payeeaccdata){
											if(err){
												res.status(500).send(err);
											}else{
												/**
												 * Determine whether payee has any transactions
												 */
												console.log("Payee Cellphone Data -> ",payeecellphonedata);
												pomopaytransactionsdb.get(payeeaccdata.username, function(err, payeetransdata){
													var payeeTransaction = null;
													if(err){
														//Assuming error means no transactions
														//Create an entry for payee with an empty transactions array
														payeeTransaction = {"_id":payeeaccdata.username
																			, "transactions":[]};
													}else{
														payeeTransaction = payeetransdata;
													}
													console.log("Payee Transactions -> ",payeeTransaction);
													//Add the transaction to the payee
													payeeTransaction.transactions[payeeTransaction.transactions.length] = {"bankname":payeeaccdata.bankname
																															, "accountnumber":payeeaccdata.accountnumber
																															, "amount":req.body.amount
																															, "type":"credit"
																															, "date":new Date().toJSON()
																															, "remarks":req.body.remarks};
													//Insert the transaction into the database
													pomopaytransactionsdb.insert(payeeTransaction, function(err, payeetransinserteddata){
														if(err){
															res.status(500).send(err);
														}else{
															res.status(200).send({"status":"OK","description":"Payment posted successfully"});
														}
													});
												});												
											}
										});
									}
								});
							}
						}
					}
				});
			}
		});
    });
    
};


var getTransaction = function(req, res){

	// Parse the VCAP Environment to get the Cloudant URL
    var vcap_env = JSON.parse(process.env.VCAP_SERVICES);
    var cloudant_credentials = vcap_env['cloudantNoSQLDB'][0]['credentials'];
    console.log("The Cloudant URL is : ",cloudant_credentials.url);

    // Connect to the pomopaytransactions DB
    var Cloudant = require('@cloudant/cloudant');
    var cloudant = Cloudant({url: cloudant_credentials.url});
    var pomopaytransactionsdb = cloudant.db.use('pomopaytransactions');

    pomopaytransactionsdb.get(req.params.username, function(err, data){
    	if(err){
    		res.status(500).send(err);
    	}else{
    		res.status(200).send(data.transactions);
    	}
    });
};

exports.getTransaction = getTransaction;
exports.postTransaction = postTransaction;

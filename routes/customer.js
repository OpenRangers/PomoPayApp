var postCustomer = function(req, res) {
    
    res.send("Hi, this is the POST customer service");

}

var getCustomer = function(req, res){
	res.send("Hi this is the GET customer service");
}

exports.postCustomer = postCustomer;
exports.getCustomer = getCustomer;
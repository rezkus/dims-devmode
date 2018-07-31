var db = firebase.database();

readInitIdentityForm();

// $(".icr-button-accept").click(function() {
// 	console.log("test");
// 	var $row = $(this).closest("tr");    // Find the row
// 	// var $owner_id = $row.find(".icr_owner_id").text();
// 	var $owner_username = $row.find(".icr_owner_name").text();
// 	var $owner_company = $row.find(".icr_owner_company").text();
// 	// var $identity_id = $row.find(".icr_identity_id").text()
// 	var $attr_key1 = $row.find(".icr_attr_key_1").text();
// 	var $attr_val1 = $row.find(".icr_attr_value_1").text();
// 	var $attr_key2 = $row.find(".icr_attr_key_2").text();
// 	var $attr_val2 = $row.find(".icr_attr_value_2").text();
// 	var $attr_key3 = $row.find(".icr_attr_key_3").text();
// 	var $attr_val3 = $row.find(".icr_attr_value_3").text();
//
// 	console.log($owner_username + " " + $owner_company + " " + $owner_id + " " + $owner_company + " " + $attr_key1 + " " + $attr_val1 + " " + $attr_key2 + " " + $attr_val2 + " " + $attr_key3 + " " + $attr_val3)
// 	angular.element('#appController').scope().init_owner($owner_id, $owner_username, $owner_company);
// 	angular.element('#appController').scope().init_identity($identity_id, $owner_id, $owner_company, $attr_key1, $attr_val1, $attr_key2, $attr_val2, $attr_key3, $attr_val3);
//
// 	// Let's test it out
// 	alert("Accept init identity success");
// });

$(document).on('click','.icr-button-accept',function(){
	//console.log("test");
	var $row = $(this).closest("tr");    // Find the row
	var $owner_id = $row.find(".icr_owner_id").find("input").val();
	var $owner_username = $row.find(".icr_owner_name").text();
	var $owner_company = $row.find(".icr_owner_company").text();
	var $identity_id = $row.find(".icr_identity_id").find("input").val();
	var $attr_key1 = $row.find(".icr_attr_key_1").text();
	var $attr_val1 = $row.find(".icr_attr_value_1").text();
	var $attr_key2 = $row.find(".icr_attr_key_2").text();
	var $attr_val2 = $row.find(".icr_attr_value_2").text();
	var $attr_key3 = $row.find(".icr_attr_key_3").text();
	var $attr_val3 = $row.find(".icr_attr_value_3").text();

	var token = sessionStorage.getItem("token");
	var decoded = parseJwt(token);

	console.log(decoded);



	// console.log($owner_id + " " + $owner_username + " " + $owner_company + " " + $identity_id + " " + $attr_key1 + " " + $attr_val1 + " " + $attr_key2 + " " + $attr_val2 + " " + $attr_key3 + " " + $attr_val3)
	$.when(angular.element('#appController')
		.scope()
		.init_owner($owner_id, $owner_username, $owner_company, $identity_id, $attr_key1, $attr_val1, $attr_key2, $attr_val2, $attr_key3, $attr_val3),
		pushOwnerDataToFirebase($owner_id, decoded.username, decoded.orgName));
	// angular.element('#appController').scope().init_identity($identity_id, $owner_id, $owner_company, $attr_key1, $attr_val1, $attr_key2, $attr_val2, $attr_key3, $attr_val3);

	// Let's test it out
	//alert("Accept init identity success");
});

function readInitIdentityForm() {
	var table = document.getElementById("identity-creation-table").tBodies[0];
	var ref = db.ref("init-identity-form");

	ref.on("value", function(data){
		table.innerHTML = "";
		var objKey = Object.keys(data.val());
		var i = 1;
		for (var obj in objKey) {
			var key = objKey[obj];
			var object = data.val()[key];
			// table.innerHTML += '<tr><td>' + i + '.</td><td ng-model="icr_owner_id"><input type="text" class="form-inline" ng-model="icr_owner_id" placeholder="Enter owner ID"></td><td ng-model="icr_owner_name">' + object.owner_username + '</td><td ng-model="icr_owner_company">' + object.owner_company + '</td><td ng-model="icr_identity_id"><input type="text" class="form-inline" ng-model="icr_identity_id" placeholder="Enter identity ID"></td><td ng-model="icr_attr_key_1">' + object.attr_key1 + '</td><td ng-model="icr_attr_value_1">' + object.attr_val1 + '</td><td ng-model="icr_attr_key_2">' + object.attr_key2 + '</td><td ng-model="icr_attr_value_2">' + object.attr_val2 + '</td><td ng-model="icr_attr_key_3">' + object.attr_key3 + '</td><td ng-model="icr_attr_value_3">' + object.attr_val3 + '</td><td><button type="button" class="btn btn-sm btn-success icr-button-accept">Accept</button><button type="button" class="btn btn-sm btn-danger icr-button-decline">Decline</button></td></tr>';
			table.innerHTML += '<tr><td>' + i + '.</td><td class="icr_owner_id"><input type="text" class="form-inline" placeholder="Enter owner ID"></td><td class="icr_owner_name">' + object.owner_username + '</td><td class="icr_owner_company">' + object.owner_company + '</td><td class="icr_identity_id"><input type="text" class="form-inline" placeholder="Enter identity ID"></td><td class="icr_attr_key_1">' + object.attr_key1 + '</td><td class="icr_attr_value_1">' + object.attr_val1 + '</td><td class="icr_attr_key_2">' + object.attr_key2 + '</td><td class="icr_attr_value_2">' + object.attr_val2 + '</td><td class="icr_attr_key_3">' + object.attr_key3 + '</td><td class="icr_attr_value_3">' + object.attr_val3 + '</td><td><button type="button" class="icr-button-accept btn btn-sm btn-success">Accept</button><button type="button" class="btn btn-sm btn-danger icr-button-decline">Decline</button></td></tr>';
		}
	});
}

var pushOwnerDataToFirebase = function(owner_id, CA_username, CA_org) {
	var ref = db.ref("owner-data").push({
		owner_id: owner_id,
		ca_username: CA_username,
		ca_org: CA_org
	});
}

function parseJwt (token) {
            var base64Url = token.split('.')[1];
            var base64 = base64Url.replace('-', '+').replace('_', '/');
            return JSON.parse(window.atob(base64));
        };
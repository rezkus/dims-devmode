var db = firebase.database();

readInitIdentityForm();
readChangeRequest();
var token = sessionStorage.getItem("token");
var decoded = parseJwt(token);


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
	var $dateTime = $row.find(".icr_dateTime").text();

	console.log(decoded);

	$.when(angular.element('#appController')
		.scope()
		.init_owner($owner_id, $owner_username, $owner_company, $identity_id, $attr_key1, $attr_val1, $attr_key2, $attr_val2, $attr_key3, $attr_val3),
		pushOwnerDataToFirebase($owner_id, decoded.username, decoded.orgName, $dateTime));
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
			if (data.val()[key].status === "Processing") {
				table.innerHTML += '<tr><td>' + i + '.</td><td class="icr_dateTime">' + object.dateTime + '</td><td class="icr_owner_id"><input type="text" class="form-inline" placeholder="Enter owner ID"></td><td class="icr_owner_name">' + object.owner_username + '</td><td class="icr_owner_company">' + object.owner_company + '</td><td class="icr_identity_id"><input type="text" class="form-inline" placeholder="Enter identity ID"></td><td class="icr_attr_key_1">' + object.attr_key1 + '</td><td class="icr_attr_value_1">' + object.attr_val1 + '</td><td class="icr_attr_key_2">' + object.attr_key2 + '</td><td class="icr_attr_value_2">' + object.attr_val2 + '</td><td class="icr_attr_key_3">' + object.attr_key3 + '</td><td class="icr_attr_value_3">' + object.attr_val3 + '</td><td><button type="button" class="icr-button-accept btn btn-sm btn-success">Accept</button><button type="button" class="btn btn-sm btn-danger icr-button-decline">Decline</button></td></tr>';
			}
		}
	});
}

var pushOwnerDataToFirebase = function(owner_id, CA_username, CA_org, dateTime) {
	var ref = db.ref("owner-data").push({
		owner_id: owner_id,
		ca_username: CA_username,
		ca_org: CA_org
	});

	//change status in ref init-identity-form
	var ref2 = db.ref("init-identity-form");
	ref2.orderByChild("dateTime").equalTo(dateTime).once("child_added", function(data) {
		//console.log(data);
		data.ref2.update({status: "Done"});
	});
}

function parseJwt (token) {
            var base64Url = token.split('.')[1];
            var base64 = base64Url.replace('-', '+').replace('_', '/');
            return JSON.parse(window.atob(base64));
        };


function readChangeRequest() {
	var table = document.getElementById("identity_change_request_table").tBodies[0];
	var ref = db.ref("attribute-change-request");

	ref.on("value", function(data){
		table.innerHTML = "";
		var objKey = Object.keys(data.val());
		var i = 1;
		for (var obj in objKey) {
			var key = objKey[obj];
			var object = data.val()[key];

			table.innerHTML += '<tr><td class="attribute_index">' + i + '</td><td class="owner_identity_id">' + object.identityID + '</td><td class="attribute_key">' + object.attrName + '</td><td class="attribute_request_type">' + object.type + '</td><td class="attribute_new_value">' + object.value + '</td><td><button type="button" class="accept_change_request btn btn-sm btn-success">Accept</button><button type="button" class="decline_change_request btn btn-sm btn-danger">Decline</button></td></tr>'
			i++
		}
	});
}

$(document).on('click','.accept_change_request',function(){
	var $row = $(this).closest("tr");    // Find the row
  var $attribute_key = $row.find(".attribute_key").text(); // Find the text
	var $owner_identity_id = $row.find('.owner_identity_id').text();
	var $attribute_new_value = $row.find('.attribute_new_value').text();
	var $attribute_request_type = $row.find('.attribute_request_type').text();

	var $signer_name = "Pak Edi";
	var $signer_company = "STEI ITB";

	//console.log($attribute_key + " --- " + $owner_identity_id);

	if ($attribute_request_type == 'sign') {
		console.log("updating attribute with new val");
		angular.element('#appController')
			.scope()
			.sign_attribute($owner_identity_id, $attribute_key, $signer_name, $signer_company);
	} else if ($attribute_request_type == 'update') {
			console.log("updating attribute with new val");
			angular.element('#appController')
				.scope()
				.update_attribute($owner_identity_id, $attribute_key, $attribute_new_value);

	}
});

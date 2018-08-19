var db = firebase.database();


//ALWAYS ON FUNCTION WHEN PAGE IS LOADED
readInitIdentityForm();
readChangeRequest();

//decoding user's token that is logged in
var userToken = sessionStorage.getItem("token");
var decoded;

if (userToken != null) {
	decoded = parseJwt(userToken);
} else {
	userToken = null;
	decoded = "null";
}

//===================================================================
//========= INIT IDENTITY REQUEST TABLE =============================
//===================================================================

//Populate table with all requests from soon-to-be identity owner
function readInitIdentityForm() {
	var table = document.getElementById("identity-creation-table").tBodies[0];
	var ref = db.ref("init-identity-form");

	ref.on("value", function(data){
		if (data.exists()) {
			console.log("data exists");
			table.innerHTML = "";
			var objKey = Object.keys(data.val());
			var i = 1;
			for (var obj in objKey) {
				var key = objKey[obj];
				var object = data.val()[key];
				if (object.status === "Processing") {
					table.innerHTML += '<tr><td>' + i + '.</td><td class="icr_dateTime">' + object.dateTime + '</td><td class="icr_owner_id"><input type="text" name="owner_id" class="form-inline" placeholder="Enter owner ID"></td><td class="icr_owner_name">' + object.owner_username + '</td><td class="icr_owner_company">' + object.owner_company + '</td><td class="icr_identity_id"><input type="text" name="identity_id" class="form-inline" placeholder="Enter identity ID"></td><td class="icr_attr_key_1">' + object.attr_key1 + '</td><td class="icr_attr_value_1">' + object.attr_val1 + '</td><td class="icr_attr_key_2">' + object.attr_key2 + '</td><td class="icr_attr_value_2">' + object.attr_val2 + '</td><td class="icr_attr_key_3">' + object.attr_key3 + '</td><td class="icr_attr_value_3">' + object.attr_val3 + '</td><td><button type="button" class="icr-button-accept btn btn-sm btn-success">Accept</button><button type="button" class="btn btn-sm btn-danger icr-button-decline">Decline</button></td></tr>';
				}
			}
		} else {
			console.log("init-identity-form data does not exists");
		}
	});
}

//Accept init_identity request
$(document).on('click','.icr-button-accept',function(){
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

	var isAllInputFilled = validateRequestForm($owner_id, $identity_id);

	if (!isAllInputFilled) {
		alert("Please fill all input!");
	} else {
		if (userToken == null) {
			alert("No authorization token found");
		} else {
			refOwner = db.ref("owner-auth");
			refOwner.once("value", function(data){
				if (data.exists()){
					var objKey = Object.keys(data.val());
					var isDuplicateId = false;
					for (var obj in objKey) {
						var key = objKey[obj];
						if (data.val()[key].owner_id === $owner_id || data.val()[key].identity_id === $identity_id) {
							isDuplicateId = true;
						}
					}

					if (isDuplicateId) {
						alert("This Owner ID/Identity ID has been made before");
					} else {
						var ref = db.ref("init-identity-form");
						ref.orderByChild("dateTime").equalTo($dateTime).once("child_added", function(data) {
							data.ref.update({status: "Accepted"});
						});
						$.when(angular.element('#appController')
							.scope()
							.init_owner($owner_id, $owner_username, $owner_company, $identity_id, $attr_key1, $attr_val1, $attr_key2, $attr_val2, $attr_key3, $attr_val3),
							pushOwnerDataToFirebase($owner_id, $owner_username, $identity_id));
					}
				} else {
					console.log("owner-auth data not exist");
				}
			});
		}
	}



	// //var $status = "Accepted";
	// var ref = db.ref("init-identity-form");
	// ref.orderByChild("dateTime").equalTo($dateTime).once("child_added", function(data) {
	// 	//console.log(data);
	// 	data.ref.update({status: "Accepted"});
	// });
	//
	// // console.log(decoded);
	//
	// $.when(angular.element('#appController')
	// 	.scope()
	// 	.init_owner($owner_id, $owner_username, $owner_company, $identity_id, $attr_key1, $attr_val1, $attr_key2, $attr_val2, $attr_key3, $attr_val3),
	// 	pushOwnerDataToFirebase($owner_id, $owner_username, $identity_id));
});

//Decline init_identity request
$(document).on('click','.icr-button-decline',function(){
	var $row = $(this).closest("tr");    // Find the row
	var $dateTime = $row.find(".icr_dateTime").text();
	var $owner_username = $row.find(".icr_owner_name").text();

	if (userToken == null) {
		alert("Token not found!");
	} else {
		var ref = db.ref("init-identity-form");
		ref.orderByChild("dateTime").equalTo($dateTime).once("child_added", function(data) {
			data.ref.update({status: "DECLINED"});
		});

		var refOwner = db.ref("owner-auth");
		refOwner.orderByChild("username").equalTo($owner_username).once("child_added", function(data) {
			data.ref.update({requestInitStatus: "DECLINED"});
		});

		alert("Identity request has been declined");
	}

});

//===========================================================================
//========= ATTRIBUTE UPDATE/SIGN REQUEST TABLE =============================
//===========================================================================

//Populate table with update/sign requests from all identity owners
function readChangeRequest() {
	var table = document.getElementById("identity_change_request_table").tBodies[0];
	var ref = db.ref("attribute-change-request");

	ref.on("value", function(data){
		if (data.exists()) {
			table.innerHTML = "";
			var objKey = Object.keys(data.val());
			var i = 1;
			for (var obj in objKey) {
				var key = objKey[obj];
				var object = data.val()[key];
				if (object.status == "Processing") {
					table.innerHTML += '<tr><td class="attribute_index">' + i + '</td><td class="attribute_request_dateTime">' + object.dateTime + '</td><td class="owner_identity_id">' + object.identityID + '</td><td class="attribute_key">' + object.attrName + '</td><td class="attribute_request_type">' + object.type + '</td><td class="attribute_new_value">' + object.value + '</td><td><button type="button" class="accept_change_request btn btn-sm btn-success">Accept</button><button type="button" class="decline_change_request btn btn-sm btn-danger">Decline</button></td></tr>'
					i++;
				}
			}
		}
	});
}

//Accept attribute update/sign request
$(document).on('click','.accept_change_request',function(){

	if (userToken == null) {
		alert("Token not found!");
	} else {
		var $row = $(this).closest("tr");    // Find the row
		var $attribute_key = $row.find(".attribute_key").text(); // Find the text
		var $owner_identity_id = $row.find('.owner_identity_id').text();
		var $attribute_new_value = $row.find('.attribute_new_value').text();
		var $attribute_request_type = $row.find('.attribute_request_type').text();
		var $dateTime = $row.find('.attribute_request_dateTime').text();

		var $signer_name = "Pak Edi";
		var $signer_company = "STEI ITB";

		if ($attribute_request_type == 'sign') {
			angular.element('#appController')
				.scope()
				.sign_attribute($owner_identity_id, $attribute_key, $signer_name, $signer_company);
			console.log("signing attribute: DONE");
		} else if ($attribute_request_type == 'update') {
			angular.element('#appController')
				.scope()
				.update_attribute($owner_identity_id, $attribute_key, $attribute_new_value);
			console.log("updating attribute with new val");
		}	else if ($attribute_request_type == 'delete') {
			angular.element('#appController')
				.scope()
				.update_attribute($owner_identity_id, $attribute_key, $attribute_new_value);
			console.log("deleting attribute");
		}

		var ref = db.ref("attribute-change-request");
		ref.orderByChild("dateTime").equalTo($dateTime).once("child_added", function(data) {
			data.ref.update({status: "Accepted"});
		});
	}
});

//Decline attribute update/sign request
$(document).on('click','.decline_change_request',function(){
	var $row = $(this).closest("tr");    // Find the row
	var $dateTime = $row.find('.attribute_request_dateTime').text();

	if (userToken == null) {
		alert("Token not found!");
	} else {
		var ref = db.ref("attribute-change-request");
		ref.orderByChild("dateTime").equalTo($dateTime).once("child_added", function(data) {
			data.ref.update({status: "DECLINED"});
		});
	}
});


//libs
var pushOwnerDataToFirebase = function(owner_id, owner_username, identity_id) {
	// var ref = db.ref("owner-data").push({
	// 	owner_id: owner_id,
	// 	ca_username: owner_username
	// });

	var ref = db.ref("owner-auth");
	ref.orderByChild("username").equalTo(owner_username).once("child_added", function(data) {
		data.ref.update({requestInitStatus: "accepted"});
		data.ref.update({owner_id: owner_id});
		data.ref.update({identity_id: identity_id});
	});

	// var ref = db.ref("id-pairs").push({
	// 	owner_id: owner_id,
	// 	identity_id: identity_id
	// });

	//
	// //change status in ref init-identity-form
	// var ref2 = db.ref("init-identity-form");
	// ref2.orderByChild("dateTime").equalTo(dateTime).once("child_added", function(data) {
	// 	//console.log(data);
	// 	data.ref2.update({status: "Accepted"});
	// });
}

function parseJwt (token) {
  var base64Url = token.split('.')[1];
  var base64 = base64Url.replace('-', '+').replace('_', '/');
  return JSON.parse(window.atob(base64));
};

function validateRequestForm(owner_id, identity_id) {
	var isValid = true;

  if (owner_id==null || owner_id=="", identity_id==null || identity_id=="")
  {
      isValid = false;
  }

	return isValid;
}

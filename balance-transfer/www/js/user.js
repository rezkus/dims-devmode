// JavaScript Document
var db = firebase.database();
var userTerkait = "hehe";

readRequestFromInquisitor();
readOwnerData();

////====================================================================================  IDENTITY USER SIDE

$(document).on('click', '.new_attr_submit', function(){
// function requestAttributeUpdateToIssuer() {
	console.log('submit');
	var $row = $(this).closest("tr");    // Find the row

	var $attribute_key = $row.find(".attribute_key").text(); // Find the text
	var $owner_identity_id = document.getElementById('owner_identity_id').innerText;

	var $actions = $row.find(".attribute_action_button");
	var $action_form = $actions.find("form");

	//console.log($action_form.find(".new_attr_value"));
	var newValue = $action_form.find(".new_attr_value").val();

	// var $action_form = $(this).closest("form");
	// var newValue = $action_form.find(".new_attr_value").value;
	console.log(newValue);

	var result = db.ref("attribute-change-request").push({
		type: "update",
		identityID: $owner_identity_id,
		attrName: $attribute_key,
		value: newValue
	}, function(error) {
		if (error) {
			alert("Error has occured during request. Please try again.");
		} else {
			console.log("Update request has been sent!");
			//document.getElementById("new_attr").value = "";
			// document.getElementById("update-form").style.display = "none";
			// document.getElementById("update-button").style.display = "inline";

			$action_form.find(".new_attr_value").text = "";
			var $update_button = $actions.find(".attribute_update_button").css("display", "inline");
			var $update_form = $actions.find(".attribute_update_form").css("display", "none");

		}
	});
});
// }

$(document).on('click','.attribute_sign_button',function(){
	var $row = $(this).closest("tr");    // Find the row
	var $attribute_key = $row.find(".attribute_key").text(); // Find the text
	var $owner_identity_id = document.getElementById('owner_identity_id').innerText;

	var result = db.ref("attribute-change-request").push({
		type: "sign",
		identityID: $owner_identity_id,
		attrName: $attribute_key,
		value: "<SIG>"
	}, function(error) {
		if (error) {
			alert("Error has occured during request. Please try again.");
		} else {
			alert("Sign request has been sent!");
			console.log("successfully pushed sign request to firebase");
		}
	});
});


//---------

function readRequestFromInquisitor() {
	var table = document.getElementById("owner-id-request-table").tBodies[0];
	var ref = db.ref("attribute-request");

	ref.on("value", function(data){
		table.innerHTML = "";
		var objKey = Object.keys(data.val());
		var i = 1;
		for (var obj in objKey) {
			var key = objKey[obj];
			if (data.val()[key].requestTo === userTerkait) {
				table.innerHTML += "<tr><td>" + i + ".</td><td ng-model='attribute_key'>" + data.val()[key].attrName + "</td><td>" +
					data.val()[key].requestFrom + "</td><td><button type='button' class='btn btn-sm btn-success' ng-click='acceptRequestFromInquisitor()'>Accept</button><button type='button' class='btn btn-sm btn-danger' ng-click='declineRequestFromInquisitor()'>Decline</button></td></tr>";
				i++;
			}
		}
	});
}

function submitInitIdentityForm() {
	var username = document.getElementById("owner-username-input").value;
	var company = document.getElementById("owner-company-input").value;
	var attr_key1 = document.getElementById("owner-attr-key-1").value;
	var attr_val1 = document.getElementById("owner-attr-value-1").value;
	var attr_key2 = document.getElementById("owner-attr-key-2").value;
	var attr_val2 = document.getElementById("owner-attr-value-2").value;
	var attr_key3 = document.getElementById("owner-attr-key-3").value;
	var attr_val3 = document.getElementById("owner-attr-value-3").value;

	var result = db.ref("init-identity-form").push( {
		owner_username: username,
		owner_company: company,
		attr_key1: attr_key1,
		attr_val1: attr_val1,
		attr_key2: attr_key2,
		attr_val2: attr_val2,
		attr_key3: attr_key3,
		attr_val3: attr_val3
	}, function(error) {
			if (error) {
				alert("Error has occured during request. Please try again.");
			} else {
				alert("Form submission request has been sent!");
			}
	});
}

function readOwnerData() {
	var username = sessionStorage.getItem("username");
	// var org = sessionStorage.getItem("org");

	var container = document.getElementById("display_user_owner_id");
	var ref = db.ref("owner-data");

	ref.on("value", function(data){
		container.innerHTML = "";
		var objKey = Object.keys(data.val());
		for (var obj in objKey) {
			var key = objKey[obj];
			if (data.val()[key].ca_username === username) {
				container.innerHTML += "<h5><b>Owner ID: </b>" + data.val()[key].owner_id + "</h5>";
				sessionStorage.setItem("owner_id", data.val()[key].owner_id);
			}
		}
	});
}

$(document).on('click','.attribute_update_button',function(){
	var $row = $(this).closest("tr");    // Find the row
	var $actions = $row.find(".attribute_action_button");

	var $update_button = $actions.find(".attribute_update_button").css("display", "none");
	var $update_form = $actions.find(".attribute_update_form").css("display", "inline");

	// console.log($update_form);
	//
	// $update_button.style.display = "none";
	// $update_form.style.display = "inline";
	// document.getElementById("attribute_update_button").style.display = "none";
	// document.getElementById("attribute_update_form").style.display = "inline";
});

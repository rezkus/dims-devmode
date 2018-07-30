// JavaScript Document
var db = firebase.database();
var userTerkait = "hehe";

readRequestFromInquisitor();

////====================================================================================  IDENTITY OWNER SIDE
function requestAttributeUpdateToIssuer() {
	var newValue = document.getElementById("new-value").value;

	var result = db.ref("attribute-change-request").push({
		type: "update",
		identityID: "i123",
		attrName: "isAgeOver18",
		value: newValue
	}, function(error) {
		if (error) {
			alert("Error has occured during request. Please try again.");
		} else {
			alert("Update request has been sent!");
			document.getElementById("new-value").value = "";
			document.getElementById("update-form").style.display = "none";
			document.getElementById("update-button").style.display = "inline";
		}
	});
}

function requestAttributeSignToIssuer() {
	var result = db.ref("attribute-change-request").push({
		type: "sign",
		identityID: "i123",
		attrName: "isAgeOver18",
		value: false
	}, function(error) {
		if (error) {
			alert("Error has occured during request. Please try again.");
		} else {
			alert("Sign request has been sent!");
		}
	});
}

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

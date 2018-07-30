var db = firebase.database();
var lembaga = "Lembaga Bukan ITB";
var userTerkait = "hehe";
//const ref = database.ref('items');

// INI CUMA JALAN DI INQUISITOR
// readSentRequest();

// INI CUMA JALAN DI USER
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
					data.val()[key].requestFrom + "</td><td><button type='button' class='btn btn-sm btn-success' ng-click="acceptRequestFromInquisitor()">Accept</button><button type='button' class='btn btn-sm btn-danger' ng-Click='declineRequestFromInquisitor()'>Decline</button></td></tr>";
				i++;
			}
		}
	});
}



//====================================================================================  INQUISITOR SIDE
function requestAttributeToOwner() {
	var username = document.getElementById("username").value;
	var attr = document.getElementById("attribute").value;
	var details = document.getElementById("details").value;

	var result = db.ref("attribute-request").push({
		requestFrom: lembaga,
		requestTo: username,
		attrName: attr,
		details: details,
		status: "Processing",
		result: ""
	}, function(error) {
		if (error) {
			alert("Error has occured during request. Please try again.");
		} else {
			alert("Request has been sent!");
		}
	});
}

function readSentRequest() {
	var table = document.getElementById("identity-request-table").tBodies[0];
	var ref = db.ref("attribute-request");

	ref.on("value", function(data){
		table.innerHTML = "";
		var objKey = Object.keys(data.val());
		var i = 1;
		for (var obj in objKey) {
			var key = objKey[obj];
			if (data.val()[key].requestFrom === lembaga) {
				table.innerHTML += "<tr><td>" + i + ".</td><td>" + data.val()[key].requestTo + "</td><td>" +
					data.val()[key].attrName + "</td><td>" + data.val()[key].status + "</td><td>" + data.val()[key].result +
					"</td></tr>";
				i++;
			}
		}
	});
}
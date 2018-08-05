// JavaScript Document
var db = firebase.database();
//var userTerkait = "Jim";
var userToken = sessionStorage.getItem("token");
var decoded = parseJwt(userToken);

//ALWAYS ON FUNCTION WHEN PAGE IS LOADED
readRequestFromInquisitor();
readOwnerData();

//=========================================================
//========= INIT IDENTITY FORM=============================
//=========================================================

//Submit a request to make identity from owner to issuer
function submitInitIdentityForm() {
	var username = document.getElementById("owner-username-input").value;
	var company = document.getElementById("owner-company-input").value;
	var attr_key1 = document.getElementById("owner-attr-key-1").value;
	var attr_val1 = document.getElementById("owner-attr-value-1").value;
	var attr_key2 = document.getElementById("owner-attr-key-2").value;
	var attr_val2 = document.getElementById("owner-attr-value-2").value;
	var attr_key3 = document.getElementById("owner-attr-key-3").value;
	var attr_val3 = document.getElementById("owner-attr-value-3").value;
	var currentdate = new Date();
	var dateTime = currentdate.toLocaleString();

	var result = db.ref("init-identity-form").push( {
		dateTime: dateTime,
		owner_username: username,
		owner_company: company,
		attr_key1: attr_key1,
		attr_val1: attr_val1,
		attr_key2: attr_key2,
		attr_val2: attr_val2,
		attr_key3: attr_key3,
		attr_val3: attr_val3,
		status: "Processing"
	}, function(error) {
			if (error) {
				alert("Error has occured during request. Please try again.");
			} else {
				// $("#owner-username-input")[0].reset();
				// $("#owner-company-input")[0].reset();
				// $("#owner-attr-key-1")[0].reset();
				// $("#owner-attr-value-1")[0].reset();
				// $("#owner-attr-key-2")[0].reset();
				// $("#owner-attr-value-2")[0].reset();
				// $("#owner-attr-key-3")[0].reset();
				// $("#owner-attr-value-3")[0].reset();
				alert("Form submission request has been sent!");
			}
	});
}

//=========================================================
//========= OWNER'S IDENTITY TABLE ========================
//=========================================================

//Read owner's data
function readOwnerData() {
	var username = sessionStorage.getItem("username");
	var container = document.getElementById("display_user_owner_id");
	container.innerHTML = "";

	var ref = db.ref("owner-data");
	ref.on("value", function(data){
		if (data.exists()){
			var objKey = Object.keys(data.val());
			for (var obj in objKey) {
				var key = objKey[obj];
				if (data.val()[key].ca_username === username ) {
					// if (data.val()[key].status == "Accepted" ) {
						container.innerHTML += "<h5><b>Owner ID: </b>" + data.val()[key].owner_id + "</h5>";
						sessionStorage.setItem("owner_id", data.val()[key].owner_id);
					// } else if (data.val()[key].status == "DECLINED" ) {
					// 	container.innerHTML += "<h5><b>Owner ID: </b>" + data.val()[key].status + "</h5>";
					// 	sessionStorage.setItem("owner_id", "DECLINED");
					// }
				}
			}
		} else {
			var refIOF = db.ref("init-identity-form");
			refIOF.on("value", function(data){
				if (data.exists()) {
					var objKey = Object.keys(data.val());
					for (var obj in objKey) {
						var key = objKey[obj];
						if (data.val()[key].owner_username === username ) {
							if (data.val()[key].status == "Processing") {
								console.log("init-identity form request with username " + username + " is in process");
								container.innerHTML += "<h5><b>Owner ID: </b> IN PROCESS</h5>";
							} else if (data.val()[key].status == "DECLINED") {
								console.log("init-identity form request with username " + username + " is declined by issuer");
								container.innerHTML += "<h5><b>Owner ID: </b>DECLINED</h5>";
							}
						}
						// } else {
						// 	console.log("init-identity form request with username " + username + " not found");
						// 	container.innerHTML += "<h5><b>Owner ID: </b>NO REQUEST INIT EXISTS</h5>";
						// }
					}
				} else {
					console.log("init-identity-form not exist");
				}
			});
		}
	});
}

//click refresh button to populate with attribute from blockchain
$(document).on('click','#refresh_identity',function(){
	if (sessionStorage.getItem("owner_id") != null) {
		var owner_id = sessionStorage.getItem("owner_id");
		angular.element('#appController')
			.scope()
			.read_identity_by_owner_id(owner_id);
	} else {
		alert("Cannot find owner_id on sessionStorage")
	}
});

//=========================================================
//========= IDENTITY CHANGE REQUEST TABLE ================
//=========================================================

//Click Update Request Button > change display of the button to form
$(document).on('click','.attribute_update_button',function(){
	var $row = $(this).closest("tr");    // Find the row
	var $actions = $row.find(".attribute_action_button");

	var $update_button = $actions.find(".attribute_update_button").css("display", "none");
	var $update_form = $actions.find(".attribute_update_form").css("display", "inline");
});

//Click Submit on Attribute New Value Request
$(document).on('click', '.new_attr_submit', function(){
	console.log('submit');
	var $row = $(this).closest("tr");    // Find the row
	var $attribute_key = $row.find(".attribute_key").text(); // Find the text

	var $owner_identity_id = document.getElementById('owner_identity_id').innerText;
	var $actions = $row.find(".attribute_action_button");
	var $action_form = $actions.find("form");
	var newValue = $action_form.find(".new_attr_value").val();

	var currentdate = new Date();
	var dateTime = currentdate.toLocaleString();


	console.log(newValue);

	var result = db.ref("attribute-change-request").push({
		dateTime: dateTime,
		type: "update",
		identityID: $owner_identity_id,
		attrName: $attribute_key,
		value: newValue,
		status: "Processing"
	}, function(error) {
		if (error) {
			alert("Error has occured during request. Please try again.");
		} else {
			console.log("Update request has been sent!");
			$action_form.find(".new_attr_value").text = "";
			var $update_button = $actions.find(".attribute_update_button").css("display", "inline");
			var $update_form = $actions.find(".attribute_update_form").css("display", "none");
		}
	});
});

//Click Sign Request Button
$(document).on('click','.attribute_sign_button',function(){
	var $row = $(this).closest("tr");    // Find the row
	var $attribute_key = $row.find(".attribute_key").text(); // Find the text
	var $owner_identity_id = document.getElementById('owner_identity_id').innerText;
	var currentdate = new Date();
	var dateTime = currentdate.toLocaleString();


	var result = db.ref("attribute-change-request").push({
		dateTime: dateTime,
		type: "sign",
		identityID: $owner_identity_id,
		attrName: $attribute_key,
		value: "-",
		status: "Processing"
	}, function(error) {
		if (error) {
			alert("Error has occured during request. Please try again.");
		} else {
			alert("Sign request has been sent!");
			console.log("successfully pushed sign request to firebase");
		}
	});
});

//=================================================================
//================ INQUISITOR'S REQUEST TABLE =====================
//=================================================================

//Populate inquisitor request table
function readRequestFromInquisitor() {
	console.log("readRequestFromInquisitor() is running")

	var table = document.getElementById("owner-id-request-table").tBodies[0];
	var ref = db.ref("attribute-request");
	ref.on("value", function(data){
		if (data.exists()) {
			table.innerHTML = "";
			var objKey = Object.keys(data.val());
			var i = 1;
			for (var obj in objKey) {
				var key = objKey[obj];
				if (data.val()[key].requestTo === decoded.username && data.val()[key].status === "Processing" ) {
					table.innerHTML += "<tr><td>" + i + ".</td><td class='inquisitor_request_dateTime'>" + data.val()[key].dateTime + "</td><td class='inquisitor_request_targetAttr'>" + data.val()[key].attrName + "</td><td>" + data.val()[key].requestFrom + "</td><td>" + data.val()[key].details+ "</td><td><button type='button' class='accept-inquisitor-request btn btn-sm btn-success'>Accept</button><button type='button' class='decline-inquisitor-request btn btn-sm btn-danger'>Decline</button></td></tr>";
					i++;
				}
			}
	} else {
		console.log("attribute-request data not exist");
	}
	});
}

//Click accept button of inquisitor request
$(document).on("click", ".accept-inquisitor-request", function() {
	var ref = db.ref("attribute-request");

	var $row = $(this).closest("tr");    // Find the row
	var $dateTime = $row.find(".inquisitor_request_dateTime").text(); // Find the text
	var $target_attr = $row.find(".inquisitor_request_targetAttr").text(); // Find the text"
	var $owner_identity_id = document.getElementById("owner_identity_id").innerHTML;

	console.log($target_attr);
	console.log($owner_identity_id);

	var $result;
	angular.element('#appController')
		.scope()
		.read_attribute($owner_identity_id, $target_attr, function(data) {
			$result = data;
			console.log($result);
			ref.orderByChild("dateTime").equalTo($dateTime).once("child_added", function(data) {
				//console.log(data);
				data.ref.update({result: $result});
				data.ref.update({status: "Accepted"});

				console.log("read_attribute() done");
			});
	});
});

//Click decline inquisitor request button
$(document).on("click", ".decline-inquisitor-request", function() {
	var ref = db.ref("attribute-request");
	var $row = $(this).closest("tr");    // Find the row
	var $dateTime = $row.find(".inquisitor_request_dateTime").text(); // Find the text
	ref.orderByChild("dateTime").equalTo($dateTime).once("child_added", function(data) {
		//console.log(data);
		data.ref.update({status: "DECLINED"});
	});
	alert("Identity request has been declined");
});

//============DELETING DATA FROM FIREBASE
// var xxx = db.ref("xxx");
// var checkDate = xxx.orderByChild("dateTime").equalTo($dateTime);
// checkDate.once("value").then(function(snapshot) {
// 	var updates = {};
// 	snapshot.forEach(function(child){
// 		updates["/xxx/"+child.key] = null;
// 	});
// 	xxx.update(updates);
// });






//==============================================================================
//============== LIB
//==============================================================================
function parseJwt (token) {
    var base64Url = token.split('.')[1];
    var base64 = base64Url.replace('-', '+').replace('_', '/');
    return JSON.parse(window.atob(base64));
};

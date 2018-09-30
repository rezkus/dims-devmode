// JavaScript Document
var db = firebase.database();
//var userTerkait = "Jim";
var userToken = sessionStorage.getItem("token");
var decoded;

if (userToken != null) {
	decoded = parseJwt(userToken);
} else {
	userToken = null;
	decoded = "null";
}


//ALWAYS ON FUNCTION WHEN PAGE IS LOADED
hideInitIdentityForm();
readRequestFromInquisitor();
readOwnerData();

var $owner_name = decoded.username;
document.getElementById("owner-username-input").value = $owner_name;


//=========================================================
//========= INIT IDENTITY FORM=============================
//=========================================================

//Submit a request to make identity from owner to issuer
function submitInitIdentityForm() {
	var isAllInputFilled = validateInitForm();

	if (userToken == null) {
		alert("Token not found!");
	} else {
		if (!isAllInputFilled) {
			alert("Please Fill All Field");
		} else {
			var $owner_name = decoded.username;
			document.getElementById("owner-username-input").value = $owner_name;
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
						alert("Form submission request has been sent!");
					}
			});

			//	var $owner_name = sessionStorage.getItem("username");

			var ref = db.ref("owner-auth");
			ref.orderByChild("username").equalTo($owner_name).once("child_added", function(data) {
				data.ref.update({requestInitStatus: "processing"});
			});
		}
	}
}

//=========================================================
//========= OWNER'S IDENTITY TABLE ========================
//=========================================================

//Read owner's data
function readOwnerData() {
	var username = sessionStorage.getItem("username");
	var container = document.getElementById("display_user_owner_id");
	container.innerHTML = "";

	var ref = db.ref("owner-auth");
	ref.on("value", function(data){
		if (data.exists()){
			var objKey = Object.keys(data.val());
			for (var obj in objKey) {
				var key = objKey[obj];
				if (data.val()[key].username === username ) {
					if (data.val()[key].requestInitStatus == "accepted") {
						container.innerHTML += "<h5><b>Owner ID: </b>" + data.val()[key].owner_id + "</h5>";
						sessionStorage.setItem("owner_id", data.val()[key].owner_id);
					} else if (data.val()[key].requestInitStatus == "processing") {
						console.log("init-identity form request with username " + username + " is in process");
						container.innerHTML += "<h5><b>Owner ID: </b> IN PROCESS</h5>";
					} else if (data.val()[key].requestInitStatus == "DECLINED") {
						console.log("init-identity form request with username " + username + " is declined by issuer");
						container.innerHTML += "<h5><b>Owner ID: </b>DECLINED</h5>";
					} else if (data.val()[key].requestInitStatus == "-") {
						console.log("You didn't make any request");
						container.innerHTML += "<h5><b>Owner ID: </b>-</h5>";
					}
				}
			}
		} else {
			console.log("owner-auth data not found");
		}
	});
}

//click refresh button to populate with attribute from blockchain
$(document).on('click','#refresh_identity',function(){
	if (userToken == null) {
		alert("Token not found!");
	} else {
		if (sessionStorage.getItem("owner_id") != null) {
			var owner_id = sessionStorage.getItem("owner_id");

			angular.element('#appController')
				.scope()
				.read_identity_by_owner_id(owner_id);

			setTimeout(findDeletedAttribute, 3500);
			console.log("testss");

		} else {
			alert("Cannot find owner_id on sessionStorage");
		}
	}

});

//=========================================================
//========= IDENTITY CHANGE REQUEST TABLE ================
//=========================================================

//Click Update Request Button > change display of the button to form
$(document).on('click','.attribute_update_button',function(){
	var $row = $(this).closest("tr");    // Find the row
	var $actions = $row.find(".attribute_action_button");

	if (userToken == null) {
		alert("Token not found!");
	} else {
		var $update_button = $actions.find(".attribute_update_button").css("display", "none");
		var $update_form = $actions.find(".attribute_update_form").css("display", "inline");
	}
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

	if (newValue == "" || newValue == " ") {
		var result = db.ref("attribute-change-request").push({
			dateTime: dateTime,
			type: "delete",
			identityID: $owner_identity_id,
			attrName: $attribute_key,
			value: newValue,
			status: "Processing"
		}, function(error) {
			if (error) {
				alert("Error has occured during request. Please try again.");
			} else {
				alert("Delete request has been sent!");
				$action_form.find(".new_attr_value").text = "";
				var $update_button = $actions.find(".attribute_update_button").css("display", "inline");
				var $update_form = $actions.find(".attribute_update_form").css("display", "none");
			}
		});
	} else {
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
	}
});

//Click Sign Request Button
$(document).on('click','.attribute_sign_button',function(){
	var $row = $(this).closest("tr");    // Find the row
	var $attribute_key = $row.find(".attribute_key").text(); // Find the text
	var $owner_identity_id = document.getElementById('owner_identity_id').innerText;
	var $current_sig = $row.find(".attribute_signature").text();
	var currentdate = new Date();
	var dateTime = currentdate.toLocaleString();

	if (userToken == null) {
		alert("Token not found!");
	} else {
		if ($current_sig != "noSig") {
			alert("Attribute has been signed");
		} else {
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
		}
	}
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
	var $target_attr = $row.find(".inquisitor_request_targetAttr").text(); //
	var $owner_identity_id = document.getElementById("owner_identity_id").innerHTML;


	if (userToken == null) {
		alert("Token not found!");
	} else {
		//get column of attribute key of #owner_attribute table
		var attrKeyArray = $('#owner_attribute td:nth-child(2)').map(function(){

			return $(this).text();
   	}).get();
		console.log(attrKeyArray);
		if (attrKeyArray === undefined || attrKeyArray.length == 0) {
				alert("Please refresh attribute table");
		} else {
			var keyFound = false;
			var keyLoc;
			for (var key in attrKeyArray) {
				//console.log(attrKeyArray[key]);
				if (attrKeyArray[key].toLowerCase() == $target_attr.toLowerCase()) {
					console.log("matching key found");
					keyFound = true;
					keyLoc = key;
				}
			}

			if (!keyFound) {
				alert("Requested key not found in your attribute list. REQUEST DECLINED");
				ref.orderByChild("dateTime").equalTo($dateTime).once("child_added", function(data) {
					//console.log(data);
					data.ref.update({status: "DECLINED"});
				});
			} else {
				console.log($target_attr);
				console.log($owner_identity_id);

				var $result;
				angular.element('#appController')
					.scope()
					.read_attribute($owner_identity_id, attrKeyArray[keyLoc], function(data) {
						$result = data;
						console.log($result);
						ref.orderByChild("dateTime").equalTo($dateTime).once("child_added", function(data) {
							//console.log(data);
							data.ref.update({result: $result});
							data.ref.update({status: "Accepted"});

							console.log("read_attribute() done");
						});
				});
			}
		}
	}
});

//Click decline inquisitor request button
$(document).on("click", ".decline-inquisitor-request", function() {

	if (userToken == null) {
		alert("Token not found!");
	} else {
		var ref = db.ref("attribute-request");
		var $row = $(this).closest("tr");    // Find the row
		var $dateTime = $row.find(".inquisitor_request_dateTime").text(); // Find the text
		ref.orderByChild("dateTime").equalTo($dateTime).once("child_added", function(data) {
			//console.log(data);
			data.ref.update({status: "DECLINED"});
		});
		alert("Identity request has been declined");
	}

});


//==============================================================================
//============== LIB
//==============================================================================
function parseJwt (token) {
    var base64Url = token.split('.')[1];
    var base64 = base64Url.replace('-', '+').replace('_', '/');
    return JSON.parse(window.atob(base64));
}

function hideInitIdentityForm() {
	var ref = db.ref("owner-auth");

	$owner_name = sessionStorage.getItem("username");

	ref.orderByChild("username").equalTo($owner_name).on("child_added", function(snapshot) {
		owner = snapshot.val();
		console.log("requestInitStatus: %s", owner.requestInitStatus);

		if (owner.requestInitStatus == "processing" || owner.requestInitStatus == "accepted") {
			$(".init-new-identity-form").hide();
		} else {
			$(".init-new-identity-form").show();
		}
	});
}

function validateInitForm() {
	var username=document.forms["init_identity_form"]["username"].value;
  var company=document.forms["init_identity_form"]["company"].value;
  var key1=document.forms["init_identity_form"]["key1"].value;
  var val1=document.forms["init_identity_form"]["val1"].value;
	var key2=document.forms["init_identity_form"]["key2"].value;
	var val2=document.forms["init_identity_form"]["val2"].value;
	var key3=document.forms["init_identity_form"]["key3"].value;
  var val3=document.forms["init_identity_form"]["val3"].value;

	var isValid = true;

  if (username==null || username=="", company==null || company=="", key1==null || key1=="", val1==null || val1=="", key2==null || key2=="", val2==null || val2=="", key3==null || key3=="", val3==null || val3=="")
  {
      isValid = false;
  }

	return isValid;
}

function findDeletedAttribute() {
	console.log("testasad");
	$(".attribute_table_row").each(function() {
		var attribute_key = $(this).find(".attribute_key").text();
		var attribute_value = $(this).find(".attribute_value").text();
		var attribute_signature = $(this).find(".attribute_signature").text();
		var action_button = $(this).find(".attribute_action_button").val();

		console.log(attribute_key);
		console.log("test");
		if (attribute_value == "" || attribute_value == " ") {
			$(this).find(".attribute_signature").value = "";
			//action_button.hide();

		}
	});
}

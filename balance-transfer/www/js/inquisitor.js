var db = firebase.database();
var lembaga = "Lembaga Bukan ITB";

// INI CUMA JALAN DI INQUISITOR
 readSentRequest();

//====================================================================================  INQUISITOR SIDE
function requestAttributeToOwner() {
	var username = document.getElementById("username").value;
	var attr = document.getElementById("attribute").value;
	var details = document.getElementById("details").value;

  var currentdate = new Date();
  var dateTime = currentdate.toLocaleString();

	var result = db.ref("attribute-request").push({
    dateTime: dateTime,
		requestFrom: lembaga,
		requestTo: username,
		attrName: attr,
		details: details,
		status: "Processing",
		result: {
      IDKey: "-",
      IDValue: "-",
      IDSignature: "-",
      docType: "-"
    }
	}, function(error) {
		if (error) {
			alert("Error has occured during request. Please try again.");
		} else {
      // $("#username")[0].reset();
      // $("#attribute")[0].reset();
      // $("#details")[0].reset();
      alert("Request has been sent!");
		}
	});
}

function readSentRequest() {
	var table = document.getElementById("identity-request-table").tBodies[0];
	var ref = db.ref("attribute-request");

	ref.on("value", function(data){
    if (data.exists()) {
  		table.innerHTML = "";
  		var objKey = Object.keys(data.val());
  		var i = 1;
  		for (var obj in objKey) {
  			var key = objKey[obj];
  			if (data.val()[key].requestFrom === lembaga) {
  				table.innerHTML += "<tr><td>" + i + ".</td><td>" + data.val()[key].requestTo + "</td><td>" +
  					data.val()[key].attrName + "</td><td>" + data.val()[key].status + "</td><td>" + data.val()[key].result.IDValue + "<br>" + data.val()[key].result.IDSignature + "</td></tr>";
  				i++;
  			}
  		}
    } else {
      console.log("attribute-request data not exist");
    }
	});
}

var firebase = require("firebase");

var config = {
    apiKey: <SOME API KEY>,
    authDomain: <SOME AUTH DOMAIN>,
    databaseURL: <SOME DATABASE URL>,
    projectId: <SOME PROJECT ID>,
    storageBucket: <SOME STORAGE BUCKET>,
    messagingSenderId: <SOME MESSAGING SENDER ID>
  };
firebase.initializeApp(config);



var db = firebase.database();

pushOwnerData();
pushIssuerData();
pushInquisitorData();

function pushOwnerData() {
  var refOwner = db.ref("owner-auth");
  refOwner.push({
    username: "john",
    password: "john123",
    orgName: "Identity Owner",
    requestInitStatus: "-",
    owner_id: "-",
    identity_id: "-"
  }, function(error) {
			if (error) {
				alert("Error has occured during request. Please try again.");
      }
	});
  refOwner.push({
    username: "mary",
    password: "mary123",
    orgName: "Identity Owner",
    requestInitStatus: "-",
    owner_id: "-",
    identity_id: "-"
  }, function(error) {
			if (error) {
				alert("Error has occured during request. Please try again.");
	    }
  });
  refOwner.push({
    username: "peter",
    password: "peter123",
    orgName: "Identity Owner",
    requestInitStatus: "-",
    owner_id: "-",
    identity_id: "-"
  }, function(error) {
			if (error) {
				alert("Error has occured during request. Please try again.");
      }
	});
}

function pushIssuerData() {
  var refIssuer = db.ref("issuer-auth");
  refIssuer.push({
    username: "steiitb",
    password: "steiitb123",
    orgName: "Identity Issuer"
  }, function(error) {
			if (error) {
				alert("Error has occured during request. Please try again.");
      }
	});
}

function pushInquisitorData() {
  var refInq = db.ref("inquisitor-auth");
  refInq.push({ //isStudent
    username: "startup",
    password: "startup123",
    orgName: "Identity Inquisitor"
  }, function(error) {
			if (error) {
				alert("Error has occured during request. Please try again.");
      }
	});
  refInq.push({ //isBidikmisi
    username: "lpdp",
    password: "lpdp123",
    orgName: "Identity Inquisitor"
  }, function(error) {
			if (error) {
				alert("Error has occured during request. Please try again.");
	    }
  });
  refInq.push({ //isGPAOver3
    username: "yayasanbeasiswa",
    password: "yayasanbeasiswa123",
    orgName: "Identity Inquisitor"
  }, function(error) {
			if (error) {
				alert("Error has occured during request. Please try again.");
      }
	});
}

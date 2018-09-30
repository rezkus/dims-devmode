db = firebase.database();

function login() {
  var option = document.getElementById("organization");
  var org = option.options[option.selectedIndex].value;

  // var org = $('#organization option:selected').value;
  var username = document.getElementById("username").value.toLowerCase();
  var password = document.getElementById("password").value.toLowerCase();

  console.log("username %s, password %s, org %s", username, password, org);

  var isFilled = validateLoginForm(username, password, org);
  console.log("isFilled %s", isFilled);
  if (isFilled) {
    validateCredential(username, password, org, function(isAuth) {
      console.log("isAuth %s", isAuth);
      if (isAuth) {
        console.log("Input filled and credential exists");
        angular.element('#appController')
          .scope()
          .enrollUser();

        setTimeout(redirectPage, 1000, org);
      } else {
      //  console.log("Wrong");
        alert("Wrong username or password or organization!");
      }
    });
  } else {
    console.log("not filled");
    alert("Please fill all fields!");
  }


}

function validateLoginForm(username, password, org) {
  var isValid = true;

  if (username==null || username=="" || password==null || password=="" || org==null || org=="")
  {
      isValid = false;
  }

  return isValid;
}

function validateCredential(username, password, org, callback) {
  isValid = false;
  console.log("uname %s, pass %s", username, password);
  switch (org) {
    case "Org1":
      console.log("case owner");
      ref = db.ref("owner-auth");
      ref.once("value", function(data){
    		if (data.exists()){
    			var objKey = Object.keys(data.val());
    			for (var obj in objKey) {
    				var key = objKey[obj];
            //console.log("db username %s, db password %s, isvalid %s", data.val()[key].username, data.val()[key].password, isValid);
    				if (data.val()[key].username == username && data.val()[key].password == password) {
              isValid = true;
              callback(true);
            }
          }
          if (isValid == false) {
            callback(false);
          }
        } else {
          console.log("owner-auth doesnt exist!");
        }
      });
      break;
    case "Org2":
    console.log("case issuer");

      ref = db.ref("issuer-auth");
      ref.once("value", function(data){
        if (data.exists()){
          var objKey = Object.keys(data.val());
          for (var obj in objKey) {
            var key = objKey[obj];
            if (data.val()[key].username === username && data.val()[key].password === password) {
              isValid = true;
              callback(true);
            }
          }
          if (isValid == false) {
            callback(false);
          }
        } else {
          console.log("issuer-auth doesnt exist!");
        }
      });
      break;
    case "Org3":
    console.log("case inqui");

      ref = db.ref("inquisitor-auth");
      ref.once("value", function(data){
        if (data.exists()){
          var objKey = Object.keys(data.val());
          for (var obj in objKey) {
            var key = objKey[obj];
            if (data.val()[key].username === username && data.val()[key].password === password) {
              isValid = true;
              callback(true);
            }
          }
          if (isValid == false) {
            callback(false);
          }
        } else {
          console.log("inquisitor-auth doesnt exist!");
        }
      });
      break;
    default:
      console.log("org doesnt match any");
      callback(false);
  }
  // callback(isValid);
}

function redirectPage(org) {
  console.log("redirecting page");
  switch (org) {
    case "Org1":
      window.location = "/index-user.html"
      break;
    case "Org2":
      window.location = "/index-issuer.html"
      break;
    case "Org3":
      window.location = "/index-inquisitor.html"
      break;
  }
}

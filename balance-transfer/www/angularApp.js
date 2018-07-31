// SPDX-License-Identifier: Apache-2.0

'use strict';

var app = angular.module('app', []);

// Angular Controller
app.controller('appController', function($scope, appFactory){

  //global var
  $scope.token = "Token empty";


  //-----------

  $scope.enrollUser = function() {
    var username = $scope.username;
    var org = $scope.org;

    appFactory.enrollUser(username, org, function(data){
        sessionStorage.setItem("org1_token", data);
        $scope.token = data;
    });
  }

  $scope.acceptRequestFromInquisitor = function() {
    console.log("acceptRequestFromInquisitor() is running");
    var identity_id = $scope.identity_id;
    var attribute_key = $scope.attribute_key;
    var token = sessionStorage.getItem("org1_token");

    appFactory.acceptRequestFromInquisitor(identity_id, attribute_key, token, function(data){
      alert("acceptRequestFromInquisitor() success");
    });
  }

  //---------init owner
  $scope.init_owner = function(owner_id, owner_username, owner_company, identity_id, attrKey1, attrVal1, attrKey2, attrVal2, attrKey3, attrVal3) {
    console.log("init_owner() is running");
    var token = sessionStorage.getItem("org1_token");
    console.log(token);
    // var owner_id = $scope.icr_owner_id;
    // var owner_username = $scope.icr_owner_name;
    // var owner_company = $scope.icr_owner_company;

    appFactory.init_owner(owner_id, owner_username, owner_company, token, function(data){
      alert("init owner success");
      appFactory.init_identity(identity_id, owner_id, owner_company, attrKey1, attrVal1, attrKey2, attrVal2, attrKey3, attrVal3, token, function(data){
        alert("init identity success");
      });
    });
  }

  //---------init identity
  $scope.init_identity = function(identity_id, owner_id, auth_company, attrKey1, attrVal1, attrKey2, attrVal2, attrKey3, attrVal3) {
    console.log("init_identity() is running");
    var token = sessionStorage.getItem("org1_token");
    // var identity_id = $scope.icr_identity_id;
    // var owner_id = $scope.icr_owner_id;
    // var auth_company = $scope.icr_owner_company;
    // var attrKey1 = $scope.icr_attr_key_1;
    // var attrVal1 = $scope.icr_attr_value_1;
    // var attrKey2 = $scope.icr_attr_key_2;
    // var attrVal2 = $scope.icr_attr_value_2;
    // var attrKey3 = $scope.icr_attr_key_3;
    // var attrVal3 = $scope.icr_attr_value_3;

    appFactory.init_identity(identity_id, owner_id, auth_company, attrKey1, attrVal1, attrKey2, attrVal2, attrKey3, attrVal3, token, function(data){
      alert("init identity success");
    });
  }

  //---------read_everything
  $scope.read_everything = function() {
    console.log("read_everything() is running");
    var token = sessionStorage.getItem("org1_token");

    appFactory.read_everything(token, function(data){

    });
  }

  //---------read_attribute
  $scope.read_attribute = function() {
    console.log("read_attribute() is running");
    var token = sessionStorage.getItem("org1_token");
    var identity_id = $scope.xxx;
    var target_attr = $scope.xxx;

    appFactory.read_attribute(identity_id, target_attr, token, function(data){

    });
  }

  //---------update_attribute
  $scope.update_attribute = function() {
    console.log("update_attribute() is running");
    var token = sessionStorage.getItem("org1_token");
    var owner_id = $scope.xxx;
    var owner_username = $scope.xxx;
    var owner_company = $scope.xxx;

    appFactory.update_attribute(identity_id, target_attr, new_value, isIssuer, token, function(data){

    });
  }

  //---------sign attribute
  $scope.sign_attribute = function() {
    console.log("sign_attribute() is running");
    var token = sessionStorage.getItem("org1_token");
    var identity_id = $scope.xxx;
    var target_attr = $scope.xxx;
    var signer_name = $scope.xxx;
    var signer_company = $scope.xxx;

    appFactory.sign_attribute(identity_id, target_attr, signer_name, signer_company, token, function(data){

    });
  }

  //---------set owner
  $scope.set_owner = function() {
    console.log("set_owner() is running");
    var token = sessionStorage.getItem("org1_token");
    var identity_id = $scope.xxx;
    var new_owner_id = $scope.xxx;
    var auth_company = $scope.xxx;

    appFactory.set_owner(identity_id, new_owner_id, auth_company, token, function(data){

    });
  }

  //---------read identity by owner id
  $scope.read_identity_by_owner_id = function() {
    console.log("read_identity_by_owner_id() is running");
    var token = sessionStorage.getItem("org1_token");
    var owner_id = $scope.xxx;

    appFactory.read_identity_by_owner_id(owner_id, token, function(data){

    });
  }

});

app.factory('appFactory', function($http){

  var factory = {};


    // ================== enrollUser
    factory.enrollUser = function(username, org, callback){
      $http({
        method: 'POST',
        url: '/users',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        data: $.param({
          'username': username,
          'orgName': org
        })
      }).success(function (response) {
        console.log(response);
        callback(response.token);
      });
    }

    //---------------------------------------------------------------------------------
    //-----------------------------INVOKE CHAINCODE------------------------------------
    //---------------------------------------------------------------------------------

    // ================== init_owner
    factory.init_owner = function(owner_id, owner_username, owner_company, token, callback){
      $http({
        method: "POST",
        url: "/channels/mychannel/chaincodes/mycc",
        headers: {
          "authorization": "Bearer " + token,
          "Content-Type": "application/json"
        },
        data: {
          "peers": ["peer0.org1.example.com","peer1.org1.example.com"],
          "fcn": "init_owner",
          "args": [owner_id, owner_username, owner_company]
        }
      }).success(function (response) {
        console.log(response);
        callback(response);
      });
    }

    // ================== init_identity
    factory.init_identity = function(identity_id, owner_id, auth_company, attrKey1, attrVal1, attrKey2, attrVal2, attrKey3, attrVal3, token, callback){
      $http({
        method: 'POST',
        url: '/channels/mychannel/chaincodes/mycc',
        headers: {
          'authorization': "Bearer " + token,
          'Content-Type': 'application/json'
        },
        data: {
          "peers": ["peer0.org1.example.com","peer1.org1.example.com"],
          "fcn":"init_identity",
          "args":[identity_id, owner_id, auth_company, attrKey1, attrVal1, attrKey2, attrVal2, attrKey3, attrVal3]
        }
      }).success(function (response) {
        console.log(response);
        callback(response);
      });
    }

    // ================== read_everything
    factory.read_everything = function(token, callback){
      $http({
        method: 'POST',
        url: '/channels/mychannel/chaincodes/mycc',
        headers: {
          'authorization': 'Bearer ' + token,
          'Content-Type': 'application/json'
        },
        data: $.param({
          'peers': ['peer0.org1.example.com','peer1.org1.example.com'],
          'fcn':'read_everything',
          'args':[]
        })
      }).success(function (response) {
        console.log(response);
        callback(response);
      });
    }

    // ================== read_attribute
    factory.read_attribute = function(identity_id, target_attr, token, callback){
      $http({
        method: 'POST',
        url: '/channels/mychannel/chaincodes/mycc',
        headers: {
          'authorization': 'Bearer ' + token,
          'Content-Type': 'application/json'
        },
        data: $.param({
          'peers': ['peer0.org1.example.com','peer1.org1.example.com'],
          'fcn':'read_attribute',
          'args':[identity_id, target_attr]
        })
      }).success(function (response) {
        console.log(response);
        callback(response);
      });
    }

    // ================== update_attribute
    factory.update_attribute = function(identity_id, target_attr, new_value, isIssuer, token, callback){
      $http({
        method: 'POST',
        url: '/channels/mychannel/chaincodes/mycc',
        headers: {
          'authorization': 'Bearer ' + token,
          'Content-Type': 'application/json'
        },
        data: $.param({
          'peers': ['peer0.org1.example.com','peer1.org1.example.com'],
          'fcn':'update_attribute',
          'args':[identity_id, target_attr, new_value, isIssuer]
        })
      }).success(function (response) {
        console.log(response);
        callback(response);
      });
    }

    // ================== sign_attribute
    factory.sign_attribute = function(identity_id, target_attr, signer_name, signer_company, token, callback){
      $http({
        method: 'POST',
        url: '/channels/mychannel/chaincodes/mycc',
        headers: {
          'authorization': 'Bearer ' + token,
          'Content-Type': 'application/json'
        },
        data: $.param({
          'peers': ['peer0.org1.example.com','peer1.org1.example.com'],
          'fcn':'sign_attribute',
          'args':[identity_id, target_attr, signer_name, signer_company]
        })
      }).success(function (response) {
        console.log(response);
        callback(response);
      });
    }

    // ================== set_owner
    factory.set_owner = function(identity_id, new_owner_id, auth_company, token, callback){
      $http({
        method: 'POST',
        url: '/channels/mychannel/chaincodes/mycc',
        headers: {
          'authorization': 'Bearer ' + token,
          'Content-Type': 'application/json'
        },
        data: $.param({
          'peers': ['peer0.org1.example.com','peer1.org1.example.com'],
          'fcn':'set_owner',
          'args':[identity_id, new_owner_id, auth_company]
        })
      }).success(function (response) {
        console.log(response);
        callback(response);
      });
    }

    // ================== read_identity_by_owner_id
    factory.read_identity_by_owner_id = function(owner_id, token, callback){
      $http({
        method: 'POST',
        url: '/channels/mychannel/chaincodes/mycc',
        headers: {
          'authorization': 'Bearer ' + token,
          'Content-Type': 'application/json'
        },
        data: $.param({
          'peers': ['peer0.org1.example.com','peer1.org1.example.com'],
          'fcn':'read_identity_by_owner_id',
          'args':[owner_id]
        })
      }).success(function (response) {
        console.log(response);
        callback(response);
      });
    }

    //----------------------------------------------------------------------------------------
    //-----------------------------END OF INVOKE CHAINCODE------------------------------------
    //----------------------------------------------------------------------------------------

    // // ================== acceptRequestFromInquisitor
    // factory.acceptRequestFromInquisitor = function(identity_id, attribute_key, token, callback){
    //   $http({
    //     method: 'POST',
    //     url: '/channels/mychannel/chaincode/mycc',
    //     headers: {
    //       'Content-Type': 'application/json',
    //       'authorization': 'Bearer ' + token
    //     },
    //     data: $.param({
    //       'peers': ['peer0.org1.example.com','peer1.org1.example.com'],
    //       'fcn':'read_attribute',
    //       'args':[identity_id, attribute_key]
    //     })
    //   }).success(function (response){
    //       console.log(response);
    //       //kirim response ke inquisitor table
    //       //status request inquisitor jadi success
    //   });
    // }

  return factory;
});

// SPDX-License-Identifier: Apache-2.0

'use strict';

var app = angular.module('application', []);

// Angular Controller
app.controller('appController', function($scope){
  $scope.token = "Token";


  $scope.enrollUser = function() {
    // appFactory.enrollUser(function(data){
      $http({
        method: 'POST',
        url: 'http://localhost:4000/users',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
        data: {
          'username': 'Jim',
          'orgName': 'Org1'
        }
      }).success(function (response) {
        // document.getElementById('token').innerHTML = this.responseText;
        $scope.token = response.body.token;
        sessionStorage.setItem("org1_token", response.body.token);
        callback(response)
      });
    // });
  }


  $scope.readEverything = function() {
    appFactory.readEverything(function(data){

    });
  }
});

app.factory('appFactory', function($http){

  var factory = {};

    // echo "POST request Enroll on Org1  ..."
    // echo
    // ORG1_TOKEN=$(curl -s -X POST \
    //   http://localhost:4000/users \
    //   -H "content-type: application/x-www-form-urlencoded" \
    //   -d 'username=Jim&orgName=Org1')
    // echo $ORG1_TOKEN
    // ORG1_TOKEN=$(echo $ORG1_TOKEN | jq ".token" | sed "s/\"//g")
    // echo
    // echo "ORG1 token is $ORG1_TOKEN"
    // echo
    factory.enrollUser = function(callback){
      $http({
        method: 'POST',
        url: 'http://localhost:4000/users',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
        data: {
          'username': 'Jim',
          'orgName': 'Org1'
        }
      }).success(function (response) {
        document.getElementById('token').innerHTML = this.responseText;
        sessionStorage.setItem("org1_token", response.body.token);
        callback(response)
    });
  }




    factory.readEverything = function(callback){
        $http.get('')
    }

    factory.enrollUser = function()

  return factory;
});
// SPDX-License-Identifier: Apache-2.0

'use strict';

var app = angular.module('app', []);

// Angular Controller
app.controller('appController', function($scope, appFactory){
  $scope.token = "Token empty";

  $scope.enrollUser = function() {
    var username = $scope.username;
    var org = $scope.org;

    appFactory.enrollUser(username, org, function(data){
        sessionStorage.setItem("org1_token", data);
        $scope.token = data;
    });
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

    factory.readEverything = function(callback){
        // $http.get('')
    }

  return factory;
});

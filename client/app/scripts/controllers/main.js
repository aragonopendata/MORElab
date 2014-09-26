'use strict';

/**
 * @ngdoc function
 * @name jacathonApp.controller:MainCtrl
 * @description
 * # MainCtrl
 * Controller of the jacathonApp
 */
angular.module('jacathonApp')
  .controller('MainCtrl', function ($scope) {
    $scope.awesomeThings = [
      'HTML5 Boilerplate',
      'AngularJS',
      'Karma'
    ];
  });

'use strict';

/**
 * @ngdoc function
 * @name jacathonApp.controller:AboutCtrl
 * @description
 * # AboutCtrl
 * Controller of the jacathonApp
 */
angular.module('jacathonApp')
  .controller('AboutCtrl', function ($scope) {
    $scope.awesomeThings = [
      'HTML5 Boilerplate',
      'AngularJS',
      'Karma'
    ];
  });

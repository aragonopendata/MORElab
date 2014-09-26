'use strict';


angular.module('jacathonApp')
  .controller('TuitsCtrl', function ($scope,$http,$interval) {
  	$scope.tuits={};

  	var refreshData = function() {
    // Assign to scope within callback to avoid data flickering on screen
  		$http.get('http://localhost:5000/morelab/api/v1.0/stream').success(function(tuits) {
  			$scope.tuits=tuits;
  			console.log($scope.tuits);
    	});
	};
    var promise = $interval(refreshData, 10000);
  });

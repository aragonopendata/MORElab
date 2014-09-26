'use strict';

//Texto, timestamp, id, lat, long, autor, foto (maybe)
angular.module('jacathonApp')
  .controller('TuitsCtrl', function ($scope,$http,$interval,$sce) {
  	$scope.tuits=[];
  	var myUrl="https://twitter.com/AritzBi/status/515522092704727041"
  	$scope.myOtherUrl = encodeURIComponent(myUrl);
  	$scope.myOtherUrl="https://twitframe.com/show?url="+$scope.myOtherUrl;
  	$scope.myOtherUrl=$sce.trustAsResourceUrl($scope.myOtherUrl);
  	console.log($scope.myOtherUrl);
  	var refreshData = function() {
    // Assign to scope within callback to avoid data flickering on screen
  		$http.get('http://localhost:5000/morelab/api/v1.0/stream').success(function(tuits) {
  			$scope.tuits=$scope.tuits.concat(tuits);
    	});
	};
    var promise = $interval(refreshData, 10000);
    var input = {
  url: "https://twitter.com/AritzBi/status/515522092704727041",
  tweet: "pito",
  author_name: "AritzBi",
  author_username: "AritzBi",
  datetime: "1142974214"
}
 var query =  $.param(input);
 console.log(query);
 $scope.testUrl="https://twitframe.com/show?"+query;
 console.log($scope.testUrl);
 $scope.testUrl=$sce.trustAsResourceUrl($scope.testUrl);
  });



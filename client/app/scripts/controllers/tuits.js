'use strict';
//psql -f tweets.bak -U jacathon -W tweets
//Texto, timestamp, id, lat, long, autor, foto (maybe)
angular.module('jacathonApp')
  .controller('TuitsCtrl', function ($scope,$http,$interval,$sce,$q) {
  	$scope.tuits=[];
  	/*var myUrl="https://twitter.com/AritzBi/status/515522092704727041"
  	$scope.myOtherUrl = encodeURIComponent(myUrl);
  	$scope.myOtherUrl="https://twitframe.com/show?url="+$scope.myOtherUrl;
  	$scope.myOtherUrl=$sce.trustAsResourceUrl($scope.myOtherUrl);
  	console.log($scope.myOtherUrl);*/
    
  	var refreshData = function() {
    // Assign to scope within callback to avoid data flickering on screen
      var tuitData;
      var embedTuitURL;
  		$http.get('http://155.210.71.106/morelab/api/v1.0/stream').success(function(tuits) {
        var promiseArr = [];
        angular.forEach( tuits, function(tuit){
          var query={
            id: tuit.id,
            align: "center",
            hide_media: true
          };
          var query =  $.param(query);
                    console.log(query);

          embedTuitURL="https://api.twitter.com/1/statuses/oembed.json?"+query;
          embedTuitURL=$sce.trustAsResourceUrl(embedTuitURL);
          promiseArr.push($http.get(embedTuitURL).success(function(embedTweet) {
            tuit.url=embedTweet.html;
          }));
        });
        $q.all(promiseArr).then(function(){
          //$scope.tuits=$scope.tuits.concat(tuits);
          for(var i=0;i<tuits.length;i++){
            var found=false;
            for(var j=0;j<$scope.tuits.length&&!found;j++){
              if(tuits[i].id === $scope.tuits[j].id){
                found=true;
              }
            }
            if(!found){
              $scope.tuits.push(tuits[i]);
            }
          }
          function loadjscssfile(filename, filetype){
 if (filetype=="js"){ //if filename is a external JavaScript file
  var fileref=document.createElement('script')
  fileref.setAttribute("type","text/javascript")
  fileref.setAttribute("src", filename)
 }
 else if (filetype=="css"){ //if filename is an external CSS file
  var fileref=document.createElement("link")
  fileref.setAttribute("rel", "stylesheet")
  fileref.setAttribute("type", "text/css")
  fileref.setAttribute("href", filename)
 }
 if (typeof fileref!="undefined")
  document.getElementsByTagName("body")[0].appendChild(fileref)
}

loadjscssfile("scripts/widgets.js", "js") //dynamically load and add this .js file
        });
    	});
	};
  refreshData();
    var promise = $interval(refreshData, 5000);
    var input = {
  url: "https://twitter.com/AritzBi/status/515522092704727041",
  tweet: "pito",
  author_name: "AritzBi",
  author_username: "AritzBi",
  datetime: "1142974214"
}
 var query =  $.param(input);
 $scope.testUrl="https://twitframe.com/show?"+query;
 $scope.testUrl=$sce.trustAsResourceUrl($scope.testUrl);

 $scope.$on('$destroy', function(){
    if (angular.isDefined(promise)) {
        $interval.cancel(promise);
        promise = undefined;
    }
});
  });

        /*for(var i=0;i<tuits.length;i++){
          /*var date=new Date(tuits[i].datetime);
          console.log('https://twitter.com/'+tuits[i].user+'/status/'+tuits[i].id);
          var tuitData={
              url: 'https://twitter.com/'+tuits[i].user+'/status/'+tuits[i].id,
              tweet: tuits[i].text,
              author_name: tuits[i].name,
              author_username: tuits[i].user,
              datetime: date.getTime()
          };
          var query =  $.param(tuitData);
          tuitUrl="https://twitframe.com/show?"+query;
          console.log(tuitUrl);
          tuitUrl=$sce.trustAsResourceUrl(tuitUrl);
          tuits[i].url=tuitUrl;*/
          /*var query={
            id: tuits[i].id,
            align: "center",
            hide_media: "true"
          };
          var query =  $.param(query);
          embedTuitURL="https://api.twitter.com/1/statuses/oembed.json?"+query;
          embedTuitURL=$sce.trustAsResourceUrl(embedTuitURL);
          var cont=i;
          $http.get(embedTuitURL).success(function(embedTweet,state,mierda,cont) {
            console.log(cont);
            tuits[cont].url=embedTweet.html;
          });

        }*/

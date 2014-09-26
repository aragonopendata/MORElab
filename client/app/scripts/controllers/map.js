'use strict';

//Texto, timestamp, id, lat, long, autor, foto (maybe)
angular.module('jacathonApp')
  .controller('MapCtrl', function ($scope,$http,$interval,$sce,leafletData) {
      angular.extend($scope, {
      center: {
          lat: 41.6333333,
          lng: -0.8833333,
          zoom: 8
      }
      });
      var mapquestOSM=L.tileLayer("http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",{
        attribution: 'Mapas por <a href="http://arcgisonline.com" target="blank">ArcGIS Online</a>'
      });
      var capaSatelite=L.tileLayer('http://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}.jpg',{
        attribution: 'Mapas por <a href="http://arcgisonline.com" target="blank">ArcGIS Online</a>'
      });
      var baseMaps={
        "MapQuest": mapquestOSM,
        "ArcGIS": capaSatelite
      };
        leafletData.getMap().then(function(map){
    L.control.layers(baseMaps).addTo(map);
  });

      $http.get('http://localhost:5000/morelab/api/v1.0/stream').success(function(tuits) {
                var promiseArr = [];
        angular.forEach( tuits, function(tuit){
          var query={
            id: tuit.id,
            align: "center",
            hide_media: "true"
          };
          var query =  $.param(query);
          embedTuitURL="https://api.twitter.com/1/statuses/oembed.json?"+query;
          embedTuitURL=$sce.trustAsResourceUrl(embedTuitURL);
          promiseArr.push($http.get(embedTuitURL).success(function(embedTweet) {
            tuit.url=embedTweet.html;
          }));
        });
        $q.all(promiseArr).then(function(){
          $scope.tuits=$scope.tuits.concat(tuits);
        });
      });
  });



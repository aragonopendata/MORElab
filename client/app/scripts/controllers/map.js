'use strict';

//Texto, timestamp, id, lat, long, autor, foto (maybe)
angular.module('jacathonApp')
  .controller('MapCtrl', function ($scope,$http,$interval,$sce,leafletData,$q) {
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
      var style={
          fillColor: "green",
          weight: 5,
          opacity: 1,
          color: 'blue',
          fillOpacity: 0.7
      };
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

      $http.get('http://155.210.71.106:5000/morelab/api/v1.0/stream').success(function(tuits) {
        var promiseArr = [];
        angular.forEach( tuits, function(tuit){
          var query={
            id: tuit.id,
            align: "center",
            hide_media: "true"
          };
          var query =  $.param(query);
          var embedTuitURL="https://api.twitter.com/1/statuses/oembed.json?"+query;
          embedTuitURL=$sce.trustAsResourceUrl(embedTuitURL);
          promiseArr.push($http.get(embedTuitURL).success(function(embedTweet) {
            tuit.url=embedTweet.html;
          }));
        });
        $q.all(promiseArr).then(function(){
          //$scope.tuits=$scope.tuits.concat(tuits);
          $scope.geoJson={};
          var geoJson=  { "type": "FeatureCollection",
            "features": [
            ]
          };
          for(var i=0;i<tuits.length;i++){
            var feature=      
            { "type": "Feature",
              "geometry": {"type": "Point", "coordinates": [tuits[i].long, tuits[i].lat]},
              "properties": {"html": tuits[i].url+' <script type="text/javascript" src="http://platform.twitter.com/widgets.js"></script>'}
            };
            if(feature.geometry.coordinates[0] != 'None')
              geoJson.features.push(feature);
          }
          $scope.geoJson=(L.geoJson(geoJson,{
            style: style,
              onEachFeature: function(feature, layer){
                if(feature.properties){
                  layer.bindPopup(feature.properties.html);
                }
              }
          }));
          leafletData.getMap().then(function(map){
            $scope.geoJson.addTo(map);
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


      });
  });



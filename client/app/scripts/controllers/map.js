'use strict';

//Texto, timestamp, id, lat, long, autor, foto (maybe)
angular.module('jacathonApp')
  .controller('MapCtrl', function ($scope,$http,$interval,$sce,leafletData) {
      angular.extend($scope, {
      center: {
          lat: 43.263163,
          lng: -2.935047,
          zoom: 17
      }
      });
  });



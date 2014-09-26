'use strict';

/**
 * @ngdoc overview
 * @name jacathonApp
 * @description
 * # jacathonApp
 *
 * Main module of the application.
 */
angular
  .module('jacathonApp', [
    'ngAnimate',
    'ngCookies',
    'ngResource',
    'ngRoute',
    'ngSanitize',
    'ngTouch',
    'ui.bootstrap',
    'ui.router',
    'leaflet-directive'
  ])
  .config(function ($stateProvider, $urlRouterProvider) {
    $stateProvider
      .state('home', {
        url: '/',
        templateUrl: 'views/main.html',
        controller: 'MainCtrl'
      })
      .state('about',{
        url: '/about',
        templateUrl: 'views/about.html',
        controller: 'AboutCtrl'
      })
      .state('tuits',{
        url: '/tuits',
        templateUrl: 'views/tuits.html',
        controller: 'TuitsCtrl'
      })
      .state('map',{
        url: '/map',
        templateUrl: 'views/map.html',
        controller: 'MapCtrl'
      });
      $urlRouterProvider.otherwise('/');
  });

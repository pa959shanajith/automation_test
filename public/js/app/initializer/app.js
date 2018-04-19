"use strict";
var mySPA = angular.module('singlePageApp', [
    'ui.router',
    'oc.lazyLoad',
    'cfp.loadingBar'
    ])
    .config(
    ['$controllerProvider', '$compileProvider', '$filterProvider', '$provide', '$httpProvider', '$locationProvider',
        function ($controllerProvider, $compileProvider,$filterProvider, $provide, $httpProvider, $locationProvider) {
            // lazy controller, directive and service
            mySPA.controller = $controllerProvider.register;
            mySPA.directive  = $compileProvider.directive;
            mySPA.filter     = $filterProvider.register;
            mySPA.factory    = $provide.factory;
            mySPA.service    = $provide.service;
            mySPA.constant   = $provide.constant;
            mySPA.value      = $provide.value;
            $locationProvider.html5Mode(true).hashPrefix('!');
        }
    ]);

    mySPA.config(['$ocLazyLoadProvider', function ($ocLazyLoadProvider) {
        $ocLazyLoadProvider.config({
            debug: false,
            events: false,
            modules: [
                'js/plugins/loading-bar.js'
            ]
        });
    }]);
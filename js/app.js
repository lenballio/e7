'use strict';

/* App Module */

var eps = angular.module('eps', ['epsItemService', 'epsModerationService', 'epsEntityService', 'epsFileService', 'epsLinkService', 'ui.bootstrap', 'ui.router']).
//	config(['$routeProvider', function($routeProvider) {
//	$routeProvider.
//		when('/search', {templateUrl: 'partials/search-list.html', controller: EPSSearchCtrl}).
//		when('/contribute', {templateUrl: 'partials/contribute.html', controller: EPSContributeCtrl}).
//		when('/config', {templateUrl: 'partials/config.html', controller: EPSConfigCtrl}).
//		when('/task', {templateUrl: 'partials/task-list.html', controller: EPSTaskCtrl}).
//		when('/notification', {templateUrl: 'partials/notification-list.html', controller: EPSNotificationCtrl}).
//		when('/item/:itemId/:version', {templateUrl: 'partials/view-item.html', controller: EPSItemCtrl}).
//		otherwise({redirectTo: '/search'});

//	//Can't use the service because it isn't defined yet
//	if(localStorage.getItem('epsToken') == undefined || localStorage.getItem('epsApiUrl') == undefined) {
//		$routeProvider.otherwise({redirectTo: '/config'});
//	}
//}]).
    run(
      [        '$rootScope', '$state', '$stateParams',
      function ($rootScope,   $state,   $stateParams) {

          // It's very handy to add references to $state and $stateParams to the $rootScope
          // so that you can access them from any scope within your applications.For example,
          // <li ng-class="{ active: $state.includes('contacts.list') }"> will set the <li>
          // to active whenever 'contacts.list' or one of its decendents is active.
          $rootScope.$state = $state;
          $rootScope.$stateParams = $stateParams;
      }]).

      config(
    ['$stateProvider', '$urlRouterProvider',
      function ($stateProvider, $urlRouterProvider) {

          $urlRouterProvider.otherwise('/dashboard');

          if (localStorage.getItem('epsToken') == undefined || localStorage.getItem('epsApiUrl') == undefined) {
              $urlRouterProvider.otherwise('/config');
          }

          $stateProvider
            .state("discover", {
                url: "/discover",
                templateUrl: 'partials/discover.html'
            })
                .state("discover.search", {
                    url: "/search",
                    templateUrl: 'partials/discover.search.html',
                    controller: EPSSearchCtrl
                })

                  .state("discover.search.item", {
                      url: "/item/{itemId}/{version}",
                      //template: ' This is contacts.detail.item overriding the "hint" ui-view',
                      templateUrl: 'partials/item.html',
                      controller: EPSItemCtrl
                  })

          .state("create", {
              url: "/create",
              templateUrl: 'partials/create.html',
              controller: EPSContributeCtrl
          })

          .state("dashboard", {
              url: "/dashboard",
              templateUrl: 'partials/dashboard.html'
          })

          .state("admin", {
              url: "/admin",
              templateUrl: 'partials/config.html',
              controller: EPSConfigCtrl
          })

          .state("config", {
              url: "/config",
              templateUrl: 'partials/config.html',
              controller:EPSConfigCtrl
          })
              //K12 additions
          .state("k12", {
              url: "/k12",
              templateUrl: 'partials/discover.search.html',
              controller: EPSSearchCtrl
          })

          .state("k12.item", {
              url: "/item/{itemId}/{version}",
              templateUrl: 'partials/discover.search.item.html',
              controller: EPSItemCtrl
          })
          .state("item", {
              url: "/item/{itemId}/{version}",
              templateUrl: 'partials/item.html',
              controller: EPSItemCtrl
          })

      }]).


value('$anchorScroll', angular.noop).

directive('upload', function () {

    return function ($scope, element, attributes) {

        element.bind('change', function (event) {
            var files = event.target.files;

            $scope.$apply(function () {
                $scope.newFile = files[0];
            });
        });
    };
}).

filter('xmlToCapitalize', function() {
    return function(input, scope) {
        if (input != null) {
            var str = input.substring(input.lastIndexOf('/') + 1)
            return str.substring(0, 1).toUpperCase() + str.substring(1);
        }
    }
}).

filter('xmlToFieldName', function() {
    return function(input, scope) {
        if (input != null) {
            var str = input.substring(input.lastIndexOf('/') + 1)
            return str.substring(0, 1).toLowerCase() + str.substring(1);
        }
    }
});


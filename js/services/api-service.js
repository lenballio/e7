angular.module('apiService', ['ngResource']).
factory('Vars', function() {

	return {
		getToken: function() {
			return localStorage.getItem('epsToken');
		},
		setToken: function(input) {
			return localStorage.setItem('epsToken', input ? input : undefined);
		},
		getUsers: function() {
			return localStorage.getItem('epsUsers') ? JSON.parse(localStorage.getItem('epsUsers')) : {};
		},
		setUsers: function(input) {
			return localStorage.setItem('epsUsers', input ? JSON.stringify(input) : undefined);
		},
		getUrl: function() {
			return localStorage.getItem('epsApiUrl');
		},
		setUrl: function(input) {
			return localStorage.setItem('epsApiUrl', input ? input : undefined);
		},
        getDigiLifeURL: function() {
            //return 'http://127.0.0.1:10045/e7-api/api.php';
            return 'http://www.digi-life.net.au/e7-api/api.php';
        }
	};
}).
factory('Api', function($http, $dialog, Vars) {

	var loading = 0;

	var opts = {
		backdrop: true,
		keyboard: false,
		backdropClick: false,
		templateUrl: 'partials/loading-dialog.html'
	};
		
	var d = $dialog.dialog(opts);
	
	return {
		request: function(method, url, params, data, config) {
            
			var token =  Vars.getToken();

			if(token) {
				$http.defaults.headers.common['X-Authorization'] = 'access_token=' + Vars.getToken();				
			}

			loading++;

			if(loading == 1) {
				//d.open();
			}

			var request = $http({method: method, url: Vars.getUrl() + '/api' + url, params: params, data: data});

			function closeDialog() {
				loading--;

				if(loading == 0) {
					//d.close();
				}
			}

			if(config && config.error) {
				request.error(function(data, status, headers, configR) {
					closeDialog();
					config.error(data, status, headers, configR);
				});
			}
			else {
				request.error(function(data, code) {

					closeDialog();

					var title = data.error ? code + ': ' + data.error : 'Unknown error';
					var description = data.error_description ? data.error_description : 'Try refreshing the page or checking for server connectivity.';

					var errorOpts = {
						backdrop: true,
						keyboard: true,
						backdropClick: true,
						templateUrl: 'partials/message.html',
						controller: 'MessageBoxController',
						resolve: {
							model: function() {
								return {
									title: title,
									message: description,
									buttons: [{label:'Ok'}]
								};
							}
						}
					};

					//Don't let the loading dialog get re-opened while the error dialog is open
					loading = 100;
					d.close();

					$dialog.dialog(errorOpts).open().then(function() {
						loading = 0;
					});
				});
			}

			return request.then(function(data) {
				closeDialog();

				if(config && config.returnStatus) {
					return data;
				}
				return data.data;
			});
		}
	}
}).
factory('ApiDigiLife', function($http, $dialog, Vars) {

	var loading = 0;

	var opts = {
		backdrop: true,
		keyboard: false,
		backdropClick: false,
		templateUrl: 'partials/loading-dialog.html'
	};
		
	var d = $dialog.dialog(opts);

	return {
		request: function(method, params, data, config) {
            
			//var request = $http({method: method, url: Vars.getDigiLifeURL(), params: params, data: data});
            
            if (params.op == 'save_xml') {
                var url = Vars.getDigiLifeURL();

                var request = $http({
                    method: 'POST',
                    url: url,
                    data: $.param(params),
                    headers: {'Content-Type': 'application/x-www-form-urlencoded'}
                });                
                
                /*
                var request = $http.post(url, $.param(params)).
                success(function(data, status, headers, config) {

                }).
                error(function(data, status, headers, config) {
                    $scope.error = true;
                });
                */                
                
            } else {

                var url = Vars.getDigiLifeURL();
                url = url + '?callback=JSON_CALLBACK';
                
                var q_string = '';
                for(a in params) {
                    q_string += '&' + a + '=' + params[a];
                }
                url = url + q_string; 
            
                var request = $http.jsonp(url).
                success(function(data, status, headers, config) {

                }).
                error(function(data, status, headers, config) {
                    $scope.error = true;
                });                
            
            }   
                
            
			return request.then(function(data) {

				if(config && config.returnStatus) {
					return data;
				}
				return data.data;
			});
		}
	}
    
});
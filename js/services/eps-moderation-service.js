angular.module('epsModerationService', ['ngResource', 'apiService']).
factory('Action', function(Api) {

	return function(uuid, version, action) {
		return Api.request('POST', '/item/' + uuid + '/' + version + '/action/' + action);
	}	
}).
factory('Moderate', function(Api) {

	return function(uuid, version, taskUuid, action, message) {

		return Api.request('POST', '/item/' + uuid + '/' + version + '/task/' + taskUuid + '/' + action, {message: message});
	}	
}).
factory('ModerationStatus', function(Api) {

	return function(uuid, version) {

		return Api.request('GET', '/item/' + uuid + '/' + version + '/moderation', undefined, undefined, {error: function() {}});
	}	
}).
factory('Task', function(Api) {

	return function(query, order, reverse, filter, length, start) {
		
		var parameters = {};

		add(parameters, 'q', query);
		add(parameters, 'order', order);
		add(parameters, 'reverse', reverse);
		add(parameters, 'filter', filter);
		add(parameters, 'start', start);
		add(parameters, 'length', length);

		return Api.request('GET', '/task', parameters);
	}
}).
factory('Notification', function(Api) {

	return function(query, type, length, start) {
		
		var parameters = {};

		add(parameters, 'q', query);
		add(parameters, 'type', type);

		return Api.request('GET', '/notification', parameters);
	}
}).
factory('Workflow', function(Api) {

	return {
		get: function(uuid) {
			return Api.request('GET', '/workflow/' + uuid, undefined, undefined, {error: function() {}});
		}
	}
});

angular.module('epsEntityService', ['ngResource', 'apiService']).
factory('Schema', function(Api) {

	return function(schemaUuid) {

		return Api.request('GET', '/schema/' + schemaUuid).then(function(schema) {
			var definition = schema.definition;
			var wizard = [];

			mapToPathArray(definition, wizard, "");

			schema.wizard = wizard;
			return schema;
		});
	}	
}).
factory('Collection', function(Api) {

	return {
		list: function() {
			return Api.request('GET', '/collection');
		},
		get: function(uuid) {
			return Api.request('GET', '/collection/' + uuid);
		}
	}
});
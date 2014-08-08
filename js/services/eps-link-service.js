//All URL hacks should be restricted to here

angular.module('epsLinkService', ['ngResource', 'apiService']).
factory('Link', function(Api, Vars) {

	return {
		file: function(filename, itemUuid, itemVersion) {
			return(Vars.getUrl() + '/api/item/' + itemUuid + '/' + itemVersion + '/file/' + filename + '?access_token=' + Vars.getToken());
		},
		item: function(uuid, version) {
			return('#/item/' + uuid + '/' + version);
		}
	};
});
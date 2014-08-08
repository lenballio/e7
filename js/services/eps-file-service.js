angular.module('epsFileService', ['ngResource', 'apiService', 'epsItemService']).
factory('File', function(Api) {

	return {
		upload: function(file, area) {
			return Api.request('PUT', '/file/' + area + '/content/' + file.name, undefined, file);
		},
		newArea: function() {
			return Api.request('POST', '/file' );
		},
		copy: function(uuid, version) {
			return Api.request('POST', '/file/copy', {uuid: uuid, version: version}, undefined, {returnStatus: true}).then(function(data) {
				var location = data.headers().location;
				var uuid = location.substring(location.lastIndexOf('/api/file/') + 10, location.lastIndexOf('/dir'));

				data['uuid'] = uuid;
				return data;
			});;
		},
		get: function(fileArea) {
			return Api.request('GET', '/file/' + fileArea + '/dir');
		}
	};
});
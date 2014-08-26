angular.module('epsItemService', ['ngResource', 'apiService', 'epsFileService']).
factory('Item', function(Api, ApiDigiLife) {

	return {
		search: function(query, where, order, reverse, showall, length, start) {
		
			var parameters = {
				q: query,
				where: where,
				order: order,
				reverse: reverse,
				showall: showall,
				info: 'basic',
				start: start,
				length: length
			};

			return Api.request('GET', '/search', parameters);
		},
		get: function(uuid, version, getAll) {

			var url = '/item/' + uuid;
			if(!getAll) {
				url += '/' + version;
			}

			return Api.request('GET', url).then(function(data) {

				for(var index in data) {
					if(data[index].version == version) {
						data[index].fieldMap = xmlToMap(data[index].metadata);
					}				
				}
				return data;
			});
		},
		delete: function(uuid, version, purge) {

			return Api.request('DELETE', '/item/' + uuid + '/' + version, {purge: purge});
		},
		lock: function(uuid, version, ifLocked) {

			function error(data, code) {
				if(code == 409) {
					ifLocked();
				}
			}

			return Api.request('POST',  '/item/' + uuid + '/' + version + '/lock', undefined, undefined, {error:error});
		},
		unlock: function(uuid, version) {
			return Api.request('DELETE', '/item/' + uuid + '/' + version + '/lock');
		},
		history: function(uuid, version) {
			return Api.request('GET', '/item/' + uuid + '/' + version + '/history', undefined, undefined, {error: function() {}});
		},
		contribute: function(data, collectionUuid, draft, fileArea, files, uuid, version, edit, lock) {

			var itemData = {
				'collection':{
					'uuid': collectionUuid
				},
				'metadata': data
			};

			if(uuid) {
				itemData['uuid'] = uuid;
				itemData['version'] = version;
			}

			var url = '/item';

			var parameters = {};
			add(parameters, 'draft', draft);
			add(parameters, 'file', fileArea);

			if(files) {

				var attachments = [];

				for(var index in files) {
					attachments[index] = {
						type: 'file',
						filename: files[index].name
					}
				}

				itemData['attachments'] = attachments;
			}

			if(edit) {
				url += '/' + uuid + '/' + version;
				add(parameters, 'lock', lock);
			}

			return Api.request(edit ? 'PUT' : 'POST', url, parameters, itemData, {returnStatus: true}).then(function(data) {
				var location = data.headers().location;
				var itemLoc = location.substring(location.lastIndexOf('/api/item/') + 10, location.length - 1);
				var uuid = itemLoc.substring(0, itemLoc.indexOf('/'));
				var version = itemLoc.substring(itemLoc.indexOf('/') + 1, location.length);

				data['uuid'] = uuid;
				data['version'] = version;

				return data;
			});
		},
        
        saveSharedItem: function(item_id, shared_contents) {
            
            var params = {op: 'add_item_share', item_id: item_id, shared_contents: shared_contents}
            return ApiDigiLife.request('GET', params).then(function(data) {
                console.log("It is in jsonp response");  
                console.log(data)
            });
            
        }
        
	}
});
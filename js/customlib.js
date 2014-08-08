// General utility type stuff for metadata handling and other small functions,
// there's some pretty dreadful stuff in here.
// I wish I could find a good XML utility library for JS (JQuery wan't really cutting it)

function add(a, name, b)
{
	if(b != undefined && (b || b.length > 0)) {
		a[name] = b;
	}
}

function addAll(a, b)
{
	var prop;

	for(prop in b) {
		add(a, prop, b[prop]);
	}
}

//Generates the metadata string from a path map.
//You'd think there'd be a library for this, but I sure couldn't find it.
//Won't do multi-value
function generateMDString(data)
{
	var mdMap = {};

	for(var path in data) {
		var pathArray = path.split("/");
		var pathPart;
		var mapPointer = mdMap;
		var value = data[path];

		//Build up the object map
		for(var counter = 1; counter < pathArray.length; counter++) {

			var pathPart = pathArray[counter];

			if(counter == pathArray.length - 1) {
				mapPointer[pathPart] = value;
			}
			else if(mapPointer[pathPart] == undefined) {
				mapPointer[pathPart] = {};
			}

			mapPointer = mapPointer[pathPart];
		}
	}

	//Then turn it into strings
	return stringFromMap(mdMap)
}

//Returns xml strings from an object map.
//This won't be quick, or flexible, but it'll get the job done
function stringFromMap(mdMap)
{
	var val;
	var mdString = "";

	for(var part in mdMap) {

		var val = mdMap[part];

		mdString += "<" + part + ">";

		if(typeof val == "string") {
			mdString += val;
		}
		else {
			mdString += stringFromMap(val);
		}

		mdString += "</" + part + ">";		
	}

	return mdString;
}

//Takes the schema definition and turns it into paths
function mapToPathArray(definition, wizard, path)
{
	for(var part in definition) {

		var fullPath = path + '/' + part;

		if(definition[part]['_type'] == 'text') {
			wizard[wizard.length] = fullPath;
		}
		else {
			mapToPathArray(definition[part], wizard, fullPath);
		}
	}
}

//Takes a string of XML and turns it into a JS object, string manipulation at it's worst
//Won't do multi-values at the same path though (Will just take the last)
function xmlToMap(metadata)
{
	var map = {};

	convertXml(metadata, map, "");
	return map;
}

function convertXml(metadata, map, path)
{
	var pathPart = metadata.substring(1, metadata.indexOf('>'));
	var fullPath = path + '/' + pathPart;
	var endTag = '</' + pathPart + '>';
	var contents = metadata.substring(metadata.indexOf('>') + 1, metadata.indexOf(endTag));
	var outside = metadata.substring(metadata.indexOf(endTag) + endTag.length, metadata.length);

	if(metadata.indexOf(endTag) > 0) {
		if(contents.indexOf('<') >= 0) {
			convertXml(contents, map, fullPath)
		}
		else {
			map[fullPath] = contents;
		}
	}

	if(outside.length > 0) {
		convertXml(outside, map, path)		
	}
}

function arrayContains(array, obj)
{
	for(var i = 0; i < array.length; i++) {
		if(array[i] == obj) {
			return true;
		}
	}
	return false;
}

//Takes an EPS result set and loads paging variables (noResults, pages, howmany, start, end) into the scope
function paging($scope, data, perpage) {

	if(data.available == 0) {
		$scope.noResults = true;
	}
	else {
		$scope.pages = [];
		var howmany = Math.ceil(data.available/perpage);
		var start = $scope.currentPage - 5;
		var end = $scope.currentPage + 5;
		end = start < 1 ? end - start : end;
		start = start < 1 ? 1 : start;
		end = end > howmany ? howmany : end;

		$scope.start = start;
		$scope.end = end;
		$scope.howmany = howmany;

		for(var i = 0; i <= end - start; i ++) {
			$scope.pages[i] = i + start;
		}
	}
}

//Loads items into $scope.results[i].item, for populating the skeleton items in notifications/tasks
function getItemDetails($scope, Item, index) {

	Item.get($scope.results[index].item.uuid, $scope.results[index].item.version).then(function(data) {
		
		$scope.results[index].item = data;
	});
}

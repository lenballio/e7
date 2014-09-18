'use strict';

/* Controllers */

function EPSSearchCtrl($scope, $rootScope, Item, Collection) {

    $scope.search = function (page) {
        
        var perpage = 10;
        $scope.results = undefined;
        $scope.noResults = false;
        $scope.currentPage = page == undefined ? 1 : page;

        Item.search($scope.query, $scope.where, $scope.orderProp, $scope.reverse, $scope.showall, perpage, ($scope.currentPage - 1) * perpage).then(function (data) {

            $scope.results = data.results;   

            paging($scope, data, perpage);
        });
        
        
    };
    
    $scope.getDiscoverImageName = function(name) {
        var img = 'images/discover/img2.png';
        name = angular.lowercase(name);
        
        
        console.log('image name = ');
        console.log(name);
        
        switch (name) {
            case 'welcome to pearson':
                img = 'images/discover/img1.png';
            break;
            case 'earth\'s surface_lv1':
            case 'earth\'s surface':
                img = 'images/discover/earth-surface.jpg';
            break;
            case 'earth\'s interior_lv1':
            case 'earth\'s interior':
                img = 'images/discover/earch-interior.jpg';
            break;
            case 'hello world':
                img = 'images/discover/helloworld.jpg';
            break;
        }
        return img;
    }

    $scope.search();

}

function EPSContributeCtrl($scope, $location, $rootScope, $dialog, Item, Schema, Collection, File) {
		setTimeout( function(){ 
    // Do something after 1 second 
	//$('.progress-bar').css({
      //                  width: '25%'
        //            });
			FormWizard.init();		
					
					
					
					
					
  }
 , 500);

		

    $scope.files = [];
    $scope.data = {};

    $scope.loadWizard = function () {
        $scope.wizard = {};
        
        var wizard_fields = {};
        wizard_fields.main_details = {};
        wizard_fields.extra_info = {};
        wizard_fields.copyright_info = {};
        
        Schema($scope.collection.schema.uuid).then(function (def) {
            $scope.wizard = def.wizard;
            
            var wz = def.wizard; 
            
            //wizard_fields.copyright_info[ '/xml/item/draft' ] = '/xml/item/draft';
            for(var a in wz) {
                if (wz[a] == '/xml/item/name' || wz[a] == '/xml/item/description' || wz[a] == '/xml/item/subject') {
                    wizard_fields.main_details[ a ] = wz[a];   
                } else if (wz[a] == '/xml/item/country' || wz[a] == '/xml/item/level' || wz[a] == '/xml/item/file/@path') {
                    wizard_fields.extra_info[ a ] = wz[a];
                } else if (wz[a] == '/xml/item/file/author' ) {
                    wizard_fields.copyright_info[ a ] = wz[a];
                }      
            }
             
            $scope.wizard_fields = wizard_fields;
            
        });
    }

    //$scope.collection = Collection.get('0dc4d152-5454-449b-a745-96b1af5580ab');
    //$scope.loadWizard();
    
    $scope.contribute = function () {

        $scope.success = false;
        var edit = $scope.uuid && !$scope.newVersion;
        var data = $scope.rawview ? $scope.item.metadata : generateMDString($scope.data);

        Item.contribute(data, $scope.collection.uuid, $scope.draft, $scope.fileArea, $scope.files, $scope.uuid, $scope.version, edit, $scope.lock).then(function (data) {

            var redirect = "/discover/search/item/" + data.uuid + "/" + data.version;
            $location.path(redirect);
        });
    };

    Collection.list().then(function (collections) {

        $scope.collections = collections.results;
        $scope.collection = $scope.collections[0];
        $scope.loadWizard();


        if ($rootScope.item != undefined) {

            var item = $rootScope.item;
            $scope.uuid = item.uuid;
            $scope.newVersion = $rootScope.version != undefined;
            $scope.version = $scope.newVersion ? $rootScope.version : item.version;
            $scope.data = xmlToMap(item.metadata);
            $scope.item = item;
            $scope.lock = $rootScope.lock;
            $scope.fileArea = $rootScope.fileArea;

            $rootScope.item = undefined;
            $rootScope.version = undefined;
            $rootScope.lock = undefined;
            $rootScope.fileArea = undefined;

            for (var index in $scope.collections) {
                if ($scope.collections[index].uuid == item.collection.uuid) {
                    $scope.collection = $scope.collections[index];
                    break;
                }
            }

            readFileArea();
            $scope.loadWizard();
        }
    });

    $scope.$watch('newFile', function (newValue, oldValue) {
        if (newValue != oldValue) {

            if ($scope.fileArea == undefined) {
                File.newArea().then(function (fileArea) {
                    $scope.fileArea = fileArea.uuid;
                    upload();
                });
            }
            else {
                upload();
            }
        }
    }, true);

    function upload() {
        File.upload($scope.newFile, $scope.fileArea).then(function (data) {
            $scope.files.push($scope.newFile);
        });
    }

    function readFileArea() {
        File.get($scope.fileArea).then(function (data) {

            for (var i in data.files) {
                var file = data.files[i];
                $scope.files.push({ name: file.filename });
            }
        });
    }
    
    $scope.country = [
        {code: 'AF', name: 'Afghanistan'},
        {code: 'AL', name: 'Albania'},
    ];
    
}


function EPSTaskCtrl($scope, Task, Item) {

    $scope.apply = function () {
        $scope.$apply();
    }
    $scope.search = function (page) {

        $scope.results = undefined;
        $scope.noResults = false;
        $scope.currentPage = page == undefined ? 1 : page;
        var perpage = 10;

        Task($scope.query, $scope.order, $scope.reverse, $scope.filter, perpage, ($scope.currentPage - 1) * perpage).then(function (data) {

            $scope.results = data.results;

            for (var index = 0; index < $scope.results.length; index++) {
                getItemDetails($scope, Item, index);
            }

            paging($scope, data, perpage);
        });
    };

    $scope.search();
}

function EPSNotificationCtrl($scope, Notification, Item) {

    $scope.editUsername = "a";
    $scope.editToken = "b";

    $scope.search = function (page) {

        $scope.results = undefined;
        $scope.noResults = false;
        $scope.currentPage = page == undefined ? 1 : page;
        var perpage = 10;

        Notification($scope.query, $scope.type, perpage, ($scope.currentPage - 1) * perpage).then(function (data) {

            $scope.results = data.results;

            for (var index = 0; index < $scope.results.length; index++) {
                getItemDetails($scope, Item, index);
            }

            paging($scope, data, perpage);
        });
    };

    $scope.search();
}

function MessageBoxController($scope, dialog, model) {
    $scope.title = model.title;
    $scope.message = model.message;
    $scope.buttons = model.buttons;
    $scope.close = function () {
        dialog.close();
    }
}

function EPSConfigCtrl($scope, $location, $rootScope, $dialog, Vars) {

    var opts = {
        backdrop: true,
        keyboard: true,
        backdropClick: true,
        templateUrl: 'partials/add-user.html',
        controller: 'AddUserDialogCtrl'
    };

    $scope.userDialog = $dialog.dialog(opts);

    $scope.getVars = function () {
        $scope.url = Vars.getUrl();
        $scope.users = Vars.getUsers();
    }

    $scope.done = function () {
        Vars.setUrl($scope.url);
        Vars.setToken($scope.users[$scope.user]);
        $location.path('/dashboard');
    }

    $scope.addUser = function () {
        $scope.userDialog.open().then(function (result) {

            if (result.result && result.user) {
                $scope.users[result.user] = result.token;
                Vars.setUsers($scope.users);
                $scope.user = result.user;
            }
        });
    }

    $scope.editUser = function () {
        $rootScope.editUsername = $scope.user;
        $rootScope.editToken = $scope.users[$scope.user];

        $scope.userDialog.open().then(function (result) {

            if (result.result && result.user) {

                if ($scope.editUsername != result.user) {
                    delete $scope.users[$scope.editUsername];
                }

                $scope.users[result.user] = result.token;
                Vars.setUsers($scope.users);
                $scope.user = result.user;
            }

            $rootScope.editUsername = undefined;
            $rootScope.editToken = undefined;
        });
    }

    $scope.deleteUser = function () {
        delete $scope.users[$scope.user];
        Vars.setUsers($scope.users);
    }

    $scope.getVars();

    var token = Vars.getToken();

    for (var user in $scope.users) {
        if ($scope.users[user] == token) {
            $scope.user = user;
        }
    }
}

function AddUserDialogCtrl($scope, $rootScope, Vars, dialog) {
    $scope.addUsername = $rootScope.editUsername;
    $scope.addToken = $rootScope.editToken;

    $scope.close = function (result) {

        dialog.close({ user: $scope.addUsername, token: $scope.addToken, result: result });
    }
}
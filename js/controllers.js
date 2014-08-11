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

function EPSItemCtrl($scope, $stateParams, $location, $rootScope, $dialog, $q, Item, Action, Moderate, ModerationStatus, Workflow, File, Link, Collection) {
    
    $("#item-summary").hide();
    $scope.loadItem = function () {
        $scope.item = undefined;

        Item.get($stateParams.itemId, $stateParams.version, true).then(function (data) {

            $scope.versions = [];
            //The index won't always be the version
            for (var index in data) {

                $scope.versions.push(data[index].version);

                if (data[index].version == $stateParams.version) {
                    $scope.selectedVersion = data[index].version;
                    $scope.item = data[index];
                }
            }

            loadAttachments();

            var modStatus = loadModStatus();
            var workflow = loadWorkflow();
            var history = loadHistory();

            if (!$scope.item) {
                alert('The selected version is not visible or no longer exists.');
            }
            else { $("#item-summary").fadeIn(); }
        });
    }

    $scope.messages = [];
    
    $scope.loadItem();

    $scope.actions = {
        'reactivate': ['archived'],
        'redraft': ['live', 'moderating', 'rejected'],
        'restore': ['deleted'],
        'review': ['live'],
        'archive': ['live'],
        'resume': ['suspended'],
        'suspend': ['draft', 'live', 'moderating', 'rejected', 'archived', 'review'],
        'reset': ['moderating', 'live', 'review'],
        'submit': ['draft']
    };

    $scope.isAllowed = function (action) {
        return $scope.item && arrayContains($scope.actions[action], $scope.item.status);
    }

    $scope.performAction = function (action) {

        var uuid = $scope.item.uuid;
        var version = $scope.item.version;

        Action(uuid, version, action).then(function () {
            $scope.loadItem();
        })
    }

    $scope.moderate = function (action, taskUuid) {
        Moderate($scope.item.uuid, $scope.item.version, taskUuid, action, $scope.messages[taskUuid]).then(function () {
            $scope.loadItem();
        });
    }

    $scope.delete = function () {
        Item.delete($scope.item.uuid, $scope.item.version, false).then(function () {
            $scope.loadItem();
        });
    }

    $scope.purge = function () {
        Item.delete($scope.item.uuid, $scope.item.version, true).then(function () {
            $location.path('/search');
        });
    }

    $scope.goToVersion = function (version) {
        $location.path("/item/" + $scope.item.uuid + "/" + version);
    }

    $scope.edit = function () {

        function ifLocked() {
            var opts = {
                backdrop: true,
                keyboard: true,
                backdropClick: true,
                templateUrl: 'partials/message.html',
                controller: 'MessageBoxController',
                resolve: {
                    model: function () {
                        return {
                            title: 'Item is locked',
                            message: 'Force unlock and proceed with edit?',
                            buttons: [{ label: 'Yes', result: true }, { label: 'No', result: false }]
                        };
                    }
                }
            };

            $dialog.dialog(opts).open().then(function (result) {
                if (result) {
                    Item.unlock($scope.item.uuid, $scope.item.version).then(function () {
                        $scope.edit();
                    });
                }
            });
        }

        Item.lock($scope.item.uuid, $scope.item.version, ifLocked).then(function (data) {
            $rootScope.lock = data.uuid;
            copyFA();
        });
    }

    $scope.newVersion = function () {
        copyFA($scope.versions[$scope.versions.length - 1] + 1)
    }

    // Copy the file area
    function copyFA(version) {
        File.copy($scope.item.uuid, $scope.item.version).then(function (data) {
            $rootScope.fileArea = data.uuid;
            loadForEditing(version);
        });
    }

    //Call with version == undefined to edit $scope.item.version
    //If version is defined it will attempt to create a new version
    function loadForEditing(version) {
        $rootScope.item = $scope.item;
        $rootScope.version = version;

        //$location.path("/contribute");
        $location.path("/create");
    }

    function loadModStatus() {

        return ModerationStatus($scope.item.uuid, $scope.item.version).then(function (data) {
            $scope.moderation = [];
            if (data.nodes != undefined) {
                getIncompleteNodes(data.nodes.children, $scope.moderation);
            }
        });
    }

    function getIncompleteNodes(nodes, array) {
        for (var index in nodes) {

            var node = nodes[index];
            if (node.status == 'incomplete' && node.type == 'task') {
                array.push({
                    'name': node.name,
                    'uuid': node.uuid
                });
            }

            if (node.children != undefined) {
                getIncompleteNodes(node.children, array);
            }
        }
    }

    function loadAttachments() {

        if ($scope.item.attachments) {

            $scope.attachments = [];

            for (var i in $scope.item.attachments) {
                var attachment = $scope.item.attachments[i];

                var name = attachment.filename;
                var link = '';

                switch (attachment.type) {
                    case 'file':
                    case 'htmlpage':
                    case 'package-res':
                        link = Link.file(attachment.filename, $scope.item.uuid, $scope.item.version);
                        break;
                    case 'zip':
                        link = Link.file(attachment.folder, $scope.item.uuid, $scope.item.version);
                        break;
                    case 'linked-resource':
                        link = Link.item(attachment.uuid, attachment.itemVersion);
                        break;
                    case 'url':
                        link = attachment.url;
                        break;
                    case 'googlebook':
                    case 'youtube':
                    case 'flickr':
                        link = attachment.viewUrl;
                        break;
                    case 'itunesu':
                        link = attachment.playUrl;
                        break;

                }

                $scope.attachments.push({ name: name, link: link });
            }
        }
    }

    function loadWorkflow() {
        return Collection.get($scope.item.collection.uuid).then(function (data) {

            if (data.workflow) {

                Workflow.get(data.workflow.uuid).then(function (data) {
                    $scope.workflow = data;
                    constructTasks(data.root, 0);
                });
            }
        });
    }

    function constructTasks(node, level) {

        switch (node.type) {
            case 't':
                node.type = 'Task';
                break;
            case 's':
                node.type = 'Serial';
                break;
            case 'p':
                node.type = 'Parallel';
                break;
            case 'd':
                node.type = 'Decision';
                break;
            default:
                node.type = 'Unknown';
                break;
        }

        node.level = level;

        for (var i in node.nodes) {
            constructTasks(node.nodes[i], level + 1);
        }
    }

    function loadHistory() {
        return Item.history($scope.item.uuid, $scope.item.version).then(function (data) {
            $scope.history = data;
        });
    }
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
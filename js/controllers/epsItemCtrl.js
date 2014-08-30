function EPSItemCtrl($scope, $stateParams, $location, $rootScope, $dialog, $q, $timeout, Item, Action, Moderate, ModerationStatus, Workflow, File, Link, Collection, Vars, Search) {
    
    $("#item-summary").hide();
    
        $scope.clearall = function() {
            $scope.attachments = [];    
        }
        
        var filter_earth_val = '';
        var filter_media_val = '';
                               
        var tmp_attachments = [];
        $scope.new_attachments = [];
        $scope.myattachments = [];
        
        $scope.filter_attachments = function() {
            
            //console.log($scope.myattachments);
            tmp_attachments = Search.attachments($scope.myattachments, filter_earth_val, filter_media_val);
            
                $scope.new_attachments = tmp_attachments; 

                if ($scope.new_attachments.length <= 10) {
                    $scope.attachments = $scope.new_attachments;
                    $scope.viewAll = false; 
                } else {
                    $scope.attachments = $scope.new_attachments.slice(0, 10); 
                    $scope.viewAll = true;
                }
                
                if (!$scope.$$phase) { 
                    $scope.$apply();
                }
                                                                        
    }
        
    
        $('#filter_earth').editable({
            prepend: "Earth Type",
            inputclass: 'form-control',
            source: [{
                    value: 'Earth Surface',
                    text: 'Earth Surface'
                }, {
                    value: 'Earth Interior',
                    text: 'Earth Interior'
                }
            ],
            display: function (value, sourceData) {
                var colors = {
                    "": "gray",
                    "Earth Surface": "#1E8FC6",
                    "Earth Interior": "#1E8FC6"
                },

                elem = $.grep(sourceData, function (o) {
                    return o.value == value;
                });

                if (elem.length) {
                    $(this).text(elem[0].text).css("color", colors[value]);
                } else {
                    $(this).empty();
                }
                
                filter_earth_val = value 
                $scope.filter_attachments();
            }
        });
    
    
        $('#filter_media').editable({
            prepend: "Media Type",
            inputclass: 'form-control',
            source: [{
                    value: 'Other',
                    text: 'Other'
                }, {
                    value: 'PDF',
                    text: 'PDF'
                }, {
                    value: 'audio',
                    text: 'Audio'
                }, {
                    value: 'images',
                    text: 'Images'
                }, {
                    value: 'video',
                    text: 'Video'
                }, {
                    value: 'All',
                    text: 'All'
                }
            ],
            display: function (value, sourceData) {
                var colors = {
                    "": "gray",
                    "Earth Surface": "#1E8FC6",
                    "Earth Interior": "#1E8FC6"
                },

                elem = $.grep(sourceData, function (o) {
                    return o.value == value;
                });

                if (elem.length) {
                    $(this).text(elem[0].text).css("color", colors[value]);
                } else {
                    $(this).empty();
                }
                
                filter_media_val = value 
                $scope.filter_attachments();
            }
        });

    
    var me = this;
    var metadata = ''; // Task 3
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
                    //console.log($scope.item);
                    
                    /** Assign metadata so we can use it in popup window to display the XML data **/ 
                     //metadata = $scope.item.metadata                    

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
    
    $scope.xml = function() {
        
        var json_data = angular.toJson($scope.item.metadata)
        json_data = ""+json_data
        json_data = json_data.replace(/(^")/,'', json_data);
        json_data = json_data.replace(/"$/,'', json_data); 


        var win = openNewWindow('xml-win');
        win.blur();
        var body = win.document.body;
        $(body).html("Loading...");
        
        Item.saveXML($stateParams.itemId, json_data).then(function (data) {
            console.log('it is saved');
            var url = Vars.getDigiLifeURL();
            url = url + '?item_id=' + $stateParams.itemId + '&op=show_xml';
            win.focus();
            
            win.location = url; 
        });
        

        //var win = openNewWindow('mywin');
        //win.document.body.innerHTML = json_data
        //var body = win.document.body;
        //$(body).text(json_data).html(); 
        //win.document.write(data);
    }

    $scope.share = function() {
        var me = this;
            var opts = {
                dialogClass: 'modal modal-share',
                backdropClass: 'modal-backdrop modal-backdrop-share',
                backdrop: true,
                keyboard: true,
                backdropClick: true,
                templateUrl: 'partials/dialog-share.html',
                controller: 'MessageBoxController',
                load: function() {
                    $('#e7-content-item1').multiSelect({
                        afterSelect: function() {
                            me.findSelectedOptions();    
                        },
                        afterDeselect: function() {
                            me.findSelectedOptions();
                        }
                    });

                    var obj = $('.modal-share');
                    console.log(obj.length)
                    console.log(obj);

                },
                resolve: {
                    model: function () {
                        return {
                            title: '',
                            message: '',
                            buttons: [{ label: 'Cancel', result: false }, { label: 'Submit', result: true }]
                        };
                    }
                }
            };
            
            $dialog.dialog(opts).open().then(function (result) {
                
                if (result) {
                    //alert('Submit is clicked')
                    var html = '';
                    
                        var content = '';
                        if (me.selectedOption.length > 0) {
                            content = me.selectedOption.join(",");
                        }

                        
                        var win = openNewWindow('share-win');
                        win.blur();
                        var body = win.document.body;
                        $(body).html("Loading...");

                        Item.saveSharedItem($stateParams.itemId, content).then(function (data) {
                            console.log('it is saved');
                            var url = Vars.getDigiLifeURL();
                            url = url + '?item_id=' + $stateParams.itemId + '&op=get_shared_content';
                            win.focus();
                            win.location = url; 
                        });
                         
                } else {
                    //alert('No is clicked')
                }
                
            }); //end of $dialog
            
            this.selectedOption = []
            this.findSelectedOptions = function() {
                me.selectedOption = []
                    
                var obj = $('.modal-share .ms-selection li.ms-selected');
                if (obj.length > 0) {
                    $(obj).each(function(index, item) {
                        me.selectedOption.push( $(item).text() ); 
                    })
                }
                
                
            }
        
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

    /** below funciton will open new window using window.open method **/ 
    
    function openNewWindow(name, url) {
    
    
        var win = window.open ("", name,"directories=no,titlebar=no,toolbar=no,location=no,status=no,menubar=no,scrollbars=yes,resizable=yes,width=650,height=450");                    
        win.document.doctype ='<!DOCTYPE html>';
        
        var meta = win.document.createElement('meta');
        meta.httpEquiv = "X-UA-Compatible";
        meta.content = "IE=edge";
        win.document.getElementsByTagName('head')[0].appendChild(meta);
        

        var meta = win.document.createElement('meta');
        meta.httpEquiv = "content-type";
        meta.content = "text/xml";
        win.document.getElementsByTagName('head')[0].appendChild(meta);
        
        return win;
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
            $scope.total_attachments = $scope.item.attachments.length;
            $scope.viewAll = false;
             
            $scope.myattachments = []; 

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

                //$scope.attachments.push({ name: name, link: link });
                $scope.myattachments.push({ name: name, link: link });
            }
            
            $scope.filter_attachments();
            /*
            if ($scope.total_attachments <= 10) {
                $scope.attachments = $scope.myattachments; 
            } else {
                $scope.attachments = $scope.myattachments.slice(0, 10); 
                $scope.viewAll = true;
            }
            */
        }
    }
    
    $scope.showAllAttachments = function() {
        $scope.attachments = $scope.new_attachments;
        $scope.viewAll = false;    
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

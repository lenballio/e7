angular.module('epsAttachmentService', ['ngResource']).
factory('Search', function() {
    return {
        attachments: function(myattachments, filter_media_val) {
            
            var tmp_attachments = [];
            
            var name = '';
            var name_array = [], name_1, name_2, ext_array = [], ext = '';
            if (myattachments == undefined) {
                return;
            }
            filter_media_val = filter_media_val.toLowerCase();
             

            //console.log('in filter');
            for(var i = 0; i< myattachments.length; i++) {
                name = myattachments[i].name;
                name_array = name.split('/');
                
                if (name_array.length >= 2) {
                
                    name_1 = name_array[0];
                    name_1 = name_1.toLowerCase();
                    name_2 = angular.lowercase(name_array[1]); 
                    ext_array = name_2.split(/\./);
                    
                    ext = '';
                    if (angular.isDefined(ext_array[ ext_array.length - 1 ])) {
                        ext = ext_array[ ext_array.length - 1 ];
                    }
                     
                    //console.log(ext);
                    if (filter_media_val != '') {
                        if (filter_media_val == 'all') {
                            if (name_1 == 'html interactivities') {
                                if (name_array[ name_array.length - 1 ] == 'player.html') {
                                    tmp_attachments.push(myattachments[i]);
                                } 
                            } else {
                                tmp_attachments.push(myattachments[i]);
                            }
                            
                        } else if (filter_media_val == 'html interactivities') {
                            if (angular.isDefined(name_array[ name_array.length - 1 ])) {
                                if (name_array[ name_array.length - 1 ] == 'player.html') {
                                    tmp_attachments.push(myattachments[i]);
                                }
                            }
                        } else if (filter_media_val == 'html') {
                            if (name_1 == "content_manuscript" && ext !== 'doc' && ext !== 'docx' ) {
                                tmp_attachments.push(myattachments[i]);
                            }
                        } else if (filter_media_val == 'pdf/docs') {
                            if (name_1 == "pdf") {
                                tmp_attachments.push(myattachments[i]);
                            } else if (ext == 'doc' || ext == 'docx') {
                                tmp_attachments.push(myattachments[i]);
                            }
                        } else {
                            if (name_1 == filter_media_val) {
                                tmp_attachments.push(myattachments[i]);
                            }
                        }
                    } else {
                        tmp_attachments.push(myattachments[i]);
                    }
                    
                } else { //end of length check
                    tmp_attachments.push(myattachments[i]);
                }
            
            }
            
            return tmp_attachments;    
        }
    }
});

angular.module('epsAttachmentService', ['ngResource']).
factory('Search', function() {
    return {
        attachments: function(myattachments, filter_media_val) {
            
            var tmp_attachments = [];
            
            var name = '';
            var name_array = [], name_1, name_2;
            if (myattachments == undefined) {
                return;
            }
            filter_media_val = filter_media_val.toLowerCase(); 

            for(var i = 0; i< myattachments.length; i++) {
                name = myattachments[i].name;
                name_array = name.split('/');
                
                if (name_array.length >= 2) {
                
                    name_1 = name_array[0];
                    name_1 = name_1.toLowerCase();
                    
                    if (filter_media_val != '') {
                        if (filter_media_val == 'all') {
                            tmp_attachments.push(myattachments[i]);
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

angular.module('epsAttachmentService', ['ngResource']).
factory('Search', function() {
    return {
        attachments: function(myattachments, filter_earth_val, filter_media_val) {
            
            var tmp_attachments = [];
            
            var name = '';
            var name_array = [], name_1, name_2;
            if (myattachments == undefined) {
                return;
            }
            filter_earth_val = filter_earth_val.toLowerCase();
            filter_media_val = filter_media_val.toLowerCase(); 

            for(var i = 0; i< myattachments.length; i++) {
                name = myattachments[i].name;
                name_array = name.split('/');
                
                if (name_array.length >= 3) {
                
                    name_1 = name_array[0];
                    name_1 = name_1.replace("'s", '');
                    name_2 = name_array[1];
                    
                    name_1 = name_1.toLowerCase();
                    name_2 = name_2.toLowerCase();
                    
                    if (filter_earth_val != '' && filter_media_val != '') {
                        
                        var val = '';
                        //console.log('11 >> ' + val);
                        if (name_1.indexOf(filter_earth_val) > -1) {
                            val = myattachments[i];
                        }
                        
                        if (val != '') {
                            if (filter_media_val == 'all') {
                                val = val;
                            } else {
                                if (name_2 == filter_media_val) {
                                    val = myattachments[i];
                                } else {
                                    val = '';
                                }
                            }
                        }
                        if (val !== '') {
                            tmp_attachments.push(val);
                        }
                    } else if (filter_earth_val != '') {
                        if (name_1.indexOf(filter_earth_val) > -1) {
                            tmp_attachments.push(myattachments[i]);
                        }
                    } else if (filter_media_val != '') {
                        if (filter_media_val == 'all') {
                            tmp_attachments.push(myattachments[i]);
                        } else {
                            if (name_2 == filter_media_val) {
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

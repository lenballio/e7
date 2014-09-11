/*
angular.module('eps')           
    .controller('EPSDashboard', ['$scope', function($scope) {
    
}]);
*/

function EPSDashboard($scope, $timeout, $state) {
    

    $('.easy-pie-chart .number.overalleq').easyPieChart({
        animate: 1000,
        size: 75,
        lineWidth: 3,
        barColor: App.getLayoutColorCode('yellow')
    });

    $('.easy-pie-chart .number.at-risk').easyPieChart({
        animate: 1000,
        size: 75,
        lineWidth: 3,
        barColor: App.getLayoutColorCode('green')
    });

    $('.easy-pie-chart .number.most-embedded').easyPieChart({
        animate: 1000,
        size: 75,
        lineWidth: 3,
        barColor: App.getLayoutColorCode('red')
    });

    var recent_activities = $('#recent-activities');

    $timeout(function() {
        $('.scroller').slimScroll({
            scrollTo: recent_activities.height()                
        });    

    },200);


    function showTooltip(title, x, y, contents) {
        $('<div id="tooltip" class="chart-tooltip"><div class="date">' + title + '<\/div><div class="label label-success">CTR: ' + x / 10 + '%<\/div><div class="label label-danger">Imp: ' + x * 12 + '<\/div><\/div>').css({
            position: 'absolute',
            display: 'none',
            top: y - 100,
            width: 80,
            left: x - 40,
            border: '0px solid #ccc',
            padding: '2px 6px',
            'background-color': '#fff',
        }).appendTo("body").fadeIn(200);
    }

        if ($('#site_activities').size() != 0) {
            //site activities
            var previousPoint2 = null;
            $('#site_activities_loading').hide();
            $('#site_activities_content').show();
    
            var activities = [
                [1, 10],
                [2, 9],
                [3, 8],
                [4, 6],
                [5, 5],
                [6, 3],
                [7, 9],
                [8, 10],
                [9, 12],
                [10, 14],
                [11, 15],
                [12, 13],
                [13, 11],
                [14, 10],
                [15, 9],
                [16, 8],
                [17, 12],
                [18, 14],
                [19, 16],
                [20, 19],
                [21, 20],
                [22, 20],
                [23, 19],
                [24, 17],
                [25, 15],
                [25, 14],
                [26, 12],
                [27, 10],
                [28, 8],
                [29, 10],
                [30, 12],
                [31, 10],
                [32, 9],
                [33, 8],
                [34, 6],
                [35, 5],
                [36, 3],
                [37, 9],
                [38, 10],
                [39, 12],
                [40, 14],
                [41, 15],
                [42, 13],
                [43, 11],
                [44, 10],
                [45, 9],
                [46, 8],
                [47, 12],
                [48, 14],
                [49, 16],
                [50, 12],
                [51, 10]
            ];
    
            var plot_activities = $.plot(
                $("#site_activities"), [{
                    data: activities,
                    color: "rgba(107,207,123, 0.9)",
                    shadowSize: 0,
                    bars: {
                        show: true,
                        lineWidth: 0,
                        fill: true,
                        fillColor: {
                            colors: [{
                                    opacity: 1
                                }, {
                                    opacity: 1
                                }
                            ]
                        }
                    }
                }
            ], {
                series: {
                    bars: {
                        show: true,
                        barWidth: 0.9
                    }
                },
                grid: {
                    show: false,
                    hoverable: true,
                    clickable: false,
                    autoHighlight: true,
                    borderWidth: 0
                },
                yaxis: {
                    min: 0,
                    max: 20
                }
            });
    
        }
        
        $("#site_activities").bind("plothover", function (event, pos, item) {
            $("#x").text(pos.x.toFixed(2));
            $("#y").text(pos.y.toFixed(2));
            if (item) {
                if (previousPoint2 != item.dataIndex) {
                    previousPoint2 = item.dataIndex;
                    $("#tooltip").remove();
                    var x = item.datapoint[0].toFixed(2),
                        y = item.datapoint[1].toFixed(2);
                    showTooltip('24 Feb 2013', item.pageX, item.pageY, x);
                }
            }
        });
    
        $('#site_activities').bind("mouseleave", function () {
            $("#tooltip").remove();
        });
            
    $scope.discover = function() {
        $state.transitionTo('discover.search');     
    }    
    
}


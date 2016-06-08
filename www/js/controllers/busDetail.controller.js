angular
    .module('easyBus.controllers')
    .controller('BusDetailController', BusDetailController);


function BusDetailController($scope, $stateParams, $rootScope, $ionicHistory, $http, $ionicScrollDelegate) {
    $scope.bus = angular.fromJson($stateParams.bus);
    $scope.arrivals = [];
    var map, geolocation;
    //加载地图，调用浏览器定位服务
    map = new AMap.Map('mapContainer', {
        resizeEnable: true
    });

    map.plugin('AMap.Geolocation', function () {
        geolocation = new AMap.Geolocation({
            enableHighAccuracy: true,//是否使用高精度定位，默认:true
            timeout: 10000,          //超过10秒后停止定位，默认：无穷大
            buttonOffset: new AMap.Pixel(10, 20),//定位按钮与设置的停靠位置的偏移量，默认：Pixel(10, 20)
            buttonPosition: 'RB'
        });
        map.addControl(geolocation);
        geolocation.getCurrentPosition();
    });


    $scope.backNav = function () {
        $ionicHistory.goBack();
    };

    function searchBuslineArrivals(buslineCode) {
        $http({
            url: 'http://www.szjt.gov.cn/apts/APTSLine.aspx',
            params: {
                'LineGuid': buslineCode
            },
            header: { 'Accept': 'text/html' },
            method: 'GET'
        }).success(function (data, header, config, status) {
            try {
                if (window.DOMParser)  //IE9+,FF,webkit
                {
                    var currentStationIndex = 0;
                    var domParser = new DOMParser();
                    var xmlDoc = domParser.parseFromString(data, 'text/html');
                    var nodelist = xmlDoc.getElementById('MainContent_DATA').getElementsByTagName('TABLE')[0].firstChild.children;
                    for (var i = 1; i < nodelist.length; i++) {
                        var domArrival = {
                            stationCode: nodelist[i].children[1].textContent,
                            carCode: nodelist[i].children[2].textContent,
                            arrivalTime: nodelist[i].children[3].textContent
                        };
                        if (nodelist[i].children[0].children.length > 0) {
                            domArrival.stationName = nodelist[i].children[0].children[0].textContent;
                        } else {
                            domArrival.stationName = '';
                        }
                        if (domArrival.stationName == $rootScope.currentStation.name) {
                            currentStationIndex = i;
                        }
                        $scope.arrivals.push(domArrival);
                    }
                    $scope.arrivalContainer = {
                        'width': $scope.arrivals.length * 30 + 'px'
                    };

                    var screenWidth = window.screen.width;
                    var offset = screenWidth / 60;
                    var index = currentStationIndex - offset - 0.5;
                    $ionicScrollDelegate.scrollTo(30 * (index > 0 ? index : 0), 0, true);
                    // $ionicScrollDelegate.scrollBottom();
                }
            }
            finally {

            }
        }).error(function (data, header, config, status) {
            //处理响应失败
            var b = 1;
        });
    };

    /*公交线路查询*/
    function lineSearch() {
        //实例化公交线路查询类，只取回一条路线
        var linesearch = new AMap.LineSearch({
            pageIndex: 1,
            city: '苏州',
            pageSize: 1,
            extensions: 'all'
        });
        //搜索相关公交线路
        linesearch.search($scope.bus.bus, function (status, result) {
            if (status === 'complete' && result.info === 'OK') {
                lineSearch_Callback(result);
            } else {
                alert(result);
            }
        });
    };
    /*公交路线查询服务返回数据解析概况*/
    function lineSearch_Callback(data) {
        var lineArr = data.lineInfo;
        var lineNum = data.lineInfo.length;
        if (lineNum == 0) {
        } else {
            for (var i = 0; i < lineNum; i++) {
                var pathArr = lineArr[i].path;
                var stops = lineArr[i].via_stops;
                var startPot = stops[0].location;
                var endPot = stops[stops.length - 1].location;
                if (i == 0) drawbusLine(startPot, endPot, pathArr, stops);
            }
        }
    };
    /*绘制路线*/
    var infoWindow = new AMap.InfoWindow({ offset: new AMap.Pixel(0, 0) });
    function drawbusLine(startPot, endPot, BusArr, stops) {
        if (startPot.name != $scope.arrivals[0].stationName) {
            var temp = startPot;
            startPot = endPot;
            endPot = temp;
            stops.reverse();
        }
        //绘制起点，终点
        new AMap.Marker({
            map: map,
            position: [startPot.lng, startPot.lat], //基点位置
            icon: "http://webapi.amap.com/theme/v1.3/markers/n/start.png",
            zIndex: 10
        });
        new AMap.Marker({
            map: map,
            position: [endPot.lng, endPot.lat], //基点位置
            icon: "http://webapi.amap.com/theme/v1.3/markers/n/end.png",
            zIndex: 10
        });
        //绘制乘车的路线
        busPolyline = new AMap.Polyline({
            map: map,
            path: BusArr,
            strokeColor: "#33cd5f",//线颜色
            strokeOpacity: 0.8,//线透明度
            strokeWeight: 4//线宽
        });

        for (var i = 1; i < stops.length - 2; i++) {
            var stop = stops[i];
            var arrivalTime = '';
            var arrival;
            $scope.arrivals.forEach(function (item) {
                if (item.stationName == stop.name) {
                    arrival = item;
                    if (item.arrivalTime.length > 0) {
                        arrivalTime = item.arrivalTime;
                    }
                }
            });
            var markerContent = '';
            if (arrivalTime.length > 0) {
                markerContent += '<div class="positive-bg icon ion-android-bus text-center" style="height:16px;width:16px;border-radius:8px;color:white;font-size:10px;line-height:16px"></div>';
            } else {
                markerContent += '<div class="balanced-bg text-center"';
                markerContent += ' style="height:16px;width:16px;border-radius:8px;color:white;font-size:10px;line-height:16px">' + i + '</div>';
            }
            var marker = new AMap.Marker({ //添加自定义点标记
                map: map,
                position: [stop.location.lng, stop.location.lat], //基点位置
                offset: new AMap.Pixel(-8, -8), //相对于基点的偏移位置
                content: markerContent  //自定义点标记覆盖物内容
            });
            var infoContent = stop.name;
            if (arrivalTime.length > 0) {
                infoContent += '<br/>';
                infoContent += arrivalTime;
            }
            marker.content = '<div class="text-center">' + infoContent + '</div>';
            marker.on('click', function (e) {
                infoWindow.setContent(e.target.content);
                infoWindow.open(map, e.target.getPosition());
            });
            if (arrival) {
                arrival.marker = marker;
            }
        }

        map.setFitView();
    };

    $scope.textClass = function (arrival) {
        if (arrival.arrivalTime.length > 0) {
            return 'balanced';
        }
        else if (arrival.stationName == $rootScope.currentStation.name) {
            return 'energized';
        }
        else {
            return 'stable';
        }
    };


    $scope.refresh = function () {
        searchBuslineArrivals($scope.bus.code);
        lineSearch();
    };
    $scope.onClickArrival = function (arrival) {
        if (arrival.marker) {
            arrival.marker.emit('click', { target: arrival.marker });
            map.setZoomAndCenter(14, [arrival.marker.getPosition().lng, arrival.marker.getPosition().lat]);
        }
    }
    $scope.refresh();
};
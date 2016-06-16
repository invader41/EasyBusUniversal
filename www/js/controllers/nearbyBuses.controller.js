angular
    .module('easyBus.controllers')
    .controller('NearbyBusesController', NearbyBusesController);

function NearbyBusesController($scope, $rootScope, $ionicPopover, $http, $state, CurrentLocation, CordovaService) {
    $scope.searchStationsByName = function (stationName) {
        $http({
            url: 'http://www.szjt.gov.cn/apts/default.aspx',
            data: {
                '__VIEWSTATE': '/wEPDwULLTE5ODM5MjcxNzlkZJjyY5yRvvioUwya4OEEvzuY1eO2+x5v1FdJc7CCQmFT',
                '__VIEWSTATEGENERATOR': '7BCA6D38',
                '__EVENTVALIDATION': '/wEWBQL6h4/dDQLq+uyKCAKkmJj/DwL0+sTIDgLl5vKEDqsVOHq8YTmi6g8ib2Iu2KAp+9fekWJmmAKeMsAka2pX',
                'ctl00$MainContent$StandName': stationName,
                'ctl00$MainContent$SearchCode': '搜索'
            },
            header: { 'Accept': 'text/html' },
            method: 'POST'
        }).success(function (data, header, config, status) {
            try {
                var nodelist = jQuery.parseHTML(data)[6].getElementsByTagName('TABLE')[1].firstChild.children;
                var stations = [];
                for (var i = 1; i < nodelist.length; i++) {
                    var domStation = {
                        station: nodelist[i].children[0].textContent,
                        stationCode: nodelist[i].children[1].textContent,
                        local: nodelist[i].children[2].textContent,
                        street: nodelist[i].children[3].textContent,
                        sections: nodelist[i].children[4].textContent,
                        point: nodelist[i].children[5].textContent
                    }
                    stations.push(domStation);
                }
                $scope.buses = [];
                stations.forEach(function (element) {
                    $scope.searchBusStateByStationCode(element.stationCode);
                }, this);

            }
            finally { }
        }).error(function (data, header, config, status) {
            //处理响应失败
        });
    };


    $scope.searchBusStateByStationCode = function (stationCode) {
        $http({
            url: 'http://www.szjt.gov.cn/apts/default.aspx',
            params: {
                'StandCode': stationCode
            },
            header: { 'Accept': 'text/html' },
            method: 'GET'
        }).success(function (data, header, config, status) {
            try {
                var nodelist = jQuery.parseHTML(data)[6].getElementsByTagName('TABLE')[1].firstChild.children;
                for (var i = 1; i < nodelist.length; i++) {
                    var domBus = {
                        fromTo: nodelist[i].children[1].textContent,
                        carCode: nodelist[i].children[2].textContent,
                        time: nodelist[i].children[3].textContent,
                        distance: nodelist[i].children[4].textContent,
                    };
                    if (nodelist[i].children[0].children.length > 0) {
                        domBus.bus = nodelist[i].children[0].children[0].textContent;
                        domBus.code = nodelist[i].children[0].children[0].getAttribute('href').substr(23, 36);
                    }
                    if (domBus.distance != '进站' && domBus.distance != '无车') {
                        domBus.distance = domBus.distance + '站';
                    }

                    $scope.buses.push(domBus);
                }
                $scope.buses.sort(function (a, b) {
                    return b.bus - a.bus;
                })

            }
            finally {

            }
        }).error(function (data, header, config, status) {
            //处理响应失败
            var b = 1;
        });
    };

    $scope.searchNearestStation = function () {
        $scope.buses = [];
        CurrentLocation.get(function (position) {
            AMap.service('AMap.PlaceSearch', function () {//回调函数
                var placeSearch = new AMap.PlaceSearch();
                placeSearch.setType('公交车站');
                placeSearch.setCity('苏州');
                placeSearch.setPageSize(100);
                var point = [position.lng, position.lat];
                // point = [120.675203, 31.283536];
                placeSearch.searchNearBy('', point, 500, function (status, result) {
                    if (status === 'complete' && result.info === 'OK') {
                        //TODO : 解析返回结果,如果设置了map和panel，api将帮助完成点标注和列表
                        var pois = [];
                        result.poiList.pois.forEach(function (element) {
                            element.name = element.name.replace('(公交站)', '');
                            pois.push(element);
                        }, this);
                        $scope.nearbyStations = pois;
                        $rootScope.currentStation = pois[0];
                        $scope.searchStationsByName($rootScope.currentStation.name);
                    }
                });
            });
        });
    }

    $ionicPopover.fromTemplateUrl('nearbyStations-popover.html', {
        scope: $scope
    }).then(function (popover) {
        $scope.popover = popover;
    })

    $scope.showPop = function ($event) {
        $scope.popover.show($event);
    }

    $scope.selectStation = function (station) {
        $rootScope.currentStation = station;
        $scope.searchStationsByName(station.name);
        $scope.popover.hide();
    };

    $scope.clickBus = function(item) {
        $state.go('tab.nearbyBuses-detail',{bus:angular.toJson(item)});
    };

    var isGroupByColor = false;
    $scope.groupByColor = function() {
        isGroupByColor = !isGroupByColor;
    };
    $scope.busItemStyle = function (bus) {
        if (isGroupByColor) {
            return {
                'background-color': stringToColor(bus.bus)
            }
        } 
    }

    $scope.refreshBuses = function () {
        if ($rootScope.currentStation == null) {
            $scope.searchNearestStation();
        } else {
            $scope.searchStationsByName($rootScope.currentStation.name);
        }
        $scope.$broadcast('scroll.refreshComplete');
    }

    $scope.refreshStations = function () {
        $scope.searchNearestStation();
        $scope.$broadcast('scroll.refreshComplete');
    }

    CordovaService.ready.then(function () {
        $scope.searchNearestStation();
    });
};

　　function stringToColor(str) {
    　　　return ('#' + parseInt(str, 16) * 100).substring(0, 4);
　　}
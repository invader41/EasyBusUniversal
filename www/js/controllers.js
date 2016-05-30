angular.module('starter.controllers', [])
  .controller('NearbyBusesCtrl', function ($scope, $rootScope, $ionicPopover, $http, CurrentLocation, CordovaService) {

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
        if (window.DOMParser)  //IE9+,FF,webkit
        {
          var domParser = new DOMParser();
          var xmlDoc = domParser.parseFromString(data, 'text/html');
          var nodelist = xmlDoc.getElementById('MainContent_DATA').getElementsByTagName('TABLE')[0].firstChild.children;
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
      }).error(function (data, header, config, status) {
        //处理响应失败
      });
    };
    
    
    $scope.searchBusStateByStationCode = function(stationCode) {
      $http({
        url: 'http://www.szjt.gov.cn/apts/default.aspx',
        params: {
          'StandCode':stationCode
        },
        header: { 'Accept': 'text/html' },
        method: 'GET'
      }).success(function (data, header, config, status) {
        if (window.DOMParser)  //IE9+,FF,webkit
        {
          var domParser = new DOMParser();
          var xmlDoc = domParser.parseFromString(data, 'text/html');
          var nodelist = xmlDoc.getElementById('MainContent_DATA').getElementsByTagName('TABLE')[0].firstChild.children;
          for (var i = 1; i < nodelist.length; i++) {
            var domBus = {
              fromTo: nodelist[i].children[1].textContent,
              carCode: nodelist[i].children[2].textContent,
              time: nodelist[i].children[3].textContent,
              distance: nodelist[i].children[4].textContent,
            };
            if(nodelist[i].children[0].children.length > 0) {
              domBus.bus = nodelist[i].children[0].children[0].textContent;
              domBus.code = nodelist[i].children[0].children[0].getAttribute('href').substr(23,36);
            }
            if(domBus.distance != '进站' && domBus.distance != '无车'){
              domBus.distance = domBus.distance + '站';
            }
            
            $scope.buses.push(domBus);
          }
          $scope.buses.sort(function(a, b) {
            return b.bus-a.bus;
          })
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
          point = [120.675203, 31.283536];
          placeSearch.searchNearBy('', point, 500, function (status, result) {
            if (status === 'complete' && result.info === 'OK') {
              //TODO : 解析返回结果,如果设置了map和panel，api将帮助完成点标注和列表
              var pois = [];
              result.poiList.pois.forEach(function (element) {
                element.name = element.name.replace('(公交站)', '');
                pois.push(element);
              }, this);
              $scope.nearbyStations = pois;
              $scope.currentStation = pois[0]
              $scope.searchStationsByName($scope.currentStation.name);
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
      $scope.currentStation = station;
      $scope.searchStationsByName(station.name);
      $scope.popover.hide();
    };
    
    $scope.refreshBuses = function () {
      $scope.searchStationsByName($scope.currentStation.name);
      $scope.$broadcast('scroll.refreshComplete');
    }
    
    $scope.refreshStations = function () {
      $scope.searchNearestStation();
      $scope.$broadcast('scroll.refreshComplete');
    }
    
    CordovaService.ready.then(function () {
      $scope.searchNearestStation();
    });
  })
  
  .controller('BusDetailCtrl', function ($scope, $stateParams, $state, $ionicHistory, $http) {
    var bus = angular.fromJson($stateParams.bus);
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

    $scope.searchBuslineArrivals = function (buslineCode) {
      $http({
        url: 'http://www.szjt.gov.cn/apts/APTSLine.aspx',
        params: {
          'LineGuid': buslineCode
        },
        header: { 'Accept': 'text/html' },
        method: 'GET'
      }).success(function (data, header, config, status) {
        if (window.DOMParser)  //IE9+,FF,webkit
        {
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
            }
            $scope.arrivals.push(domArrival);
          }
          $scope.arrivalContainer = {
            'width': $scope.arrivals.length * 40 + 'px'
          }
        }
      }).error(function (data, header, config, status) {
        //处理响应失败
        var b = 1;
      });
    };
    $scope.searchBuslineArrivals(bus.code);

    /*公交线路查询*/
    function lineSearch() {
      //实例化公交线路查询类，只取回一条路线
      var linesearch = new AMap.LineSearch({
        pageIndex: 1,
        city: '苏州',
        pageSize: 1,
        extensions: 'all'
      });
      //搜索“536”相关公交线路
      linesearch.search(bus.bus, function (status, result) {
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

          if (i == 0) drawbusLine(startPot, endPot, pathArr);
        }
      }
    };
    /*绘制路线*/
    function drawbusLine(startPot, endPot, BusArr) {
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
        strokeColor: "#09f",//线颜色
        strokeOpacity: 0.8,//线透明度
        strokeWeight: 6//线宽
      });
      map.setFitView();
    };
    
    lineSearch();
    
  })
  
  .controller('DashCtrl', function ($scope) { })

  .controller('ChatsCtrl', function ($scope, Chats) {
    // With the new view caching in Ionic, Controllers are only called
    // when they are recreated or on app start, instead of every page change.
    // To listen for when this page is active (for example, to refresh data),
    // listen for the $ionicView.enter event:
    //
    //$scope.$on('$ionicView.enter', function(e) {
    //});

    $scope.chats = Chats.all();
    $scope.remove = function (chat) {
      Chats.remove(chat);
    };
  })

  .controller('ChatDetailCtrl', function ($scope, $stateParams, Chats) {
    $scope.chat = Chats.get($stateParams.chatId);
  })

  .controller('AccountCtrl', function ($scope) {
    $scope.settings = {
      enableFriends: true
    };
  });
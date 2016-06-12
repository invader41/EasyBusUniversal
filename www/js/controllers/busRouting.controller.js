angular
    .module('easyBus.controllers')
    .controller('BusRoutingController', BusRoutingController);

function BusRoutingController($scope, $sce, $rootScope) {
    var auto = new AMap.Autocomplete({
        input: "searchinput",
        city: '苏州'
    });
    //加载地图
    var map = new AMap.Map('mapContainer', {
        resizeEnable: true
    });
    map.setCity('苏州');
    AMap.event.addListener(auto, "select", select);//注册监听，当选中某条记录时会触发
    function select(e) {
        // CurrentLocation.get(function (position) {
        // var start = position.lng + ',' + position.lat;
        // var dest = e.poi.location.lng + ',' + e.poi.location.lat;
        // var url = 'http://m.amap.com/navi/?start=' + start + '&dest=' + dest + '&destName=' + e.poi.name + '&naviBy=bus&key=42972b43dee566eee381cb43eb72ee56';
        // $scope.targetUrl = $sce.trustAsResourceUrl(url);

        var transOptions = {
            map: map,
            city: '苏州市',
            panel: 'panel'
            // policy: AMap.TransferPolicy.LEAST_TIME //乘车策略
        };
        //构造公交换乘类
        var transfer = new AMap.Transfer(transOptions);
        //根据起、终点名称查询公交换乘路线
        transfer.search([{ keyword: $rootScope.currentStation.name }, { keyword: e.poi.name }]);

        // });
    };
    $scope.shouldHideMap = false;
    $scope.panelStyle = {
        'position': 'absolute',
        'max-height': '80%',
        'overflow-y': 'auto',
        'top': '0px',
        'right': '0px',
        'min-width': '250px'
    };
    $scope.hideMap = function () {
        $scope.shouldHideMap = !$scope.shouldHideMap;
        if (!$scope.shouldHideMap) {
            $scope.panelStyle = {
                'position': 'absolute',
                'max-height': '80%',
                'overflow-y': 'auto',
                'top': '0px',
                'right': '0px',
                'min-width': '250px'
            }
        } else {
            $scope.panelStyle = {
                'position': 'absolute',
                'max-height': '100%',
                'overflow-y': 'auto',
                'top': '0px',
                'right': '0px',
                'width': '100%'
            }
        }
    };
};
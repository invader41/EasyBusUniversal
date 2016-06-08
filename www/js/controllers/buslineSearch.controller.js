angular
    .module('easyBus.controllers')
    .controller('BuslineSearchController', BuslineSearchController);

function BuslineSearchController($scope, $http) {
    $scope.buses = [];
    $scope.searchBuslines = function (searchName) {
        $http({
            url: 'http://www.szjt.gov.cn/apts/APTSLine.aspx',
            data: {
                '__VIEWSTATE': '/wEPDwUJNDk3MjU2MjgyD2QWAmYPZBYCAgMPZBYCAgEPZBYCAgYPDxYCHgdWaXNpYmxlaGRkZJjIjf9wec64bUk0awl8Fmu9ZpeMHtOkmveJctfcLWzs',
                '__VIEWSTATEGENERATOR': '964EC381',
                '__EVENTVALIDATION': '/wEWAwLC6/qEDgL88Oh8AqX89aoKYSqjSGRgG6uatob0mRtv8UxGdjgHvVdIogSh29pwM0M=',
                'ctl00$MainContent$LineName': searchName,
                'ctl00$MainContent$SearchLine': '搜索'
            },
            header: { 'Accept': 'text/html' },
            method: 'POST'
        }).success(function (data, header, config, status) {
            $scope.buses = [];
            try {
                if (window.DOMParser)  //IE9+,FF,webkit
                {
                    var domParser = new DOMParser();
                    var xmlDoc = domParser.parseFromString(data, 'text/html');
                    var nodelist = xmlDoc.getElementById('MainContent_DATA').getElementsByTagName('TABLE')[0].firstChild.children;
                    for (var i = 1; i < nodelist.length; i++) {
                        var domBus = {
                            fromTo: nodelist[i].children[1].textContent,
                        };
                        if (nodelist[i].children[0].children.length > 0) {
                            domBus.bus = nodelist[i].children[0].children[0].textContent;
                            domBus.code = nodelist[i].children[0].children[0].getAttribute('href').substr(23, 36);
                        }
                        $scope.buses.push(domBus);
                    }
                }
            } finally { }

        }).error(function (data, header, config, status) {
            //处理响应失败
        });
    };
};
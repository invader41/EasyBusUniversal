angular
    .module('easyBus.controllers')
    .controller('BuslineSearchController', BuslineSearchController);
        
function BuslineSearchController($scope, $http) {
    $scope.buses = [];
    $scope.searchBuslines = function (searchName) {
        $http({
            url: 'http://www.szjt.gov.cn/apts/APTSLine.aspx',
            data: {
                '__VIEWSTATE': '/wEPDwUJNDk3MjU2MjgyD2QWAmYPZBYCAgMPZBYCAgEPZBYCAgYPDxYCHgdWaXNpYmxlaGRkZArYd9NZeb6lYhNOScqHVvOmnKWkIejcJ7J2157Nz6l1',
                '__VIEWSTATEGENERATOR': '964EC381',
                '__EVENTVALIDATION': '/wEWAwL5m9CTDgL88Oh8AqX89aoKFjHWxIvicIW2NoJRKPFu7zDvdWiw74UWlUePz1dAXk4=',
                'ctl00$MainContent$LineName': searchName,
                'ctl00$MainContent$SearchLine': '搜索'
            },
            header: { 'Accept': 'text/html' },
            method: 'POST'
        }).success(function (data, header, config, status) {
            $scope.buses = [];
            try {
                var nodelist = jQuery.parseHTML(data)[6].getElementsByTagName('TABLE')[1].firstChild.children
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
            } finally { }

        }).error(function (data, header, config, status) {
            //处理响应失败
        });
    };
};
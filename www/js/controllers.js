angular.module('starter.controllers', [])

  .controller('NearbyBusesCtrl', function ($scope, CurrentLocation) {
    $scope.searchNearestStation = function () {
      CurrentLocation.get(function (position) {
        AMap.service('AMap.PlaceSearch', function () {//回调函数
          var placeSearch = new AMap.PlaceSearch();
          placeSearch.setType('公交车站');
          placeSearch.setCity('苏州');
          placeSearch.setPageSize(100);
          var point = [position.lng, position.lat];
          point = [120.675203, 31.283536];
          placeSearch.searchNearBy("", point, 500, function (status, result) {
            if (status === 'complete' && result.info === 'OK') {
              //TODO : 解析返回结果,如果设置了map和panel，api将帮助完成点标注和列表
              $scope.pois = result.poiList.pois;
            }
          });
        });
      });
    }
    $scope.searchNearestStation();
  })

.controller('DashCtrl', function($scope) {})

.controller('ChatsCtrl', function($scope, Chats) {
  // With the new view caching in Ionic, Controllers are only called
  // when they are recreated or on app start, instead of every page change.
  // To listen for when this page is active (for example, to refresh data),
  // listen for the $ionicView.enter event:
  //
  //$scope.$on('$ionicView.enter', function(e) {
  //});

  $scope.chats = Chats.all();
  $scope.remove = function(chat) {
    Chats.remove(chat);
  };
})

.controller('ChatDetailCtrl', function($scope, $stateParams, Chats) {
  $scope.chat = Chats.get($stateParams.chatId);
})

.controller('AccountCtrl', function($scope) {
  $scope.settings = {
    enableFriends: true
  };
});


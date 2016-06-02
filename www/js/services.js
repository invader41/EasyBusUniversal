angular.module('starter.services', [])

  .factory('CurrentLocation', function ($cordovaGeolocation) {
    return {
      get: function (callback) {
        var posOptions = { timeout: 10000, enableHighAccuracy: true };
        $cordovaGeolocation
          .getCurrentPosition(posOptions)
          .then(function (position) {
            var lat = position.coords.latitude
            var long = position.coords.longitude
            AMap.convertFrom([long,lat], 'gps', function (status, result) {
              callback(result.locations[0]);
            })
          }, function (err) {
            callback();
          });
      }
    }
  })
  
  .service('CordovaService', ['$document', '$q',
        function ($document, $q) {
            var d = $q.defer(),
                resolved = false;
            var self = this;
            this.ready = d.promise;
            document.addEventListener('deviceready', function () {
                resolved = true;
                d.resolve(window.cordova);
            });
            // 检查一下以确保没有漏掉这个事件（以防万一）
            setTimeout(function () {
                if (!resolved) {
                    if (window.cordova) {
                        d.resolve(window.cordova);
                    }
                }
            }, 3000);
        }
    ]);

(function () {
    'use strict';

    angular
        .module('easyBus.services')
        .factory('CurrentLocation', CurrentLocation);

    function CurrentLocation($cordovaGeolocation) {
        return {
            get: function (callback) {
                var posOptions = { timeout: 10000, enableHighAccuracy: true };
                $cordovaGeolocation
                    .getCurrentPosition(posOptions)
                    .then(function (position) {
                        var lat = position.coords.latitude
                        var long = position.coords.longitude
                        AMap.convertFrom([long, lat], 'gps', function (status, result) {
                            callback(result.locations[0]);
                        })
                    }, function (err) {
                        callback();
                    });
            }
        }
    }
})();
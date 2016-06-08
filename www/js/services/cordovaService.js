(function () {
    'use strict';

    angular
        .module('easyBus.services')
        .factory('CordovaService', ['$document', '$q', CordovaService]);

    function CordovaService($document, $q) {
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
})();
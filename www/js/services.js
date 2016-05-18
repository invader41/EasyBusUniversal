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
    ])

.factory('Chats', function() {
  // Might use a resource here that returns a JSON array

  // Some fake testing data
  var chats = [{
    id: 0,
    name: 'Ben Sparrow',
    lastText: 'You on your way?',
    face: 'img/ben.png'
  }, {
    id: 1,
    name: 'Max Lynx',
    lastText: 'Hey, it\'s me',
    face: 'img/max.png'
  }, {
    id: 2,
    name: 'Adam Bradleyson',
    lastText: 'I should buy a boat',
    face: 'img/adam.jpg'
  }, {
    id: 3,
    name: 'Perry Governor',
    lastText: 'Look at my mukluks!',
    face: 'img/perry.png'
  }, {
    id: 4,
    name: 'Mike Harrington',
    lastText: 'This is wicked good ice cream.',
    face: 'img/mike.png'
  }];

  return {
    all: function() {
      return chats;
    },
    remove: function(chat) {
      chats.splice(chats.indexOf(chat), 1);
    },
    get: function(chatId) {
      for (var i = 0; i < chats.length; i++) {
        if (chats[i].id === parseInt(chatId)) {
          return chats[i];
        }
      }
      return null;
    }
  };
});

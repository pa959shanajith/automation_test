mySPA.factory('socket', ['$rootScope', function($rootScope) {
    //	var socket = io.connect();
    if(window.localStorage['_UI'])
    var userName= Encrypt.encode(JSON.parse(window.localStorage['_UI']).username);
    var param={check:'notify'};
    $rootScope.socket = io('', { forceNew: true, reconnect: true, query: param});
    $rootScope.socket.emit("key",userName);
    return {
        on: function(eventName, callback){
            $rootScope.socket.on(eventName, callback);
        },
        emit: function(eventName, data) {
            $rootScope.socket.emit(eventName, data);
        }
    };
}]);
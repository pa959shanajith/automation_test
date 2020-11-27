mySPA.service('socket', ['$rootScope', function($rootScope) {
    function connect() {
        var userName = Encrypt.encode((window.localStorage._UI)? JSON.parse(window.localStorage._UI).username:GUID());
        $rootScope.socket = io('', { forceNew: true, reconnect: true, query: {check: 'notify', key: userName}});
        $rootScope.socket.emit("key",userName);
    }
    connect();
    return {
        on: function(eventName, callback){
            $rootScope.socket.on(eventName, callback);
        },
        emit: function(eventName, data) {
            $rootScope.socket.emit(eventName, data);
        },
        close: function() {
            $rootScope.socket.disconnect(true);
        },
        reconnect: function() {
            this.close();
            connect();
        }
    };
}]);
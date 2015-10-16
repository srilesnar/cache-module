/**
 * Created by srikuswaminathan on 10/12/15.
 */
var Buffer = require("buffer");
var http = require("http");
var _ = require("underscore");
var sizeOf = require("object-sizeof");
var cacheInstance = (function() {


    var instance;

    function init(expiry, bytesSize, elemSize) {
        var cache = {};
        var duration = expiry;
        var sizeBytes = bytesSize;
        var sizeElements = elemSize;

        function forwardToDestination(key, callback) {
            var options = {
                host: 'localhost',
                port: 9000,
                path: key
            };
            http.get(options, function(response){
                response.on('data', function(data){
                    var strData = data.toString();
                    addToCache(key, strData);
                    callback(data);
                });

                response.on('error', function(error){
                    //log the error
                    callback("Resource not found");
                });

            });
        };

        function validateCacheData(key) {
            //Element is not found in the cache
            if (_.keys(cache).length === 0 || cache[key] === undefined) {
                return false;
            }


            var time = cache[key].time;
            var currTime = new Date().getTime();

            if ((currTime - time) > duration) {

                return false;
            } else {
                //Valid cache entry
                return true;
            }
        };

        function addToCache(key, data) {

            if(sizeOf(data) >= sizeBytes ){
                return;
            }
            //Check for cache size and count
            if(_.keys(cache).length >= sizeElements || sizeOf(cache) >= sizeBytes){
                invalidateCache(key, data);

            }
            cache[key] = {
                data: data,
                time: new Date().getTime()
            };
            printCache();
        };

        function invalidateCache(key, data){

            var oldestCacheObj = {time:99999999999999999};
            var oldestKey = undefined;
            for(var x in cache){
                if(cache[x].time  < oldestCacheObj.time){
                    oldestCacheObj = cache[x];
                    oldestKey = x;
                }
            }
            delete cache[oldestKey];
            var neededBytes = sizeOf(data);
            var availableBytes = sizeBytes - sizeOf(cache);
            addToCache(key, data);
        }

        function printCache(){
            console.log(JSON.stringify(cache));
            console.log("Total cache Size: "+sizeOf(cache));
        }


        return {


            handleRequest: function handleRequest(request, callback) {
                var key = request.url;
                var success = validateCacheData(key);
                //console.log(JSON.stringify(cache));
                if (success) {
                    callback(cache[key].data);
                } else {
                    forwardToDestination(key, callback);
                }
            }
        };

    };

    return {
        getInstance: function (expiry, bytesSize, elemSize) {
            if (!instance) {
                instance = init(expiry, bytesSize, elemSize);
            }
            return instance;
        }
    };
})();

exports.cacheIns = cacheInstance;

/**
 * Created by srikuswaminathan on 10/12/15.
 */
var Buffer = require("buffer");
var http = require("http");
var cacheInstance = (function() {


    var instance;

    function init() {
        var cache = {};
        var duration;
        var sizeBytes;
        var sizeElements;
        var dest;

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
            if (cache.length === 0 || cache[key] === undefined) {
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
            //Check for cache size and count
            if(cache.length >= sizeElements || getCacheSizeInBytes() >= sizeBytes){
                cache.splice(0, 1);
                addToCache(key, data);
            } else {
                cache[key] = {
                    data: data,
                    time: new Date().getTime()
                };
            }
        };

        function getCacheSizeInBytes(){
            var size = 0;
            for(var  i=0; i< cache.length; i++){
                size += Buffer.byteLength( cache[i].data,'utf8');
            }
            return size;

        };

        function printCache(){
            console.log(JSON.stringify(cache));
        }


        return {
            initCache: function initCache(expiry, bytesSize, elemSize, destination) {
                duration = expiry;
                sizeBytes = bytesSize;
                sizeElements = elemSize;
                dest = destination;
            },


            handleRequest: function handleRequest(request, callback) {
                var key = request.url;
                var success = validateCacheData(key);
                console.log(JSON.stringify(cache));
                if (success) {
                    callback(cache[key].data);
                } else {
                    forwardToDestination(key, callback);
                }
            }
        };

    };

    return {
        getInstance: function () {
            if (!instance) {
                instance = init();
            }
            return instance;
        }
    };
})();

exports.cacheIns = cacheInstance.getInstance();

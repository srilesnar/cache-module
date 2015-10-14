/**
 * Created by srikuswaminathan on 10/12/15.
 */
var Buffer = require("buffer");
var cacheInstance = (function() {


    var instance;

    function init() {
        var cache = {};
        var duration;
        var sizeBytes;
        var sizeElements;
        var dest;

        function forwardToDestination(key) {
            //TODO forward to a local server to return data
            return "Testing";
        };

        function validateCacheData(key) {
            //Element is not found in the cache
            if (cache.length ===0 || cache[key] === undefined) {
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


            handleRequest: function handleRequest(request) {
                var key = request.url;
                var success = validateCacheData(key);
                console.log(JSON.stringify(cache));
                if (success) {
                    return cache[key].data + "--From cache";
                } else {
                    var data = forwardToDestination(key);
                    addToCache(key, data);
                    return data;
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

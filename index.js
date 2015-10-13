/**
 * Created by srikuswaminathan on 10/12/15.
 */


var cache= [];
var duration;
var sizeBytes;
var sizeElements;
var dest;

function initCache(expiry, bytesSize, elemSize, destination){
    duration = expiry;
    sizeBytes = bytesSize;
    sizeElements = elemSize;
    dest = destination;
}

function addToCache(key, data){
        cache[key] = {
            data: data,
            time: new Date
        };
}

function handleRequest(key){
    var success = validateCacheData(key);
    if(success){
        return cache[key].data;
    } else {
        var data = forwardToDestination(key);
        cache[key] = {
            data: data,
            time: new Date
        };
        return data;
    }
}

function forwardToDestination(key){
    //TODO forward to a local server to return data
}

function validateCacheData(key){

    //Element is not found in the cache
    if(cache[key] === undefined){
        return false;
    }

    var time = cache[key].time;
    var currTime = new Date();

    if((currTime - time) > duration){
        var index = cache.indexOf(key);
        //Remove the element from cache and return false
        cache.splice(index, 1);
        return false;
    } else {
        //Valid cache entry
        return true;
    }
}


exports.initCache = initCache;
exports.addToCache = addToCache;
exports.handleRequest = handleRequest;
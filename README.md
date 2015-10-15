# Cache-module

This is the cache module for the proxy layer. This module maintains a simple collection of objects to store the request end points and the resultant data from the destination server. This is a scaled version instead of using a DB for caching.

The logic used for caching is very simple and straightforward. The request path serves as a key towards the resource data and current time in ms. The caching algorithm is as follows:

1. Request from proxy to cache
2. Is request already cached? 
    2.1 If yes, Is the time difference between the current time and cached time greater than the allowed expiration time in configuration? (ie if the data has expired as per config)
          2.1.1 If yes, forward the request to destination and check if the cache left with storage? (Is the current cache                     elements size or the cache byte size has exceeded the configured values?). Do this check recursively and then add                data to cache when available.
          2.1.2 If no, return data.
    2.2 If no, forward the request to destination and check if the cache left with storage? (Is the current cache                       elements size or the cache byte size has exceeded the configured values?). Do this check recursively and then add                data to cache when available.

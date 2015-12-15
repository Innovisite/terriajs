'use strict';

/*global require*/
var corsProxy = require('../Core/corsProxy');

var defaultValue = require('terriajs-cesium/Source/Core/defaultValue');
var defined = require('terriajs-cesium/Source/Core/defined');
var defineProperties = require('terriajs-cesium/Source/Core/defineProperties');
var DeveloperError = require('terriajs-cesium/Source/Core/DeveloperError');
var loadJson = require('terriajs-cesium/Source/Core/loadJson');
var loadWithXhr = require('terriajs-cesium/Source/Core/loadWithXhr');

var ModelError = require('./ModelError');

var InoUrlShortener = function(options) {
    if (!defined(options) || !defined(options.terria)) {
        throw new DeveloperError('options.terria is required.');
    }

    this.terria = options.terria;
    this.url = defaultValue(options.url, '/1no/lib/api.php');
};

defineProperties(InoUrlShortener.prototype, {
    isUsable: {
        get: function() {
            var key = this.terria.configParameters.inoUrlShortenerKey;
            return defined(key) && key !== null;
        }
    }
});

InoUrlShortener.prototype.shorten = function(url) {
    if (!this.isUsable) {
        throw new DeveloperError('InoUrlShortener is not usable because Terria.configPrameters.inoUrlShortenerKey is not defined.');
    }

    return loadWithXhr({
        url : this.url + "?key=" + this.terria.configParameters.inoUrlShortenerKey,
        method : "POST",
        data : JSON.stringify({"longUrl": url}), 
        headers : {'Content-Type': 'application/json'},
        responseType : 'json'
    }).then(function(result) {
	return result.id;
    });
};

/**
 * Expands the URL associated with a given token.
 *
 * @param {String} token The token for which to get the expanded URL.
 * @return {Promise|Object} A promise that resolves to the expanded URL.  If the token does not exist, the promise resolves to undefined.
 */
InoUrlShortener.prototype.expand = function(token) {
    if (!this.isUsable) {
        throw new DeveloperError('InoUrlShortener is not usable because Terria.configPrameters.inoUrlShortenerKey is not defined.');
    }

    var url = this.url + '?key=' + this.terria.configParameters.inoUrlShortenerKey + '&shortUrl=' + token;

    if (corsProxy.shouldUseProxy(url)) {
        url = corsProxy.getURL(url);
    }

    var that = this;
    return loadJson(url).then(function(json) {
        return json.longUrl;
    }).otherwise(function() {
        that.terria.error.raiseEvent(new ModelError({
            title: 'Shortened start URL was not located',
            message: '\
The shortened share URL used to launch '+that.terria.appName+' was not located. \
This may indicate an error in the link or that the shortening service is unavailable at this time. \
If you believe it is a bug in '+that.terria.appName+', please report it by emailing \
<a href="mailto:'+that.terria.supportEmail+'">'+that.terria.supportEmail+'</a>.'
        }));

        return undefined;
    });
};

module.exports = InoUrlShortener;

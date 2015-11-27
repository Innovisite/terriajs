'use strict';

/*global require*/
var BaseMapViewModel = require('./BaseMapViewModel');
var BingMapsCatalogItem = require('../Models/BingMapsCatalogItem');

var BingMapsStyle = require('terriajs-cesium/Source/Scene/BingMapsStyle');

var createBingBaseMapOptions = function(terria, bingMapsKey) {
    var result = [];

    var bingMapsAerialWithLabels = new BingMapsCatalogItem(terria);
    bingMapsAerialWithLabels.name = 'Carte Bing Satellite détaillée';
    bingMapsAerialWithLabels.mapStyle = BingMapsStyle.AERIAL_WITH_LABELS;
    bingMapsAerialWithLabels.opacity = 1.0;
    bingMapsAerialWithLabels.key = bingMapsKey;
    bingMapsAerialWithLabels.isRequiredForRendering = true;

    result.push(new BaseMapViewModel({
        image: terria.baseUrl + 'images/france-bing-aerial-labels.png',
        catalogItem: bingMapsAerialWithLabels
    }));

    var bingMapsAerial = new BingMapsCatalogItem(terria);
    bingMapsAerial.name = 'Carte Bing Satellite';
    bingMapsAerial.mapStyle = BingMapsStyle.AERIAL;
    bingMapsAerial.opacity = 1.0;
    bingMapsAerial.key = bingMapsKey;
    bingMapsAerial.isRequiredForRendering = true;

    result.push(new BaseMapViewModel({
        image: terria.baseUrl + 'images/france-bing-aerial.png',
        catalogItem: bingMapsAerial
    }));

    var bingMapsRoads = new BingMapsCatalogItem(terria);
    bingMapsRoads.name = 'Carte Bing routière';
    bingMapsRoads.mapStyle = BingMapsStyle.ROAD;
    bingMapsRoads.opacity = 1.0;
    bingMapsRoads.key = bingMapsKey;
    bingMapsRoads.isRequiredForRendering = true;

    result.push(new BaseMapViewModel({
        image: terria.baseUrl + 'images/france-bing-maps-roads.png',
        catalogItem: bingMapsRoads
    }));

    return result;
};

module.exports = createBingBaseMapOptions;

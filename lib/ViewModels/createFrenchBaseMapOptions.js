'use strict';

/*global require*/
//var ArcGisMapServerCatalogItem = require('../Models/ArcGisMapServerCatalogItem');
var BaseMapViewModel = require('./BaseMapViewModel');
var OpenStreetMapCatalogItem = require('../Models/OpenStreetMapCatalogItem');
var MapboxMapCatalogItem = require('../Models/MapboxMapCatalogItem');

var createFrenchBaseMapOptions = function(terria) {
    var result = [];

    var frenchCarto = new OpenStreetMapCatalogItem(terria);
    frenchCarto.url = '//a.tile.openstreetmap.org' ;
    frenchCarto.opacity = 1.0;
    frenchCarto.name = 'OpenStreetMap Cartographie';
    frenchCarto.attribution = '© OpenStreetMap contributors ODbL';
    frenchCarto.isRequiredForRendering = true;
    frenchCarto.allowFeaturePicking = false;

    result.push(new BaseMapViewModel({
        image: terria.baseUrl + 'images/france-carto.png',
        catalogItem: frenchCarto,
    }));

    var mapBox = new MapboxMapCatalogItem(terria);
    mapBox.accessToken = "pk.eyJ1IjoiamVhbnB1bCIsImEiOiItOEtRRGNnIn0.VvYD17vzR_4AFvNbfZq7oA";
    mapBox.mapId = 'mapbox.satellite';
    mapBox.name = 'Mapbox Satellite';
    mapBox.opacity = 1.0;
    mapBox.isRequiredForRendering = true;
    mapBox.allowFeaturePicking = false;
    result.push(new BaseMapViewModel({
	image: terria.baseUrl + 'images/france-mapbox-aerial.png',
	catalogItem: mapBox
    }));

    return result;
};

module.exports = createFrenchBaseMapOptions;

'use strict';

/*global require*/
var ArcGisMapServerCatalogItem = require('../Models/ArcGisMapServerCatalogItem');
var BaseMapViewModel = require('./BaseMapViewModel');
var CompositeCatalogItem = require('../Models/CompositeCatalogItem');
var WebMapServiceCatalogItem = require('../Models/WebMapServiceCatalogItem');

var createFrenchBaseMapOptions = function(terria) {
    var result = [];

    var naturalEarthII = new WebMapServiceCatalogItem(terria);
    naturalEarthII.name = 'Natural Earth II';
    naturalEarthII.url = 'http://geoserver.nationalmap.nicta.com.au/imagery/natural-earth-ii/wms';
    naturalEarthII.layers = 'natural-earth-ii:NE2_HR_LC_SR_W_DR';
    naturalEarthII.parameters = {
        tiled: true,
        transparent: false,
        format: 'image/jpeg'
    };
    naturalEarthII.opacity = 1.0;
    naturalEarthII.isRequiredForRendering = true;

    var frenchTopo = new ArcGisMapServerCatalogItem(terria);
    frenchTopo.url = 'http://www.ga.gov.au/gisimg/rest/services/topography/National_Map_Colour_Basemap/MapServer' ;
    frenchTopo.opacity = 1.0;
    frenchTopo.isRequiredForRendering = true;
    frenchTopo.name = 'Topographie Française';
    frenchTopo.allowFeaturePicking = false;

    var frenchHydroOverlay = new ArcGisMapServerCatalogItem(terria);
    frenchHydroOverlay.name = 'Hydrographie Française';
    frenchHydroOverlay.url = 'http://www.ga.gov.au/gis/rest/services/topography/AusHydro_WM/MapServer';
    frenchHydroOverlay.opacity = 1.0;
    frenchHydroOverlay.isRequiredForRendering = true;
    frenchHydroOverlay.allowFeaturePicking = false;

    var frenchHydro = new CompositeCatalogItem(terria, [naturalEarthII, frenchHydroOverlay]);
    frenchHydro.name = 'Hydrographie Française';

    result.push(new BaseMapViewModel({
        image: terria.baseUrl + 'images/france-topo.png',
        catalogItem: frenchTopo,
    }));

    result.push(new BaseMapViewModel({
        image: terria.baseUrl + 'images/france-hydro.png',
        catalogItem: frenchHydro,
    }));

    return result;
};

module.exports = createFrenchBaseMapOptions;

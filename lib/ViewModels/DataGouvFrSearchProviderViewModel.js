'use strict';

/*global require*/
var inherit = require('../Core/inherit');
var SearchProviderViewModel = require('./SearchProviderViewModel');
var SearchResultViewModel = require('./SearchResultViewModel');

var CesiumMath = require('terriajs-cesium/Source/Core/Math');
var defaultValue = require('terriajs-cesium/Source/Core/defaultValue');
var defined = require('terriajs-cesium/Source/Core/defined');
var Ellipsoid = require('terriajs-cesium/Source/Core/Ellipsoid');
var loadJson = require('terriajs-cesium/Source/Core/loadJson');
var Rectangle = require('terriajs-cesium/Source/Core/Rectangle');

var DataGouvFrSearchProviderViewModel = function(options) {
    SearchProviderViewModel.call(this);

    options = defaultValue(options, defaultValue.EMPTY_OBJECT);

    this.terria = options.terria;
    this._geocodeInProgress = undefined;

    this.name = 'DATA.GOUV.FR';
    this.url = defaultValue(options.url, '//api-adresse.data.gouv.fr/');
    if (this.url.length > 0 && this.url[this.url.length - 1] !== '/') {
        this.url += '/';
    }
    this.flightDurationSeconds = defaultValue(options.flightDurationSeconds, 1.5);
    this.limit = 4;
};

inherit(SearchProviderViewModel, DataGouvFrSearchProviderViewModel);

DataGouvFrSearchProviderViewModel.prototype.search = function(searchText) {
    if (!defined(searchText) || /^\s*$/.test(searchText)) {
        this.isSearching = false;
        this.searchResults.removeAll();
        return;
    }

    this.isSearching = true;
    this.searchResults.removeAll();
    this.searchMessage = undefined;

    this.terria.analytics.logEvent('search', 'datagouvfr', searchText);

    // If there is already a search in progress, cancel it.
    if (defined(this._geocodeInProgress)) {
        this._geocodeInProgress.cancel = true;
        this._geocodeInProgress = undefined;
    }

    var bboxStr;

    if (defined( this.terria.cesium)) {
        var scene =  this.terria.cesium.scene;
        var cameraPosition = scene.camera.positionWC;
        var cameraPositionCartographic = Ellipsoid.WGS84.cartesianToCartographic(cameraPosition);
	bboxStr = '&lat=' + CesiumMath.toDegrees(cameraPositionCartographic.latitude) + '&lon=' + 
	    CesiumMath.toDegrees(cameraPositionCartographic.longitude);
	    
    } else if (defined( this.terria.leaflet)) {
        var center =  this.terria.leaflet.map.getCenter();
	bboxStr = '&lat=' + center.lat + '&lon=' + center.lng; 
    }

    var promise = loadJson(this.url + 'search?q=' + searchText + '&limit=' + this.limit + bboxStr);

    var that = this;
    var geocodeInProgress = this._geocodeInProgress = promise.then(function(result) {
        if (geocodeInProgress.cancel) {
            return;
        }
        that.isSearching = false;

        if (result.features.length === 0) {
            that.searchMessage = 'Désolé, aucun lieu n\'a été trouvé.';
            return;
        }

        var locations = [];

        // Locations in the primary country go on top, locations elsewhere go undernearth and we add
        // the country name to them.
        for (var i = 0; i < result.features.length; ++i) {
            var resource = result.features[i];

            var name = resource.properties.name;
            if (!defined(name)) {
                continue;
            }

	    if(defined(resource.properties.city)) {
		name += ", " + resource.properties.city;
            }

            locations.push(new SearchResultViewModel({
                name: name,
                isImportant: true,
                clickAction: createZoomToFunction(that, resource)
            }));
        }

        that.searchResults.push.apply(that.searchResults, locations);

        if (that.searchResults.length === 0) {
            that.searchMessage = 'Désolé, aucun lieu n\'a été trouvé.';
        }
    }).otherwise(function() {
        if (geocodeInProgress.cancel) {
            return;
        }

        that.isSearching = false;
        that.searchMessage = 'Une erreur est survenue pendant la recherche. Veuillez vérifier votre connexion internet ou réessayer plus tard.';
    });
};

function createZoomToFunction(viewModel, resource) {
    var bbox = resource.geometry.coordinates;
    var south = bbox[1] - 0.01;
    var west = bbox[0] - 0.01;
    var north = bbox[1] + 0.01;
    var east = bbox[0] + 0.01;

    var rectangle = Rectangle.fromDegrees(west, south, east, north);

    return function() {
        var terria = viewModel.terria;
        terria.currentViewer.zoomTo(rectangle, viewModel.flightDurationSeconds);
    };
}

module.exports = DataGouvFrSearchProviderViewModel;

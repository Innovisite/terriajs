'use strict';

var defined = require('terriajs-cesium/Source/Core/defined');
var defineProperties = require('terriajs-cesium/Source/Core/defineProperties');
var CesiumTerrainProvider = require('terriajs-cesium/Source/Core/CesiumTerrainProvider');

var CatalogItem = require('./CatalogItem');
var inherit = require('../Core/inherit');

var Metadata = require('./Metadata');

/*
 * A {@link CatalogItem} that is added to the Cesium map as a terrain layer.
 * 
 * @constructor
 * @extends CatalogItem
 * @abstract
 *
 * @param {Terria} terria The Terria instance
 */
var CesiumTerrainCatalogItem = function(terria) {
    CatalogItem.call(this, terria);

    this._prevTerrainProvider = undefined;
    this._terrainProvider = undefined;    
};

inherit(CatalogItem, CesiumTerrainCatalogItem);

defineProperties(CesiumTerrainCatalogItem.prototype, {

    type: {
	get: function() {
	    return 'cesium-terrain';
	}
    },

    typeName: {
	get: function() {
	    return 'Cesium Terrain';
	}
    },

    metadata : {
        get : function() {
            var result = new Metadata();
            result.isLoading = false;
            result.dataSourceErrorMessage = 'This data source does not have any details available.';
            result.serviceErrorMessage = 'This service does not have any details available.';
            return result;
        }
    },
    
    /**
     * Get the Cesium TerrainProvider
     * @memberOf CesiumTerrainCatalogItem.prototype
     * @type {Object}
     */
    terrainProvider: {
	get: function() {
	    return this._terrainProvider;
	}
    },
});

CesiumTerrainCatalogItem.prototype._enable = function() {
};

CesiumTerrainCatalogItem.prototype._disable = function() {
};

CesiumTerrainCatalogItem.prototype._showInCesium = function() {
    if(defined(this._terrainProvider)) {
	return;
    }

    this._prevTerrainProvider = this.terria.cesium.scene.globe.terrainProvider;
    this._terrainProvider = new CesiumTerrainProvider({url: this.dataUrl});
    this.terria.cesium.scene.globe.terrainProvider = this._terrainProvider;
};

CesiumTerrainCatalogItem.prototype._showInLeaflet = function() {
    this._terrainProvider = undefined;
};

CesiumTerrainCatalogItem.prototype._hideInCesium = function() {
    if(!defined(this._terrainProvider)) {
	return;
    }

    this.terria.cesium.scene.globe.terrainProvider = this._prevTerrainProvider;
    this._terrainProvider = undefined;
};

CesiumTerrainCatalogItem.prototype._hideInLeaflet = function() {
    this._terrainProvider = undefined;
};

module.exports = CesiumTerrainCatalogItem;


'use strict';

/*global require,describe,it,expect,beforeEach*/
var GeoJsonCatalogItem = require('../../lib/Models/GeoJsonCatalogItem');
var TerriaError = require('../../lib/Core/TerriaError');
var Terria = require('../../lib/Models/Terria');

var loadBlob = require('terriajs-cesium/Source/Core/loadBlob');
var loadText = require('terriajs-cesium/Source/Core/loadText');

describe('GeoJsonCatalogItem', function() {
    var terria;
    var geojson;

    beforeEach(function() {
        terria = new Terria({
            baseUrl: './'
        });
        geojson = new GeoJsonCatalogItem(terria);
    });

    describe('loading in EPSG:28356', function() {
        it('works by URL', function(done) {
            geojson.url = 'test/GeoJSON/bike_racks.geojson';
            geojson.load().then(function() {
                expect(geojson.dataSource.entities.values.length).toBeGreaterThan(0);
                done();
            });
        });

        it('have default dataUrl and dataUrlType', function() {
            geojson.updateFromJson({
                url: 'test/GeoJSON/bike_racks.geojson',
            });
            expect(geojson.dataUrl).toBe('test/GeoJSON/bike_racks.geojson');
            expect(geojson.dataUrlType).toBe('direct');
        });

        it('use provided dataUrl', function(done) {
            geojson.url = 'test/GeoJSON/bike_racks.geojson';
            geojson.dataUrl ="test/test.html";
            geojson.dataUrlType ="fake type";
            geojson.load().then(function() {
                expect(geojson.dataSource.entities.values.length).toBeGreaterThan(0);
                expect(geojson.dataUrl).toBe("test/test.html");
                expect(geojson.dataUrlType).toBe("fake type");
                done();
            });
        });

        it('works by string', function(done) {
            loadText('test/GeoJSON/bike_racks.geojson').then(function(s) {
                geojson.data = s;
                geojson.dataSourceUrl = 'anything.geojson';
                geojson.load().then(function() {
                    expect(geojson.dataSource.entities.values.length).toBeGreaterThan(0);
                    done();
                });
            });
        });

        it('works by blob', function(done) {
            loadBlob('test/GeoJSON/bike_racks.geojson').then(function(blob) {
                geojson.data = blob;
                geojson.dataSourceUrl = 'anything.geojson';
                geojson.load().then(function() {
                    expect(geojson.dataSource.entities.values.length).toBeGreaterThan(0);
                    done();
                });
            });
        });
    });

    describe('loading in CRS:84', function() {
        it('works by URL', function(done) {
            geojson.url = 'test/GeoJSON/cemeteries.geojson';
            geojson.load().then(function() {
                expect(geojson.dataSource.entities.values.length).toBeGreaterThan(0);
                done();
            });
        });

        it('works by string', function(done) {
            loadText('test/GeoJSON/cemeteries.geojson').then(function(s) {
                geojson.data = s;
                geojson.dataSourceUrl = 'anything.geojson';
                geojson.load().then(function() {
                    expect(geojson.dataSource.entities.values.length).toBeGreaterThan(0);
                    done();
                });
            });
        });

        it('works by blob', function(done) {
            loadBlob('test/GeoJSON/cemeteries.geojson').then(function(blob) {
                geojson.data = blob;
                geojson.dataSourceUrl = 'anything.geojson';
                geojson.load().then(function() {
                    expect(geojson.dataSource.entities.values.length).toBeGreaterThan(0);
                    done();
                });
            });
        });
    });

    describe('loading without specified CRS (assumes EPSG:4326)', function() {
        it('works by URL', function(done) {
            geojson.url = 'test/GeoJSON/gme.geojson';
            geojson.load().then(function() {
                expect(geojson.dataSource.entities.values.length).toBeGreaterThan(0);
                done();
            });
        });

        it('works by string', function(done) {
            loadText('test/GeoJSON/gme.geojson').then(function(s) {
                geojson.data = s;
                geojson.dataSourceUrl = 'anything.geojson';
                geojson.load().then(function() {
                    expect(geojson.dataSource.entities.values.length).toBeGreaterThan(0);
                    done();
                });
            });
        });

        it('works by blob', function(done) {
            loadBlob('test/GeoJSON/gme.geojson').then(function(blob) {
                geojson.data = blob;
                geojson.dataSourceUrl = 'anything.geojson';
                geojson.load().then(function() {
                    expect(geojson.dataSource.entities.values.length).toBeGreaterThan(0);
                    done();
                });
            });
        });
    });

    describe('loading Esri-style GeoJSON with an "envelope"', function() {
        it('works by URL', function(done) {
            geojson.url = 'test/GeoJSON/EsriEnvelope.geojson';
            geojson.load().then(function() {
                expect(geojson.dataSource.entities.values.length).toBeGreaterThan(0);
                done();
            });
        });

        it('works by string', function(done) {
            loadText('test/GeoJSON/EsriEnvelope.geojson').then(function(s) {
                geojson.data = s;
                geojson.dataSourceUrl = 'anything.geojson';
                geojson.load().then(function() {
                    expect(geojson.dataSource.entities.values.length).toBeGreaterThan(0);
                    done();
                });
            });
        });

        it('works by blob', function(done) {
            loadBlob('test/GeoJSON/EsriEnvelope.geojson').then(function(blob) {
                geojson.data = blob;
                geojson.dataSourceUrl = 'anything.geojson';
                geojson.load().then(function() {
                    expect(geojson.dataSource.entities.values.length).toBeGreaterThan(0);
                    done();
                });
            });
        });
    });

    describe('error handling', function() {
        it('fails gracefully when the data at a URL is not JSON', function(done) {
            geojson.url = 'test/KML/vic_police.kml';
            geojson.load().then(function() {
                done.fail('Load should not succeed.');
            }).otherwise(function(e) {
                expect(e instanceof TerriaError).toBe(true);
                done();
            });
        });

        it('fails gracefully when the provided string is not JSON', function(done) {
            loadText('test/KML/vic_police.kml').then(function(s) {
                geojson.data = s;
                geojson.dataSourceUrl = 'anything.czml';

                geojson.load().then(function() {
                    done.fail('Load should not succeed.');
                }).otherwise(function(e) {
                    expect(e instanceof TerriaError).toBe(true);
                    done();
                });
            });
        });

        it('fails gracefully when the provided blob is not JSON', function(done) {
            loadBlob('test/KML/vic_police.kml').then(function(blob) {
                geojson.data = blob;
                geojson.dataSourceUrl = 'anything.czml';

                geojson.load().then(function() {
                    done.fail('Load should not succeed.');
                }).otherwise(function(e) {
                    expect(e instanceof TerriaError).toBe(true);
                    done();
                });
            });
        });

        it('fails gracefully when the data at a URL is JSON but not GeoJSON', function(done) {
            geojson.url = 'test/CZML/verysimple.czml';
            geojson.load().then(function() {
                done.fail('Load should not succeed.');
            }).otherwise(function(e) {
                expect(e instanceof TerriaError).toBe(true);
                done();
            });
        });

        it('fails gracefully when the provided string is JSON but not GeoJSON', function(done) {
            loadText('test/CZML/verysimple.czml').then(function(s) {
                geojson.data = s;
                geojson.dataSourceUrl = 'anything.czml';

                geojson.load().then(function() {
                    done.fail('Load should not succeed.');
                }).otherwise(function(e) {
                    expect(e instanceof TerriaError).toBe(true);
                    done();
                });
            });
        });

        it('fails gracefully when the provided blob is JSON but not GeoJSON', function(done) {
            loadBlob('test/CZML/verysimple.czml').then(function(blob) {
                geojson.data = blob;
                geojson.dataSourceUrl = 'anything.czml';

                geojson.load().then(function() {
                    done.fail('Load should not succeed.');
                }).otherwise(function(e) {
                    expect(e instanceof TerriaError).toBe(true);
                    done();
                });
            });
        });
    });

    describe('TopoJSON', function() {
        it('computes extent of TopoJSON before rendering', function(done) {
            geojson.url = 'test/GeoJSON/polygon.topojson';
            geojson.load().then(function() {
                expect(geojson.rectangle.width).not.toBeCloseTo(0, 1);
                done();
            });
        });
    });

    describe('Adding and removing attribution', function() {
        var currentViewer;
        beforeEach(function(){
            currentViewer = geojson.terria.currentViewer;
            geojson.url = 'test/GeoJSON/polygon.topojson';
        });

        it('can add attribution', function(done) {
            geojson.isEnabled = true;
            spyOn(currentViewer, 'addAttribution');
            geojson.load().then(function() {
                expect(currentViewer.addAttribution).toHaveBeenCalled();
                done();
            });
        });

        it('can add attribution', function(done) {
            geojson.isEnabled = true;
            spyOn(currentViewer, 'removeAttribution');
            geojson.load().then(function() {
                geojson.isEnabled = false;
                expect(currentViewer.removeAttribution).toHaveBeenCalled();
                done();
            });
        });
    });
});

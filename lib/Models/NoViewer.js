'use strict';

/*global require*/
var Rectangle = require('terriajs-cesium/Source/Core/Rectangle');
var when = require('terriajs-cesium/Source/ThirdParty/when');

/**
 * The base class for map/globe viewers.
 *
 * @constructor
 * @alias GlobeOrMap
 *
 * @see Cesium
 * @see Leaflet
 */
var NoViewer = function() {
};

NoViewer.prototype.destroy = function() {
};

NoViewer.prototype.isDestroyed = function() {
    return false;
};

/**
 * Gets the current extent of the camera.  This may be approximate if the viewer does not have a strictly rectangular view.
 * @return {Rectangle} The current visible extent.
 */
NoViewer.prototype.getCurrentExtent = function() {
    return Rectangle.MAX_VALUE;
};

/**
 * Zooms to a specified camera view or extent with a smooth flight animation.
 *
 * @param {CameraView|Rectangle} viewOrExtent The view or extent to which to zoom.
 * @param {Number} [flightDurationSeconds=3.0] The length of the flight animation in seconds.
 */
NoViewer.prototype.zoomTo = function(viewOrExtent, flightDurationSeconds) {
};

/**
 * Captures a screenshot of the map.
 * @param {String} [type]  image format default is image/png
 * @param {Number} [ratio] image ratio that is W/H, if this value is not defined
 * then the original canvas image is returned otherwise the image is cropped from the center in
 * order to get the specified ratio.
 * @return {Promise} A promise that resolves to a data URL when the screenshot is ready.
 */
NoViewer.prototype.captureScreenshot = function(type, ratio) {
    return when.reject();
};

/**
 * Notifies the viewer that a repaint is required.
 */
NoViewer.prototype.notifyRepaintRequired = function() {
};

/**
 * Computes the screen position of a given world position.
 * @param  {Cartesian3} position The world position in Earth-centered Fixed coordinates.
 * @param  {Cartesian2} [result] The instance to which to copy the result.
 * @return {Cartesian2} The screen position, or undefined if the position is not on the screen.
 */
NoViewer.prototype.computePositionOnScreen = function(position, result) {
    return undefined;
};

/**
 * Adds an attribution to the globe or map.
 * @param {Credit} attribution The attribution to add.
 */
NoViewer.prototype.addAttribution = function(attribution){
};

/**
 * Removes an attribution from the globe or map.
 * @param {Credit} attribution The attribution to remove.
 */
NoViewer.prototype.removeAttribution = function(attribution){
};

module.exports = NoViewer;

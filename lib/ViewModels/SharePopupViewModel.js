'use strict';

/*global require*/
var URI = require('urijs');

var CesiumMath = require('terriajs-cesium/Source/Core/Math');
var defined = require('terriajs-cesium/Source/Core/defined');
var definedNotNull = require('terriajs-cesium/Source/Core/definedNotNull');
var knockout = require('terriajs-cesium/Source/ThirdParty/knockout');
var loadWithXhr = require('terriajs-cesium/Source/Core/loadWithXhr');
var inherit = require('../Core/inherit');
var ModelError = require('../Models/ModelError');
var formatError = require('terriajs-cesium/Source/Core/formatError');
var PopupViewModel = require('./PopupViewModel');
var PopupMessageViewModel = require('./PopupMessageViewModel');

var SharePopupViewModel = function(options) {
    PopupViewModel.call(this, options);
    this.terria = options.terria;

    this.rapanuiKey = options.rapanuiKey;
    this.enableRapanui = defined(this.rapanuiKey);

    this.formatCapture = "full";

    this._longUrl = undefined;
    this._shortUrl = undefined;

    this.title = "Partager";
    this.url = '';
    this.imageUrl = '';
    this.embedCode = '';
    this.itemsSkippedBecauseTheyHaveLocalData = [];
    this.enableShortenUrl = defined(this.terria.urlShortener) && this.terria.urlShortener.isUsable;

    var shortenLocalProperty = this.terria.getLocalProperty('shortenShareUrls');
    this.shortenUrl = this.enableShortenUrl && (!definedNotNull(shortenLocalProperty) || shortenLocalProperty);

    this.view = require('fs').readFileSync(__dirname + '/../Views/SharePopup.html', 'utf8');

    knockout.track(this, ['imageUrl', 'url', 'embedCode', 'shortenUrl', 
			  'enableShortenUrl', 'formatCapture',
			  'itemsSkippedBecauseTheyHaveLocalData',
			  'enableRapanui']);

    var that = this;

    knockout.getObservable(this, 'shortenUrl').subscribe(function() {
        that.terria.setLocalProperty('shortenShareUrls', that.shortenUrl);
        setShareUrl(that);
    });

    // Build the share URL.
    var cameraExtent =  this.terria.currentViewer.getCurrentExtent();

    var request = {
        version: '0.0.05',
        initSources:  this.terria.initSources.slice()
    };

    var initSources = request.initSources;

    // Add an init source with user-added catalog members.
    var userDataSerializeOptions = {
        userSuppliedOnly: true,
        skipItemsWithLocalData: true,
        itemsSkippedBecauseTheyHaveLocalData: []
    };

    var userAddedCatalog =  this.terria.catalog.serializeToJson(userDataSerializeOptions);
    if (userAddedCatalog.length > 0) {
        initSources.push({
            catalog: userAddedCatalog,
            catalogIsUserSupplied: true
        });
    }

    // Add an init source with the enabled/opened catalog members.
    var enabledAndOpenedCatalog =  this.terria.catalog.serializeToJson({
        enabledItemsOnly: true,
        skipItemsWithLocalData: true,
        serializeForSharing: true,
    });

    if (enabledAndOpenedCatalog.length > 0) {
        initSources.push({
            catalog: enabledAndOpenedCatalog,
            catalogOnlyUpdatesExistingItems: true
        });
    }

    // Add an init source with the camera position.
    var initialCamera = {
        west: CesiumMath.toDegrees(cameraExtent.west),
        south: CesiumMath.toDegrees(cameraExtent.south),
        east: CesiumMath.toDegrees(cameraExtent.east),
        north: CesiumMath.toDegrees(cameraExtent.north),
    };

    if (defined( this.terria.cesium)) {
        var cesiumCamera =  this.terria.cesium.scene.camera;
        initialCamera.position = cesiumCamera.positionWC;
        initialCamera.direction = cesiumCamera.directionWC;
        initialCamera.up = cesiumCamera.upWC;
    }

    var homeCamera = {
        west: CesiumMath.toDegrees( this.terria.homeView.rectangle.west),
        south: CesiumMath.toDegrees( this.terria.homeView.rectangle.south),
        east: CesiumMath.toDegrees( this.terria.homeView.rectangle.east),
        north: CesiumMath.toDegrees( this.terria.homeView.rectangle.north),
        position:  this.terria.homeView.position,
        direction:  this.terria.homeView.direction,
        up:  this.terria.homeView.up
    };

    initSources.push({
        initialCamera: initialCamera,
        homeCamera: homeCamera,
        baseMapName: this.terria.baseMap.name,
        viewerMode: this.terria.leaflet ? '2d' : '3d'
    });

    this.itemsSkippedBecauseTheyHaveLocalData.push.apply(this.itemsSkippedBecauseTheyHaveLocalData, userDataSerializeOptions.itemsSkippedBecauseTheyHaveLocalData);

    var uri = new URI(window.location);

    // Remove the portion of the URL after the hash.
    uri.fragment('');

    var requestString = JSON.stringify(request);

    this._baseUrl = uri.toString() + '#start=' ;
    this._shortBaseUrl = uri.toString() + '#share=';

    this._longUrl = this._baseUrl + encodeURIComponent(requestString);

    setShareUrl(that);

    this.updateCapture();
};

inherit(PopupViewModel, SharePopupViewModel);

function setShareUrl(viewModel) {

    var iframeString = '<iframe style="width: 720px; height: 405px; border: none;" src="_TARGET_" allowFullScreen mozAllowFullScreen webkitAllowFullScreen></iframe>';

    function setUrlAndEmbed(url) {
        viewModel.url = url;
        viewModel.embedCode = iframeString.replace('_TARGET_', viewModel.url);
    }

    if (!viewModel.shortenUrl) {
        setUrlAndEmbed(viewModel._longUrl);
    }
    else if (defined(viewModel._shortUrl)) {
        setUrlAndEmbed(viewModel._shortUrl);
    }
    else {
        viewModel.terria.urlShortener.shorten(viewModel._longUrl).then(function(token) {
            viewModel._shortUrl = viewModel._shortBaseUrl + token;
            setUrlAndEmbed(viewModel._shortUrl);
            viewModel.terria.analytics.logEvent('share', 'url', viewModel._shortUrl);
        }).otherwise(function() {
            viewModel.terria.error.raiseEvent(new ModelError({
                title: 'Impossible de traiter l\'URL',
                message: 'Une erreur est survenue lors de l\'utilisation du service pour compresser l\'URL. Ce service n\'est pas disponible ou bien la connexion internet n\'est pas active.'
            }));
            viewModel.shortenUrl = false;
            setUrlAndEmbed(viewModel._longUrl);
        });
    }
}

SharePopupViewModel.open = function(options) {
    var viewModel = new SharePopupViewModel(options);
    viewModel.show(options.container);
    return viewModel;
};

SharePopupViewModel.prototype.print = function() {
    var data = new FormData();
    data.append('api_key', this.rapanuiKey);
    data.append('base64_image', this.imageUrl);
    data.append('item_code', 'RNA1');
    //data.append('landing_page', 'customise');
    data.append('colour', 'White');

    var server = 'https://rapanuiclothing.com/api-access-point/';
    
    var popup = PopupMessageViewModel.open('ui', { title: "Communication avec le service d\'impression", 
						   message: '<div>Veuillez patienter...</div>\
<p>Le transfert de données vers le service d\'impression peut prendre plusieurs dizaines de secondes cela \
va dépendre de la rapidité de votre connexion internet. Consultez la FAQ pour obtenir des infos supplémentaires.</p>'});

    var that = this;
    loadWithXhr({
	url: server,
	method: 'POST',
	data: data
    }).then( function(res) {
	window.location = res;
    }).otherwise(function(e) {
	popup.message = '\
<p>La communication avec le service d\'impression a échouée, essayez de nouveau ou bien \
envoyer un email à <a href="mailto:'+that.terria.supportEmail+'">'+that.terria.supportEmail+'</a> avec les données techniques affichées ci-dessous. Merci !</p><br/><br/>\
<pre>' + formatError(e) + '</pre>';
    });    
};

SharePopupViewModel.prototype.updateCapture = function() {
    var that = this;
    if(this.formatCapture === "shirt") {
	this.terria.currentViewer.captureScreenshot("image/png", 0.75).then(function(dataUrl) {
            that.imageUrl = dataUrl;
	});
    } else {
	this.terria.currentViewer.captureScreenshot("image/jpeg").then(function(dataUrl) {
            that.imageUrl = dataUrl;
	});
    }
};

module.exports = SharePopupViewModel;

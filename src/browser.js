"use strict";

var vis = require("vis");
require("./shape.js");
var Messages = require("./messages.js");
var jQuery = require("jquery");
var events = require("events");

exports.Browser = Browser;
exports.Messages = Messages;

var CANVAS_PADDING = 80;

function Browser(container, url, callBackAfterInit) {
	this.url = url;
	this.currentViewRect = undefined;

	//message bar
	this.messageBar = jQuery(document.createElement("div"));
	this.messageBar.addClass("messageBar");
	this.messageBar.hide();

	var browser = this;

	var options = this.getExplorerOptions();
	this.network = new vis.Network(container, {
		nodes: [],
		edges: []
	}, options);

	this.network.on("zoom", this.onZoom);
	this.network.off("fit");
	this.network.on("fit", function (args) {
		//called by initPhysics()
		if (args === undefined) {
			//do nothing...
			//prevents auto fit
		}
		else {
			var scale = Math.min(network.canvas.frame.canvas.clientWidth / browser.canvaWidth,
				network.canvas.frame.canvas.clientHeight / browser.canvasHeight);
			browser.onZoom({scale: scale});
		}
	});
}

Browser.prototype.init = function () {
	//init, get global settings
	var browser = this;
	this._ajaxCommand("init", {}, function (json, textStatus) {
		browser.canvaWidth = json.canvaWidth + CANVAS_PADDING;
		browser.canvasHeight = json.canvasHeight + CANVAS_PADDING;
		browser.gridSize = json.gridSize;
		browser.numberOfNodes = json.numberOfNodes;

		browser.emit("init", json);
	});
}

Browser.prototype.__proto__ = events.EventEmitter.prototype;
Browser.prototype.loadAll = function () {
	var browser = this;
	this._ajaxCommand("loadAll", {}, function (json, textStatus) {
		var options = browser.getDefaultOptions();
		console.log(browser);
		browser.network = new vis.Network(browser.network.body.container, {
			nodes: json.data.nodes,
			edges: json.data.edges
		}, options);
	});
}

Browser.prototype.showMessage = function (msgCode) {
	this.messageBar.html(Messages.getMessage(msgCode));
	this.messageBar.show();
}

Browser.prototype.hideMessage = function () {
	this.messageBar.html("");
	this.messageBar.hide();
}

Browser.prototype.onZoom = function (args) {
	this.centerOn(new Point(0, 0), args.scale);
};

Browser.prototype._ajaxCommand = function (command, params, callback) {
	params = params || {};
	params["command"] = command;
	jQuery.getJSON(this.url + "?jsoncallback=?", params, callback);
};

Browser.prototype.getExplorerOptions = function () {
	return {
		autoResize: false,
		nodes: {
			shape: 'dot',
			scaling: {
				min: 10,
				max: 30
			},
			font: {
				size: 12,
				face: 'Tahoma'
			}
		},
		edges: {
			width: 0.15,
			color: {inherit: 'from'},
			smooth: {
				type: 'continuous'
			}
		},

		physics: false,

		interaction: {
			tooltipDelay: 200,
			hideEdgesOnDrag: true,
			navigationButtons: true,
		}
	};
};

Browser.prototype.getDefaultOptions = function () {
	return {
		nodes: {
			shape: 'circularImage',
			scaling: {
				min: 10,
				max: 30
			},
			font: {
				size: 14,
				strokeWidth: 7
			}
		},
		edges: {
			width: 0.15,
			color: {
				highlight: '#ff0000',
				hover: '#848484',
			},
			selectionWidth: 0.3,
			arrows: {
				to: {enabled: true}
			},
			smooth: {
				type: 'continuous'
			}
		},

		physics: {
			stabilization: false,
			solver: 'forceAtlas2Based',
			barnesHut: {
				gravitationalConstant: -80000,
				springConstant: 0.001,
				springLength: 200
			},
			forceAtlas2Based: {
				gravitationalConstant: -26,
				centralGravity: 0.005,
				springLength: 230,
				springConstant: 0.18
			},
		},

		interaction: {
			tooltipDelay: 200,
			hideEdgesOnDrag: true,
			navigationButtons: true,
		}
	};
};

Browser.prototype.centerOn = function (x, y, scale) {
	var center = new Point(x, y);
	var rect = center.expand(network.canvas.frame.canvas.clientWidth / scale,
		this.network.canvas.frame.canvas.clientHeight / scale);

	this._updateNetworkWithView(rect);
	console.log(network);

	if (scale != this.network.getScale) {
		this.network.moveTo({scale: scale});
	}
};

Browser.prototype._updateNetworkWithView = function (rect) {
	var browser = this;
	var callback = function (json, status) {
		//overwrite
		if (json.hasOwnProperty("data")) {
			var ret = json.data;
			this.network.setData({
				nodes: json.data.nodes.valueArray(),
				edges: json.data.edges.valueArray()
			});
		}
		//delta
		else {
			this.network.body.data.nodes.remove(json.dataToDelete.nodes);
			this.network.body.data.edges.remove(json.dataToDelete.edges);
			this.network.body.data.nodes.add(json.dataToAdd.nodes);
			this.network.body.data.edges.add(json.dataToAdd.edges);
		}

		browser.currentViewRect = rect;
	};

	if (browser.currentViewRect === undefined)
		browser._ajaxCommand("updateView", {view: rect}, callback);
	else
		browser._ajaxCommand("updateView", {previousView: browser.currentViewRect, view: rect});
};
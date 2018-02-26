"use strict";

var vis = require("vis");
require("./shape.js");
var events = require("./utils.js");
var Messages = require("./messages.js");
var jQuery = require("jquery");
var events = require("events");

exports.Browser = Browser;
exports.Messages = Messages;

var CANVAS_PADDING = 80;

function Browser(container, url, infoBox) {
	this.url = url;
	this.currentViewRect = undefined;
	this.infoBox = infoBox;

	//message bar
	this.messageBar = jQuery(document.createElement("div"));
	this.messageBar.addClass("messageBar");
	this.messageBar.hide();

	var browser = this;
	this.graphData = {
		nodes: [],
		edges: []
	};
	var options = this.getExplorerOptions();
	this.network = new vis.Network(container, {
		nodes: [],
		edges: []
	}, options);

	this.network.on("click", eventOnClick(this));
	if (false) {
		this.network.on("zoom", this._onZoom);
		this.network.off("fit");
		this.network.on("fit", this._onFit);
	}
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

Browser.prototype.loadGraph = function (options) {
	var browser = this;
	this._ajaxCommand("loadGraph", {}, function (json, textStatus) {
		var networkOptions = browser.getDefaultOptions();
		browser.network.setOptions(networkOptions);
		console.log(browser);
		browser.graphData = {
			nodes: json.data.nodes,
			edges: json.data.edges
		};

		browser.network.setData(browser.graphData);
		browser.emit("loadGraph", browser.graphData);
	});
}

Browser.prototype.updateGraph = function (objectShowOptions) {
	var showOptions = objectShowOptions || {};
	if (showOptions.scale !== undefined)
		browser.scaleTo(showOptions.scale);

	if (showOptions.showEdges === false)
		browser.showEdges(false);

	browser._updateNodes(function (node, update) {
		if (node._meta !== undefined) {
			if (showOptions.showFaces === true && node._meta.image !== undefined) {
				update.shape = 'circularImage';
				update.image = node._meta.image;
			}
			if (showOptions.showGroups === true && node._meta.group !== undefined) {
				update.group = node._meta.group;
			}
			if (showOptions.showDegrees === true && node._meta.degree !== undefined) {
				update.value = node._meta.degree;
			}
		}
	});
}

Browser.prototype._showMessage = function (msgCode) {
	this.messageBar.html(Messages.getMessage(msgCode));
	this.messageBar.show();
}

Browser.prototype._hideMessage = function () {
	this.messageBar.html("");
	this.messageBar.hide();
}

Browser.prototype.focus = function (nodeIds) {
	this.network.selectNodes(focus, false);
	this.network.fit({nodes: focus});
}

/**
 * @param functionDoUpdate a function which updates an edge, be called as functionDoUpdate(edge, update)
 * @private
 */
Browser.prototype._updateEdges = function (functionDoUpdate) {
	var updates = [];
	for (var item in this.graphData.edges) {
		var edge = this.graphData.edges[item];
		var update = {id: edge['id']};
		functionDoUpdate(edge, update);
		if (Object.keys(update).length > 1)
			updates.push(update);
	}

	if (updates.length > 0)
		this.network.body.data.edges.update(updates);
}

/**
 * @param functionDoUpdate a function which updates a node, be called as functionDoUpdate(node, update)
 * @private
 */
Browser.prototype._updateNodes = function (functionDoUpdate) {
	var updates = [];
	for (var item in this.graphData.nodes) {
		var node = this.graphData.nodes[item];
		var update = {id: node['id']};
		functionDoUpdate(node, update);
		if (Object.keys(update).length > 1)
			updates.push(update);
	}

	if (updates.length > 0)
		this.network.body.data.nodes.update(updates);
}

Browser.prototype.showEdges = function (showOrNot) {
	showOrNot = !(false === showOrNot);
	this._updateEdges(function (edge, update) {
		update.hidden = !showOrNot;
	});
}

Browser.prototype.showFaces = function (showOrNot) {
	showOrNot = !(false === showOrNot);
	this._updateNodes(function (node, update) {
		if (node._meta !== undefined) {
			var value = node._meta.image;
			update.shape = (showOrNot && value !== undefined) ? 'circularImage' : 'dot';
			update.image = (showOrNot && value !== undefined) ? value : null;
		}
	});
}

Browser.prototype.showGroups = function (showOrNot) {
	showOrNot = !(false === showOrNot);
	this._updateNodes(function (node, update) {
		if (node._meta !== undefined) {
			var value = node._meta.group;
			update.group = (showOrNot && value !== undefined) ? value : null;
		}
	});
}

Browser.prototype.scaleTo = function (scale) {
	this.network.moveTo({scale: scale});
}

Browser.prototype.showDegrees = function (showOrNot) {
	showOrNot = !(false === showOrNot);
	this._updateNodes(function (node, update) {
		if (node._meta !== undefined) {
			var value = node._meta.degree;
			update.value = (showOrNot && value !== undefined) ? value : 1;
		}
	});
}

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
			shape: 'dot',
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
				to: {
					enabled: true,
					scaleFactor: 0.5,
				}
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
			hover: true,
			hideEdgesOnDrag: true,
			selectable: true,
			navigationButtons: true,
		}
	};
};

Browser.prototype.centerOn = function (x, y, scale) {
	var center = new Point(x, y);
	var rect = center.expand(network.canvas.frame.canvas.clientWidth / scale,
		this.network.canvas.frame.canvas.clientHeight / scale);

	this._updateNetworkWithView(rect);
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
				nodes: Utils.mapValues(json.data.nodes),
				edges: Utils.mapValues(json.data.edges)
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

//////////////////////////////////////////////
////////////////Events Handlers//////////////
//////////////////////////////////////////////
Browser.prototype._onFit = function (args) {
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
}

Browser.prototype._onZoom = function (args) {
	this.centerOn(new Point(0, 0), args.scale);
};

function eventOnClick(browser) {
	return function (args) {
		if (args.nodes.length > 0) {
			if (browser.infoBox !== undefined) {
				browser._ajaxCommand("getNodesInfo", {nodes: args.nodes}, function (json, textStatus) {
					console.log(json);
					$(browser.infoBox).text(json.infos.toString());
				});
			}
		}
	};
}
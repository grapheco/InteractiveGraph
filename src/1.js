var vis = require("vis");

function foo(){
	console.log("hello");
}

var name="bluejoe";

exports.foo = foo;
exports.network = vis.Network;

var GRIDS = {nodes: {}, edges: {}};
const GRID_SIZE = 100;
var CANVAS_WIDTH = 0;
var CANVAS_HEIGHT = 0;
const CANVAS_PADDING = 80;


function processGraphData(nodes, edges) {
	var nodeIds = {};
	var minx = 0, maxx = 0, miny = 0, maxy = 0;

	for (var i = 0; i < nodes.length; i++) {
		var node = nodes[i];
		nodeIds[node.id] = node;
		if (node.x > maxx)
			maxx = node.x;
		if (node.x < minx)
			minx = node.x;
		if (node.y > maxy)
			maxy = node.y;
		if (node.y < miny)
			miny = node.y;

		var grid = convertXY2Grid(new Point(node.x, node.y));
		var pos = "" + grid[0] + "," + grid[1];
		if (GRIDS.nodes[pos] === undefined)
			GRIDS.nodes[pos] = [];

		GRIDS.nodes[pos].push(node);
	}

	CANVAS_WIDTH = maxx - minx + CANVAS_PADDING;
	CANVAS_HEIGHT = maxy - miny + CANVAS_PADDING;

	for (var i = 0; i < edges.length; i++) {
		var edge = edges[i];
		var startNode = nodeIds[edge.from];
		var endNode = nodeIds[edge.to];
		var tgs = getGridsThatLineWalkThrough(new Point(startNode.x, startNode.y), new Point(endNode.x, endNode.y));
		for (var g = 0; g < tgs.length; g++) {
			var pos = tgs[g];

			if (GRIDS.edges[pos] === undefined)
				GRIDS.edges[pos] = [];

			GRIDS.edges[pos].push(edge);
		}
	}

	console.log(GRIDS);
}

function convertXY2Grid(pt) {
	return [Math.floor(pt.x / GRID_SIZE), Math.floor(pt.y / GRID_SIZE)];
}


function ajaxGetElementsInView(rect) {
	return {data: {nodes: nodes, edges: edges}};
}

function ajaxCompareElementsInView(rect1, rect2) {
	var e1 = ajaxGetElementsInView(rect1);
	var e2 = ajaxGetElementsInView(rect2);

	var nodesToAdd = [];
	var edgesToAdd = [];
	var nodesToDelete = [];
	var edgesToDelete = [];

	e2.data.nodes.forEach(function (value, key, mapObj) {
		if (!e1.data.nodes.has(key))
			nodesToAdd.push(value);
	});

	e2.data.edges.forEach(function (value, key, mapObj) {
		if (!e1.data.edges.has(key))
			edgesToAdd.push(value);
	});

	e1.data.nodes.forEach(function (value, key, mapObj) {
		if (!e2.data.nodes.has(key))
			nodesToDelete.push(key);
	});

	e1.data.edges.forEach(function (value, key, mapObj) {
		if (!e2.data.edges.has(key))
			edgesToDelete.push(key);
	});

	return {
		dataToAdd: {nodes: nodesToAdd, edges: edgesToAdd},
		dataToDelete: {nodes: nodesToDelete, edges: edgesToDelete}
	};
}

function getGridsThatLineWalkThrough(p1, p2) {
	var touched = {};

	var x1 = p1.x;
	var y1 = p1.y;
	var x2 = p2.x;
	var y2 = p2.y;
	var gx, gy;
	//y = ratio * (x - x1) + y1;
	var fy = function (y) {
		return x1;
	}
	var fx = function (x) {
		return y1;
	}

	if (x2 != x1) {
		var ratio = (y2 - y1) / (x2 - x1);
		fx = function (x) {
			return ratio * (x - x1) + y1;
		}

		fy = function (y) {
			return (y - y1) / ratio + x1;
		}
	}

	var addPointByX = function (x) {
		gx = x / GRID_SIZE;
		gy = fx(x) / GRID_SIZE;
		touched[Math.floor(gx) + "," + Math.floor(gy)] = true;
	}

	var addPointByY = function (y) {
		gy = y / GRID_SIZE;
		gx = fy(y) / GRID_SIZE;
		touched[Math.floor(gx) + "," + Math.floor(gy)] = true;
	}

	if (x1 != x2) {
		var min = Math.min(x1, x2);
		var max = Math.max(x1, x2);

		for (var x = Math.ceil(min / GRID_SIZE) * GRID_SIZE; x < max; x += GRID_SIZE) {
			addPointByX(x);
		}

		addPointByX(min);
		addPointByX(max);
	}

	if (y1 != y2) {
		var min = Math.min(y1, y2);
		var max = Math.max(y1, y2);

		for (var y = Math.ceil(min / GRID_SIZE) * GRID_SIZE; y < y2; y += GRID_SIZE) {
			addPointByY(y);
		}

		addPointByY(min);
		addPointByY(max);
	}

	var GRIDS = [];
	for (var p in touched) {
		GRIDS.push(p);
	}

	return GRIDS;
}

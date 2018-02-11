/**
 * Created by bluejoe on 2018/2/6.
 */
exports.Point = Point;
exports.Rect = Rect;

//////////////Point/////////////////
function Point(x, y) {
	this.x = x;
	this.y = y;
}

Point.prototype.delta = function (delta) {
	this.x += delta.x;
	this.y += delta.y;
}

Point.prototype.expand = function (width, height) {
	return new Rect(this.x - width / 2, this.y - height / 2, this.x + width / 2, this.y + height / 2);
}

//////////////Rect/////////////////
function Rect(x1, y1, x2, y2) {
	this.x1 = Math.min(x1, x2);
	this.y1 = Math.min(y1, y2);
	this.x2 = Math.max(x1, x2);
	this.y2 = Math.max(y1, y2);
}

Rect.prototype.center = function () {
	return new Point((this.x1 + this.x2) / 2, (this.y1 + this.y2) / 2);
}

Rect.prototype.width = function () {
	return this.x2 - this.x1;
}

Rect.prototype.height = function () {
	return this.y2 - this.y1;
}

///////////////////////////////////
Map.prototype.valueArray = function () {
	var arr = [];
	for (let v of this.values()) {
		arr.push(v);
	}
	return arr;
}
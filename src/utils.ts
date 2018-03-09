/**
 * Created by bluejoe on 2018/2/6.
 */
///////////////////////////////////
export class Utils {
	public static distinct(arr: any[]): any[] {
		var ae = [];
		arr.forEach((t) => {
			if (ae.indexOf(t) < 0)
				ae.push(t);
		});
		return ae;
	}

	public static flatMap(arr: any[], func: (t) => any[]): any[] {
		var ae = [];
		arr.forEach((t) => {
			var r = func(t);
			ae = ae.concat(r);
		});
		return ae;
	}

	public static mapValues(map) {
		var arr = [];
		for (let v in map.values()) {
			arr.push(v);
		}
		return arr;
	}

	public static extend(baseObject: object, extension: object) {
		for (let key in extension) {
			if (extension.hasOwnProperty(key)) {
				var baseValue = baseObject[key];
				var extValue = extension[key];
				if (baseValue instanceof Object && baseValue instanceof Object) {
					Utils.extend(baseValue, extValue);
				}
				else {
					baseObject[key] = extValue;
				}
			}
		}
	}

	/**
	 * evalate each property which is a Function(currentObject)
	 */
	public static evaluate(o) {
		for (let key in o) {
			if (o[key] instanceof Function) {
				var fun = o[key];
				o[key] = fun(o);
			}
		}
	}
}

//////////////Point/////////////////
export class Point {
	public x: number;
	public y: number;

	constructor(x, y) {
		this.x = x;
		this.y = y;
	}

	public delta(delta) {
		this.x += delta.x;
		this.y += delta.y;
	}

	public expand(width, height) {
		return new Rect(this.x - width / 2, this.y - height / 2, this.x + width / 2, this.y + height / 2);
	}
}

//////////////Rect/////////////////
export class Rect {
	public x1: number;
	public y1: number;
	public x2: number;
	public y2: number;
	public constructor(x1, y1, x2, y2) {
		this.x1 = Math.min(x1, x2);
		this.y1 = Math.min(y1, y2);
		this.x2 = Math.max(x1, x2);
		this.y2 = Math.max(y1, y2);
	}

	public center(): Point {
		return new Point((this.x1 + this.x2) / 2, (this.y1 + this.y2) / 2);
	}

	public width() {
		return this.x2 - this.x1;
	}

	public height() {
		return this.y2 - this.y1;
	}
}
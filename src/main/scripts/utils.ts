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

	public static partOf(keys: string[], src: any) {
		var filtered = {};
		keys.forEach((key) => {
			if (src[key] !== undefined) {
				filtered[key] = src[key];
			}
		})

		return filtered;
	}

	public static flatMap(arr: any[], func: (t) => any[]): any[] {
		var ae = [];
		arr.forEach((t) => {
			var r = func(t);
			r.forEach((ri) => {
				ae.push(ri);
			});
		});

		return ae;
	}

	public static toArray<T>(it: IterableIterator<T>) {
		var arr = [];
		while (true) {
			var v = it.next();
			if (v.done)
				break;

			arr.push(v.value);
		}

		return arr;
	}

	public static clone(value: any): any {
		if (typeof (value) == 'string'
			|| typeof (value) == 'number'
			|| typeof (value) == 'boolean'
			|| value instanceof Function) {
			return value;
		}

		if (value instanceof Array) {
			var arr: any[] = value;
			return arr.map((item) => {
				return Utils.clone(item);
			});
		}

		if (typeof (value) == 'object') {
			return Utils._cloneObject(value);
		}

		throw new TypeError("unsupported type: " + typeof (value));
	}

	private static _cloneObject(src: object): object {
		var dest = {};
		for (let key in src) {
			if (src.hasOwnProperty(key)) {
				var value = src[key];
				dest[key] = Utils.clone(value);
			}
		}

		return dest;
	}

	/**
	 * base + delta
	 * @param base 
	 * @param delta 
	 */
	public static extend(base: object, delta: object): object {
		//do not working on base object
		var dest = Utils._cloneObject(base);

		for (let key in delta) {
			if (delta.hasOwnProperty(key)) {
				var baseValue = base[key];
				var extValue = delta[key];

				if (typeof (extValue) == 'object' &&
					typeof (baseValue) == 'object') {
					dest[key] = Utils.extend(baseValue, extValue);
					continue;
				}

				//base={a:{x:...}}, ext={a:2}
				dest[key] = Utils.clone(extValue);
			}
		}

		return dest;
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

	public static toMap(o): Map<any, any> {
		var m = new Map();
		for (let key in o) {
			if (o.hasOwnProperty(key)) {
				m.set(key, o[key]);
			}
		}

		return m;
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
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Created by bluejoe on 2018/2/6.
 */
///////////////////////////////////
class Utils {
    static distinct(arr) {
        var ae = [];
        arr.forEach((t) => {
            if (ae.indexOf(t) < 0)
                ae.push(t);
        });
        return ae;
    }
    static partOf(keys, src) {
        var filtered = {};
        keys.forEach((key) => {
            if (src[key] !== undefined) {
                filtered[key] = src[key];
            }
        });
        return filtered;
    }
    static flatMap(arr, func) {
        var ae = [];
        arr.forEach((t) => {
            var r = func(t);
            r.forEach((ri) => {
                ae.push(ri);
            });
        });
        return ae;
    }
    static toArray(it) {
        var arr = [];
        while (true) {
            var v = it.next();
            if (v.done)
                break;
            arr.push(v.value);
        }
        return arr;
    }
    static deepClone(value) {
        if (value === undefined)
            return undefined;
        if (value === null)
            return null;
        if (typeof (value) == 'string'
            || typeof (value) == 'number'
            || typeof (value) == 'boolean'
            || value instanceof Function) {
            return value;
        }
        if (value instanceof Array) {
            var arr = value;
            return arr.map((item) => {
                return Utils.deepClone(item);
            });
        }
        if (typeof (value) == 'object') {
            return Utils._deepCloneObject(value);
        }
        throw new TypeError("unsupported type: " + typeof (value));
    }
    static _deepCloneObject(src) {
        var dest = {};
        for (let key in src) {
            if (src.hasOwnProperty(key)) {
                var value = src[key];
                dest[key] = Utils.deepClone(value);
            }
        }
        return dest;
    }
    /**
     * base + delta
     * @param base
     * @param delta
     */
    static deepExtend(base, delta) {
        //do not working on base object
        var dest = Utils._deepCloneObject(base);
        for (let key in delta) {
            if (delta.hasOwnProperty(key)) {
                var baseValue = base[key];
                var extValue = delta[key];
                if (typeof (extValue) == 'object' &&
                    typeof (baseValue) == 'object') {
                    dest[key] = Utils.deepExtend(baseValue, extValue);
                    continue;
                }
                //base={a:{x:...}}, ext={a:2}
                dest[key] = Utils.deepClone(extValue);
            }
        }
        return dest;
    }
    /**
     * evalate each property which is a Function(currentObject)
     */
    static evaluate(o) {
        for (let key in o) {
            if (o[key] instanceof Function) {
                var fun = o[key];
                o[key] = fun(o);
            }
        }
    }
    static toMap(o) {
        var m = new Map();
        for (let key in o) {
            if (o.hasOwnProperty(key)) {
                m.set(key, o[key]);
            }
        }
        return m;
    }
}
exports.Utils = Utils;
//////////////Point/////////////////
class Point {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }
    delta(delta) {
        this.x += delta.x;
        this.y += delta.y;
    }
    expand(width, height) {
        return new Rect(this.x - width / 2, this.y - height / 2, this.x + width / 2, this.y + height / 2);
    }
}
exports.Point = Point;
//////////////Rect/////////////////
class Rect {
    constructor(x1, y1, x2, y2) {
        this.x1 = Math.min(x1, x2);
        this.y1 = Math.min(y1, y2);
        this.x2 = Math.max(x1, x2);
        this.y2 = Math.max(y1, y2);
    }
    center() {
        return new Point((this.x1 + this.x2) / 2, (this.y1 + this.y2) / 2);
    }
    width() {
        return this.x2 - this.x1;
    }
    height() {
        return this.y2 - this.y1;
    }
}
exports.Rect = Rect;

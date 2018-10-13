"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.typedArrayToArray = typedArrayToArray;
exports.Float = void 0;

var _errors = require("../../../errors");

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

var Float =
/*#__PURE__*/
function () {
  function Float(value) {
    _classCallCheck(this, Float);

    this._value = value;
  }

  _createClass(Float, [{
    key: "add",
    value: function add(operand) {
      return new this.constructor(this._value + operand._value);
    }
  }, {
    key: "sub",
    value: function sub(operand) {
      return new this.constructor(this._value - operand._value);
    }
  }, {
    key: "mul",
    value: function mul(operand) {
      return new this.constructor(this._value * operand._value);
    }
  }, {
    key: "div_s",
    value: function div_s(operand) {
      return new this.constructor(this._value / operand._value);
    }
  }, {
    key: "div_u",
    value: function div_u(operand) {
      return new this.constructor(this._value / operand._value);
    }
  }, {
    key: "div",
    value: function div(operand) {
      return new this.constructor(this._value / operand._value);
    }
  }, {
    key: "and",
    value: function and(operand) {
      return new this.constructor(this._value & operand._value);
    }
  }, {
    key: "or",
    value: function or(operand) {
      return new this.constructor(this._value | operand._value);
    }
  }, {
    key: "xor",
    value: function xor(operand) {
      return new this.constructor(this._value ^ operand._value);
    }
  }, {
    key: "isZero",
    value: function isZero() {
      return this._value == 0;
    }
  }, {
    key: "equals",
    value: function equals(operand) {
      return isNaN(this._value) ? isNaN(operand._value) : this._value == operand._value;
    }
  }, {
    key: "min",
    value: function min(operand) {
      return new this.constructor(Math.min(this._value, operand._value));
    }
  }, {
    key: "max",
    value: function max(operand) {
      return new this.constructor(Math.max(this._value, operand._value));
    }
  }, {
    key: "abs",
    value: function abs() {
      return new this.constructor(Math.abs(this._value));
    }
  }, {
    key: "neg",
    value: function neg() {
      return new this.constructor(-this._value);
    }
  }, {
    key: "copysign",
    value: function copysign(operand) {
      return new this.constructor(Math.sign(this._value) === Math.sign(operand._value) ? this._value : -this._value);
    }
  }, {
    key: "reinterpret",
    value: function reinterpret() {
      throw new _errors.RuntimeError("unsupported operation");
    }
  }, {
    key: "toByteArray",
    value: function toByteArray() {
      throw new _errors.RuntimeError("unsupported operation");
    }
  }, {
    key: "toNumber",
    value: function toNumber() {
      return this._value;
    }
  }, {
    key: "isTrue",
    value: function isTrue() {
      return this._value == 1;
    }
  }, {
    key: "toString",
    value: function toString() {
      return this.toNumber().toString();
    }
  }]);

  return Float;
}();

exports.Float = Float;

function typedArrayToArray(typedArray) {
  var byteArray = new Array(typedArray.byteLength);

  for (var i = 0; i < byteArray.length; i++) {
    byteArray[i] = typedArray[i];
  }

  return byteArray;
}
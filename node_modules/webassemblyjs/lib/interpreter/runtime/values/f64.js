"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.createInfFromAST = createInfFromAST;
exports.createNanFromAST = createNanFromAST;
exports.createValueFromAST = createValueFromAST;
exports.createValue = createValue;
exports.createValueFromArrayBuffer = createValueFromArrayBuffer;
exports.f64nan = exports.f64inf = exports.f64 = void 0;

var _long = _interopRequireDefault(require("long"));

var _number = require("./number");

var _i = require("./i64");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === "object" || typeof call === "function")) { return call; } if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var type = "f64";

var f64 =
/*#__PURE__*/
function (_Float) {
  _inherits(f64, _Float);

  function f64() {
    _classCallCheck(this, f64);

    return _possibleConstructorReturn(this, (f64.__proto__ || Object.getPrototypeOf(f64)).apply(this, arguments));
  }

  _createClass(f64, [{
    key: "reinterpret",
    value: function reinterpret() {
      var floatArray = new Float64Array(1);
      floatArray[0] = this._value;
      var lowIntArray = new Int32Array(floatArray.buffer.slice(0, 4));
      var highIntArray = new Int32Array(floatArray.buffer.slice(4, 8));
      return new _i.i64(_long.default.fromBits(lowIntArray[0], highIntArray[0]));
    }
  }, {
    key: "toByteArray",
    value: function toByteArray() {
      var floatArray = new Float64Array(1);
      floatArray[0] = this._value;
      return (0, _number.typedArrayToArray)(new Int8Array(floatArray.buffer));
    }
  }], [{
    key: "fromArrayBuffer",
    value: function fromArrayBuffer(buffer, ptr) {
      var slice = buffer.slice(ptr, ptr + 8);
      var value = new Float64Array(slice);
      return new f64(value[0]);
    }
  }]);

  return f64;
}(_number.Float);

exports.f64 = f64;

var f64inf =
/*#__PURE__*/
function (_f) {
  _inherits(f64inf, _f);

  function f64inf() {
    _classCallCheck(this, f64inf);

    return _possibleConstructorReturn(this, (f64inf.__proto__ || Object.getPrototypeOf(f64inf)).apply(this, arguments));
  }

  _createClass(f64inf, [{
    key: "reinterpret",
    value: function reinterpret() {
      // Exponent is all 1's, mantissa is all zeros
      var upper = 0x7ff << 20;

      if (this._value < 0) {
        upper = upper | 0x80000000;
      }

      return new _i.i64(_long.default.fromBits(0, upper).toSigned());
    }
  }]);

  return f64inf;
}(f64);

exports.f64inf = f64inf;

var f64nan =
/*#__PURE__*/
function (_f2) {
  _inherits(f64nan, _f2);

  function f64nan() {
    _classCallCheck(this, f64nan);

    return _possibleConstructorReturn(this, (f64nan.__proto__ || Object.getPrototypeOf(f64nan)).apply(this, arguments));
  }

  _createClass(f64nan, [{
    key: "reinterpret",
    value: function reinterpret() {
      var lower = 0;
      var upper = 0; // sign bit of _value shifted to position 0

      if (this._value <= 0) {
        upper = upper | 0x80000000;
      } // 11-bit exponent shifted to position 1 through 11


      upper = upper | 0x7ff << 20; // 52-bit mantissa which is obtained by disregarding the sign of _value

      var mantissa = this._value <= 0 ? -this._value : this._value;
      lower = lower | mantissa % Math.pow(2, 32);
      upper = upper | Math.floor(mantissa / Math.pow(2, 32));
      return new _i.i64(_long.default.fromBits(lower, upper));
    }
  }]);

  return f64nan;
}(f64);

exports.f64nan = f64nan;

function createInfFromAST(sign) {
  return {
    type: type,
    value: new f64inf(sign)
  };
}

function createNanFromAST(payload) {
  return {
    type: type,
    value: new f64nan(payload)
  };
}

function createValueFromAST(value) {
  return {
    type: type,
    value: new f64(value)
  };
}

function createValue(value) {
  return {
    type: type,
    value: value
  };
}

function createValueFromArrayBuffer(buffer, ptr) {
  return {
    type: type,
    value: f64.fromArrayBuffer(buffer, ptr)
  };
}
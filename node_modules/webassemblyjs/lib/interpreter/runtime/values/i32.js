"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.createValueFromAST = createValueFromAST;
exports.createValue = createValue;
exports.createValueFromArrayBuffer = createValueFromArrayBuffer;
exports.createTrue = createTrue;
exports.createFalse = createFalse;
exports.i32 = void 0;

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

var Long = require("long");

var _require = require("../../../errors"),
    RuntimeError = _require.RuntimeError;

var bits = 32;
var type = "i32"; // the specification describes the conversion from unsigned to signed
// https://webassembly.github.io/spec/core/exec/numerics.html#aux-signed
// this function performs the inverse

var toUnsigned = function toUnsigned(a) {
  return a >>> 0;
};

var i32 =
/*#__PURE__*/
function () {
  function i32(value) {
    _classCallCheck(this, i32);

    // Integers are represented within WebAssembly as unsigned numbers. When crossing the JS <=> WebAssembly boundary
    // they are converted into a signed number.
    this._value = value | 0;
  }

  _createClass(i32, [{
    key: "add",
    value: function add(operand) {
      // https://webassembly.github.io/spec/core/exec/numerics.html#op-iadd
      return new i32(this._value + operand._value);
    }
  }, {
    key: "sub",
    value: function sub(operand) {
      // https://webassembly.github.io/spec/core/exec/numerics.html#op-isub
      return new i32(this._value - operand._value);
    }
  }, {
    key: "mul",
    value: function mul(operand) {
      // https://webassembly.github.io/spec/core/exec/numerics.html#op-imul
      return new i32(Long.fromNumber(this._value).mul(Long.fromNumber(operand._value)).mod(Math.pow(2, bits)).toNumber());
    }
  }, {
    key: "div_s",
    value: function div_s(operand) {
      // https://webassembly.github.io/spec/core/exec/numerics.html#op-idiv-s
      if (operand._value == 0) {
        throw new RuntimeError("integer divide by zero");
      } // as per: https://webassembly.github.io/spec/core/exec/numerics.html#op-idiv-s
      // This operator is partial. Besides division by 0, the result of −2^(N−1) / (−1) = +2^(N−1)
      // is not representable as an N-bit signed integer.


      if (this._value == -0x80000000 && operand._value == -1) {
        throw new RuntimeError("integer overflow");
      }

      return new i32(this._value / operand._value);
    }
  }, {
    key: "div_u",
    value: function div_u(operand) {
      // https://webassembly.github.io/spec/core/exec/numerics.html#op-idiv-u
      if (operand._value == 0) {
        throw new RuntimeError("integer divide by zero");
      }

      return new i32(toUnsigned(this._value) / toUnsigned(operand._value));
    }
  }, {
    key: "rem_s",
    value: function rem_s(operand) {
      // https://webassembly.github.io/spec/core/exec/numerics.html#op-irem-s
      if (operand._value == 0) {
        throw new RuntimeError("integer divide by zero");
      }

      return new i32(this._value % operand._value);
    }
  }, {
    key: "rem_u",
    value: function rem_u(operand) {
      // https://webassembly.github.io/spec/core/exec/numerics.html#op-irem-u
      if (operand._value == 0) {
        throw new RuntimeError("integer divide by zero");
      }

      return new i32(toUnsigned(this._value) % toUnsigned(operand._value));
    }
  }, {
    key: "shl",
    value: function shl(operand) {
      // https://webassembly.github.io/spec/core/exec/numerics.html#op-shl
      return new i32(this._value << operand._value);
    }
  }, {
    key: "shr_s",
    value: function shr_s(operand) {
      // https://webassembly.github.io/spec/core/exec/numerics.html#op-shr-s
      return new i32(this._value >> operand._value);
    }
  }, {
    key: "shr_u",
    value: function shr_u(operand) {
      // https://webassembly.github.io/spec/core/exec/numerics.html#op-shr-u
      return new i32(this._value >>> operand._value);
    }
  }, {
    key: "rotl",
    value: function rotl(rotation) {
      // https://webassembly.github.io/spec/core/exec/numerics.html#op-rotl
      return new i32(this._value << rotation._value | this._value >>> bits - rotation._value);
    }
  }, {
    key: "rotr",
    value: function rotr(rotation) {
      // https://webassembly.github.io/spec/core/exec/numerics.html#op-rotl
      return new i32(this._value >>> rotation._value | this._value << bits - rotation._value);
    }
  }, {
    key: "clz",
    value: function clz() {
      // https://webassembly.github.io/spec/core/exec/numerics.html#op-iclz
      if (this._value == 0) {
        return new i32(bits);
      }

      var lead = 0;
      var temp = toUnsigned(this._value);

      while ((temp & 0x80000000) == 0) {
        lead++;
        temp = temp << 1 >>> 0;
      }

      return new i32(lead);
    }
  }, {
    key: "ctz",
    value: function ctz() {
      // https://webassembly.github.io/spec/core/exec/numerics.html#op-ictz
      if (this._value == 0) {
        return new i32(bits);
      }

      var lead = 0;
      var temp = toUnsigned(this._value);

      while ((temp & 0x1) == 0) {
        lead++;
        temp = temp >> 1 >>> 0;
      }

      return new i32(lead);
    }
  }, {
    key: "popcnt",
    value: function popcnt() {
      // https://webassembly.github.io/spec/core/exec/numerics.html#op-ipopcnt
      var temp = toUnsigned(this._value);
      var count = 0;

      while (temp != 0) {
        if (temp & 0x80000000) {
          count++;
        }

        temp = temp << 1;
      }

      return new i32(count);
    }
  }, {
    key: "div",
    value: function div() {
      throw new RuntimeError("Unsupported operation");
    }
  }, {
    key: "and",
    value: function and(operand) {
      // https://webassembly.github.io/spec/core/exec/numerics.html#op-iand
      return new i32(this._value & operand._value);
    }
  }, {
    key: "or",
    value: function or(operand) {
      // https://webassembly.github.io/spec/core/exec/numerics.html#op-ixor
      return new i32(this._value | operand._value);
    }
  }, {
    key: "xor",
    value: function xor(operand) {
      // https://webassembly.github.io/spec/core/exec/numerics.html#op-ixor
      return new i32(this._value ^ operand._value);
    }
  }, {
    key: "eqz",
    value: function eqz() {
      // https://webassembly.github.io/spec/core/exec/numerics.html#op-ieqz
      return new i32(this._value == 0 ? 1 : 0);
    }
  }, {
    key: "eq",
    value: function eq(operand) {
      // https://webassembly.github.io/spec/core/exec/numerics.html#op-ieq
      return new i32(this._value == operand._value ? 1 : 0);
    }
  }, {
    key: "ne",
    value: function ne(operand) {
      // https://webassembly.github.io/spec/core/exec/numerics.html#op-ieq
      return new i32(this._value != operand._value ? 1 : 0);
    }
  }, {
    key: "lt_u",
    value: function lt_u(operand) {
      // https://webassembly.github.io/spec/core/exec/numerics.html#op-lt-u
      return new i32(toUnsigned(this._value) < toUnsigned(operand._value) ? 1 : 0);
    }
  }, {
    key: "lt_s",
    value: function lt_s(operand) {
      // https://webassembly.github.io/spec/core/exec/numerics.html#op-lt-s
      return new i32(this._value < operand._value ? 1 : 0);
    }
  }, {
    key: "le_u",
    value: function le_u(operand) {
      // https://webassembly.github.io/spec/core/exec/numerics.html#op-lt-u
      return new i32(toUnsigned(this._value) <= toUnsigned(operand._value) ? 1 : 0);
    }
  }, {
    key: "le_s",
    value: function le_s(operand) {
      // https://webassembly.github.io/spec/core/exec/numerics.html#op-lt-s
      return new i32(this._value <= operand._value ? 1 : 0);
    }
  }, {
    key: "gt_u",
    value: function gt_u(operand) {
      // https://webassembly.github.io/spec/core/exec/numerics.html#op-gt-u
      return new i32(toUnsigned(this._value) > toUnsigned(operand._value) ? 1 : 0);
    }
  }, {
    key: "gt_s",
    value: function gt_s(operand) {
      // https://webassembly.github.io/spec/core/exec/numerics.html#op-gt-s
      return new i32(this._value > operand._value ? 1 : 0);
    }
  }, {
    key: "ge_u",
    value: function ge_u(operand) {
      // https://webassembly.github.io/spec/core/exec/numerics.html#op-gt-u
      return new i32(toUnsigned(this._value) >= toUnsigned(operand._value) ? 1 : 0);
    }
  }, {
    key: "ge_s",
    value: function ge_s(operand) {
      // https://webassembly.github.io/spec/core/exec/numerics.html#op-gt-s
      return new i32(this._value >= operand._value ? 1 : 0);
    }
  }, {
    key: "equals",
    value: function equals(operand) {
      return isNaN(this._value) ? isNaN(operand._value) : this._value == operand._value;
    }
  }, {
    key: "min",
    value: function min(operand) {
      return new i32(Math.min(this._value, operand._value));
    }
  }, {
    key: "max",
    value: function max(operand) {
      return new i32(Math.max(this._value, operand._value));
    }
  }, {
    key: "abs",
    value: function abs() {
      return new i32(Math.abs(this._value));
    }
  }, {
    key: "neg",
    value: function neg() {
      return new i32(-this._value);
    }
  }, {
    key: "copysign",
    value: function copysign(operand) {
      return new i32(Math.sign(this._value) === Math.sign(operand._value) ? this._value : -this._value);
    }
  }, {
    key: "toNumber",
    value: function toNumber() {
      return this._value;
    }
  }, {
    key: "toString",
    value: function toString() {
      return this._value + "";
    }
  }, {
    key: "isTrue",
    value: function isTrue() {
      // https://webassembly.github.io/spec/core/exec/numerics.html#boolean-interpretation
      return this._value == 1;
    }
  }, {
    key: "toByteArray",
    value: function toByteArray() {
      var byteArray = new Array(4);

      for (var offset = 0, shift = 0; offset < byteArray.length; offset++, shift += 8) {
        byteArray[offset] = this._value >>> shift & 0xff;
      }

      return byteArray;
    }
  }], [{
    key: "fromArrayBuffer",
    value: function fromArrayBuffer(buffer, ptr, extend, signed) {
      var slice = buffer.slice(ptr, ptr + 4);
      var asInt32 = new Int32Array(slice)[0]; // shift left, then shift right by the same number of bits, using
      // signed or unsigned shifts

      asInt32 <<= extend;
      return new i32(signed ? asInt32 >> extend : asInt32 >>> extend);
    }
  }]);

  return i32;
}();

exports.i32 = i32;

function createValueFromAST(value) {
  return {
    type: type,
    value: new i32(value)
  };
}

function createValue(value) {
  return {
    type: type,
    value: value
  };
}

function createValueFromArrayBuffer(buffer, ptr, extend, signed) {
  return {
    type: type,
    value: i32.fromArrayBuffer(buffer, ptr, extend, signed)
  };
}

function createTrue() {
  return new i32(1);
}

function createFalse() {
  return new i32(0);
}
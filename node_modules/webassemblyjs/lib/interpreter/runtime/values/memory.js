"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Memory = void 0;

function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

var _require = require("../../../errors"),
    RuntimeError = _require.RuntimeError;

var WEBASSEMBLY_PAGE_SIZE = 64 * 1024
/* 64KiB */
;

var Memory =
/*#__PURE__*/
function () {
  function Memory(descr) {
    _classCallCheck(this, Memory);

    if (_typeof(descr) !== "object") {
      throw new TypeError("MemoryDescriptor must be an object");
    }

    if (typeof descr.maximum === "number" && descr.maximum < descr.initial) {
      throw new RangeError("Initial memory can not be higher than the maximum");
    }

    if (descr.initial > 65536) {
      throw new RuntimeError("memory size must be at most 65536 pages (4GiB)");
    }

    if (typeof descr.maximum === "number") {
      this._maximumBytes = descr.maximum * WEBASSEMBLY_PAGE_SIZE;
    }

    this._initialBytes = descr.initial * WEBASSEMBLY_PAGE_SIZE;

    this._allocateInitial();
  }

  _createClass(Memory, [{
    key: "_allocateInitial",
    value: function _allocateInitial() {
      this.buffer = new ArrayBuffer(this._initialBytes);
    }
  }]);

  return Memory;
}();

exports.Memory = Memory;
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Table = void 0;

function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

var DEFAULT_MAX_TABLE_ENTRY = Math.pow(2, 23);

var Table =
/*#__PURE__*/
function () {
  function Table(descr) {
    _classCallCheck(this, Table);

    if (_typeof(descr) !== "object") {
      throw new TypeError("TableDescriptor must be an object");
    }

    if (typeof descr.maximum === "number") {
      this._maximum = descr.maximum;
    } else {
      this._maximum = DEFAULT_MAX_TABLE_ENTRY;
    }

    if (typeof descr.initial === "number") {
      this._initial = descr.initial;

      if (this._initial > this._maximum) {
        throw new RangeError("Initial number can not be higher than the maximum");
      }
    }

    this._elements = Array(this._initial);
    this._offset = 0;
  }

  _createClass(Table, [{
    key: "push",
    value: function push(fn) {
      var offset = this._offset % this._maximum;
      this._elements[offset] = fn;
      this._offset = offset + 1;
    }
  }, {
    key: "get",
    value: function get(offset) {
      var element = this._elements[offset];

      if (typeof element === "undefined") {
        return null;
      } else {
        return element;
      }
    }
  }, {
    key: "length",
    get: function get() {
      return this._elements.length;
    }
  }]);

  return Table;
}();

exports.Table = Table;
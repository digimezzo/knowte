"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.unopi32 = unopi32;
exports.unopi64 = unopi64;
exports.unopf32 = unopf32;
exports.unopf64 = unopf64;

var i32 = _interopRequireWildcard(require("../../runtime/values/i32"));

var i64 = _interopRequireWildcard(require("../../runtime/values/i64"));

var f32 = _interopRequireWildcard(require("../../runtime/values/f32"));

var f64 = _interopRequireWildcard(require("../../runtime/values/f64"));

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {}; if (desc.get || desc.set) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj.default = obj; return newObj; } }

// https://webassembly.github.io/spec/core/exec/instructions.html#exec-binop
function unop(_ref, operation, createValue) {
  var value = _ref.value;

  switch (operation) {
    case "abs":
      return createValue(value.abs());

    case "neg":
      return createValue(value.neg());

    case "clz":
      return createValue(value.clz());

    case "ctz":
      return createValue(value.ctz());

    case "popcnt":
      return createValue(value.popcnt());

    case "eqz":
      return createValue(value.eqz());

    case "reinterpret/f32":
      return i32.createValue(value.reinterpret());

    case "reinterpret/f64":
      return i64.createValue(value.reinterpret());
  }

  throw new Error("Unsupported unop: " + operation);
}

function unopi32(c, operation) {
  return unop(c, operation, i32.createValue);
}

function unopi64(c, operation) {
  return unop(c, operation, i64.createValue);
}

function unopf32(c, operation) {
  return unop(c, operation, f32.createValue);
}

function unopf64(c, operation) {
  return unop(c, operation, f64.createValue);
}
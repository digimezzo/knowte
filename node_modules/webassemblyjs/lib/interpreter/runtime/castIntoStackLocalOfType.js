"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.castIntoStackLocalOfType = castIntoStackLocalOfType;

var _require = require("../../errors"),
    RuntimeError = _require.RuntimeError;

var i32 = require("./values/i32");

var i64 = require("./values/i64");

var f32 = require("./values/f32");

var f64 = require("./values/f64");

function castIntoStackLocalOfType(type, v) {
  var nan = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;
  var inf = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : false;
  var castFn = {
    i32: i32.createValueFromAST,
    i64: i64.createValueFromAST,
    f32: f32.createValueFromAST,
    f64: f64.createValueFromAST
  };

  if (nan === true) {
    castFn.f32 = f32.createNanFromAST;
    castFn.f64 = f64.createNanFromAST;
  }

  if (inf === true) {
    castFn.f32 = f32.createInfFromAST;
    castFn.f64 = f64.createInfFromAST;
  }

  if (typeof castFn[type] === "undefined") {
    throw new RuntimeError("Cannot cast: unsupported type " + JSON.stringify(type));
  }

  return castFn[type](v);
}
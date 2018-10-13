"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.binopi32 = binopi32;
exports.binopi64 = binopi64;
exports.binopf32 = binopf32;
exports.binopf64 = binopf64;

var i32 = require("../../runtime/values/i32");

var i64 = require("../../runtime/values/i64");

var f32 = require("../../runtime/values/f32");

var f64 = require("../../runtime/values/f64");

function binop(_ref, _ref2, sign, createValue) {
  var value1 = _ref.value;
  var value2 = _ref2.value;

  switch (sign) {
    case "add":
      return createValue(value1.add(value2));

    case "sub":
      return createValue(value1.sub(value2));

    case "mul":
      return createValue(value1.mul(value2));

    case "div_s":
      return createValue(value1.div_s(value2));

    case "div_u":
      return createValue(value1.div_u(value2));

    case "rem_s":
      return createValue(value1.rem_s(value2));

    case "rem_u":
      return createValue(value1.rem_u(value2));

    case "shl":
      return createValue(value1.shl(value2));

    case "shr_s":
      return createValue(value1.shr_s(value2));

    case "shr_u":
      return createValue(value1.shr_u(value2));

    case "rotl":
      return createValue(value1.rotl(value2));

    case "rotr":
      return createValue(value1.rotr(value2));

    case "div":
      return createValue(value1.div(value2));

    case "and":
      return createValue(value1.and(value2));

    case "eq":
      return createValue(value1.eq(value2));

    case "ne":
      return createValue(value1.ne(value2));

    case "lt_s":
      return createValue(value1.lt_s(value2));

    case "lt_u":
      return createValue(value1.lt_u(value2));

    case "le_s":
      return createValue(value1.le_s(value2));

    case "le_u":
      return createValue(value1.le_u(value2));

    case "gt":
      return createValue(value1.gt(value2));

    case "gt_s":
      return createValue(value1.gt_s(value2));

    case "gt_u":
      return createValue(value1.gt_u(value2));

    case "ge_s":
      return createValue(value1.ge_s(value2));

    case "ge_u":
      return createValue(value1.ge_u(value2));

    case "or":
      return createValue(value1.or(value2));

    case "xor":
      return createValue(value1.xor(value2));

    case "min":
      return createValue(value1.min(value2));

    case "max":
      return createValue(value1.max(value2));

    case "copysign":
      return createValue(value1.copysign(value2));
  }

  throw new Error("Unsupported binop: " + sign);
}

function binopi32(value1, value2, sign) {
  return binop(value1, value2, sign, i32.createValue);
}

function binopi64(value1, value2, sign) {
  return binop(value1, value2, sign, i64.createValue);
}

function binopf32(value1, value2, sign) {
  return binop(value1, value2, sign, f32.createValue);
}

function binopf64(value1, value2, sign) {
  return binop(value1, value2, sign, f64.createValue);
}
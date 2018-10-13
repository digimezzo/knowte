"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.createFuncInstance = createFuncInstance;
exports.createGlobalInstance = createGlobalInstance;

function createFuncInstance(func, params, results) {
  var type = [params, results];
  return {
    type: type,
    code: func,
    module: null,
    isExternal: true
  };
}

function createGlobalInstance(value, type, mutability) {
  return {
    type: type,
    mutability: mutability,
    value: value
  };
}
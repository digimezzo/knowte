"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.createValue = createValue;
var type = "label";

function createValue(value) {
  return {
    type: type,
    value: value
  };
}
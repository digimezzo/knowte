"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.walk = walk;

function walk(object, visitor) {
  Object.keys(object).forEach(function (key) {
    Object.keys(object[key]).forEach(function (key2) {
      var val = object[key][key2];
      visitor(key, key2, val);
    });
  });
}
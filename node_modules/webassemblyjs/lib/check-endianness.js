"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.checkEndianness = checkEndianness;
var buff = new ArrayBuffer(16);

function checkEndianness() {
  var viewInt16 = new Int16Array(buff);
  var viewInt8 = new Int8Array(buff);
  viewInt16[0] = 0x6373;
  return viewInt8[0] === 0x73 && viewInt8[1] === 0x63;
}
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.evaluate = evaluate;

var t = require("@webassemblyjs/ast");

var _require = require("./kernel/exec"),
    executeStackFrame = _require.executeStackFrame;

var _require2 = require("./kernel/stackframe"),
    createStackFrame = _require2.createStackFrame;

var modulevalue = require("./runtime/values/module");

function evaluate(allocator, code) {
  // Create an empty module instance for the context
  var moduleInstance = modulevalue.createInstance(allocator, t.module(undefined, []));
  var stackFrame = createStackFrame(code, [], moduleInstance, allocator);
  var res = executeStackFrame(stackFrame);
  return res;
}
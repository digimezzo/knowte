"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.createStackFrame = createStackFrame;
exports.createChildStackFrame = createChildStackFrame;

function createStackFrame(code, locals, originatingModule, allocator) {
  return {
    code: code,
    locals: locals,
    globals: [],

    /**
     * Labels are named block of code.
     * We maintain a map to access the block for a given identifier.
     *
     * https://webassembly.github.io/spec/core/exec/runtime.html#labels
     */
    labels: [],

    /**
     * Local applicatif Stack for the current stackframe.
     *
     * https://webassembly.github.io/spec/core/exec/runtime.html#stack
     */
    values: [],

    /**
     * We keep a reference to its originating module.
     *
     * When we need to lookup a function by addr for example.
     */
    originatingModule: originatingModule,

    /**
     * For shared memory operations
     */
    allocator: allocator,

    /**
     * Program counter, used to track the execution of the code
     */
    _pc: 0
  };
}

function createChildStackFrame(parent, code) {
  var locals = parent.locals,
      originatingModule = parent.originatingModule,
      allocator = parent.allocator,
      trace = parent.trace;
  var frame = createStackFrame(code, locals, originatingModule, allocator);
  frame.trace = trace;
  return frame;
}
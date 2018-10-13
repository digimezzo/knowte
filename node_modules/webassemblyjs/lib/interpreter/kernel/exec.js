"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.executeStackFrame = executeStackFrame;

var _memory2 = require("../runtime/values/memory");

var _errors = require("../../errors");

function _toArray(arr) { return Array.isArray(arr) ? arr : Array.from(arr); }

function _sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"] != null) _i["return"](); } finally { if (_d) throw _e; } } return _arr; }

function _slicedToArray(arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return _sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }

function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = new Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

var t = require("@webassemblyjs/ast");

var _require = require("./instruction/binop"),
    binopi32 = _require.binopi32,
    binopi64 = _require.binopi64,
    binopf32 = _require.binopf32,
    binopf64 = _require.binopf64;

var _require2 = require("./instruction/unop"),
    unopi32 = _require2.unopi32,
    unopi64 = _require2.unopi64,
    unopf32 = _require2.unopf32,
    unopf64 = _require2.unopf64;

var _require3 = require("../runtime/castIntoStackLocalOfType"),
    castIntoStackLocalOfType = _require3.castIntoStackLocalOfType;

var i32 = require("../runtime/values/i32");

var i64 = require("../runtime/values/i64");

var f32 = require("../runtime/values/f32");

var f64 = require("../runtime/values/f64");

var label = require("../runtime/values/label");

var stackframe = require("./stackframe");

var _require4 = require("./signals"),
    createTrap = _require4.createTrap; // Syntactic sugar for the Syntactic sugar
// TODO(sven): do it AOT?


function addEndInstruction(body) {
  body.push(t.instruction("end"));
}

function assertStackDepth(depth) {
  if (depth >= 300) {
    throw new _errors.RuntimeError("Maximum call stack depth reached");
  }
}

function executeStackFrame(firstFrame) {
  var depth = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;
  var stack = [firstFrame];
  var framepointer = 0; // eax

  var returnRegister = null;

  function run() {
    assertStackDepth(framepointer);
    var frame = stack[framepointer];

    (function () {
      if (!(frame !== undefined)) {
        throw new _errors.RuntimeError("Assertion error: " + ("no frame at " + framepointer || "unknown"));
      }
    })();

    framepointer++;

    function getLocalByIndex(index) {
      var local = frame.locals[index];

      if (typeof local === "undefined") {
        throw newRuntimeError("Assertion error: no local value at index " + index);
      }

      frame.values.push(local);
    }

    function setLocalByIndex(index, value) {
      (function () {
        if (!(typeof index === "number")) {
          throw new _errors.RuntimeError("Assertion error: " + (undefined || "unknown"));
        }
      })();

      frame.locals[index] = value;
    }

    function pushResult(res) {
      if (typeof res === "undefined") {
        return;
      }

      frame.values.push(res);
    }

    function popArrayOfValTypes(types) {
      (function () {
        if (frame.values.length < types.length) {
          throw new _errors.RuntimeError("Assertion error: expected " + types.length + " on the stack, found " + frame.values.length);
        }
      })();

      return types.map(function (type) {
        return pop1OfType(type);
      });
    }

    function pop1OfType(type) {
      (function () {
        if (frame.values.length < 1) {
          throw new _errors.RuntimeError("Assertion error: expected " + 1 + " on the stack, found " + frame.values.length);
        }
      })();

      var v = frame.values.pop();

      if (typeof type === "string" && v.type !== type) {
        throw newRuntimeError("Internal failure: expected value of type " + type + " on top of the stack, type given: " + v.type);
      }

      return v;
    }

    function pop1() {
      (function () {
        if (frame.values.length < 1) {
          throw new _errors.RuntimeError("Assertion error: expected " + 1 + " on the stack, found " + frame.values.length);
        }
      })();

      return frame.values.pop();
    }

    function pop2(type1, type2) {
      (function () {
        if (frame.values.length < 2) {
          throw new _errors.RuntimeError("Assertion error: expected " + 2 + " on the stack, found " + frame.values.length);
        }
      })();

      var c2 = frame.values.pop();
      var c1 = frame.values.pop();

      if (c2.type !== type2) {
        throw newRuntimeError("Internal failure: expected c2 value of type " + type2 + " on top of the stack, give type: " + c2.type);
      }

      if (c1.type !== type1) {
        throw newRuntimeError("Internal failure: expected c1 value of type " + type1 + " on top of the stack, give type: " + c1.type);
      }

      return [c1, c2];
    }

    function getLabel(index) {
      var code;

      if (index.type === "NumberLiteral") {
        var _label = index; // WASM

        code = frame.labels.find(function (l) {
          return l.value.value === _label.value;
        });
      } else if (index.type === "Identifier") {
        var _label2 = index; // WAST

        code = frame.labels.find(function (l) {
          if (l.id == null) {
            return false;
          }

          return l.id.value === _label2.value;
        });
      }

      if (typeof code !== "undefined") {
        return code.value;
      }
    }

    function br(label) {
      var code = getLabel(label);

      if (typeof code === "undefined") {
        throw newRuntimeError("Label ".concat(label.value, " doesn't exist"));
      } // FIXME(sven): find a more generic way to handle label and its code
      // Currently func body and block instr*.


      var childStackFrame = stackframe.createChildStackFrame(frame, code.body || code.instr);
      return executeStackFrame(childStackFrame, depth + 1);
    }

    function getMemoryOffset(instruction) {
      if (instruction.namedArgs && instruction.namedArgs.offset) {
        var offset = instruction.namedArgs.offset.value;

        if (offset < 0) {
          throw newRuntimeError("offset must be positive");
        }

        if (offset > 0xffffffff) {
          throw newRuntimeError("offset must be less than or equal to 0xffffffff");
        }

        return offset;
      } else {
        return 0;
      }
    }

    function getMemory() {
      if (frame.originatingModule.memaddrs.length !== 1) {
        throw newRuntimeError("unknown memory");
      }

      var memAddr = frame.originatingModule.memaddrs[0];
      return frame.allocator.get(memAddr);
    }

    function newRuntimeError(msg) {
      return new _errors.RuntimeError(msg);
    }

    function createAndExecuteChildStackFrame(instrs) {
      var _ref = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {},
          passCurrentContext = _ref.passCurrentContext;

      // FIXME(sven): that's wrong
      var frame = stack[framepointer - 1];

      (function () {
        if (!(frame !== undefined)) {
          throw new _errors.RuntimeError("Assertion error: " + ("no active frame" || "unknown"));
        }
      })();

      var nextStackFrame = stackframe.createChildStackFrame(frame, instrs);

      if (passCurrentContext === true) {
        nextStackFrame.values = frame.values;
        nextStackFrame.labels = frame.labels;
      } // Push the frame on top of the stack


      stack[framepointer] = nextStackFrame; // Jump and execute the next frame

      run();

      if (returnRegister !== null) {
        var _frame$values;

        (_frame$values = frame.values).push.apply(_frame$values, _toConsumableArray(returnRegister));

        returnRegister = null;
      }
    }

    while (true) {
      var instruction = frame.code[frame._pc];

      (function () {
        if (!(instruction !== undefined)) {
          throw new _errors.RuntimeError("Assertion error: " + ("no instruction at pc ".concat(frame._pc, " in frame ").concat(framepointer) || "unknown"));
        }
      })();

      if (typeof frame.trace === "function") {
        frame.trace(framepointer, frame._pc, instruction, frame);
      }

      frame._pc++;

      switch (instruction.type) {
        /**
         * Function declaration
         *
         * FIXME(sven): seems unspecified in the spec but it's required for the `call`
         * instruction.
         */
        case "Func":
          {
            var func = instruction;
            /**
             * Register the function into the stack frame labels
             */

            if (_typeof(func.name) === "object") {
              if (func.name.type === "Identifier") {
                if (func.signature.type !== "Signature") {
                  throw newRuntimeError("Function signatures must be denormalised before execution");
                }

                frame.labels.push({
                  value: func,
                  arity: func.signature.params.length,
                  id: func.name
                });
              }
            }

            break;
          }
      }

      switch (instruction.id) {
        case "const":
          {
            // https://webassembly.github.io/spec/core/exec/instructions.html#exec-const
            var n = instruction.args[0];

            if (typeof n === "undefined") {
              throw newRuntimeError("const requires one argument, none given.");
            }

            if (n.type !== "NumberLiteral" && n.type !== "LongNumberLiteral" && n.type !== "FloatLiteral") {
              throw newRuntimeError("const: unsupported value of type: " + n.type);
            }

            pushResult(castIntoStackLocalOfType(instruction.object, n.value));
            break;
          }

        /**
         * Control Instructions
         *
         * https://webassembly.github.io/spec/core/exec/instructions.html#control-instructions
         */

        case "nop":
          {
            // Do nothing
            // https://webassembly.github.io/spec/core/exec/instructions.html#exec-nop
            break;
          }

        case "loop":
          {
            // https://webassembly.github.io/spec/core/exec/instructions.html#exec-loop
            var loop = instruction;

            (function () {
              if (!(_typeof(loop.instr) === "object" && typeof loop.instr.length !== "undefined")) {
                throw new _errors.RuntimeError("Assertion error: " + (undefined || "unknown"));
              }
            })(); // 2. Enter the block instr∗ with label


            frame.labels.push({
              value: loop,
              arity: 0,
              id: loop.label
            });
            pushResult(label.createValue(loop.label.value));

            if (loop.instr.length > 0) {
              createAndExecuteChildStackFrame(loop.instr, {
                passCurrentContext: true
              });
            }

            break;
          }

        case "drop":
          {
            // https://webassembly.github.io/spec/core/exec/instructions.html#exec-drop
            // 1. Assert: due to validation, a value is on the top of the stack.
            (function () {
              if (frame.values.length < 1) {
                throw new _errors.RuntimeError("Assertion error: expected " + 1 + " on the stack, found " + frame.values.length);
              }
            })(); // 2. Pop the value valval from the stack.


            pop1();
            break;
          }

        case "call":
          {
            // According to the spec call doesn't support an Identifier as argument
            // but the Script syntax supports it.
            // https://webassembly.github.io/spec/core/exec/instructions.html#exec-call
            var call = instruction;

            if (call.index.type === "Identifier") {
              throw newRuntimeError("Internal compiler error: Identifier argument in call must be " + "transformed to a NumberLiteral node");
            } // WASM


            if (call.index.type === "NumberLiteral") {
              var index = call.index.value;

              (function () {
                if (!(typeof frame.originatingModule !== "undefined")) {
                  throw new _errors.RuntimeError("Assertion error: " + (undefined || "unknown"));
                }
              })(); // 2. Assert: due to validation, F.module.funcaddrs[x] exists.


              var funcaddr = frame.originatingModule.funcaddrs[index];

              if (typeof funcaddr === "undefined") {
                throw newRuntimeError("No function were found in module at address ".concat(index));
              } // 3. Let a be the function address F.module.funcaddrs[x]


              var subroutine = frame.allocator.get(funcaddr);

              if (_typeof(subroutine) !== "object") {
                throw newRuntimeError("Cannot call function at address ".concat(funcaddr, ": not a function"));
              } // 4. Invoke the function instance at address a
              // FIXME(sven): assert that res has type of resultType


              var _subroutine$type = _slicedToArray(subroutine.type, 2),
                  argTypes = _subroutine$type[0],
                  resultType = _subroutine$type[1];

              var args = popArrayOfValTypes(argTypes);

              if (subroutine.isExternal === false) {
                createAndExecuteChildStackFrame(subroutine.code);
              } else {
                var res = subroutine.code(args.map(function (arg) {
                  return arg.value;
                }));

                if (typeof res !== "undefined") {
                  pushResult(castIntoStackLocalOfType(resultType, res));
                }
              }
            }

            break;
          }

        case "block":
          {
            var _ret = function () {
              // https://webassembly.github.io/spec/core/exec/instructions.html#blocks
              var block = instruction;
              /**
               * Used to keep track of the number of values added on top of the stack
               * because we need to remove the label after the execution of this block.
               */

              var numberOfValuesAddedOnTopOfTheStack = 0; // 2. Enter the block instr∗ with label

              frame.labels.push({
                value: block,
                arity: 0,
                id: block.label
              });

              if (block.label.type === "Identifier") {
                pushResult(label.createValue(block.label.value));
              } else {
                throw newRuntimeError("Block has no id");
              }

              (function () {
                if (!(_typeof(block.instr) === "object" && typeof block.instr.length !== "undefined")) {
                  throw new _errors.RuntimeError("Assertion error: " + (undefined || "unknown"));
                }
              })();

              if (block.instr.length > 0) {
                var oldStackSize = frame.values.length;
                createAndExecuteChildStackFrame(block.instr, {
                  passCurrentContext: true
                });
                numberOfValuesAddedOnTopOfTheStack = frame.values.length - oldStackSize;
              }
              /**
               * Wen exiting the block
               *
               * > Let m be the number of values on the top of the stack
               *
               * The Stack (values) are seperated by StackFrames and we are running on
               * one single thread, there's no need to check if values were added.
               *
               * We tracked it in numberOfValuesAddedOnTopOfTheStack anyway.
               */


              var topOfTheStack = frame.values.slice(frame.values.length - numberOfValuesAddedOnTopOfTheStack);
              frame.values.splice(frame.values.length - numberOfValuesAddedOnTopOfTheStack); // 3. Assert: due to validation, the label LL is now on the top of the stack.
              // 4. Pop the label from the stack.

              pop1OfType("label");
              frame.values = _toConsumableArray(frame.values).concat(_toConsumableArray(topOfTheStack)); // Remove label

              frame.labels = frame.labels.filter(function (x) {
                if (x.id == null) {
                  return true;
                }

                return x.id.value !== block.label.value;
              });
              return "break";
            }();

            if (_ret === "break") break;
          }

        case "br":
          {
            var _ret2 = function () {
              // https://webassembly.github.io/spec/core/exec/instructions.html#exec-br
              var _instruction$args = _toArray(instruction.args),
                  label = _instruction$args[0],
                  children = _instruction$args.slice(1);

              if (label.type === "Identifier") {
                throw newRuntimeError("Internal compiler error: Identifier argument in br must be " + "transformed to a NumberLiteral node");
              }

              var l = label.value; // 1. Assert: due to validation, the stack contains at least l+1 labels.

              (function () {
                if (frame.values.length < l + 1) {
                  throw new _errors.RuntimeError("Assertion error: expected " + (l + 1) + " on the stack, found " + frame.values.length);
                }
              })(); // 2. Let L be the l-th label appearing on the stack, starting from the top and counting from zero.


              var seenLabels = 0;
              var labelidx = {
                value: "unknown"
              }; // for (var i = 0, len = frame.values.length; i < len; i++) {

              for (var i = frame.values.length; i--;) {
                if (frame.values[i].type === "label") {
                  if (seenLabels === l) {
                    labelidx = frame.values[i];
                    break;
                  }

                  seenLabels++;
                }
              } // $FlowIgnore


              var L = frame.labels.find(function (x) {
                return x.id.value === labelidx.value;
              });

              if (typeof L === "undefined") {
                throw newRuntimeError("br: unknown label ".concat(labelidx.value));
              } // 3. Let n be the arity of L.


              var n = L.arity; // 4. Assert: due to validation, there are at least nn values on the top of the stack.

              (function () {
                if (frame.values.length < n) {
                  throw new _errors.RuntimeError("Assertion error: expected " + n + " on the stack, found " + frame.values.length);
                }
              })(); // 5. Pop the values valn from the stack


              var val = frame.values[n];
              var bottomOfTheStack = frame.values.slice(0, n);
              var topOfTheStack = frame.values.slice(n + 1);
              frame.values = _toConsumableArray(bottomOfTheStack).concat(_toConsumableArray(topOfTheStack)); // 6. Repeat l+1 times:

              for (var _i2 = 0; _i2 < l + 1; _i2++) {
                // a. While the top of the stack is a value, do:
                // i. Pop the value from the stack
                var value = frame.values[frame.values.length - 1];

                if (typeof value === "undefined") {
                  break;
                }

                if (value.type !== "label") {
                  pop1();
                }
              } // b. Assert: due to validation, the top of the stack now is a label.
              // c. Pop the label from the stack.


              pop1OfType("label"); // 7. Push the values valn to the stack.

              pushResult(val); // 0 is the current frame, 1 is it's parent.

              stack = stack.slice(0, -(l + 1));
              framepointer -= l + 1; // execute childrens

              addEndInstruction(children);
              createAndExecuteChildStackFrame(children, {
                passCurrentContext: true
              });
              return {
                v: void 0
              };
            }();

            if (_typeof(_ret2) === "object") return _ret2.v;
          }

        case "br_if":
          {
            var _instruction$args2 = _toArray(instruction.args),
                _label3 = _instruction$args2[0],
                children = _instruction$args2.slice(1); // execute childrens


            addEndInstruction(children);
            createAndExecuteChildStackFrame(children, {
              passCurrentContext: true
            }); // 1. Assert: due to validation, a value of type i32 is on the top of the stack.
            // 2. Pop the value ci32.const c from the stack.

            var c = pop1OfType("i32");

            if (!c.value.eqz().isTrue()) {
              // 3. If c is non-zero, then
              // 3. a. Execute the instruction (br l).
              var _res = br(_label3);

              pushResult(_res);
            } else {// 4. Else:
              // 4. a. Do nothing.
            }

            break;
          }

        case "if":
          {
            if (instruction.test.length > 0) {
              createAndExecuteChildStackFrame(instruction.test);
            } // 1. Assert: due to validation, a value of value type i32 is on the top of the stack.
            // 2. Pop the value i32.const from the stack.


            var _c = pop1OfType("i32");

            if (_c.value.eqz().isTrue() === false) {
              /**
               * Execute consequent
               */
              createAndExecuteChildStackFrame(instruction.consequent);
            } else if (typeof instruction.alternate !== "undefined" && instruction.alternate.length > 0) {
              /**
               * Execute alternate
               */
              createAndExecuteChildStackFrame(instruction.alternate);
            }

            break;
          }

        /**
         * Administrative Instructions
         *
         * https://webassembly.github.io/spec/core/exec/runtime.html#administrative-instructions
         */

        case "unreachable": // https://webassembly.github.io/spec/core/exec/instructions.html#exec-unreachable

        case "trap":
          {
            // signalling abrupt termination
            // https://webassembly.github.io/spec/core/exec/runtime.html#syntax-trap
            throw createTrap();
          }

        case "local":
          {
            var _instruction$args3 = _slicedToArray(instruction.args, 1),
                valtype = _instruction$args3[0];

            var init = castIntoStackLocalOfType(valtype.name, 0);
            frame.locals.push(init);
            break;
          }

        /**
         * Memory Instructions
         *
         * https://webassembly.github.io/spec/core/exec/instructions.html#memory-instructions
         */

        case "get_local":
          {
            // https://webassembly.github.io/spec/core/exec/instructions.html#exec-get-local
            var _index = instruction.args[0];

            if (typeof _index === "undefined") {
              throw newRuntimeError("get_local requires one argument, none given.");
            }

            if (_index.type === "NumberLiteral" || _index.type === "FloatLiteral") {
              getLocalByIndex(_index.value);
            } else {
              throw newRuntimeError("get_local: unsupported index of type: " + _index.type);
            }

            break;
          }

        case "set_local":
          {
            // https://webassembly.github.io/spec/core/exec/instructions.html#exec-set-local
            var _index2 = instruction.args[0];
            var _init = instruction.args[1];

            if (typeof _init !== "undefined" && _init.type === "Instr") {
              // WAST
              var code = [_init];
              addEndInstruction(code);
              createAndExecuteChildStackFrame(code, {
                passCurrentContext: true
              });

              var _res2 = pop1();

              setLocalByIndex(_index2.value, _res2);
            } else if (_index2.type === "NumberLiteral") {
              // WASM
              // 4. Pop the value val from the stack
              var val = pop1(); // 5. Replace F.locals[x] with the value val

              setLocalByIndex(_index2.value, val);
            } else {
              throw newRuntimeError("set_local: unsupported index of type: " + _index2.type);
            }

            break;
          }

        case "tee_local":
          {
            // https://webassembly.github.io/spec/core/exec/instructions.html#exec-tee-local
            var _index3 = instruction.args[0];
            var _init2 = instruction.args[1];

            if (typeof _init2 !== "undefined" && _init2.type === "Instr") {
              // WAST
              var _code = [_init2];
              addEndInstruction(_code);
              createAndExecuteChildStackFrame(_code, {
                passCurrentContext: true
              });

              var _res3 = pop1();

              setLocalByIndex(_index3.value, _res3);
              pushResult(_res3);
            } else if (_index3.type === "NumberLiteral") {
              // WASM
              // 1. Assert: due to validation, a value is on the top of the stack.
              // 2. Pop the value val from the stack.
              var _val = pop1(); // 3. Push the value valval to the stack.


              pushResult(_val); // 4. Push the value valval to the stack.

              pushResult(_val); // 5. Execute the instruction (set_local x).
              // 5. 4. Pop the value val from the stack

              var val2 = pop1(); // 5. 5. Replace F.locals[x] with the value val

              setLocalByIndex(_index3.value, val2);
            } else {
              throw newRuntimeError("tee_local: unsupported index of type: " + _index3.type);
            }

            break;
          }

        case "set_global":
          {
            // https://webassembly.github.io/spec/core/exec/instructions.html#exec-set-global
            var _instruction$args4 = _slicedToArray(instruction.args, 2),
                _index4 = _instruction$args4[0],
                right = _instruction$args4[1]; // Interpret right branch first if it's a child instruction


            if (typeof right !== "undefined") {
              var _code2 = [right];
              addEndInstruction(_code2);
              createAndExecuteChildStackFrame(_code2, {
                passCurrentContext: true
              });
            } // 2. Assert: due to validation, F.module.globaladdrs[x] exists.


            var globaladdr = frame.originatingModule.globaladdrs[_index4.value];

            if (typeof globaladdr === "undefined") {
              throw newRuntimeError("Global address ".concat(_index4.value, " not found"));
            } // 4. Assert: due to validation, S.globals[a] exists.


            var globalinst = frame.allocator.get(globaladdr);

            if (_typeof(globalinst) !== "object") {
              throw newRuntimeError("Unexpected data for global at ".concat(globaladdr));
            } // 7. Pop the value val from the stack.


            var _val2 = pop1(); // 8. Replace glob.value with the value val.


            globalinst.value = _val2.value;
            frame.allocator.set(globaladdr, globalinst);
            break;
          }

        case "get_global":
          {
            // https://webassembly.github.io/spec/core/exec/instructions.html#exec-get-global
            var _index5 = instruction.args[0]; // 2. Assert: due to validation, F.module.globaladdrs[x] exists.

            var _globaladdr = frame.originatingModule.globaladdrs[_index5.value];

            if (typeof _globaladdr === "undefined") {
              throw newRuntimeError("Unknown global at index: ".concat(_index5.value));
            } // 4. Assert: due to validation, S.globals[a] exists.


            var _globalinst = frame.allocator.get(_globaladdr);

            if (_typeof(_globalinst) !== "object") {
              throw newRuntimeError("Unexpected data for global at ".concat(_globaladdr));
            } // 7. Pop the value val from the stack.


            pushResult(_globalinst);
            break;
          }

        case "return":
          {
            var _args = instruction.args;

            if (_args.length > 0) {
              addEndInstruction(_args);
              createAndExecuteChildStackFrame(_args, {
                passCurrentContext: true
              });
            } // Abort execution and return the first item on the stack


            returnRegister = [pop1()];
            return;
          }

        /**
         * Memory operations
         */
        // https://webassembly.github.io/spec/core/exec/instructions.html#exec-storen

        case "store":
        case "store8":
        case "store16":
        case "store32":
          {
            var id = instruction.id,
                object = instruction.object,
                _args2 = instruction.args; // Interpret children first
            // only WAST

            if (typeof _args2 !== "undefined" && _args2.length > 0) {
              addEndInstruction(_args2);
              createAndExecuteChildStackFrame(_args2, {
                passCurrentContext: true
              });
            }

            var memory = getMemory();

            var _pop = pop2("i32", object),
                _pop2 = _slicedToArray(_pop, 2),
                c1 = _pop2[0],
                c2 = _pop2[1];

            var ptr = c1.value.toNumber() + getMemoryOffset(instruction);
            var valueBuffer = c2.value.toByteArray();

            switch (id) {
              case "store8":
                valueBuffer = valueBuffer.slice(0, 1);
                break;

              case "store16":
                valueBuffer = valueBuffer.slice(0, 2);
                break;

              case "store32":
                valueBuffer = valueBuffer.slice(0, 4);
                break;
            }

            if (ptr + valueBuffer.length > memory.buffer.byteLength) {
              throw newRuntimeError("memory access out of bounds");
            }

            var memoryBuffer = new Uint8Array(memory.buffer); // load / store use little-endian order

            for (var ptrOffset = 0; ptrOffset < valueBuffer.length; ptrOffset++) {
              memoryBuffer[ptr + ptrOffset] = valueBuffer[ptrOffset];
            }

            break;
          }
        // https://webassembly.github.io/spec/core/exec/instructions.html#and

        case "load":
        case "load16_s":
        case "load16_u":
        case "load8_s":
        case "load8_u":
        case "load32_s":
        case "load32_u":
          {
            var _id = instruction.id,
                _object = instruction.object,
                _args3 = instruction.args; // Interpret children first
            // only WAST

            if (typeof _args3 !== "undefined" && _args3.length > 0) {
              addEndInstruction(_args3);
              createAndExecuteChildStackFrame(_args3, {
                passCurrentContext: true
              });
            }

            var _memory = getMemory();

            var _ptr = pop1OfType("i32").value.toNumber() + getMemoryOffset(instruction); // for i32 / i64 ops, handle extended load


            var extend = 0; // for i64 values, increase the bitshift by 4 bytes

            var extendOffset = _object === "i32" ? 0 : 32;
            var signed = false;

            switch (_id) {
              case "load16_s":
                extend = 16 + extendOffset;
                signed = true;
                break;

              case "load16_u":
                extend = 16 + extendOffset;
                signed = false;
                break;

              case "load8_s":
                extend = 24 + extendOffset;
                signed = true;
                break;

              case "load8_u":
                extend = 24 + extendOffset;
                signed = false;
                break;

              case "load32_u":
                extend = 0 + extendOffset;
                signed = false;
                break;

              case "load32_s":
                extend = 0 + extendOffset;
                signed = true;
                break;
            } // check for memory access out of bounds


            switch (_object) {
              case "i32":
              case "f32":
                if (_ptr + 4 > _memory.buffer.byteLength) {
                  throw newRuntimeError("memory access out of bounds");
                }

                break;

              case "i64":
              case "f64":
                if (_ptr + 8 > _memory.buffer.byteLength) {
                  throw newRuntimeError("memory access out of bounds");
                }

                break;
            }

            switch (_object) {
              case "i32":
              case "u32":
                pushResult(i32.createValueFromArrayBuffer(_memory.buffer, _ptr, extend, signed));
                break;

              case "i64":
                pushResult(i64.createValueFromArrayBuffer(_memory.buffer, _ptr, extend, signed));
                break;

              case "f32":
                pushResult(f32.createValueFromArrayBuffer(_memory.buffer, _ptr));
                break;

              case "f64":
                pushResult(f64.createValueFromArrayBuffer(_memory.buffer, _ptr));
                break;

              default:
                throw new _errors.RuntimeError("Unsupported " + _object + " load");
            }

            break;
          }

        /**
         * Binary operations
         */

        case "add":
        case "mul":
        case "sub":
        /**
         * There are two seperated operation for both signed and unsigned integer,
         * but since the host environment will handle that, we don't have too :)
         */

        case "div_s":
        case "div_u":
        case "rem_s":
        case "rem_u":
        case "shl":
        case "shr_s":
        case "shr_u":
        case "rotl":
        case "rotr":
        case "div":
        case "min":
        case "max":
        case "copysign":
        case "or":
        case "xor":
        case "and":
        case "eq":
        case "ne":
        case "lt_s":
        case "lt_u":
        case "le_s":
        case "le_u":
        case "gt":
        case "gt_s":
        case "gt_u":
        case "ge_s":
        case "ge_u":
          {
            var binopFn = void 0;

            switch (instruction.object) {
              case "i32":
                binopFn = binopi32;
                break;

              case "i64":
                binopFn = binopi64;
                break;

              case "f32":
                binopFn = binopf32;
                break;

              case "f64":
                binopFn = binopf64;
                break;

              default:
                throw createTrap("Unsupported operation " + instruction.id + " on " + instruction.object);
            }

            var _instruction$args5 = _slicedToArray(instruction.args, 2),
                left = _instruction$args5[0],
                _right = _instruction$args5[1]; // Interpret left branch first if it's a child instruction


            if (typeof left !== "undefined") {
              var _code3 = [left];
              addEndInstruction(_code3);
              createAndExecuteChildStackFrame(_code3, {
                passCurrentContext: true
              });
            } // Interpret right branch first if it's a child instruction


            if (typeof _right !== "undefined") {
              var _code4 = [_right];
              addEndInstruction(_code4);
              createAndExecuteChildStackFrame(_code4, {
                passCurrentContext: true
              });
            }

            var _pop3 = pop2(instruction.object, instruction.object),
                _pop4 = _slicedToArray(_pop3, 2),
                _c2 = _pop4[0],
                _c3 = _pop4[1];

            pushResult(binopFn(_c2, _c3, instruction.id));
            break;
          }

        /**
         * Unary operations
         */

        case "abs":
        case "neg":
        case "clz":
        case "ctz":
        case "popcnt":
        case "eqz":
        case "reinterpret/f32":
        case "reinterpret/f64":
          {
            var unopFn = void 0; // for conversion operations, the operand type appears after the forward-slash
            // e.g. with i32.reinterpret/f32, the oprand is f32, and the resultant is i32

            var opType = instruction.id.indexOf("/") !== -1 ? instruction.id.split("/")[1] : instruction.object;

            switch (opType) {
              case "i32":
                unopFn = unopi32;
                break;

              case "i64":
                unopFn = unopi64;
                break;

              case "f32":
                unopFn = unopf32;
                break;

              case "f64":
                unopFn = unopf64;
                break;

              default:
                throw createTrap("Unsupported operation " + instruction.id + " on " + opType);
            }

            var _instruction$args6 = _slicedToArray(instruction.args, 1),
                operand = _instruction$args6[0]; // Interpret argument first if it's a child instruction


            if (typeof operand !== "undefined") {
              var _code5 = [operand];
              addEndInstruction(_code5);
              createAndExecuteChildStackFrame(_code5, {
                passCurrentContext: true
              });
            }

            var _c4 = pop1OfType(opType);

            pushResult(unopFn(_c4, instruction.id));
            break;
          }

        case "end":
          {
            // Pop active frame from the stack
            stack.pop();
            framepointer--; // Return the item on top of the values/stack;

            if (frame.values.length > 0) {
              var _res4 = pop1();

              if (_res4.type !== "label") {
                returnRegister = [_res4];
              } else {
                // Push label back
                pushResult(_res4);
              }
            }

            return;
          }
      }
    }
  }

  run();

  if (returnRegister !== null) {
    // FIXME(sven): handle multiple results in hostfunc
    return returnRegister[0];
  }
}
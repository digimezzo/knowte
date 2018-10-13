"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.createHostfunc = createHostfunc;
exports.executeStackFrameAndGetResult = executeStackFrameAndGetResult;

var _errors = require("../errors");

var t = require("@webassemblyjs/ast");

var _require = require("./runtime/castIntoStackLocalOfType"),
    castIntoStackLocalOfType = _require.castIntoStackLocalOfType;

var _require2 = require("./kernel/exec"),
    executeStackFrame = _require2.executeStackFrame;

var _require3 = require("./kernel/stackframe"),
    createStackFrame = _require3.createStackFrame;

var label = require("./runtime/values/label");

var _require4 = require("./kernel/signals"),
    ExecutionHasBeenTrapped = _require4.ExecutionHasBeenTrapped;

function createHostfunc(moduleinst, exportinst, allocator, _ref) {
  var checkForI64InSignature = _ref.checkForI64InSignature,
      returnStackLocal = _ref.returnStackLocal;
  return function hostfunc() {
    var exportinstAddr = exportinst.value.addr;
    /**
     * Find callable in instantiated function in the module funcaddrs
     */

    var hasModuleInstantiatedFunc = moduleinst.funcaddrs.indexOf(exportinstAddr);

    if (hasModuleInstantiatedFunc === -1) {
      throw new _errors.RuntimeError("Function at addr ".concat(exportinstAddr.index, " has not been initialized in the module.") + "Probably an internal failure");
    }

    var funcinst = allocator.get(exportinstAddr);

    if (funcinst === null) {
      throw new _errors.RuntimeError("Function was not found at addr ".concat(exportinstAddr.index));
    }

    var funcinstArgs = funcinst.type[0];

    if (checkForI64InSignature === true) {
      var funcinstResults = funcinst.type[1];
      /**
       * If the signature contains an i64 (as argument or result), the host
       * function immediately throws a TypeError when called.
       */

      var funcinstArgsHasi64 = funcinstArgs.indexOf("i64") !== -1;
      var funcinstResultsHasi64 = funcinstResults.indexOf("i64") !== -1;

      if (funcinstArgsHasi64 === true || funcinstResultsHasi64 === true) {
        throw new TypeError("Can not call this function from JavaScript: " + "i64 in signature.");
      }
    }
    /**
     * Check number of argument passed vs the function arity
     */


    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    if (args.length !== funcinstArgs.length) {
      throw new _errors.RuntimeError("Function ".concat(exportinstAddr.index, " called with ").concat(args.length, " arguments but ") + funcinst.type[0].length + " expected");
    }

    var argsWithType = args.map(function (value, i) {
      return castIntoStackLocalOfType(funcinstArgs[i], value);
    });
    var stackFrame = createStackFrame(funcinst.code, argsWithType, funcinst.module, allocator); // 2. Enter the block instr∗ with label

    stackFrame.values.push(label.createValue(exportinst.name));
    stackFrame.labels.push({
      value: funcinst,
      arity: funcinstArgs.length,
      id: t.identifier(exportinst.name)
    }); // function trace(depth, pc, i, frame) {
    //   function ident() {
    //     let out = "";
    //     for (let i = 0; i < depth; i++) {
    //       out += "\t|";
    //     }
    //     return out;
    //   }
    //   console.log(
    //     ident(),
    //     `-------------- pc: ${pc} - depth: ${depth} --------------`
    //   );
    //   console.log(ident(), "instruction:", i.id);
    //   console.log(ident(), "locals:");
    //   frame.locals.forEach((stackLocal: StackLocal) => {
    //     console.log(
    //       ident(),
    //       `\t- type: ${stackLocal.type}, value: ${stackLocal.value}`
    //     );
    //   });
    //   console.log(ident(), "values:");
    //   frame.values.forEach((stackLocal: StackLocal) => {
    //     console.log(
    //       ident(),
    //       `\t- type: ${stackLocal.type}, value: ${stackLocal.value}`
    //     );
    //   });
    //   console.log(ident(), "");
    //   console.log(ident(), "labels:");
    //   frame.labels.forEach((label, k) => {
    //     let value = "unknown";
    //     if (label.id != null) {
    //       value = label.id.value;
    //     }
    //     console.log(ident(), `\t- ${k} id: ${value}`);
    //   });
    //   console.log(
    //     ident(),
    //     "--------------------------------------------------\n"
    //   );
    // }
    // stackFrame.trace = trace;

    return executeStackFrameAndGetResult(stackFrame, returnStackLocal);
  };
}

function executeStackFrameAndGetResult(stackFrame, returnStackLocal) {
  try {
    var res = executeStackFrame(stackFrame);

    if (returnStackLocal === true) {
      return res;
    }

    if (res != null && res.value != null) {
      return res.value.toNumber();
    }
  } catch (e) {
    if (e instanceof ExecutionHasBeenTrapped) {
      throw e;
    } else {
      var err = new _errors.RuntimeError(e.message);
      err.stack = e.stack;
      throw err;
    }
  }
}
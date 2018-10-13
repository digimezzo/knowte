"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Instance = void 0;

var _ast = require("@webassemblyjs/ast");

var _module = require("../compiler/compile/module");

var _errors = require("../errors");

var _hostFunc = require("./host-func");

function _sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"] != null) _i["return"](); } finally { if (_d) throw _e; } } return _arr; }

function _slicedToArray(arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return _sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }

function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

var modulevalue = require("./runtime/values/module");

var _require = require("./kernel/memory"),
    createAllocator = _require.createAllocator;

var importObjectUtils = require("./import-object");

var _require2 = require("./kernel/stackframe"),
    createStackFrame = _require2.createStackFrame;

var Instance =
/*#__PURE__*/
function () {
  /**
   * Map id to external elements or callable functions
   */
  function Instance(module, importObject) {
    var _this = this;

    _classCallCheck(this, Instance);

    if (module instanceof _module.Module === false) {
      throw new TypeError("module must be of type WebAssembly.Module, " + _typeof(module) + " given.");
    }

    this._externalElements = {};
    this.exports = {};
    /**
     * Create Module's default memory allocator
     */

    this._allocator = createAllocator();
    /**
     * Pass internal options
     */

    var internalInstanceOptions = {
      checkForI64InSignature: true,
      returnStackLocal: false
    };

    if (_typeof(importObject._internalInstanceOptions) === "object") {
      internalInstanceOptions = importObject._internalInstanceOptions;
    }
    /**
     * importObject.
     */


    if (_typeof(importObject) === "object") {
      importObjectUtils.walk(importObject, function (key, key2, value) {
        if (_typeof(_this._externalElements[key]) !== "object") {
          _this._externalElements[key] = {};
        }

        _this._externalElements[key][key2] = value;
      });
    }

    var moduleNode = getModuleFromProgram(module._ast);

    if (moduleNode === null) {
      throw new _errors.RuntimeError("Module not found");
    }

    var moduleInstance = modulevalue.createInstance(this._allocator, // $FlowIgnore: that's the correct type but Flow fails to get it
    moduleNode, this._externalElements);
    moduleInstance.exports.forEach(function (exportinst) {
      if (exportinst.value.type === "Func") {
        _this.exports[exportinst.name] = (0, _hostFunc.createHostfunc)(moduleInstance, exportinst, _this._allocator, internalInstanceOptions);
      }

      if (exportinst.value.type === "Global") {
        var globalinst = _this._allocator.get(exportinst.value.addr);

        if (globalinst == null) {
          throw new _errors.RuntimeError("Global instance has not been instantiated");
        }

        if (internalInstanceOptions.returnStackLocal === true) {
          _this.exports[exportinst.name] = globalinst;
        } else {
          _this.exports[exportinst.name] = globalinst.value.toNumber();
        }
      }

      if (exportinst.value.type === "Memory") {
        var memoryinst = _this._allocator.get(exportinst.value.addr);

        if (memoryinst == null) {
          throw new _errors.RuntimeError("Memory instance has not been instantiated");
        }

        _this.exports[exportinst.name] = memoryinst;
      }
    });
    this._moduleInstance = moduleInstance;

    if (module._start != null && module._start.type === "NumberLiteral") {
      // $FlowIgnore: the NumberLiteral type ensure that the value is present
      var value = module._start.value;
      this.executeStartFunc(value);
    }
  }

  _createClass(Instance, [{
    key: "executeStartFunc",
    value: function executeStartFunc(value) {
      var funcinstAddr = this._moduleInstance.funcaddrs[value];

      if (typeof funcinstAddr === "undefined") {
        throw new _errors.RuntimeError("Start function not found, index: " + value);
      }

      var funcinst = this._allocator.get(funcinstAddr); // The type of C.funcs[x] must be []→[].


      var _funcinst$type = _slicedToArray(funcinst.type, 2),
          params = _funcinst$type[0],
          results = _funcinst$type[1];

      if (params.length !== 0 || results.length !== 0) {
        throw new _errors.RuntimeError("Start function can not have arguments or results");
      }

      var stackFrame = createStackFrame(funcinst.code, params, funcinst.module, this._allocator); // Ignore the result

      (0, _hostFunc.executeStackFrameAndGetResult)(stackFrame,
      /* returnStackLocal */
      true);
    }
  }]);

  return Instance;
}();

exports.Instance = Instance;

function getModuleFromProgram(ast) {
  var module = null;
  (0, _ast.traverse)(ast, {
    Module: function Module(_ref) {
      var node = _ref.node;
      module = node;
    }
  });
  return module;
}
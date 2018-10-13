"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.createCompiledModule = createCompiledModule;
exports.Module = void 0;

var _wastIdentifierToIndex = require("@webassemblyjs/ast/lib/transform/wast-identifier-to-index");

var _denormalizeTypeReferences = require("@webassemblyjs/ast/lib/transform/denormalize-type-references");

var _validation = _interopRequireDefault(require("@webassemblyjs/validation"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var t = require("@webassemblyjs/ast");

var _require = require("../../errors"),
    CompileError = _require.CompileError;

var Module = function Module(ast, exports, imports, start) {
  _classCallCheck(this, Module);

  this._ast = ast;
  this._start = start;
  this.exports = exports;
  this.imports = imports;
};

exports.Module = Module;

function createCompiledModule(ast) {
  var exports = [];
  var imports = [];
  var start; // Do compile-time ast manipulation in order to remove WAST
  // semantics during execution

  (0, _denormalizeTypeReferences.transform)(ast);
  (0, _wastIdentifierToIndex.transform)(ast);
  (0, _validation.default)(ast);
  t.traverse(ast, {
    ModuleExport: function (_ModuleExport) {
      function ModuleExport(_x) {
        return _ModuleExport.apply(this, arguments);
      }

      ModuleExport.toString = function () {
        return _ModuleExport.toString();
      };

      return ModuleExport;
    }(function (_ref) {
      var node = _ref.node;

      if (node.descr.exportType === "Func") {
        exports.push({
          name: node.name,
          kind: "function"
        });
      }
    }),
    Start: function (_Start) {
      function Start(_x2) {
        return _Start.apply(this, arguments);
      }

      Start.toString = function () {
        return _Start.toString();
      };

      return Start;
    }(function (_ref2) {
      var node = _ref2.node;

      if (typeof start !== "undefined") {
        throw new CompileError("Multiple start functions is not allowed");
      }

      start = node.index;
    })
  });
  /**
   * Adds missing end instructions
   */

  t.traverse(ast, {
    Func: function (_Func) {
      function Func(_x3) {
        return _Func.apply(this, arguments);
      }

      Func.toString = function () {
        return _Func.toString();
      };

      return Func;
    }(function (_ref3) {
      var node = _ref3.node;
      node.body.push(t.instruction("end"));
    }),
    Global: function (_Global) {
      function Global(_x4) {
        return _Global.apply(this, arguments);
      }

      Global.toString = function () {
        return _Global.toString();
      };

      return Global;
    }(function (_ref4) {
      var node = _ref4.node;
      node.init.push(t.instruction("end"));
    }),
    IfInstruction: function (_IfInstruction) {
      function IfInstruction(_x5) {
        return _IfInstruction.apply(this, arguments);
      }

      IfInstruction.toString = function () {
        return _IfInstruction.toString();
      };

      return IfInstruction;
    }(function (_ref5) {
      var node = _ref5.node;
      node.test.push(t.instruction("end"));
      node.consequent.push(t.instruction("end"));
      node.alternate.push(t.instruction("end"));
    }),
    BlockInstruction: function (_BlockInstruction) {
      function BlockInstruction(_x6) {
        return _BlockInstruction.apply(this, arguments);
      }

      BlockInstruction.toString = function () {
        return _BlockInstruction.toString();
      };

      return BlockInstruction;
    }(function (_ref6) {
      var node = _ref6.node;
      node.instr.push(t.instruction("end"));
    }),
    LoopInstruction: function (_LoopInstruction) {
      function LoopInstruction(_x7) {
        return _LoopInstruction.apply(this, arguments);
      }

      LoopInstruction.toString = function () {
        return _LoopInstruction.toString();
      };

      return LoopInstruction;
    }(function (_ref7) {
      var node = _ref7.node;
      node.instr.push(t.instruction("end"));
    })
  });
  return new Module(ast, exports, imports, start);
}
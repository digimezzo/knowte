"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.createInstance = createInstance;

var _ast = require("@webassemblyjs/ast");

var WebAssemblyMemory = _interopRequireWildcard(require("./memory"));

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {}; if (desc.get || desc.set) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj.default = obj; return newObj; } }

function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

var _require = require("../../../errors"),
    RuntimeError = _require.RuntimeError,
    LinkError = _require.LinkError,
    CompileError = _require.CompileError;

var WebAssemblyTable = require("./table");

var func = require("./func");

var externvalue = require("./extern");

var global = require("./global");

var _require2 = require("./i32"),
    i32 = _require2.i32;
/**
 * Create Module's import instances
 *
 * > the indices of imports go before the first index of any definition
 * > contained in the module itself.
 * see https://webassembly.github.io/spec/core/syntax/modules.html#imports
 */


function instantiateImports(n, allocator, externalElements, internals, moduleInstance) {
  function getExternalElementOrThrow(key, key2) {
    if (typeof externalElements[key] === "undefined" || typeof externalElements[key][key2] === "undefined") {
      throw new CompileError("Unknown import ".concat(key, ".").concat(key2));
    }

    return externalElements[key][key2];
  }

  function handleFuncImport(node, descr) {
    var element = getExternalElementOrThrow(node.module, node.name);
    var params = descr.signature.params != null ? descr.signature.params : [];
    var results = descr.signature.results != null ? descr.signature.results : [];
    var externFuncinstance = externvalue.createFuncInstance(element, // $FlowIgnore
    params, results);
    var externFuncinstanceAddr = allocator.malloc(1
    /* sizeof externFuncinstance */
    );
    allocator.set(externFuncinstanceAddr, externFuncinstance);
    moduleInstance.funcaddrs.push(externFuncinstanceAddr);
  }

  function handleGlobalImport(node, descr) {
    // Validation: The mutability of globaltype must be const.
    if (descr.mutability === "var") {
      throw new CompileError("Mutable globals cannot be imported");
    }

    var element = getExternalElementOrThrow(node.module, node.name);
    var externglobalinstance = externvalue.createGlobalInstance(new i32(element), descr.valtype, descr.mutability);
    var addr = allocator.malloc(1
    /* size of the globalinstance struct */
    );
    allocator.set(addr, externglobalinstance);
    moduleInstance.globaladdrs.push(addr);
  }

  function handleMemoryImport(node) {
    var memoryinstance = getExternalElementOrThrow(node.module, node.name);
    var addr = allocator.malloc(1
    /* size of the memoryinstance struct */
    );
    allocator.set(addr, memoryinstance);
    moduleInstance.memaddrs.push(addr);
  }

  function handleTableImport(node) {
    var tableinstance = getExternalElementOrThrow(node.module, node.name);
    var addr = allocator.malloc(1
    /* size of the tableinstance struct */
    );
    allocator.set(addr, tableinstance);
    moduleInstance.tableaddrs.push(addr);
  }

  (0, _ast.traverse)(n, {
    ModuleImport: function (_ModuleImport) {
      function ModuleImport(_x) {
        return _ModuleImport.apply(this, arguments);
      }

      ModuleImport.toString = function () {
        return _ModuleImport.toString();
      };

      return ModuleImport;
    }(function (_ref) {
      var node = _ref.node;

      switch (node.descr.type) {
        case "FuncImportDescr":
          return handleFuncImport(node, node.descr);

        case "GlobalType":
          return handleGlobalImport(node, node.descr);

        case "Memory":
          return handleMemoryImport(node);

        case "Table":
          return handleTableImport(node);

        default:
          throw new Error("Unsupported import of type: " + node.descr.type);
      }
    })
  });
}
/**
 * write data segments to linear memory
 */


function instantiateDataSections(n, allocator, moduleInstance) {
  (0, _ast.traverse)(n, {
    Data: function (_Data) {
      function Data(_x2) {
        return _Data.apply(this, arguments);
      }

      Data.toString = function () {
        return _Data.toString();
      };

      return Data;
    }(function (_ref2) {
      var node = _ref2.node;
      var memIndex = node.memoryIndex.value;
      var memoryAddr = moduleInstance.memaddrs[memIndex];
      var memory = allocator.get(memoryAddr);
      var buffer = new Uint8Array(memory.buffer);
      var offset;

      if (node.offset.id === "const") {
        var offsetInstruction = node.offset;
        var arg = offsetInstruction.args[0];
        offset = arg.value;
      } else if (node.offset.id === "get_global") {
        var _offsetInstruction = node.offset;
        var globalIndex = _offsetInstruction.args[0].value;
        var globalAddr = moduleInstance.globaladdrs[globalIndex];
        var globalInstance = allocator.get(globalAddr);
        offset = globalInstance.value.toNumber();
      } else {
        throw new RuntimeError("data segment offsets can only be specified as constants or globals");
      }

      for (var i = 0; i < node.init.values.length; i++) {
        buffer[i + offset] = node.init.values[i];
      }
    })
  });
}
/**
 * Create Module's internal elements instances
 */


function instantiateInternals(n, allocator, internals, moduleInstance) {
  (0, _ast.traverse)(n, {
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

      // Only instantiate/allocate our own functions
      if (node.isExternal === true) {
        return;
      }

      var funcinstance = func.createInstance(node, moduleInstance);
      var addr = allocator.malloc(1
      /* size of the funcinstance struct */
      );
      allocator.set(addr, funcinstance);
      moduleInstance.funcaddrs.push(addr);

      if (node.name != null) {
        if (node.name.type === "Identifier") {
          internals.instantiatedFuncs[node.name.value] = {
            addr: addr
          };
        }
      }
    }),
    Table: function (_Table) {
      function Table(_x4) {
        return _Table.apply(this, arguments);
      }

      Table.toString = function () {
        return _Table.toString();
      };

      return Table;
    }(function (_ref4) {
      var node = _ref4.node;
      var initial = node.limits.min;
      var element = node.elementType;
      var tableinstance = new WebAssemblyTable.Table({
        initial: initial,
        element: element
      });
      var addr = allocator.malloc(1
      /* size of the tableinstance struct */
      );
      allocator.set(addr, tableinstance);
      moduleInstance.tableaddrs.push(addr);

      if (node.name != null) {
        if (node.name.type === "Identifier") {
          internals.instantiatedTables[node.name.value] = {
            addr: addr
          };
        }
      }
    }),
    Elem: function (_Elem) {
      function Elem(_x5) {
        return _Elem.apply(this, arguments);
      }

      Elem.toString = function () {
        return _Elem.toString();
      };

      return Elem;
    }(function (_ref5) {
      var node = _ref5.node;
      var table;

      if (node.table.type === "NumberLiteral") {
        var addr = moduleInstance.tableaddrs[node.table.value];
        table = allocator.get(addr);
      }

      if (_typeof(table) === "object") {
        // FIXME(sven): expose the function in a HostFunc
        table.push(function () {
          throw new Error("Unsupported operation");
        });
      } else {
        throw new CompileError("Unknown table");
      }
    }),
    Memory: function (_Memory) {
      function Memory(_x6) {
        return _Memory.apply(this, arguments);
      }

      Memory.toString = function () {
        return _Memory.toString();
      };

      return Memory;
    }(function (_ref6) {
      var node = _ref6.node;

      // Module has already a memory instance (likely imported), skip this.
      if (moduleInstance.memaddrs.length !== 0) {
        return;
      }

      var _node$limits = node.limits,
          min = _node$limits.min,
          max = _node$limits.max;
      var memoryDescriptor = {
        initial: min
      };

      if (typeof max === "number") {
        memoryDescriptor.maximum = max;
      }

      var memoryinstance = new WebAssemblyMemory.Memory(memoryDescriptor);
      var addr = allocator.malloc(1
      /* size of the memoryinstance struct */
      );
      allocator.set(addr, memoryinstance);
      moduleInstance.memaddrs.push(addr);

      if (node.id != null) {
        if (node.id.type === "Identifier") {
          // $FlowIgnore
          internals.instantiatedMemories[node.id.value] = {
            addr: addr
          };
        }
      }
    }),
    Global: function (_Global) {
      function Global(_x7) {
        return _Global.apply(this, arguments);
      }

      Global.toString = function () {
        return _Global.toString();
      };

      return Global;
    }(function (_ref7) {
      var node = _ref7.node;
      var globalinstance = global.createInstance(allocator, node);
      var addr = allocator.malloc(1
      /* size of the globalinstance struct */
      );
      allocator.set(addr, globalinstance);
      moduleInstance.globaladdrs.push(addr);

      if (node.name != null) {
        if (node.name.type === "Identifier") {
          internals.instantiatedGlobals[node.name.value] = {
            addr: addr,
            type: node.globalType
          };
        }
      }
    })
  });
}
/**
 * Create Module's exports instances
 *
 * The `internals` argument reference already instantiated elements
 */


function instantiateExports(n, allocator, internals, moduleInstance) {
  function assertNotAlreadyExported(str) {
    var moduleInstanceExport = moduleInstance.exports.find(function (_ref8) {
      var name = _ref8.name;
      return name === str;
    });

    if (moduleInstanceExport !== undefined) {
      throw new CompileError("Duplicate export name");
    }
  }

  function createModuleExport(node, instantiatedItemArray, validate) {
    if (node.descr.id.type === "Identifier") {
      var instantiatedItem = instantiatedItemArray[node.descr.id.value];
      validate(instantiatedItem);
      assertNotAlreadyExported(node.name);
      moduleInstance.exports.push({
        name: node.name,
        value: {
          type: node.descr.exportType,
          addr: instantiatedItem.addr
        }
      });
    } else {
      throw new CompileError("Module exports must be referenced via an Identifier");
    }
  }

  (0, _ast.traverse)(n, {
    ModuleExport: function (_ModuleExport) {
      function ModuleExport(_x8) {
        return _ModuleExport.apply(this, arguments);
      }

      ModuleExport.toString = function () {
        return _ModuleExport.toString();
      };

      return ModuleExport;
    }(function (_ref9) {
      var node = _ref9.node;

      switch (node.descr.exportType) {
        case "Func":
          {
            createModuleExport(node, internals.instantiatedFuncs, function (instantiatedFunc) {
              if (typeof instantiatedFunc === "undefined") {
                throw new Error("unknown function");
              }
            });
            break;
          }

        case "Global":
          {
            createModuleExport(node, internals.instantiatedGlobals, function (instantiatedGlobal) {
              if (typeof instantiatedGlobal === "undefined") {
                throw new Error("unknown global");
              } else if (instantiatedGlobal.type.mutability === "var") {
                throw new CompileError("Mutable globals cannot be exported");
              } else if (instantiatedGlobal.type.valtype === "i64") {
                throw new LinkError("Export of globals of type i64 is not allowed");
              }
            });
            break;
          }

        case "Table":
          {
            createModuleExport(node, internals.instantiatedTables, function (instantiatedTable) {
              if (typeof instantiatedTable === "undefined") {
                throw new Error("unknown table");
              }
            });
            break;
          }

        case "Memory":
          {
            createModuleExport(node, internals.instantiatedMemories, function (instantiatedMemory) {
              if (typeof instantiatedMemory === "undefined") {
                throw new Error("unknown memory");
              }
            });
            break;
          }
      }
    })
  });
}

function createInstance(allocator, n) {
  var externalElements = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
  // Keep a ref to the module instance
  var moduleInstance = {
    types: [],
    funcaddrs: [],
    tableaddrs: [],
    memaddrs: [],
    globaladdrs: [],
    exports: []
  };
  /**
   * Keep the function that were instantiated and re-use their addr in
   * the export wrapper
   */

  var instantiatedInternals = {
    instantiatedFuncs: {},
    instantiatedGlobals: {},
    instantiatedTables: {},
    instantiatedMemories: {}
  };
  instantiateImports(n, allocator, externalElements, instantiatedInternals, moduleInstance);
  instantiateInternals(n, allocator, instantiatedInternals, moduleInstance);
  instantiateDataSections(n, allocator, moduleInstance);
  instantiateExports(n, allocator, instantiatedInternals, moduleInstance);
  return moduleInstance;
}
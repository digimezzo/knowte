"use strict";

var _errors = require("../../../errors");

function createInstance(n, fromModule) {
  //       [param*, result*]
  var type = [[], []];

  if (n.signature.type !== "Signature") {
    throw new _errors.RuntimeError("Function signatures must be denormalised before execution");
  }

  var signature = n.signature;
  signature.params.forEach(function (param) {
    type[0].push(param.valtype);
  });
  signature.results.forEach(function (result) {
    type[1].push(result);
  });
  var code = n.body;
  return {
    type: type,
    code: code,
    module: fromModule,
    isExternal: false
  };
}

module.exports = {
  createInstance: createInstance
};
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.createTrap = createTrap;
exports.ExecutionHasBeenTrapped = void 0;

function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === "object" || typeof call === "function")) { return call; } if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var ExecutionHasBeenTrapped =
/*#__PURE__*/
function (_Error) {
  _inherits(ExecutionHasBeenTrapped, _Error);

  function ExecutionHasBeenTrapped() {
    _classCallCheck(this, ExecutionHasBeenTrapped);

    return _possibleConstructorReturn(this, (ExecutionHasBeenTrapped.__proto__ || Object.getPrototypeOf(ExecutionHasBeenTrapped)).apply(this, arguments));
  }

  return ExecutionHasBeenTrapped;
}(Error);
/**
 * Trap: signalling abrupt termination
 * https://webassembly.github.io/spec/core/exec/runtime.html#syntax-trap
 *
 * It triggered using the `trap` instruction
 */


exports.ExecutionHasBeenTrapped = ExecutionHasBeenTrapped;

function createTrap() {
  var reason = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : "Execution has been trapped";
  return new ExecutionHasBeenTrapped(reason);
}
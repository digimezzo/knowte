/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes} checked by tsc
 */

const /** @type {?} */ MAC_ENTER = 3;
const /** @type {?} */ BACKSPACE = 8;
const /** @type {?} */ TAB = 9;
const /** @type {?} */ NUM_CENTER = 12;
const /** @type {?} */ ENTER = 13;
const /** @type {?} */ SHIFT = 16;
const /** @type {?} */ CONTROL = 17;
const /** @type {?} */ ALT = 18;
const /** @type {?} */ PAUSE = 19;
const /** @type {?} */ CAPS_LOCK = 20;
const /** @type {?} */ ESCAPE = 27;
const /** @type {?} */ SPACE = 32;
const /** @type {?} */ PAGE_UP = 33;
const /** @type {?} */ PAGE_DOWN = 34;
const /** @type {?} */ END = 35;
const /** @type {?} */ HOME = 36;
const /** @type {?} */ LEFT_ARROW = 37;
const /** @type {?} */ UP_ARROW = 38;
const /** @type {?} */ RIGHT_ARROW = 39;
const /** @type {?} */ DOWN_ARROW = 40;
const /** @type {?} */ PLUS_SIGN = 43;
const /** @type {?} */ PRINT_SCREEN = 44;
const /** @type {?} */ INSERT = 45;
const /** @type {?} */ DELETE = 46;
const /** @type {?} */ ZERO = 48;
const /** @type {?} */ ONE = 49;
const /** @type {?} */ TWO = 50;
const /** @type {?} */ THREE = 51;
const /** @type {?} */ FOUR = 52;
const /** @type {?} */ FIVE = 53;
const /** @type {?} */ SIX = 54;
const /** @type {?} */ SEVEN = 55;
const /** @type {?} */ EIGHT = 56;
const /** @type {?} */ NINE = 57;
const /** @type {?} */ FF_SEMICOLON = 59; // Firefox (Gecko) fires this for semicolon instead of 186
const /** @type {?} */ FF_EQUALS = 61; // Firefox (Gecko) fires this for equals instead of 187
const /** @type {?} */ QUESTION_MARK = 63;
const /** @type {?} */ AT_SIGN = 64;
const /** @type {?} */ A = 65;
const /** @type {?} */ B = 66;
const /** @type {?} */ C = 67;
const /** @type {?} */ D = 68;
const /** @type {?} */ E = 69;
const /** @type {?} */ F = 70;
const /** @type {?} */ G = 71;
const /** @type {?} */ H = 72;
const /** @type {?} */ I = 73;
const /** @type {?} */ J = 74;
const /** @type {?} */ K = 75;
const /** @type {?} */ L = 76;
const /** @type {?} */ M = 77;
const /** @type {?} */ N = 78;
const /** @type {?} */ O = 79;
const /** @type {?} */ P = 80;
const /** @type {?} */ Q = 81;
const /** @type {?} */ R = 82;
const /** @type {?} */ S = 83;
const /** @type {?} */ T = 84;
const /** @type {?} */ U = 85;
const /** @type {?} */ V = 86;
const /** @type {?} */ W = 87;
const /** @type {?} */ X = 88;
const /** @type {?} */ Y = 89;
const /** @type {?} */ Z = 90;
const /** @type {?} */ META = 91; // WIN_KEY_LEFT
const /** @type {?} */ MAC_WK_CMD_LEFT = 91;
const /** @type {?} */ MAC_WK_CMD_RIGHT = 93;
const /** @type {?} */ CONTEXT_MENU = 93;
const /** @type {?} */ NUMPAD_ZERO = 96;
const /** @type {?} */ NUMPAD_ONE = 97;
const /** @type {?} */ NUMPAD_TWO = 98;
const /** @type {?} */ NUMPAD_THREE = 99;
const /** @type {?} */ NUMPAD_FOUR = 100;
const /** @type {?} */ NUMPAD_FIVE = 101;
const /** @type {?} */ NUMPAD_SIX = 102;
const /** @type {?} */ NUMPAD_SEVEN = 103;
const /** @type {?} */ NUMPAD_EIGHT = 104;
const /** @type {?} */ NUMPAD_NINE = 105;
const /** @type {?} */ NUMPAD_MULTIPLY = 106;
const /** @type {?} */ NUMPAD_PLUS = 107;
const /** @type {?} */ NUMPAD_MINUS = 109;
const /** @type {?} */ NUMPAD_PERIOD = 110;
const /** @type {?} */ NUMPAD_DIVIDE = 111;
const /** @type {?} */ F1 = 112;
const /** @type {?} */ F2 = 113;
const /** @type {?} */ F3 = 114;
const /** @type {?} */ F4 = 115;
const /** @type {?} */ F5 = 116;
const /** @type {?} */ F6 = 117;
const /** @type {?} */ F7 = 118;
const /** @type {?} */ F8 = 119;
const /** @type {?} */ F9 = 120;
const /** @type {?} */ F10 = 121;
const /** @type {?} */ F11 = 122;
const /** @type {?} */ F12 = 123;
const /** @type {?} */ NUM_LOCK = 144;
const /** @type {?} */ SCROLL_LOCK = 145;
const /** @type {?} */ FIRST_MEDIA = 166;
const /** @type {?} */ FF_MINUS = 173;
const /** @type {?} */ MUTE = 173; // Firefox (Gecko) fires 181 for MUTE
const /** @type {?} */ VOLUME_DOWN = 174; // Firefox (Gecko) fires 182 for VOLUME_DOWN
const /** @type {?} */ VOLUME_UP = 175; // Firefox (Gecko) fires 183 for VOLUME_UP
const /** @type {?} */ FF_MUTE = 181;
const /** @type {?} */ FF_VOLUME_DOWN = 182;
const /** @type {?} */ LAST_MEDIA = 183;
const /** @type {?} */ FF_VOLUME_UP = 183;
const /** @type {?} */ SEMICOLON = 186; // Firefox (Gecko) fires 59 for SEMICOLON
const /** @type {?} */ EQUALS = 187; // Firefox (Gecko) fires 61 for EQUALS
const /** @type {?} */ COMMA = 188;
const /** @type {?} */ DASH = 189; // Firefox (Gecko) fires 173 for DASH/MINUS
const /** @type {?} */ SLASH = 191;
const /** @type {?} */ APOSTROPHE = 192;
const /** @type {?} */ TILDE = 192;
const /** @type {?} */ OPEN_SQUARE_BRACKET = 219;
const /** @type {?} */ BACKSLASH = 220;
const /** @type {?} */ CLOSE_SQUARE_BRACKET = 221;
const /** @type {?} */ SINGLE_QUOTE = 222;
const /** @type {?} */ MAC_META = 224;

/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes} checked by tsc
 */

/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes} checked by tsc
 */

export { MAC_ENTER, BACKSPACE, TAB, NUM_CENTER, ENTER, SHIFT, CONTROL, ALT, PAUSE, CAPS_LOCK, ESCAPE, SPACE, PAGE_UP, PAGE_DOWN, END, HOME, LEFT_ARROW, UP_ARROW, RIGHT_ARROW, DOWN_ARROW, PLUS_SIGN, PRINT_SCREEN, INSERT, DELETE, ZERO, ONE, TWO, THREE, FOUR, FIVE, SIX, SEVEN, EIGHT, NINE, FF_SEMICOLON, FF_EQUALS, QUESTION_MARK, AT_SIGN, A, B, C, D, E, F, G, H, I, J, K, L, M, N, O, P, Q, R, S, T, U, V, W, X, Y, Z, META, MAC_WK_CMD_LEFT, MAC_WK_CMD_RIGHT, CONTEXT_MENU, NUMPAD_ZERO, NUMPAD_ONE, NUMPAD_TWO, NUMPAD_THREE, NUMPAD_FOUR, NUMPAD_FIVE, NUMPAD_SIX, NUMPAD_SEVEN, NUMPAD_EIGHT, NUMPAD_NINE, NUMPAD_MULTIPLY, NUMPAD_PLUS, NUMPAD_MINUS, NUMPAD_PERIOD, NUMPAD_DIVIDE, F1, F2, F3, F4, F5, F6, F7, F8, F9, F10, F11, F12, NUM_LOCK, SCROLL_LOCK, FIRST_MEDIA, FF_MINUS, MUTE, VOLUME_DOWN, VOLUME_UP, FF_MUTE, FF_VOLUME_DOWN, LAST_MEDIA, FF_VOLUME_UP, SEMICOLON, EQUALS, COMMA, DASH, SLASH, APOSTROPHE, TILDE, OPEN_SQUARE_BRACKET, BACKSLASH, CLOSE_SQUARE_BRACKET, SINGLE_QUOTE, MAC_META };
//# sourceMappingURL=keycodes.js.map

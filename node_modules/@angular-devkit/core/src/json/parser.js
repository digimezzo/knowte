"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
const __1 = require("..");
/**
 * A character was invalid in this context.
 */
class InvalidJsonCharacterException extends __1.BaseException {
    constructor(context) {
        const pos = context.previous;
        super(`Invalid JSON character: ${JSON.stringify(_peek(context))} `
            + `at ${pos.line}:${pos.character}.`);
    }
}
exports.InvalidJsonCharacterException = InvalidJsonCharacterException;
/**
 * More input was expected, but we reached the end of the stream.
 */
class UnexpectedEndOfInputException extends __1.BaseException {
    constructor(_context) {
        super(`Unexpected end of file.`);
    }
}
exports.UnexpectedEndOfInputException = UnexpectedEndOfInputException;
/**
 * Peek and return the next character from the context.
 * @private
 */
function _peek(context) {
    return context.original[context.position.offset];
}
/**
 * Move the context to the next character, including incrementing the line if necessary.
 * @private
 */
function _next(context) {
    context.previous = context.position;
    let { offset, line, character } = context.position;
    const char = context.original[offset];
    offset++;
    if (char == '\n') {
        line++;
        character = 0;
    }
    else {
        character++;
    }
    context.position = { offset, line, character };
}
function _token(context, valid) {
    const char = _peek(context);
    if (valid) {
        if (!char) {
            throw new UnexpectedEndOfInputException(context);
        }
        if (valid.indexOf(char) == -1) {
            throw new InvalidJsonCharacterException(context);
        }
    }
    // Move the position of the context to the next character.
    _next(context);
    return char;
}
/**
 * Read the exponent part of a number. The exponent part is looser for JSON than the number
 * part. `str` is the string of the number itself found so far, and start the position
 * where the full number started. Returns the node found.
 * @private
 */
function _readExpNumber(context, start, str, comments) {
    let char;
    let signed = false;
    while (true) {
        char = _token(context);
        if (char == '+' || char == '-') {
            if (signed) {
                break;
            }
            signed = true;
            str += char;
        }
        else if (char == '0' || char == '1' || char == '2' || char == '3' || char == '4'
            || char == '5' || char == '6' || char == '7' || char == '8' || char == '9') {
            signed = true;
            str += char;
        }
        else {
            break;
        }
    }
    // We're done reading this number.
    context.position = context.previous;
    return {
        kind: 'number',
        start,
        end: context.position,
        text: context.original.substring(start.offset, context.position.offset),
        value: Number.parseFloat(str),
        comments: comments,
    };
}
/**
 * Read a number from the context.
 * @private
 */
function _readNumber(context, comments = _readBlanks(context)) {
    let str = '';
    let dotted = false;
    const start = context.position;
    // read until `e` or end of line.
    while (true) {
        const char = _token(context);
        // Read tokens, one by one.
        if (char == '-') {
            if (str != '') {
                throw new InvalidJsonCharacterException(context);
            }
        }
        else if (char == '0') {
            if (str == '0' || str == '-0') {
                throw new InvalidJsonCharacterException(context);
            }
        }
        else if (char == '1' || char == '2' || char == '3' || char == '4' || char == '5'
            || char == '6' || char == '7' || char == '8' || char == '9') {
            if (str == '0' || str == '-0') {
                throw new InvalidJsonCharacterException(context);
            }
        }
        else if (char == '.') {
            if (dotted) {
                throw new InvalidJsonCharacterException(context);
            }
            dotted = true;
        }
        else if (char == 'e' || char == 'E') {
            return _readExpNumber(context, start, str + char, comments);
        }
        else {
            // We're done reading this number.
            context.position = context.previous;
            return {
                kind: 'number',
                start,
                end: context.position,
                text: context.original.substring(start.offset, context.position.offset),
                value: Number.parseFloat(str),
                comments,
            };
        }
        str += char;
    }
}
/**
 * Read a string from the context. Takes the comments of the string or read the blanks before the
 * string.
 * @private
 */
function _readString(context, comments = _readBlanks(context)) {
    const start = context.position;
    // Consume the first string delimiter.
    const delim = _token(context);
    if ((context.mode & JsonParseMode.SingleQuotesAllowed) == 0) {
        if (delim == '\'') {
            throw new InvalidJsonCharacterException(context);
        }
    }
    else if (delim != '\'' && delim != '"') {
        throw new InvalidJsonCharacterException(context);
    }
    let str = '';
    while (true) {
        let char = _token(context);
        if (char == delim) {
            return {
                kind: 'string',
                start,
                end: context.position,
                text: context.original.substring(start.offset, context.position.offset),
                value: str,
                comments: comments,
            };
        }
        else if (char == '\\') {
            char = _token(context);
            switch (char) {
                case '\\':
                case '\/':
                case '"':
                case delim:
                    str += char;
                    break;
                case 'b':
                    str += '\b';
                    break;
                case 'f':
                    str += '\f';
                    break;
                case 'n':
                    str += '\n';
                    break;
                case 'r':
                    str += '\r';
                    break;
                case 't':
                    str += '\t';
                    break;
                case 'u':
                    const [c0] = _token(context, '0123456789abcdefABCDEF');
                    const [c1] = _token(context, '0123456789abcdefABCDEF');
                    const [c2] = _token(context, '0123456789abcdefABCDEF');
                    const [c3] = _token(context, '0123456789abcdefABCDEF');
                    str += String.fromCharCode(parseInt(c0 + c1 + c2 + c3, 16));
                    break;
                case undefined:
                    throw new UnexpectedEndOfInputException(context);
                default:
                    throw new InvalidJsonCharacterException(context);
            }
        }
        else if (char === undefined) {
            throw new UnexpectedEndOfInputException(context);
        }
        else if (char == '\b' || char == '\f' || char == '\n' || char == '\r' || char == '\t') {
            throw new InvalidJsonCharacterException(context);
        }
        else {
            str += char;
        }
    }
}
/**
 * Read the constant `true` from the context.
 * @private
 */
function _readTrue(context, comments = _readBlanks(context)) {
    const start = context.position;
    _token(context, 't');
    _token(context, 'r');
    _token(context, 'u');
    _token(context, 'e');
    const end = context.position;
    return {
        kind: 'true',
        start,
        end,
        text: context.original.substring(start.offset, end.offset),
        value: true,
        comments,
    };
}
/**
 * Read the constant `false` from the context.
 * @private
 */
function _readFalse(context, comments = _readBlanks(context)) {
    const start = context.position;
    _token(context, 'f');
    _token(context, 'a');
    _token(context, 'l');
    _token(context, 's');
    _token(context, 'e');
    const end = context.position;
    return {
        kind: 'false',
        start,
        end,
        text: context.original.substring(start.offset, end.offset),
        value: false,
        comments,
    };
}
/**
 * Read the constant `null` from the context.
 * @private
 */
function _readNull(context, comments = _readBlanks(context)) {
    const start = context.position;
    _token(context, 'n');
    _token(context, 'u');
    _token(context, 'l');
    _token(context, 'l');
    const end = context.position;
    return {
        kind: 'null',
        start,
        end,
        text: context.original.substring(start.offset, end.offset),
        value: null,
        comments: comments,
    };
}
/**
 * Read an array of JSON values from the context.
 * @private
 */
function _readArray(context, comments = _readBlanks(context)) {
    const start = context.position;
    // Consume the first delimiter.
    _token(context, '[');
    const value = [];
    const elements = [];
    _readBlanks(context);
    if (_peek(context) != ']') {
        const node = _readValue(context);
        elements.push(node);
        value.push(node.value);
    }
    while (_peek(context) != ']') {
        _token(context, ',');
        const valueComments = _readBlanks(context);
        if ((context.mode & JsonParseMode.TrailingCommasAllowed) !== 0 && _peek(context) === ']') {
            break;
        }
        const node = _readValue(context, valueComments);
        elements.push(node);
        value.push(node.value);
    }
    _token(context, ']');
    return {
        kind: 'array',
        start,
        end: context.position,
        text: context.original.substring(start.offset, context.position.offset),
        value,
        elements,
        comments,
    };
}
/**
 * Read an identifier from the context. An identifier is a valid JavaScript identifier, and this
 * function is only used in Loose mode.
 * @private
 */
function _readIdentifier(context, comments = _readBlanks(context)) {
    const start = context.position;
    let char = _peek(context);
    if (char && '0123456789'.indexOf(char) != -1) {
        const identifierNode = _readNumber(context);
        return {
            kind: 'identifier',
            start,
            end: identifierNode.end,
            text: identifierNode.text,
            value: identifierNode.value.toString(),
        };
    }
    const identValidFirstChar = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMOPQRSTUVWXYZ';
    const identValidChar = '_$abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMOPQRSTUVWXYZ0123456789';
    let first = true;
    let value = '';
    while (true) {
        char = _token(context);
        if (char == undefined
            || (first ? identValidFirstChar.indexOf(char) : identValidChar.indexOf(char)) == -1) {
            context.position = context.previous;
            return {
                kind: 'identifier',
                start,
                end: context.position,
                text: context.original.substr(start.offset, context.position.offset),
                value,
                comments,
            };
        }
        value += char;
        first = false;
    }
}
/**
 * Read a property from the context. A property is a string or (in Loose mode only) a number or
 * an identifier, followed by a colon `:`.
 * @private
 */
function _readProperty(context, comments = _readBlanks(context)) {
    const start = context.position;
    let key;
    if ((context.mode & JsonParseMode.IdentifierKeyNamesAllowed) != 0) {
        const top = _peek(context);
        if (top == '"' || top == '\'') {
            key = _readString(context);
        }
        else {
            key = _readIdentifier(context);
        }
    }
    else {
        key = _readString(context);
    }
    _readBlanks(context);
    _token(context, ':');
    const value = _readValue(context);
    const end = context.position;
    return {
        kind: 'keyvalue',
        key,
        value,
        start,
        end,
        text: context.original.substring(start.offset, end.offset),
        comments,
    };
}
/**
 * Read an object of properties -> JSON values from the context.
 * @private
 */
function _readObject(context, comments = _readBlanks(context)) {
    const start = context.position;
    // Consume the first delimiter.
    _token(context, '{');
    const value = {};
    const properties = [];
    _readBlanks(context);
    if (_peek(context) != '}') {
        const property = _readProperty(context);
        value[property.key.value] = property.value.value;
        properties.push(property);
        while (_peek(context) != '}') {
            _token(context, ',');
            const propertyComments = _readBlanks(context);
            if ((context.mode & JsonParseMode.TrailingCommasAllowed) !== 0 && _peek(context) === '}') {
                break;
            }
            const property = _readProperty(context, propertyComments);
            value[property.key.value] = property.value.value;
            properties.push(property);
        }
    }
    _token(context, '}');
    return {
        kind: 'object',
        properties,
        start,
        end: context.position,
        value,
        text: context.original.substring(start.offset, context.position.offset),
        comments,
    };
}
/**
 * Remove any blank character or comments (in Loose mode) from the context, returning an array
 * of comments if any are found.
 * @private
 */
function _readBlanks(context) {
    if ((context.mode & JsonParseMode.CommentsAllowed) != 0) {
        const comments = [];
        while (true) {
            let char = context.original[context.position.offset];
            if (char == '/' && context.original[context.position.offset + 1] == '*') {
                const start = context.position;
                // Multi line comment.
                _next(context);
                _next(context);
                char = context.original[context.position.offset];
                while (context.original[context.position.offset] != '*'
                    || context.original[context.position.offset + 1] != '/') {
                    _next(context);
                    if (context.position.offset >= context.original.length) {
                        throw new UnexpectedEndOfInputException(context);
                    }
                }
                // Remove "*/".
                _next(context);
                _next(context);
                comments.push({
                    kind: 'multicomment',
                    start,
                    end: context.position,
                    text: context.original.substring(start.offset, context.position.offset),
                    content: context.original.substring(start.offset + 2, context.position.offset - 2),
                });
            }
            else if (char == '/' && context.original[context.position.offset + 1] == '/') {
                const start = context.position;
                // Multi line comment.
                _next(context);
                _next(context);
                char = context.original[context.position.offset];
                while (context.original[context.position.offset] != '\n') {
                    _next(context);
                    if (context.position.offset >= context.original.length) {
                        break;
                    }
                }
                // Remove "\n".
                if (context.position.offset < context.original.length) {
                    _next(context);
                }
                comments.push({
                    kind: 'comment',
                    start,
                    end: context.position,
                    text: context.original.substring(start.offset, context.position.offset),
                    content: context.original.substring(start.offset + 2, context.position.offset - 1),
                });
            }
            else if (char == ' ' || char == '\t' || char == '\n' || char == '\r' || char == '\f') {
                _next(context);
            }
            else {
                break;
            }
        }
        return comments;
    }
    else {
        let char = context.original[context.position.offset];
        while (char == ' ' || char == '\t' || char == '\n' || char == '\r' || char == '\f') {
            _next(context);
            char = context.original[context.position.offset];
        }
        return [];
    }
}
/**
 * Read a JSON value from the context, which can be any form of JSON value.
 * @private
 */
function _readValue(context, comments = _readBlanks(context)) {
    let result;
    // Clean up before.
    const char = _peek(context);
    switch (char) {
        case undefined:
            throw new UnexpectedEndOfInputException(context);
        case '-':
        case '0':
        case '1':
        case '2':
        case '3':
        case '4':
        case '5':
        case '6':
        case '7':
        case '8':
        case '9':
            result = _readNumber(context, comments);
            break;
        case '\'':
        case '"':
            result = _readString(context, comments);
            break;
        case 't':
            result = _readTrue(context, comments);
            break;
        case 'f':
            result = _readFalse(context, comments);
            break;
        case 'n':
            result = _readNull(context, comments);
            break;
        case '[':
            result = _readArray(context, comments);
            break;
        case '{':
            result = _readObject(context, comments);
            break;
        default:
            throw new InvalidJsonCharacterException(context);
    }
    // Clean up after.
    _readBlanks(context);
    return result;
}
/**
 * The Parse mode used for parsing the JSON string.
 */
var JsonParseMode;
(function (JsonParseMode) {
    JsonParseMode[JsonParseMode["Strict"] = 0] = "Strict";
    JsonParseMode[JsonParseMode["CommentsAllowed"] = 1] = "CommentsAllowed";
    JsonParseMode[JsonParseMode["SingleQuotesAllowed"] = 2] = "SingleQuotesAllowed";
    JsonParseMode[JsonParseMode["IdentifierKeyNamesAllowed"] = 4] = "IdentifierKeyNamesAllowed";
    JsonParseMode[JsonParseMode["TrailingCommasAllowed"] = 8] = "TrailingCommasAllowed";
    JsonParseMode[JsonParseMode["Default"] = 0] = "Default";
    JsonParseMode[JsonParseMode["Loose"] = 15] = "Loose";
})(JsonParseMode = exports.JsonParseMode || (exports.JsonParseMode = {}));
/**
 * Parse the JSON string and return its AST. The AST may be losing data (end comments are
 * discarded for example, and space characters are not represented in the AST), but all values
 * will have a single node in the AST (a 1-to-1 mapping).
 * @param input The string to use.
 * @param mode The mode to parse the input with. {@see JsonParseMode}.
 * @returns {JsonAstNode} The root node of the value of the AST.
 */
function parseJsonAst(input, mode = JsonParseMode.Default) {
    if (mode == JsonParseMode.Default) {
        mode = JsonParseMode.Strict;
    }
    const context = {
        position: { offset: 0, line: 0, character: 0 },
        previous: { offset: 0, line: 0, character: 0 },
        original: input,
        comments: undefined,
        mode,
    };
    const ast = _readValue(context);
    if (context.position.offset < input.length) {
        const rest = input.substr(context.position.offset);
        const i = rest.length > 20 ? rest.substr(0, 20) + '...' : rest;
        throw new Error(`Expected end of file, got "${i}" at `
            + `${context.position.line}:${context.position.character}.`);
    }
    return ast;
}
exports.parseJsonAst = parseJsonAst;
/**
 * Parse a JSON string into its value.  This discards the AST and only returns the value itself.
 * @param input The string to parse.
 * @param mode The mode to parse the input with. {@see JsonParseMode}.
 * @returns {JsonValue} The value represented by the JSON string.
 */
function parseJson(input, mode = JsonParseMode.Default) {
    // Try parsing for the fastest path available, if error, uses our own parser for better errors.
    if (mode == JsonParseMode.Strict) {
        try {
            return JSON.parse(input);
        }
        catch (err) {
            return parseJsonAst(input, mode).value;
        }
    }
    return parseJsonAst(input, mode).value;
}
exports.parseJson = parseJson;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicGFyc2VyLmpzIiwic291cmNlUm9vdCI6Ii4vIiwic291cmNlcyI6WyJwYWNrYWdlcy9hbmd1bGFyX2RldmtpdC9jb3JlL3NyYy9qc29uL3BhcnNlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBOzs7Ozs7R0FNRztBQUNILDBCQUFtQztBQXFCbkM7O0dBRUc7QUFDSCxtQ0FBMkMsU0FBUSxpQkFBYTtJQUM5RCxZQUFZLE9BQTBCO1FBQ3BDLE1BQU0sR0FBRyxHQUFHLE9BQU8sQ0FBQyxRQUFRLENBQUM7UUFDN0IsS0FBSyxDQUFDLDJCQUEyQixJQUFJLENBQUMsU0FBUyxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsQ0FBQyxHQUFHO2NBQzVELE1BQU0sR0FBRyxDQUFDLElBQUksSUFBSSxHQUFHLENBQUMsU0FBUyxHQUFHLENBQUMsQ0FBQztJQUM1QyxDQUFDO0NBQ0Y7QUFORCxzRUFNQztBQUdEOztHQUVHO0FBQ0gsbUNBQTJDLFNBQVEsaUJBQWE7SUFDOUQsWUFBWSxRQUEyQjtRQUNyQyxLQUFLLENBQUMseUJBQXlCLENBQUMsQ0FBQztJQUNuQyxDQUFDO0NBQ0Y7QUFKRCxzRUFJQztBQWNEOzs7R0FHRztBQUNILGVBQWUsT0FBMEI7SUFDdkMsTUFBTSxDQUFDLE9BQU8sQ0FBQyxRQUFRLENBQUMsT0FBTyxDQUFDLFFBQVEsQ0FBQyxNQUFNLENBQUMsQ0FBQztBQUNuRCxDQUFDO0FBR0Q7OztHQUdHO0FBQ0gsZUFBZSxPQUEwQjtJQUN2QyxPQUFPLENBQUMsUUFBUSxHQUFHLE9BQU8sQ0FBQyxRQUFRLENBQUM7SUFFcEMsSUFBSSxFQUFDLE1BQU0sRUFBRSxJQUFJLEVBQUUsU0FBUyxFQUFDLEdBQUcsT0FBTyxDQUFDLFFBQVEsQ0FBQztJQUNqRCxNQUFNLElBQUksR0FBRyxPQUFPLENBQUMsUUFBUSxDQUFDLE1BQU0sQ0FBQyxDQUFDO0lBQ3RDLE1BQU0sRUFBRSxDQUFDO0lBQ1QsRUFBRSxDQUFDLENBQUMsSUFBSSxJQUFJLElBQUksQ0FB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USxDQUFDLFNBQVMsR0FBRyxDQUFDLENBQUM7SUFDbkUsQ0FBQztJQUVELE1BQU0sQ0FBQyxHQUFHLENBQUM7QUFDYixDQUFDO0FBdEJELG9DQXNCQztBQUdEOzs7OztHQUtHO0FBQ0gsbUJBQTBCLEtBQWEsRUFBRSxJQUFJLEdBQUcsYUFBYSxDQUFDLE9BQU87SUFDbkUsK0ZBQStGO0lBQy9GLEVBQUUsQ0FBQyxDQUFDLElBQUksSUFBSSxhQUFhLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQztRQUNqQyxJQUFJLENBQUM7WUFDSCxNQUFNLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsQ0FBQztRQUMzQixDQUFDO1FBQUMsS0FBSyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQztZQUNiLE1BQU0sQ0FBQyxZQUFZLENBQUMsS0FBSyxFQUFFLElBQUksQ0FBQyxDQUFDLEtBQUssQ0FBQztRQUN6QyxDQUFDO0lBQ0gsQ0FBQztJQUVELE1BQU0sQ0FBQyxZQUFZLENBQUMsS0FBSyxFQUFFLElBQUksQ0FBQyxDQUFDLEtBQUssQ0FBQztBQUN6QyxDQUFDO0FBWEQsOEJBV0MiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIEluYy4gQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5pbXBvcnQgeyBCYXNlRXhjZXB0aW9uIH0gZnJvbSAnLi4nO1xuaW1wb3J0IHtcbiAgSnNvbkFycmF5LFxuICBKc29uQXN0QXJyYXksXG4gIEpzb25Bc3RDb21tZW50LFxuICBKc29uQXN0Q29uc3RhbnRGYWxzZSxcbiAgSnNvbkFzdENvbnN0YW50TnVsbCxcbiAgSnNvbkFzdENvbnN0YW50VHJ1ZSxcbiAgSnNvbkFzdElkZW50aWZpZXIsXG4gIEpzb25Bc3RLZXlWYWx1ZSxcbiAgSnNvbkFzdE11bHRpbGluZUNvbW1lbnQsXG4gIEpzb25Bc3ROb2RlLFxuICBKc29uQXN0TnVtYmVyLFxuICBKc29uQXN0T2JqZWN0LFxuICBKc29uQXN0U3RyaW5nLFxuICBKc29uT2JqZWN0LFxuICBKc29uVmFsdWUsXG4gIFBvc2l0aW9uLFxufSBmcm9tICcuL2ludGVyZmFjZSc7XG5cblxuLyoqXG4gKiBBIGNoYXJhY3RlciB3YXMgaW52YWxpZCBpbiB0aGlzIGNvbnRleHQuXG4gKi9cbmV4cG9ydCBjbGFzcyBJbnZhbGlkSnNvbkNoYXJhY3RlckV4Y2VwdGlvbiBleHRlbmRzIEJhc2VFeGNlcHRpb24ge1xuICBjb25zdHJ1Y3Rvcihjb250ZXh0OiBKc29uUGFyc2VyQ29udGV4dCkge1xuICAgIGNvbnN0IHBvcyA9IGNvbnRleHQucHJldmlvdXM7XG4gICAgc3VwZXIoYEludmFsaWQgSlNPTiBjaGFyYWN0ZXI6ICR7SlNPTi5zdHJpbmdpZnkoX3BlZWsoY29udGV4dCkpfSBgXG4gICAgICAgICsgYGF0ICR7cG9zLmxpbmV9OiR7cG9zLmNoYXJhY3Rlcn0uYCk7XG4gIH1cbn1cblxuXG4vKipcbiAqIE1vcmUgaW5wdXQgd2FzIGV4cGVjdGVkLCBidXQgd2UgcmVhY2hlZCB0aGUgZW5kIG9mIHRoZSBzdHJlYW0uXG4gKi9cbmV4cG9ydCBjbGFzcyBVbmV4cGVjdGVkRW5kT2ZJbnB1dEV4Y2VwdGlvbiBleHRlbmRzIEJhc2VFeGNlcHRpb24ge1xuICBjb25zdHJ1Y3RvcihfY29udGV4dDogSnNvblBhcnNlckNvbnRleHQpIHtcbiAgICBzdXBlcihgVW5leHBlY3RlZCBlbmQgb2YgZmlsZS5gKTtcbiAgfVxufVxuXG5cbi8qKlxuICogQ29udGV4dCBwYXNzZWQgYXJvdW5kIHRoZSBwYXJzZXIgd2l0aCBpbmZvcm1hdGlvbiBhYm91dCB3aGVyZSB3ZSBjdXJyZW50bHkgYXJlIGluIHRoZSBwYXJzZS5cbiAqL1xuZXhwb3J0IGludGVyZmFjZSBKc29uUGFyc2VyQ29udGV4dCB7XG4gIHBvc2l0aW9uOiBQb3NpdGlvbjtcbiAgcHJldmlvdXM6IFBvc2l0aW9uO1xuICByZWFkb25seSBvcmlnaW5hbDogc3RyaW5nO1xuICByZWFkb25seSBtb2RlOiBKc29uUGFyc2VNb2RlO1xufVxuXG5cbi8qKlxuICogUGVlayBhbmQgcmV0dXJuIHRoZSBuZXh0IGNoYXJhY3RlciBmcm9tIHRoZSBjb250ZXh0LlxuICogQHByaXZhdGVcbiAqL1xuZnVuY3Rpb24gX3BlZWsoY29udGV4dDogSnNvblBhcnNlckNvbnRleHQpOiBzdHJpbmcgfCB1bmRlZmluZWQge1xuICByZXR1cm4gY29udGV4dC5vcmlnaW5hbFtjb250ZXh0LnBvc2l0aW9uLm9mZnNldF07XG59XG5cblxuLyoqXG4gKiBNb3ZlIHRoZSBjb250ZXh0IHRvIHRoZSBuZXh0IGNoYXJhY3RlciwgaW5jbHVkaW5nIGluY3JlbWVudGluZyB0aGUgbGluZSBpZiBuZWNlc3NhcnkuXG4gKiBAcHJpdmF0ZVxuICovXG5mdW5jdGlvbiBfbmV4dChjb250ZXh0OiBKc29uUGFyc2VyQ29udGV4dCkge1xuICBjb250ZXh0LnByZXZpb3VzID0gY29udGV4dC5wb3NpdGlvbjtcblxuICBsZXQge29mZnNldCwgbGluZSwgY2hhcmFjdGVyfSA9IGNvbnRleHQucG9zaXRpb247XG4gIGNvbnN0IGNoYXIgPSBjb250ZXh0Lm9yaWdpbmFsW29mZnNldF07XG4gIG9mZnNldCsrO1xuICBpZiAoY2hhciA9PSAnXFxuJykge1xuICAgIGxpbmUrKztcbiAgICBjaGFyYWN0ZXIgPSAwO1xuICB9IGVsc2Uge1xuICAgIGNoYXJhY3RlcisrO1xuICB9XG4gIGNvbnRleHQucG9zaXRpb24gPSB7b2Zmc2V0LCBsaW5lLCBjaGFyYWN0ZXJ9O1xufVxuXG5cbi8qKlxuICogUmVhZCBhIHNpbmdsZSBjaGFyYWN0ZXIgZnJvbSB0aGUgaW5wdXQuIElmIGEgYHZhbGlkYCBzdHJpbmcgaXMgcGFzc2VkLCB2YWxpZGF0ZSB0aGF0IHRoZVxuICogY2hhcmFjdGVyIGlzIGluY2x1ZGVkIGluIHRoZSB2YWxpZCBzdHJpbmcuXG4gKiBAcHJpdmF0ZVxuICovXG5mdW5jdGlvbiBfdG9rZW4oY29udGV4dDogSnNvblBhcnNlckNvbnRleHQsIHZhbGlkOiBzdHJpbmcpOiBzdHJpbmc7XG5mdW5jdGlvbiBfdG9rZW4oY29udGV4dDogSnNvblBhcnNlckNvbnRleHQpOiBzdHJpbmcgfCB1bmRlZmluZWQ7XG5mdW5jdGlvbiBfdG9rZW4oY29udGV4dDogSnNvblBhcnNlckNvbnRleHQsIHZhbGlkPzogc3RyaW5nKTogc3RyaW5nIHwgdW5kZWZpbmVkIHtcbiAgY29uc3QgY2hhciA9IF9wZWVrKGNvbnRleHQpO1xuICBpZiAodmFsaWQpIHtcbiAgICBpZiAoIWNoYXIpIHtcbiAgICAgIHRocm93IG5ldyBVbmV4cGVjdGVkRW5kT2ZJbnB1dEV4Y2VwdGlvbihjb250ZXh0KTtcbiAgICB9XG4gICAgaWYgKHZhbGlkLmluZGV4T2YoY2hhcikgPT0gLTEpIHtcbiAgICAgIHRocm93IG5ldyBJbnZhbGlkSnNvbkNoYXJhY3RlckV4Y2VwdGlvbihjb250ZXh0KTtcbiAgICB9XG4gIH1cblxuICAvLyBNb3ZlIHRoZSBwb3NpdGlvbiBvZiB0aGUgY29udGV4dCB0byB0aGUgbmV4dCBjaGFyYWN0ZXIuXG4gIF9uZXh0KGNvbnRleHQpO1xuXG4gIHJldHVybiBjaGFyO1xufVxuXG5cbi8qKlxuICogUmVhZCB0aGUgZXhwb25lbnQgcGFydCBvZiBhIG51bWJlci4gVGhlIGV4cG9uZW50IHBhcnQgaXMgbG9vc2VyIGZvciBKU09OIHRoYW4gdGhlIG51bWJlclxuICogcGFydC4gYHN0cmAgaXMgdGhlIHN0cmluZyBvZiB0aGUgbnVtYmVyIGl0c2VsZiBmb3VuZCBzbyBmYXIsIGFuZCBzdGFydCB0aGUgcG9zaXRpb25cbiAqIHdoZXJlIHRoZSBmdWxsIG51bWJlciBzdGFydGVkLiBSZXR1cm5zIHRoZSBub2RlIGZvdW5kLlxuICogQHByaXZhdGVcbiAqL1xuZnVuY3Rpb24gX3JlYWRFeHBOdW1iZXIoY29udGV4dDogSnNvblBhcnNlckNvbnRleHQsXG4gICAgICAgICAgICAgICAgICAgICAgICBzdGFydDogUG9zaXRpb24sXG4gICAgICAgICAgICAgICAgICAgICAgICBzdHI6IHN0cmluZyxcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbW1lbnRzOiAoSnNvbkFzdENvbW1lbnQgfCBKc29uQXN0TXVsdGlsaW5lQ29tbWVudClbXSk6IEpzb25Bc3ROdW1iZXIge1xuICBsZXQgY2hhcjtcbiAgbGV0IHNpZ25lZCA9IGZhbHNlO1xuXG4gIHdoaWxlICh0cnVlKSB7XG4gICAgY2hhciA9IF90b2tlbihjb250ZXh0KTtcbiAgICBpZiAoY2hhciA9PSAnKycgfHwgY2hhciA9PSAnLScpIHtcbiAgICAgIGlmIChzaWduZWQpIHtcbiAgICAgICAgYnJlYWs7XG4gICAgICB9XG4gICAgICBzaWduZWQgPSB0cnVlO1xuICAgICAgc3RyICs9IGNoYXI7XG4gICAgfSBlbHNlIGlmIChjaGFyID09ICcwJyB8fCBjaGFyID09ICcxJyB8fCBjaGFyID09ICcyJyB8fCBjaGFyID09ICczJyB8fCBjaGFyID09ICc0J1xuICAgICAgICB8fCBjaGFyID09ICc1JyB8fCBjaGFyID09ICc2JyB8fCBjaGFyID09ICc3JyB8fCBjaGFyID09ICc4JyB8fCBjaGFyID09ICc5Jykge1xuICAgICAgc2lnbmVkID0gdHJ1ZTtcbiAgICAgIHN0ciArPSBjaGFyO1xuICAgIH0gZWxzZSB7XG4gICAgICBicmVhaztcbiAgICB9XG4gIH1cblxuICAvLyBXZSdyZSBkb25lIHJlYWRpbmcgdGhpcyBudW1iZXIuXG4gIGNvbnRleHQucG9zaXRpb24gPSBjb250ZXh0LnByZXZpb3VzO1xuXG4gIHJldHVybiB7XG4gICAga2luZDogJ251bWJlcicsXG4gICAgc3RhcnQsXG4gICAgZW5kOiBjb250ZXh0LnBvc2l0aW9uLFxuICAgIHRleHQ6IGNvbnRleHQub3JpZ2luYWwuc3Vic3RyaW5nKHN0YXJ0Lm9mZnNldCwgY29udGV4dC5wb3NpdGlvbi5vZmZzZXQpLFxuICAgIHZhbHVlOiBOdW1iZXIucGFyc2VGbG9hdChzdHIpLFxuICAgIGNvbW1lbnRzOiBjb21tZW50cyxcbiAgfTtcbn1cblxuXG4vKipcbiAqIFJlYWQgYSBudW1iZXIgZnJvbSB0aGUgY29udGV4dC5cbiAqIEBwcml2YXRlXG4gKi9cbmZ1bmN0aW9uIF9yZWFkTnVtYmVyKGNvbnRleHQ6IEpzb25QYXJzZXJDb250ZXh0LCBjb21tZW50cyA9IF9yZWFkQmxhbmtzKGNvbnRleHQpKTogSnNvbkFzdE51bWJlciB7XG4gIGxldCBzdHIgPSAnJztcbiAgbGV0IGRvdHRlZCA9IGZhbHNlO1xuICBjb25zdCBzdGFydCA9IGNvbnRleHQucG9zaXRpb247XG5cbiAgLy8gcmVhZCB1bnRpbCBgZWAgb3IgZW5kIG9mIGxpbmUuXG4gIHdoaWxlICh0cnVlKSB7XG4gICAgY29uc3QgY2hhciA9IF90b2tlbihjb250ZXh0KTtcblxuICAgIC8vIFJlYWQgdG9rZW5zLCBvbmUgYnkgb25lLlxuICAgIGlmIChjaGFyID09ICctJykge1xuICAgICAgaWYgKHN0ciAhPSAnJykge1xuICAgICAgICB0aHJvdyBuZXcgSW52YWxpZEpzb25DaGFyYWN0ZXJFeGNlcHRpb24oY29udGV4dCk7XG4gICAgICB9XG4gICAgfSBlbHNlIGlmIChjaGFyID09ICcwJykge1xuICAgICAgaWYgKHN0ciA9PSAnMCcgfHwgc3RyID09ICctMCcpIHtcbiAgICAgICAgdGhyb3cgbmV3IEludmFsaWRKc29uQ2hhcmFjdGVyRXhjZXB0aW9uKGNvbnRleHQpO1xuICAgICAgfVxuICAgIH0gZWxzZSBpZiAoY2hhciA9PSAnMScgfHwgY2hhciA9PSAnMicgfHwgY2hhciA9PSAnMycgfHwgY2hhciA9PSAnNCcgfHwgY2hhciA9PSAnNSdcbiAgICAgICAgfHwgY2hhciA9PSAnNicgfHwgY2hhciA9PSAnNycgfHwgY2hhciA9PSAnOCcgfHwgY2hhciA9PSAnOScpIHtcbiAgICAgIGlmIChzdHIgPT0gJzAnIHx8IHN0ciA9PSAnLTAnKSB7XG4gICAgICAgIHRocm93IG5ldyBJbnZhbGlkSnNvbkNoYXJhY3RlckV4Y2VwdGlvbihjb250ZXh0KTtcbiAgICAgIH1cbiAgICB9IGVsc2UgaWYgKGNoYXIgPT0gJy4nKSB7XG4gICAgICBpZiAoZG90dGVkKSB7XG4gICAgICAgIHRocm93IG5ldyBJbnZhbGlkSnNvbkNoYXJhY3RlckV4Y2VwdGlvbihjb250ZXh0KTtcbiAgICAgIH1cbiAgICAgIGRvdHRlZCA9IHRydWU7XG4gICAgfSBlbHNlIGlmIChjaGFyID09ICdlJyB8fCBjaGFyID09ICdFJykge1xuICAgICAgcmV0dXJuIF9yZWFkRXhwTnVtYmVyKGNvbnRleHQsIHN0YXJ0LCBzdHIgKyBjaGFyLCBjb21tZW50cyk7XG4gICAgfSBlbHNlIHtcbiAgICAgIC8vIFdlJ3JlIGRvbmUgcmVhZGluZyB0aGlzIG51bWJlci5cbiAgICAgIGNvbnRleHQucG9zaXRpb24gPSBjb250ZXh0LnByZXZpb3VzO1xuXG4gICAgICByZXR1cm4ge1xuICAgICAgICBraW5kOiAnbnVtYmVyJyxcbiAgICAgICAgc3RhcnQsXG4gICAgICAgIGVuZDogY29udGV4dC5wb3NpdGlvbixcbiAgICAgICAgdGV4dDogY29udGV4dC5vcmlnaW5hbC5zdWJzdHJpbmcoc3RhcnQub2Zmc2V0LCBjb250ZXh0LnBvc2l0aW9uLm9mZnNldCksXG4gICAgICAgIHZhbHVlOiBOdW1iZXIucGFyc2VGbG9hdChzdHIpLFxuICAgICAgICBjb21tZW50cyxcbiAgICAgIH07XG4gICAgfVxuXG4gICAgc3RyICs9IGNoYXI7XG4gIH1cbn1cblxuXG4vKipcbiAqIFJlYWQgYSBzdHJpbmcgZnJvbSB0aGUgY29udGV4dC4gVGFrZXMgdGhlIGNvbW1lbnRzIG9mIHRoZSBzdHJpbmcgb3IgcmVhZCB0aGUgYmxhbmtzIGJlZm9yZSB0aGVcbiAqIHN0cmluZy5cbiAqIEBwcml2YXRlXG4gKi9cbmZ1bmN0aW9uIF9yZWFkU3RyaW5nKGNvbnRleHQ6IEpzb25QYXJzZXJDb250ZXh0LCBjb21tZW50cyA9IF9yZWFkQmxhbmtzKGNvbnRleHQpKTogSnNvbkFzdFN0cmluZyB7XG4gIGNvbnN0IHN0YXJ0ID0gY29udGV4dC5wb3NpdGlvbjtcblxuICAvLyBDb25zdW1lIHRoZSBmaXJzdCBzdHJpbmcgZGVsaW1pdGVyLlxuICBjb25zdCBkZWxpbSA9IF90b2tlbihjb250ZXh0KTtcbiAgaWYgKChjb250ZXh0Lm1vZGUgJiBKc29uUGFyc2VNb2RlLlNpbmdsZVF1b3Rlc0FsbG93ZWQpID09IDApIHtcbiAgICBpZiAoZGVsaW0gPT0gJ1xcJycpIHtcbiAgICAgIHRocm93IG5ldyBJbnZhbGlkSnNvbkNoYXJhY3RlckV4Y2VwdGlvbihjb250ZXh0KTtcbiAgICB9XG4gIH0gZWxzZSBpZiAoZGVsaW0gIT0gJ1xcJycgJiYgZGVsaW0gIT0gJ1wiJykge1xuICAgIHRocm93IG5ldyBJbnZhbGlkSnNvbkNoYXJhY3RlckV4Y2VwdGlvbihjb250ZXh0KTtcbiAgfVxuXG4gIGxldCBzdHIgPSAnJztcbiAgd2hpbGUgKHRydWUpIHtcbiAgICBsZXQgY2hhciA9IF90b2tlbihjb250ZXh0KTtcbiAgICBpZiAoY2hhciA9PSBkZWxpbSkge1xuICAgICAgcmV0dXJuIHtcbiAgICAgICAga2luZDogJ3N0cmluZycsXG4gICAgICAgIHN0YXJ0LFxuICAgICAgICBlbmQ6IGNvbnRleHQucG9zaXRpb24sXG4gICAgICAgIHRleHQ6IGNvbnRleHQub3JpZ2luYWwuc3Vic3RyaW5nKHN0YXJ0Lm9mZnNldCwgY29udGV4dC5wb3NpdGlvbi5vZmZzZXQpLFxuICAgICAgICB2YWx1ZTogc3RyLFxuICAgICAgICBjb21tZW50czogY29tbWVudHMsXG4gICAgICB9O1xuICAgIH0gZWxzZSBpZiAoY2hhciA9PSAnXFxcXCcpIHtcbiAgICAgIGNoYXIgPSBfdG9rZW4oY29udGV4dCk7XG4gICAgICBzd2l0Y2ggKGNoYXIpIHtcbiAgICAgICAgY2FzZSAnXFxcXCc6XG4gICAgICAgIGNhc2UgJ1xcLyc6XG4gICAgICAgIGNhc2UgJ1wiJzpcbiAgICAgICAgY2FzZSBkZWxpbTpcbiAgICAgICAgICBzdHIgKz0gY2hhcjtcbiAgICAgICAgICBicmVhaztcblxuICAgICAgICBjYXNlICdiJzogc3RyICs9ICdcXGInOyBicmVhaztcbiAgICAgICAgY2FzZSAnZic6IHN0ciArPSAnXFxmJzsgYnJlYWs7XG4gICAgICAgIGNhc2UgJ24nOiBzdHIgKz0gJ1xcbic7IGJyZWFrO1xuICAgICAgICBjYXNlICdyJzogc3RyICs9ICdcXHInOyBicmVhaztcbiAgICAgICAgY2FzZSAndCc6IHN0ciArPSAnXFx0JzsgYnJlYWs7XG4gICAgICAgIGNhc2UgJ3UnOlxuICAgICAgICAgIGNvbnN0IFtjMF0gPSBfdG9rZW4oY29udGV4dCwgJzAxMjM0NTY3ODlhYmNkZWZBQkNERUYnKTtcbiAgICAgICAgICBjb25zdCBbYzFdID0gX3Rva2VuKGNvbnRleHQsICcwMTIzNDU2Nzg5YWJjZGVmQUJDREVGJyk7XG4gICAgICAgICAgY29uc3QgW2MyXSA9IF90b2tlbihjb250ZXh0LCAnMDEyMzQ1Njc4OWFiY2RlZkFCQ0RFRicpO1xuICAgICAgICAgIGNvbnN0IFtjM10gPSBfdG9rZW4oY29udGV4dCwgJzAxMjM0NTY3ODlhYmNkZWZBQkNERUYnKTtcbiAgICAgICAgICBzdHIgKz0gU3RyaW5nLmZyb21DaGFyQ29kZShwYXJzZUludChjMCArIGMxICsgYzIgKyBjMywgMTYpKTtcbiAgICAgICAgICBicmVhaztcblxuICAgICAgICBjYXNlIHVuZGVmaW5lZDpcbiAgICAgICAgICB0aHJvdyBuZXcgVW5leHBlY3RlZEVuZE9mSW5wdXRFeGNlcHRpb24oY29udGV4dCk7XG4gICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgdGhyb3cgbmV3IEludmFsaWRKc29uQ2hhcmFjdGVyRXhjZXB0aW9uKGNvbnRleHQpO1xuICAgICAgfVxuICAgIH0gZWxzZSBpZiAoY2hhciA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICB0aHJvdyBuZXcgVW5leHBlY3RlZEVuZE9mSW5wdXRFeGNlcHRpb24oY29udGV4dCk7XG4gICAgfSBlbHNlIGlmIChjaGFyID09ICdcXGInIHx8IGNoYXIgPT0gJ1xcZicgfHwgY2hhciA9PSAnXFxuJyB8fCBjaGFyID09ICdcXHInIHx8IGNoYXIgPT0gJ1xcdCcpIHtcbiAgICAgIHRocm93IG5ldyBJbnZhbGlkSnNvbkNoYXJhY3RlckV4Y2VwdGlvbihjb250ZXh0KTtcbiAgICB9IGVsc2Uge1xuICAgICAgc3RyICs9IGNoYXI7XG4gICAgfVxuICB9XG59XG5cblxuLyoqXG4gKiBSZWFkIHRoZSBjb25zdGFudCBgdHJ1ZWAgZnJvbSB0aGUgY29udGV4dC5cbiAqIEBwcml2YXRlXG4gKi9cbmZ1bmN0aW9uIF9yZWFkVHJ1ZShjb250ZXh0OiBKc29uUGFyc2VyQ29udGV4dCxcbiAgICAgICAgICAgICAgICAgICBjb21tZW50cyA9IF9yZWFkQmxhbmtzKGNvbnRleHQpKTogSnNvbkFzdENvbnN0YW50VHJ1ZSB7XG4gIGNvbnN0IHN0YXJ0ID0gY29udGV4dC5wb3NpdGlvbjtcbiAgX3Rva2VuKGNvbnRleHQsICd0Jyk7XG4gIF90b2tlbihjb250ZXh0LCAncicpO1xuICBfdG9rZW4oY29udGV4dCwgJ3UnKTtcbiAgX3Rva2VuKGNvbnRleHQsICdlJyk7XG5cbiAgY29uc3QgZW5kID0gY29udGV4dC5wb3NpdGlvbjtcblxuICByZXR1cm4ge1xuICAgIGtpbmQ6ICd0cnVlJyxcbiAgICBzdGFydCxcbiAgICBlbmQsXG4gICAgdGV4dDogY29udGV4dC5vcmlnaW5hbC5zdWJzdHJpbmcoc3RhcnQub2Zmc2V0LCBlbmQub2Zmc2V0KSxcbiAgICB2YWx1ZTogdHJ1ZSxcbiAgICBjb21tZW50cyxcbiAgfTtcbn1cblxuXG4vKipcbiAqIFJlYWQgdGhlIGNvbnN0YW50IGBmYWxzZWAgZnJvbSB0aGUgY29udGV4dC5cbiAqIEBwcml2YXRlXG4gKi9cbmZ1bmN0aW9uIF9yZWFkRmFsc2UoY29udGV4dDogSnNvblBhcnNlckNvbnRleHQsXG4gICAgICAgICAgICAgICAgICAgIGNvbW1lbnRzID0gX3JlYWRCbGFua3MoY29udGV4dCkpOiBKc29uQXN0Q29uc3RhbnRGYWxzZSB7XG4gIGNvbnN0IHN0YXJ0ID0gY29udGV4dC5wb3NpdGlvbjtcbiAgX3Rva2VuKGNvbnRleHQsICdmJyk7XG4gIF90b2tlbihjb250ZXh0LCAnYScpO1xuICBfdG9rZW4oY29udGV4dCwgJ2wnKTtcbiAgX3Rva2VuKGNvbnRleHQsICdzJyk7XG4gIF90b2tlbihjb250ZXh0LCAnZScpO1xuXG4gIGNvbnN0IGVuZCA9IGNvbnRleHQucG9zaXRpb247XG5cbiAgcmV0dXJuIHtcbiAgICBraW5kOiAnZmFsc2UnLFxuICAgIHN0YXJ0LFxuICAgIGVuZCxcbiAgICB0ZXh0OiBjb250ZXh0Lm9yaWdpbmFsLnN1YnN0cmluZyhzdGFydC5vZmZzZXQsIGVuZC5vZmZzZXQpLFxuICAgIHZhbHVlOiBmYWxzZSxcbiAgICBjb21tZW50cyxcbiAgfTtcbn1cblxuXG4vKipcbiAqIFJlYWQgdGhlIGNvbnN0YW50IGBudWxsYCBmcm9tIHRoZSBjb250ZXh0LlxuICogQHByaXZhdGVcbiAqL1xuZnVuY3Rpb24gX3JlYWROdWxsKGNvbnRleHQ6IEpzb25QYXJzZXJDb250ZXh0LFxuICAgICAgICAgICAgICAgICAgIGNvbW1lbnRzID0gX3JlYWRCbGFua3MoY29udGV4dCkpOiBKc29uQXN0Q29uc3RhbnROdWxsIHtcbiAgY29uc3Qgc3RhcnQgPSBjb250ZXh0LnBvc2l0aW9uO1xuXG4gIF90b2tlbihjb250ZXh0LCAnbicpO1xuICBfdG9rZW4oY29udGV4dCwgJ3UnKTtcbiAgX3Rva2VuKGNvbnRleHQsICdsJyk7XG4gIF90b2tlbihjb250ZXh0LCAnbCcpO1xuXG4gIGNvbnN0IGVuZCA9IGNvbnRleHQucG9zaXRpb247XG5cbiAgcmV0dXJuIHtcbiAgICBraW5kOiAnbnVsbCcsXG4gICAgc3RhcnQsXG4gICAgZW5kLFxuICAgIHRleHQ6IGNvbnRleHQub3JpZ2luYWwuc3Vic3RyaW5nKHN0YXJ0Lm9mZnNldCwgZW5kLm9mZnNldCksXG4gICAgdmFsdWU6IG51bGwsXG4gICAgY29tbWVudHM6IGNvbW1lbnRzLFxuICB9O1xufVxuXG5cbi8qKlxuICogUmVhZCBhbiBhcnJheSBvZiBKU09OIHZhbHVlcyBmcm9tIHRoZSBjb250ZXh0LlxuICogQHByaXZhdGVcbiAqL1xuZnVuY3Rpb24gX3JlYWRBcnJheShjb250ZXh0OiBKc29uUGFyc2VyQ29udGV4dCwgY29tbWVudHMgPSBfcmVhZEJsYW5rcyhjb250ZXh0KSk6IEpzb25Bc3RBcnJheSB7XG4gIGNvbnN0IHN0YXJ0ID0gY29udGV4dC5wb3NpdGlvbjtcblxuICAvLyBDb25zdW1lIHRoZSBmaXJzdCBkZWxpbWl0ZXIuXG4gIF90b2tlbihjb250ZXh0LCAnWycpO1xuICBjb25zdCB2YWx1ZTogSnNvbkFycmF5ID0gW107XG4gIGNvbnN0IGVsZW1lbnRzOiBKc29uQXN0Tm9kZVtdID0gW107XG5cbiAgX3JlYWRCbGFua3MoY29udGV4dCk7XG4gIGlmIChfcGVlayhjb250ZXh0KSAhPSAnXScpIHtcbiAgICBjb25zdCBub2RlID0gX3JlYWRWYWx1ZShjb250ZXh0KTtcbiAgICBlbGVtZW50cy5wdXNoKG5vZGUpO1xuICAgIHZhbHVlLnB1c2gobm9kZS52YWx1ZSk7XG4gIH1cblxuICB3aGlsZSAoX3BlZWsoY29udGV4dCkgIT0gJ10nKSB7XG4gICAgX3Rva2VuKGNvbnRleHQsICcsJyk7XG5cbiAgICBjb25zdCB2YWx1ZUNvbW1lbnRzID0gX3JlYWRCbGFua3MoY29udGV4dCk7XG4gICAgaWYgKChjb250ZXh0Lm1vZGUgJiBKc29uUGFyc2VNb2RlLlRyYWlsaW5nQ29tbWFzQWxsb3dlZCkgIT09IDAgJiYgX3BlZWsoY29udGV4dCkgPT09ICddJykge1xuICAgICAgYnJlYWs7XG4gICAgfVxuICAgIGNvbnN0IG5vZGUgPSBfcmVhZFZhbHVlKGNvbnRleHQsIHZhbHVlQ29tbWVudHMpO1xuICAgIGVsZW1lbnRzLnB1c2gobm9kZSk7XG4gICAgdmFsdWUucHVzaChub2RlLnZhbHVlKTtcbiAgfVxuXG4gIF90b2tlbihjb250ZXh0LCAnXScpO1xuXG4gIHJldHVybiB7XG4gICAga2luZDogJ2FycmF5JyxcbiAgICBzdGFydCxcbiAgICBlbmQ6IGNvbnRleHQucG9zaXRpb24sXG4gICAgdGV4dDogY29udGV4dC5vcmlnaW5hbC5zdWJzdHJpbmcoc3RhcnQub2Zmc2V0LCBjb250ZXh0LnBvc2l0aW9uLm9mZnNldCksXG4gICAgdmFsdWUsXG4gICAgZWxlbWVudHMsXG4gICAgY29tbWVudHMsXG4gIH07XG59XG5cblxuLyoqXG4gKiBSZWFkIGFuIGlkZW50aWZpZXIgZnJvbSB0aGUgY29udGV4dC4gQW4gaWRlbnRpZmllciBpcyBhIHZhbGlkIEphdmFTY3JpcHQgaWRlbnRpZmllciwgYW5kIHRoaXNcbiAqIGZ1bmN0aW9uIGlzIG9ubHkgdXNlZCBpbiBMb29zZSBtb2RlLlxuICogQHByaXZhdGVcbiAqL1xuZnVuY3Rpb24gX3JlYWRJZGVudGlmaWVyKGNvbnRleHQ6IEpzb25QYXJzZXJDb250ZXh0LFxuICAgICAgICAgICAgICAgICAgICAgICAgIGNvbW1lbnRzID0gX3JlYWRCbGFua3MoY29udGV4dCkpOiBKc29uQXN0SWRlbnRpZmllciB7XG4gIGNvbnN0IHN0YXJ0ID0gY29udGV4dC5wb3NpdGlvbjtcblxuICBsZXQgY2hhciA9IF9wZWVrKGNvbnRleHQpO1xuICBpZiAoY2hhciAmJiAnMDEyMzQ1Njc4OScuaW5kZXhPZihjaGFyKSAhPSAtMSkge1xuICAgIGNvbnN0IGlkZW50aWZpZXJOb2RlID0gX3JlYWROdW1iZXIoY29udGV4dCk7XG5cbiAgICByZXR1cm4ge1xuICAgICAga2luZDogJ2lkZW50aWZpZXInLFxuICAgICAgc3RhcnQsXG4gICAgICBlbmQ6IGlkZW50aWZpZXJOb2RlLmVuZCxcbiAgICAgIHRleHQ6IGlkZW50aWZpZXJOb2RlLnRleHQsXG4gICAgICB2YWx1ZTogaWRlbnRpZmllck5vZGUudmFsdWUudG9TdHJpbmcoKSxcbiAgICB9O1xuICB9XG5cbiAgY29uc3QgaWRlbnRWYWxpZEZpcnN0Q2hhciA9ICdhYmNkZWZnaGlqa2xtbm9wcXJzdHV2d3h5ekFCQ0RFRkdISUpLTE1PUFFSU1RVVldYWVonO1xuICBjb25zdCBpZGVudFZhbGlkQ2hhciA9ICdfJGFiY2RlZmdoaWprbG1ub3BxcnN0dXZ3eHl6QUJDREVGR0hJSktMTU9QUVJTVFVWV1hZWjAxMjM0NTY3ODknO1xuICBsZXQgZmlyc3QgPSB0cnVlO1xuICBsZXQgdmFsdWUgPSAnJztcblxuICB3aGlsZSAodHJ1ZSkge1xuICAgIGNoYXIgPSBfdG9rZW4oY29udGV4dCk7XG4gICAgaWYgKGNoYXIgPT0gdW5kZWZpbmVkXG4gICAgICAgIHx8IChmaXJzdCA/IGlkZW50VmFsaWRGaXJzdENoYXIuaW5kZXhPZihjaGFyKSA6IGlkZW50VmFsaWRDaGFyLmluZGV4T2YoY2hhcikpID09IC0xKSB7XG4gICAgICBjb250ZXh0LnBvc2l0aW9uID0gY29udGV4dC5wcmV2aW91cztcblxuICAgICAgcmV0dXJuIHtcbiAgICAgICAga2luZDogJ2lkZW50aWZpZXInLFxuICAgICAgICBzdGFydCxcbiAgICAgICAgZW5kOiBjb250ZXh0LnBvc2l0aW9uLFxuICAgICAgICB0ZXh0OiBjb250ZXh0Lm9yaWdpbmFsLnN1YnN0cihzdGFydC5vZmZzZXQsIGNvbnRleHQucG9zaXRpb24ub2Zmc2V0KSxcbiAgICAgICAgdmFsdWUsXG4gICAgICAgIGNvbW1lbnRzLFxuICAgICAgfTtcbiAgICB9XG5cbiAgICB2YWx1ZSArPSBjaGFyO1xuICAgIGZpcnN0ID0gZmFsc2U7XG4gIH1cbn1cblxuXG4vKipcbiAqIFJlYWQgYSBwcm9wZXJ0eSBmcm9tIHRoZSBjb250ZXh0LiBBIHByb3BlcnR5IGlzIGEgc3RyaW5nIG9yIChpbiBMb29zZSBtb2RlIG9ubHkpIGEgbnVtYmVyIG9yXG4gKiBhbiBpZGVudGlmaWVyLCBmb2xsb3dlZCBieSBhIGNvbG9uIGA6YC5cbiAqIEBwcml2YXRlXG4gKi9cbmZ1bmN0aW9uIF9yZWFkUHJvcGVydHkoY29udGV4dDogSnNvblBhcnNlckNvbnRleHQsXG4gICAgICAgICAgICAgICAgICAgICAgIGNvbW1lbnRzID0gX3JlYWRCbGFua3MoY29udGV4dCkpOiBKc29uQXN0S2V5VmFsdWUge1xuICBjb25zdCBzdGFydCA9IGNvbnRleHQucG9zaXRpb247XG5cbiAgbGV0IGtleTtcbiAgaWYgKChjb250ZXh0Lm1vZGUgJiBKc29uUGFyc2VNb2RlLklkZW50aWZpZXJLZXlOYW1lc0FsbG93ZWQpICE9IDApIHtcbiAgICBjb25zdCB0b3AgPSBfcGVlayhjb250ZXh0KTtcbiAgICBpZiAodG9wID09ICdcIicgfHwgdG9wID09ICdcXCcnKSB7XG4gICAgICBrZXkgPSBfcmVhZFN0cmluZyhjb250ZXh0KTtcbiAgICB9IGVsc2Uge1xuICAgICAga2V5ID0gX3JlYWRJZGVudGlmaWVyKGNvbnRleHQpO1xuICAgIH1cbiAgfSBlbHNlIHtcbiAgICBrZXkgPSBfcmVhZFN0cmluZyhjb250ZXh0KTtcbiAgfVxuXG4gIF9yZWFkQmxhbmtzKGNvbnRleHQpO1xuICBfdG9rZW4oY29udGV4dCwgJzonKTtcbiAgY29uc3QgdmFsdWUgPSBfcmVhZFZhbHVlKGNvbnRleHQpO1xuICBjb25zdCBlbmQgPSBjb250ZXh0LnBvc2l0aW9uO1xuXG4gIHJldHVybiB7XG4gICAga2luZDogJ2tleXZhbHVlJyxcbiAgICBrZXksXG4gICAgdmFsdWUsXG4gICAgc3RhcnQsXG4gICAgZW5kLFxuICAgIHRleHQ6IGNvbnRleHQub3JpZ2luYWwuc3Vic3RyaW5nKHN0YXJ0Lm9mZnNldCwgZW5kLm9mZnNldCksXG4gICAgY29tbWVudHMsXG4gIH07XG59XG5cblxuLyoqXG4gKiBSZWFkIGFuIG9iamVjdCBvZiBwcm9wZXJ0aWVzIC0+IEpTT04gdmFsdWVzIGZyb20gdGhlIGNvbnRleHQuXG4gKiBAcHJpdmF0ZVxuICovXG5mdW5jdGlvbiBfcmVhZE9iamVjdChjb250ZXh0OiBKc29uUGFyc2VyQ29udGV4dCxcbiAgICAgICAgICAgICAgICAgICAgIGNvbW1lbnRzID0gX3JlYWRCbGFua3MoY29udGV4dCkpOiBKc29uQXN0T2JqZWN0IHtcbiAgY29uc3Qgc3RhcnQgPSBjb250ZXh0LnBvc2l0aW9uO1xuICAvLyBDb25zdW1lIHRoZSBmaXJzdCBkZWxpbWl0ZXIuXG4gIF90b2tlbihjb250ZXh0LCAneycpO1xuICBjb25zdCB2YWx1ZTogSnNvbk9iamVjdCA9IHt9O1xuICBjb25zdCBwcm9wZXJ0aWVzOiBKc29uQXN0S2V5VmFsdWVbXSA9IFtdO1xuXG4gIF9yZWFkQmxhbmtzKGNvbnRleHQpO1xuICBpZiAoX3BlZWsoY29udGV4dCkgIT0gJ30nKSB7XG4gICAgY29uc3QgcHJvcGVydHkgPSBfcmVhZFByb3BlcnR5KGNvbnRleHQpO1xuICAgIHZhbHVlW3Byb3BlcnR5LmtleS52YWx1ZV0gPSBwcm9wZXJ0eS52YWx1ZS52YWx1ZTtcbiAgICBwcm9wZXJ0aWVzLnB1c2gocHJvcGVydHkpO1xuXG4gICAgd2hpbGUgKF9wZWVrKGNvbnRleHQpICE9ICd9Jykge1xuICAgICAgX3Rva2VuKGNvbnRleHQsICcsJyk7XG5cbiAgICAgIGNvbnN0IHByb3BlcnR5Q29tbWVudHMgPSBfcmVhZEJsYW5rcyhjb250ZXh0KTtcbiAgICAgIGlmICgoY29udGV4dC5tb2RlICYgSnNvblBhcnNlTW9kZS5UcmFpbGluZ0NvbW1hc0FsbG93ZWQpICE9PSAwICYmIF9wZWVrKGNvbnRleHQpID09PSAnfScpIHtcbiAgICAgICAgYnJlYWs7XG4gICAgICB9XG4gICAgICBjb25zdCBwcm9wZXJ0eSA9IF9yZWFkUHJvcGVydHkoY29udGV4dCwgcHJvcGVydHlDb21tZW50cyk7XG4gICAgICB2YWx1ZVtwcm9wZXJ0eS5rZXkudmFsdWVdID0gcHJvcGVydHkudmFsdWUudmFsdWU7XG4gICAgICBwcm9wZXJ0aWVzLnB1c2gocHJvcGVydHkpO1xuICAgIH1cbiAgfVxuXG4gIF90b2tlbihjb250ZXh0LCAnfScpO1xuXG4gIHJldHVybiB7XG4gICAga2luZDogJ29iamVjdCcsXG4gICAgcHJvcGVydGllcyxcbiAgICBzdGFydCxcbiAgICBlbmQ6IGNvbnRleHQucG9zaXRpb24sXG4gICAgdmFsdWUsXG4gICAgdGV4dDogY29udGV4dC5vcmlnaW5hbC5zdWJzdHJpbmcoc3RhcnQub2Zmc2V0LCBjb250ZXh0LnBvc2l0aW9uLm9mZnNldCksXG4gICAgY29tbWVudHMsXG4gIH07XG59XG5cblxuLyoqXG4gKiBSZW1vdmUgYW55IGJsYW5rIGNoYXJhY3RlciBvciBjb21tZW50cyAoaW4gTG9vc2UgbW9kZSkgZnJvbSB0aGUgY29udGV4dCwgcmV0dXJuaW5nIGFuIGFycmF5XG4gKiBvZiBjb21tZW50cyBpZiBhbnkgYXJlIGZvdW5kLlxuICogQHByaXZhdGVcbiAqL1xuZnVuY3Rpb24gX3JlYWRCbGFua3MoY29udGV4dDogSnNvblBhcnNlckNvbnRleHQpOiAoSnNvbkFzdENvbW1lbnQgfCBKc29uQXN0TXVsdGlsaW5lQ29tbWVudClbXSB7XG4gIGlmICgoY29udGV4dC5tb2RlICYgSnNvblBhcnNlTW9kZS5Db21tZW50c0FsbG93ZWQpICE9IDApIHtcbiAgICBjb25zdCBjb21tZW50czogKEpzb25Bc3RDb21tZW50IHwgSnNvbkFzdE11bHRpbGluZUNvbW1lbnQpW10gPSBbXTtcbiAgICB3aGlsZSAodHJ1ZSkge1xuICAgICAgbGV0IGNoYXIgPSBjb250ZXh0Lm9yaWdpbmFsW2NvbnRleHQucG9zaXRpb24ub2Zmc2V0XTtcbiAgICAgIGlmIChjaGFyID09ICcvJyAmJiBjb250ZXh0Lm9yaWdpbmFsW2NvbnRleHQucG9zaXRpb24ub2Zmc2V0ICsgMV0gPT0gJyonKSB7XG4gICAgICAgIGNvbnN0IHN0YXJ0ID0gY29udGV4dC5wb3NpdGlvbjtcbiAgICAgICAgLy8gTXVsdGkgbGluZSBjb21tZW50LlxuICAgICAgICBfbmV4dChjb250ZXh0KTtcbiAgICAgICAgX25leHQoY29udGV4dCk7XG4gICAgICAgIGNoYXIgPSBjb250ZXh0Lm9yaWdpbmFsW2NvbnRleHQucG9zaXRpb24ub2Zmc2V0XTtcbiAgICAgICAgd2hpbGUgKGNvbnRleHQub3JpZ2luYWxbY29udGV4dC5wb3NpdGlvbi5vZmZzZXRdICE9ICcqJ1xuICAgICAgICAgICAgfHwgY29udGV4dC5vcmlnaW5hbFtjb250ZXh0LnBvc2l0aW9uLm9mZnNldCArIDFdICE9ICcvJykge1xuICAgICAgICAgIF9uZXh0KGNvbnRleHQpO1xuICAgICAgICAgIGlmIChjb250ZXh0LnBvc2l0aW9uLm9mZnNldCA+PSBjb250ZXh0Lm9yaWdpbmFsLmxlbmd0aCkge1xuICAgICAgICAgICAgdGhyb3cgbmV3IFVuZXhwZWN0ZWRFbmRPZklucHV0RXhjZXB0aW9uKGNvbnRleHQpO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICAvLyBSZW1vdmUgXCIqL1wiLlxuICAgICAgICBfbmV4dChjb250ZXh0KTtcbiAgICAgICAgX25leHQoY29udGV4dCk7XG5cbiAgICAgICAgY29tbWVudHMucHVzaCh7XG4gICAgICAgICAga2luZDogJ211bHRpY29tbWVudCcsXG4gICAgICAgICAgc3RhcnQsXG4gICAgICAgICAgZW5kOiBjb250ZXh0LnBvc2l0aW9uLFxuICAgICAgICAgIHRleHQ6IGNvbnRleHQub3JpZ2luYWwuc3Vic3RyaW5nKHN0YXJ0Lm9mZnNldCwgY29udGV4dC5wb3NpdGlvbi5vZmZzZXQpLFxuICAgICAgICAgIGNvbnRlbnQ6IGNvbnRleHQub3JpZ2luYWwuc3Vic3RyaW5nKHN0YXJ0Lm9mZnNldCArIDIsIGNvbnRleHQucG9zaXRpb24ub2Zmc2V0IC0gMiksXG4gICAgICAgIH0pO1xuICAgICAgfSBlbHNlIGlmIChjaGFyID09ICcvJyAmJiBjb250ZXh0Lm9yaWdpbmFsW2NvbnRleHQucG9zaXRpb24ub2Zmc2V0ICsgMV0gPT0gJy8nKSB7XG4gICAgICAgIGNvbnN0IHN0YXJ0ID0gY29udGV4dC5wb3NpdGlvbjtcbiAgICAgICAgLy8gTXVsdGkgbGluZSBjb21tZW50LlxuICAgICAgICBfbmV4dChjb250ZXh0KTtcbiAgICAgICAgX25leHQoY29udGV4dCk7XG4gICAgICAgIGNoYXIgPSBjb250ZXh0Lm9yaWdpbmFsW2NvbnRleHQucG9zaXRpb24ub2Zmc2V0XTtcbiAgICAgICAgd2hpbGUgKGNvbnRleHQub3JpZ2luYWxbY29udGV4dC5wb3NpdGlvbi5vZmZzZXRdICE9ICdcXG4nKSB7XG4gICAgICAgICAgX25leHQoY29udGV4dCk7XG4gICAgICAgICAgaWYgKGNvbnRleHQucG9zaXRpb24ub2Zmc2V0ID49IGNvbnRleHQub3JpZ2luYWwubGVuZ3RoKSB7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICAvLyBSZW1vdmUgXCJcXG5cIi5cbiAgICAgICAgaWYgKGNvbnRleHQucG9zaXRpb24ub2Zmc2V0IDwgY29udGV4dC5vcmlnaW5hbC5sZW5ndGgpIHtcbiAgICAgICAgICBfbmV4dChjb250ZXh0KTtcbiAgICAgICAgfVxuICAgICAgICBjb21tZW50cy5wdXNoKHtcbiAgICAgICAgICBraW5kOiAnY29tbWVudCcsXG4gICAgICAgICAgc3RhcnQsXG4gICAgICAgICAgZW5kOiBjb250ZXh0LnBvc2l0aW9uLFxuICAgICAgICAgIHRleHQ6IGNvbnRleHQub3JpZ2luYWwuc3Vic3RyaW5nKHN0YXJ0Lm9mZnNldCwgY29udGV4dC5wb3NpdGlvbi5vZmZzZXQpLFxuICAgICAgICAgIGNvbnRlbnQ6IGNvbnRleHQub3JpZ2luYWwuc3Vic3RyaW5nKHN0YXJ0Lm9mZnNldCArIDIsIGNvbnRleHQucG9zaXRpb24ub2Zmc2V0IC0gMSksXG4gICAgICAgIH0pO1xuICAgICAgfSBlbHNlIGlmIChjaGFyID09ICcgJyB8fCBjaGFyID09ICdcXHQnIHx8IGNoYXIgPT0gJ1xcbicgfHwgY2hhciA9PSAnXFxyJyB8fCBjaGFyID09ICdcXGYnKSB7XG4gICAgICAgIF9uZXh0KGNvbnRleHQpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgYnJlYWs7XG4gICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIGNvbW1lbnRzO1xuICB9IGVsc2Uge1xuICAgIGxldCBjaGFyID0gY29udGV4dC5vcmlnaW5hbFtjb250ZXh0LnBvc2l0aW9uLm9mZnNldF07XG4gICAgd2hpbGUgKGNoYXIgPT0gJyAnIHx8IGNoYXIgPT0gJ1xcdCcgfHwgY2hhciA9PSAnXFxuJyB8fCBjaGFyID09ICdcXHInIHx8IGNoYXIgPT0gJ1xcZicpIHtcbiAgICAgIF9uZXh0KGNvbnRleHQpO1xuICAgICAgY2hhciA9IGNvbnRleHQub3JpZ2luYWxbY29udGV4dC5wb3NpdGlvbi5vZmZzZXRdO1xuICAgIH1cblxuICAgIHJldHVybiBbXTtcbiAgfVxufVxuXG5cbi8qKlxuICogUmVhZCBhIEpTT04gdmFsdWUgZnJvbSB0aGUgY29udGV4dCwgd2hpY2ggY2FuIGJlIGFueSBmb3JtIG9mIEpTT04gdmFsdWUuXG4gKiBAcHJpdmF0ZVxuICovXG5mdW5jdGlvbiBfcmVhZFZhbHVlKGNvbnRleHQ6IEpzb25QYXJzZXJDb250ZXh0LCBjb21tZW50cyA9IF9yZWFkQmxhbmtzKGNvbnRleHQpKTogSnNvbkFzdE5vZGUge1xuICBsZXQgcmVzdWx0OiBKc29uQXN0Tm9kZTtcblxuICAvLyBDbGVhbiB1cCBiZWZvcmUuXG4gIGNvbnN0IGNoYXIgPSBfcGVlayhjb250ZXh0KTtcbiAgc3dpdGNoIChjaGFyKSB7XG4gICAgY2FzZSB1bmRlZmluZWQ6XG4gICAgICB0aHJvdyBuZXcgVW5leHBlY3RlZEVuZE9mSW5wdXRFeGNlcHRpb24oY29udGV4dCk7XG5cbiAgICBjYXNlICctJzpcbiAgICBjYXNlICcwJzpcbiAgICBjYXNlICcxJzpcbiAgICBjYXNlICcyJzpcbiAgICBjYXNlICczJzpcbiAgICBjYXNlICc0JzpcbiAgICBjYXNlICc1JzpcbiAgICBjYXNlICc2JzpcbiAgICBjYXNlICc3JzpcbiAgICBjYXNlICc4JzpcbiAgICBjYXNlICc5JzpcbiAgICAgIHJlc3VsdCA9IF9yZWFkTnVtYmVyKGNvbnRleHQsIGNvbW1lbnRzKTtcbiAgICAgIGJyZWFrO1xuXG4gICAgY2FzZSAnXFwnJzpcbiAgICBjYXNlICdcIic6XG4gICAgICByZXN1bHQgPSBfcmVhZFN0cmluZyhjb250ZXh0LCBjb21tZW50cyk7XG4gICAgICBicmVhaztcblxuICAgIGNhc2UgJ3QnOlxuICAgICAgcmVzdWx0ID0gX3JlYWRUcnVlKGNvbnRleHQsIGNvbW1lbnRzKTtcbiAgICAgIGJyZWFrO1xuICAgIGNhc2UgJ2YnOlxuICAgICAgcmVzdWx0ID0gX3JlYWRGYWxzZShjb250ZXh0LCBjb21tZW50cyk7XG4gICAgICBicmVhaztcbiAgICBjYXNlICduJzpcbiAgICAgIHJlc3VsdCA9IF9yZWFkTnVsbChjb250ZXh0LCBjb21tZW50cyk7XG4gICAgICBicmVhaztcblxuICAgIGNhc2UgJ1snOlxuICAgICAgcmVzdWx0ID0gX3JlYWRBcnJheShjb250ZXh0LCBjb21tZW50cyk7XG4gICAgICBicmVhaztcblxuICAgIGNhc2UgJ3snOlxuICAgICAgcmVzdWx0ID0gX3JlYWRPYmplY3QoY29udGV4dCwgY29tbWVudHMpO1xuICAgICAgYnJlYWs7XG5cbiAgICBkZWZhdWx0OlxuICAgICAgdGhyb3cgbmV3IEludmFsaWRKc29uQ2hhcmFjdGVyRXhjZXB0aW9uKGNvbnRleHQpO1xuICB9XG5cbiAgLy8gQ2xlYW4gdXAgYWZ0ZXIuXG4gIF9yZWFkQmxhbmtzKGNvbnRleHQpO1xuXG4gIHJldHVybiByZXN1bHQ7XG59XG5cblxuLyoqXG4gKiBUaGUgUGFyc2UgbW9kZSB1c2VkIGZvciBwYXJzaW5nIHRoZSBKU09OIHN0cmluZy5cbiAqL1xuZXhwb3J0IGVudW0gSnNvblBhcnNlTW9kZSB7XG4gIFN0cmljdCAgICAgICAgICAgICAgICAgICAgPSAgICAgIDAsICAvLyBTdGFuZGFyZCBKU09OLlxuICBDb21tZW50c0FsbG93ZWQgICAgICAgICAgID0gMSA8PCAwLCAgLy8gQWxsb3dzIGNvbW1lbnRzLCBib3RoIHNpbmdsZSBvciBtdWx0aSBsaW5lcy5cbiAgU2luZ2xlUXVvdGVzQWxsb3dlZCAgICAgICA9IDEgPDwgMSwgIC8vIEFsbG93IHNpbmdsZSBxdW90ZWQgc3RyaW5ncy5cbiAgSWRlbnRpZmllcktleU5hbWVzQWxsb3dlZCA9IDEgPDwgMiwgIC8vIEFsbG93IGlkZW50aWZpZXJzIGFzIG9iamVjdHAgcHJvcGVydGllcy5cbiAgVHJhaWxpbmdDb21tYXNBbGxvd2VkICAgICA9IDEgPDwgMyxcblxuICBEZWZhdWx0ICAgICAgICAgICAgICAgICAgID0gU3RyaWN0LFxuICBMb29zZSAgICAgICAgICAgICAgICAgICAgID0gQ29tbWVudHNBbGxvd2VkIHwgU2luZ2xlUXVvdGVzQWxsb3dlZCB8XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICBJZGVudGlmaWVyS2V5TmFtZXNBbGxvd2VkIHwgVHJhaWxpbmdDb21tYXNBbGxvd2VkLFxufVxuXG5cbi8qKlxuICogUGFyc2UgdGhlIEpTT04gc3RyaW5nIGFuZCByZXR1cm4gaXRzIEFTVC4gVGhlIEFTVCBtYXkgYmUgbG9zaW5nIGRhdGEgKGVuZCBjb21tZW50cyBhcmVcbiAqIGRpc2NhcmRlZCBmb3IgZXhhbXBsZSwgYW5kIHNwYWNlIGNoYXJhY3RlcnMgYXJlIG5vdCByZXByZXNlbnRlZCBpbiB0aGUgQVNUKSwgYnV0IGFsbCB2YWx1ZXNcbiAqIHdpbGwgaGF2ZSBhIHNpbmdsZSBub2RlIGluIHRoZSBBU1QgKGEgMS10by0xIG1hcHBpbmcpLlxuICogQHBhcmFtIGlucHV0IFRoZSBzdHJpbmcgdG8gdXNlLlxuICogQHBhcmFtIG1vZGUgVGhlIG1vZGUgdG8gcGFyc2UgdGhlIGlucHV0IHdpdGguIHtAc2VlIEpzb25QYXJzZU1vZGV9LlxuICogQHJldHVybnMge0pzb25Bc3ROb2RlfSBUaGUgcm9vdCBub2RlIG9mIHRoZSB2YWx1ZSBvZiB0aGUgQVNULlxuICovXG5leHBvcnQgZnVuY3Rpb24gcGFyc2VKc29uQXN0KGlucHV0OiBzdHJpbmcsIG1vZGUgPSBKc29uUGFyc2VNb2RlLkRlZmF1bHQpOiBKc29uQXN0Tm9kZSB7XG4gIGlmIChtb2RlID09IEpzb25QYXJzZU1vZGUuRGVmYXVsdCkge1xuICAgIG1vZGUgPSBKc29uUGFyc2VNb2RlLlN0cmljdDtcbiAgfVxuXG4gIGNvbnN0IGNvbnRleHQgPSB7XG4gICAgcG9zaXRpb246IHsgb2Zmc2V0OiAwLCBsaW5lOiAwLCBjaGFyYWN0ZXI6IDAgfSxcbiAgICBwcmV2aW91czogeyBvZmZzZXQ6IDAsIGxpbmU6IDAsIGNoYXJhY3RlcjogMCB9LFxuICAgIG9yaWdpbmFsOiBpbnB1dCxcbiAgICBjb21tZW50czogdW5kZWZpbmVkLFxuICAgIG1vZGUsXG4gIH07XG5cbiAgY29uc3QgYXN0ID0gX3JlYWRWYWx1ZShjb250ZXh0KTtcbiAgaWYgKGNvbnRleHQucG9zaXRpb24ub2Zmc2V0IDwgaW5wdXQubGVuZ3RoKSB7XG4gICAgY29uc3QgcmVzdCA9IGlucHV0LnN1YnN0cihjb250ZXh0LnBvc2l0aW9uLm9mZnNldCk7XG4gICAgY29uc3QgaSA9IHJlc3QubGVuZ3RoID4gMjAgPyByZXN0LnN1YnN0cigwLCAyMCkgKyAnLi4uJyA6IHJlc3Q7XG4gICAgdGhyb3cgbmV3IEVycm9yKGBFeHBlY3RlZCBlbmQgb2YgZmlsZSwgZ290IFwiJHtpfVwiIGF0IGBcbiAgICAgICAgKyBgJHtjb250ZXh0LnBvc2l0aW9uLmxpbmV9OiR7Y29udGV4dC5wb3NpdGlvbi5jaGFyYWN0ZXJ9LmApO1xuICB9XG5cbiAgcmV0dXJuIGFzdDtcbn1cblxuXG4vKipcbiAqIFBhcnNlIGEgSlNPTiBzdHJpbmcgaW50byBpdHMgdmFsdWUuICBUaGlzIGRpc2NhcmRzIHRoZSBBU1QgYW5kIG9ubHkgcmV0dXJucyB0aGUgdmFsdWUgaXRzZWxmLlxuICogQHBhcmFtIGlucHV0IFRoZSBzdHJpbmcgdG8gcGFyc2UuXG4gKiBAcGFyYW0gbW9kZSBUaGUgbW9kZSB0byBwYXJzZSB0aGUgaW5wdXQgd2l0aC4ge0BzZWUgSnNvblBhcnNlTW9kZX0uXG4gKiBAcmV0dXJucyB7SnNvblZhbHVlfSBUaGUgdmFsdWUgcmVwcmVzZW50ZWQgYnkgdGhlIEpTT04gc3RyaW5nLlxuICovXG5leHBvcnQgZnVuY3Rpb24gcGFyc2VKc29uKGlucHV0OiBzdHJpbmcsIG1vZGUgPSBKc29uUGFyc2VNb2RlLkRlZmF1bHQpOiBKc29uVmFsdWUge1xuICAvLyBUcnkgcGFyc2luZyBmb3IgdGhlIGZhc3Rlc3QgcGF0aCBhdmFpbGFibGUsIGlmIGVycm9yLCB1c2VzIG91ciBvd24gcGFyc2VyIGZvciBiZXR0ZXIgZXJyb3JzLlxuICBpZiAobW9kZSA9PSBKc29uUGFyc2VNb2RlLlN0cmljdCkge1xuICAgIHRyeSB7XG4gICAgICByZXR1cm4gSlNPTi5wYXJzZShpbnB1dCk7XG4gICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICByZXR1cm4gcGFyc2VKc29uQXN0KGlucHV0LCBtb2RlKS52YWx1ZTtcbiAgICB9XG4gIH1cblxuICByZXR1cm4gcGFyc2VKc29uQXN0KGlucHV0LCBtb2RlKS52YWx1ZTtcbn1cbiJdfQ==
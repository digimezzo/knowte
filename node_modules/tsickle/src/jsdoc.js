/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
var __values = (this && this.__values) || function (o) {
    var m = typeof Symbol === "function" && o[Symbol.iterator], i = 0;
    if (m) return m.call(o);
    return {
        next: function () {
            if (o && i >= o.length) o = void 0;
            return { value: o && o[i++], done: !o };
        }
    };
};
var __read = (this && this.__read) || function (o, n) {
    var m = typeof Symbol === "function" && o[Symbol.iterator];
    if (!m) return o;
    var i = m.call(o), r, ar = [], e;
    try {
        while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
    }
    catch (error) { e = { error: error }; }
    finally {
        try {
            if (r && !r.done && (m = i["return"])) m.call(i);
        }
        finally { if (e) throw e.error; }
    }
    return ar;
};
(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define("tsickle/src/jsdoc", ["require", "exports", "tsickle/src/util"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var util_1 = require("tsickle/src/util");
    /**
     * A list of all JSDoc tags allowed by the Closure compiler.
     * The public Closure docs don't list all the tags it allows; this list comes
     * from the compiler source itself.
     * https://github.com/google/closure-compiler/blob/master/src/com/google/javascript/jscomp/parsing/Annotation.java
     * https://github.com/google/closure-compiler/blob/master/src/com/google/javascript/jscomp/parsing/ParserConfig.properties
     */
    var JSDOC_TAGS_WHITELIST = new Set([
        'abstract', 'argument',
        'author', 'consistentIdGenerator',
        'const', 'constant',
        'constructor', 'copyright',
        'define', 'deprecated',
        'desc', 'dict',
        'disposes', 'enhance',
        'enhanceable', 'enum',
        'export', 'expose',
        'extends', 'externs',
        'fileoverview', 'final',
        'hassoydelcall', 'hassoydeltemplate',
        'hidden', 'id',
        'idGenerator', 'ignore',
        'implements', 'implicitCast',
        'inheritDoc', 'interface',
        'jaggerInject', 'jaggerModule',
        'jaggerProvide', 'jaggerProvidePromise',
        'lends', 'license',
        'link', 'meaning',
        'modifies', 'modName',
        'mods', 'ngInject',
        'noalias', 'nocollapse',
        'nocompile', 'nosideeffects',
        'override', 'owner',
        'package', 'param',
        'pintomodule', 'polymerBehavior',
        'preserve', 'preserveTry',
        'private', 'protected',
        'public', 'record',
        'requirecss', 'requires',
        'return', 'returns',
        'see', 'stableIdGenerator',
        'struct', 'suppress',
        'template', 'this',
        'throws', 'type',
        'typedef', 'unrestricted',
        'version', 'wizaction',
        'wizmodule',
    ]);
    /**
     * A list of JSDoc @tags that are never allowed in TypeScript source. These are Closure tags that
     * can be expressed in the TypeScript surface syntax. As tsickle's emit will mangle type names,
     * these will cause Closure Compiler issues and should not be used.
     */
    var JSDOC_TAGS_BLACKLIST = new Set([
        'augments', 'class', 'constructs', 'constructor', 'enum', 'extends', 'field',
        'function', 'implements', 'interface', 'lends', 'namespace', 'private', 'public',
        'record', 'static', 'template', 'this', 'type', 'typedef',
    ]);
    /**
     * A list of JSDoc @tags that might include a {type} after them. Only banned when a type is passed.
     * Note that this does not include tags that carry a non-type system type, e.g. \@suppress.
     */
    var JSDOC_TAGS_WITH_TYPES = new Set([
        'const',
        'export',
        'param',
        'return',
    ]);
    /**
     * parse parses JSDoc out of a comment string.
     * Returns null if comment is not JSDoc.
     */
    // TODO(martinprobst): representing JSDoc as a list of tags is too simplistic. We need functionality
    // such as merging (below), de-duplicating certain tags (@deprecated), and special treatment for
    // others (e.g. @suppress). We should introduce a proper model class with a more suitable data
    // strucure (e.g. a Map<TagName, Values[]>).
    function parse(comment) {
        // Make sure we have proper line endings before parsing on Windows.
        comment = util_1.normalizeLineEndings(comment);
        // TODO(evanm): this is a pile of hacky regexes for now, because we
        // would rather use the better TypeScript implementation of JSDoc
        // parsing.  https://github.com/Microsoft/TypeScript/issues/7393
        var match = comment.match(/^\/\*\*([\s\S]*?)\*\/$/);
        if (!match)
            return null;
        return parseContents(match[1].trim());
    }
    exports.parse = parse;
    /**
     * parseContents parses JSDoc out of a comment text.
     * Returns null if comment is not JSDoc.
     *
     * @param commentText a comment's text content, i.e. the comment w/o /* and * /.
     */
    function parseContents(commentText) {
        var e_1, _a, _b, _c;
        // Make sure we have proper line endings before parsing on Windows.
        commentText = util_1.normalizeLineEndings(commentText);
        // Strip all the " * " bits from the front of each line.
        commentText = commentText.replace(/^\s*\*? ?/gm, '');
        var lines = commentText.split('\n');
        var tags = [];
        var warnings = [];
        try {
            for (var lines_1 = __values(lines), lines_1_1 = lines_1.next(); !lines_1_1.done; lines_1_1 = lines_1.next()) {
                var line = lines_1_1.value;
                var match = line.match(/^\s*@(\S+) *(.*)/);
                if (match) {
                    var _d = __read(match, 3), _ = _d[0], tagName = _d[1], text = _d[2];
                    if (tagName === 'returns') {
                        // A synonym for 'return'.
                        tagName = 'return';
                    }
                    var type = void 0;
                    if (JSDOC_TAGS_BLACKLIST.has(tagName)) {
                        warnings.push("@" + tagName + " annotations are redundant with TypeScript equivalents");
                        continue; // Drop the tag so Closure won't process it.
                    }
                    else if (JSDOC_TAGS_WITH_TYPES.has(tagName) && text[0] === '{') {
                        warnings.push("the type annotation on @" + tagName + " is redundant with its TypeScript type, " +
                            "remove the {...} part");
                        continue;
                    }
                    else if (tagName === 'suppress') {
                        var suppressMatch = text.match(/^\{(.*)\}(.*)$/);
                        if (!suppressMatch) {
                            warnings.push("malformed @suppress tag: \"" + text + "\"");
                        }
                        else {
                            _b = __read(suppressMatch, 3), type = _b[1], text = _b[2];
                        }
                    }
                    else if (tagName === 'dict') {
                        warnings.push('use index signatures (`[k: string]: type`) instead of @dict');
                        continue;
                    }
                    // Grab the parameter name from @param tags.
                    var parameterName = void 0;
                    if (tagName === 'param') {
                        match = text.match(/^(\S+) ?(.*)/);
                        if (match)
                            _c = __read(match, 3), _ = _c[0], parameterName = _c[1], text = _c[2];
                    }
                    var tag = { tagName: tagName };
                    if (parameterName)
                        tag.parameterName = parameterName;
                    if (text)
                        tag.text = text;
                    if (type)
                        tag.type = type;
                    tags.push(tag);
                }
                else {
                    // Text without a preceding @tag on it is either the plain text
                    // documentation or a continuation of a previous tag.
                    if (tags.length === 0) {
                        tags.push({ tagName: '', text: line });
                    }
                    else {
                        var lastTag = tags[tags.length - 1];
                        lastTag.text = (lastTag.text || '') + '\n' + line;
                    }
                }
            }
        }
        catch (e_1_1) { e_1 = { error: e_1_1 }; }
        finally {
            try {
                if (lines_1_1 && !lines_1_1.done && (_a = lines_1.return)) _a.call(lines_1);
            }
            finally { if (e_1) throw e_1.error; }
        }
        if (warnings.length > 0) {
            return { tags: tags, warnings: warnings };
        }
        return { tags: tags };
    }
    exports.parseContents = parseContents;
    /**
     * Serializes a Tag into a string usable in a comment.
     * Returns a string like " @foo {bar} baz" (note the whitespace).
     */
    function tagToString(tag, escapeExtraTags) {
        if (escapeExtraTags === void 0) { escapeExtraTags = new Set(); }
        var out = '';
        if (tag.tagName) {
            if (!JSDOC_TAGS_WHITELIST.has(tag.tagName) || escapeExtraTags.has(tag.tagName)) {
                // Escape tags we don't understand.  This is a subtle
                // compromise between multiple issues.
                // 1) If we pass through these non-Closure tags, the user will
                //    get a warning from Closure, and the point of tsickle is
                //    to insulate the user from Closure.
                // 2) The output of tsickle is for Closure but also may be read
                //    by humans, for example non-TypeScript users of Angular.
                // 3) Finally, we don't want to warn because users should be
                //    free to add whichever JSDoc they feel like.  If the user
                //    wants help ensuring they didn't typo a tag, that is the
                //    responsibility of a linter.
                out += " \\@" + tag.tagName;
            }
            else {
                out += " @" + tag.tagName;
            }
        }
        if (tag.type) {
            out += ' {';
            if (tag.restParam) {
                out += '...';
            }
            out += tag.type;
            if (tag.optional) {
                out += '=';
            }
            out += '}';
        }
        if (tag.parameterName) {
            out += ' ' + tag.parameterName;
        }
        if (tag.text) {
            out += ' ' + tag.text.replace(/@/g, '\\@');
        }
        return out;
    }
    /** Tags that must only occur onces in a comment (filtered below). */
    var SINGLETON_TAGS = new Set(['deprecated']);
    /** Tags that conflict with \@type in Closure Compiler (e.g. \@param). */
    exports.TAGS_CONFLICTING_WITH_TYPE = new Set(['param', 'return']);
    /** Serializes a Comment out to a string, but does not include the start and end comment tokens. */
    function toStringWithoutStartEnd(tags, escapeExtraTags) {
        if (escapeExtraTags === void 0) { escapeExtraTags = new Set(); }
        return serialize(tags, false, escapeExtraTags);
    }
    exports.toStringWithoutStartEnd = toStringWithoutStartEnd;
    /** Serializes a Comment out to a string usable in source code. */
    function toString(tags, escapeExtraTags) {
        if (escapeExtraTags === void 0) { escapeExtraTags = new Set(); }
        return serialize(tags, true, escapeExtraTags);
    }
    exports.toString = toString;
    function serialize(tags, includeStartEnd, escapeExtraTags) {
        if (escapeExtraTags === void 0) { escapeExtraTags = new Set(); }
        var e_2, _a;
        if (tags.length === 0)
            return '';
        if (tags.length === 1) {
            var tag = tags[0];
            if ((tag.tagName === 'type' || tag.tagName === 'nocollapse') &&
                (!tag.text || !tag.text.match('\n'))) {
                // Special-case one-liner "type" and "nocollapse" tags to fit on one line, e.g.
                //   /** @type {foo} */
                return '/**' + tagToString(tag, escapeExtraTags) + ' */\n';
            }
            // Otherwise, fall through to the multi-line output.
        }
        var out = includeStartEnd ? '/**\n' : '*\n';
        var emitted = new Set();
        try {
            for (var tags_1 = __values(tags), tags_1_1 = tags_1.next(); !tags_1_1.done; tags_1_1 = tags_1.next()) {
                var tag = tags_1_1.value;
                if (emitted.has(tag.tagName) && SINGLETON_TAGS.has(tag.tagName)) {
                    continue;
                }
                emitted.add(tag.tagName);
                out += ' *';
                // If the tagToString is multi-line, insert " * " prefixes on subsequent lines.
                out += tagToString(tag, escapeExtraTags).split('\n').join('\n * ');
                out += '\n';
            }
        }
        catch (e_2_1) { e_2 = { error: e_2_1 }; }
        finally {
            try {
                if (tags_1_1 && !tags_1_1.done && (_a = tags_1.return)) _a.call(tags_1);
            }
            finally { if (e_2) throw e_2.error; }
        }
        out += includeStartEnd ? ' */\n' : ' ';
        return out;
    }
    /** Merges multiple tags (of the same tagName type) into a single unified tag. */
    function merge(tags) {
        var e_3, _a;
        var tagNames = new Set();
        var parameterNames = new Set();
        var types = new Set();
        var texts = new Set();
        // If any of the tags are optional/rest, then the merged output is optional/rest.
        var optional = false;
        var restParam = false;
        try {
            for (var tags_2 = __values(tags), tags_2_1 = tags_2.next(); !tags_2_1.done; tags_2_1 = tags_2.next()) {
                var tag_1 = tags_2_1.value;
                if (tag_1.tagName)
                    tagNames.add(tag_1.tagName);
                if (tag_1.parameterName)
                    parameterNames.add(tag_1.parameterName);
                if (tag_1.type)
                    types.add(tag_1.type);
                if (tag_1.text)
                    texts.add(tag_1.text);
                if (tag_1.optional)
                    optional = true;
                if (tag_1.restParam)
                    restParam = true;
            }
        }
        catch (e_3_1) { e_3 = { error: e_3_1 }; }
        finally {
            try {
                if (tags_2_1 && !tags_2_1.done && (_a = tags_2.return)) _a.call(tags_2);
            }
            finally { if (e_3) throw e_3.error; }
        }
        if (tagNames.size !== 1) {
            throw new Error("cannot merge differing tags: " + JSON.stringify(tags));
        }
        var tagName = tagNames.values().next().value;
        var parameterName = parameterNames.size > 0 ? Array.from(parameterNames).join('_or_') : undefined;
        var type = types.size > 0 ? Array.from(types).join('|') : undefined;
        var text = texts.size > 0 ? Array.from(texts).join(' / ') : undefined;
        var tag = { tagName: tagName, parameterName: parameterName, type: type, text: text };
        // Note: a param can either be optional or a rest param; if we merged an
        // optional and rest param together, prefer marking it as a rest param.
        if (restParam) {
            tag.restParam = true;
        }
        else if (optional) {
            tag.optional = true;
        }
        return tag;
    }
    exports.merge = merge;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoianNkb2MuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi9zcmMvanNkb2MudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztJQUVILHlDQUE0QztJQXNDNUM7Ozs7OztPQU1HO0lBQ0gsSUFBTSxvQkFBb0IsR0FBRyxJQUFJLEdBQUcsQ0FBQztRQUNuQyxVQUFVLEVBQU8sVUFBVTtRQUMzQixRQUFRLEVBQVMsdUJBQXVCO1FBQ3hDLE9BQU8sRUFBVSxVQUFVO1FBQzNCLGFBQWEsRUFBSSxXQUFXO1FBQzVCLFFBQVEsRUFBUyxZQUFZO1FBQzdCLE1BQU0sRUFBVyxNQUFNO1FBQ3ZCLFVBQVUsRUFBTyxTQUFTO1FBQzFCLGFBQWEsRUFBSSxNQUFNO1FBQ3ZCLFFBQVEsRUFBUyxRQUFRO1FBQ3pCLFNBQVMsRUFBUSxTQUFTO1FBQzFCLGNBQWMsRUFBRyxPQUFPO1FBQ3hCLGVBQWUsRUFBRSxtQkFBbUI7UUFDcEMsUUFBUSxFQUFTLElBQUk7UUFDckIsYUFBYSxFQUFJLFFBQVE7UUFDekIsWUFBWSxFQUFLLGNBQWM7UUFDL0IsWUFBWSxFQUFLLFdBQVc7UUFDNUIsY0FBYyxFQUFHLGNBQWM7UUFDL0IsZUFBZSxFQUFFLHNCQUFzQjtRQUN2QyxPQUFPLEVBQVUsU0FBUztRQUMxQixNQUFNLEVBQVcsU0FBUztRQUMxQixVQUFVLEVBQU8sU0FBUztRQUMxQixNQUFNLEVBQVcsVUFBVTtRQUMzQixTQUFTLEVBQVEsWUFBWTtRQUM3QixXQUFXLEVBQU0sZUFBZTtRQUNoQyxVQUFVLEVBQU8sT0FBTztRQUN4QixTQUFTLEVBQVEsT0FBTztRQUN4QixhQUFhLEVBQUksaUJBQWlCO1FBQ2xDLFVBQVUsRUFBTyxhQUFhO1FBQzlCLFNBQVMsRUFBUSxXQUFXO1FBQzVCLFFBQVEsRUFBUyxRQUFRO1FBQ3pCLFlBQVksRUFBSyxVQUFVO1FBQzNCLFFBQVEsRUFB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QUFTLEdBQUcsSUFBSSxDQUFDO1NBQ3RCO2FBQU0sSUFBSSxRQUFRLEVBQUU7WUFDbkIsR0FBRyxDQUFDLFFBQVEsR0FBRyxJQUFJLENBQUM7U0FDckI7UUFDRCxPQUFPLEdBQUcsQ0FBQztJQUNiLENBQUM7SUFsQ0Qsc0JBa0NDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBJbmMuIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQge25vcm1hbGl6ZUxpbmVFbmRpbmdzfSBmcm9tICcuL3V0aWwnO1xuXG4vKipcbiAqIFR5cGVTY3JpcHQgaGFzIGFuIEFQSSBmb3IgSlNEb2MgYWxyZWFkeSwgYnV0IGl0J3Mgbm90IGV4cG9zZWQuXG4gKiBodHRwczovL2dpdGh1Yi5jb20vTWljcm9zb2Z0L1R5cGVTY3JpcHQvaXNzdWVzLzczOTNcbiAqIEZvciBub3cgd2UgY3JlYXRlIHR5cGVzIHRoYXQgYXJlIHNpbWlsYXIgdG8gdGhlaXJzIHNvIHRoYXQgbWlncmF0aW5nXG4gKiB0byB0aGVpciBBUEkgd2lsbCBiZSBlYXNpZXIuICBTZWUgZS5nLiB0cy5KU0RvY1RhZyBhbmQgdHMuSlNEb2NDb21tZW50LlxuICovXG5leHBvcnQgaW50ZXJmYWNlIFRhZyB7XG4gIC8qKlxuICAgKiB0YWdOYW1lIGlzIGUuZy4gXCJwYXJhbVwiIGluIGFuIEBwYXJhbSBkZWNsYXJhdGlvbi4gIEl0IGlzIHRoZSBlbXB0eSBzdHJpbmdcbiAgICogZm9yIHRoZSBwbGFpbiB0ZXh0IGRvY3VtZW50YXRpb24gdGhhdCBvY2N1cnMgYmVmb3JlIGFueSBAZm9vIGxpbmVzLlxuICAgKi9cbiAgdGFnTmFtZTogc3RyaW5nO1xuICAvKipcbiAgICogcGFyYW1ldGVyTmFtZSBpcyB0aGUgdGhlIG5hbWUgb2YgdGhlIGZ1bmN0aW9uIHBhcmFtZXRlciwgZS5nLiBcImZvb1wiXG4gICAqIGluIGBcXEBwYXJhbSBmb28gVGhlIGZvbyBwYXJhbWBcbiAgICovXG4gIHBhcmFtZXRlck5hbWU/OiBzdHJpbmc7XG4gIC8qKlxuICAgKiBUaGUgdHlwZSBvZiBhIEpTRG9jIFxcQHBhcmFtLCBcXEB0eXBlIGV0YyB0YWcsIHJlbmRlcmVkIGluIGN1cmx5IGJyYWNlcy5cbiAgICogQ2FuIGFsc28gaG9sZCB0aGUgdHlwZSBvZiBhbiBcXEBzdXBwcmVzcy5cbiAgICovXG4gIHR5cGU/OiBzdHJpbmc7XG4gIC8qKiBvcHRpb25hbCBpcyB0cnVlIGZvciBvcHRpb25hbCBmdW5jdGlvbiBwYXJhbWV0ZXJzLiAqL1xuICBvcHRpb25hbD86IGJvb2xlYW47XG4gIC8qKiByZXN0UGFyYW0gaXMgdHJ1ZSBmb3IgXCIuLi54OiBmb29bXVwiIGZ1bmN0aW9uIHBhcmFtZXRlcnMuICovXG4gIHJlc3RQYXJhbT86IGJvb2xlYW47XG4gIC8qKlxuICAgKiBkZXN0cnVjdHVyaW5nIGlzIHRydWUgZm9yIGRlc3RydWN0dXJpbmcgYmluZCBwYXJhbWV0ZXJzLCB3aGljaCByZXF1aXJlXG4gICAqIG5vbi1udWxsIGFyZ3VtZW50cyBvbiB0aGUgQ2xvc3VyZSBzaWRlLiAgQ2FuIGxpa2VseSByZW1vdmUgdGhpc1xuICAgKiBvbmNlIFR5cGVTY3JpcHQgbnVsbGFibGUgdHlwZXMgYXJlIGF2YWlsYWJsZS5cbiAgICovXG4gIGRlc3RydWN0dXJpbmc/OiBib29sZWFuO1xuICAvKiogQW55IHJlbWFpbmluZyB0ZXh0IG9uIHRoZSB0YWcsIGUuZy4gdGhlIGRlc2NyaXB0aW9uLiAqL1xuICB0ZXh0Pzogc3RyaW5nO1xufVxuXG4vKipcbiAqIEEgbGlzdCBvZiBhbGwgSlNEb2MgdGFncyBhbGxvd2VkIGJ5IHRoZSBDbG9zdXJlIGNvbXBpbGVyLlxuICogVGhlIHB1YmxpYyBDbG9zdXJlIGRvY3MgZG9uJ3QgbGlzdCBhbGwgdGhlIHRhZ3MgaXQgYWxsb3dzOyB0aGlzIGxpc3QgY29tZXNcbiAqIGZyb20gdGhlIGNvbXBpbGVyIHNvdXJjZSBpdHNlbGYuXG4gKiBodHRwczovL2dpdGh1Yi5jb20vZ29vZ2xlL2Nsb3N1cmUtY29tcGlsZXIvYmxvYi9tYXN0ZXIvc3JjL2NvbS9nb29nbGUvamF2YXNjcmlwdC9qc2NvbXAvcGFyc2luZy9Bbm5vdGF0aW9uLmphdmFcbiAqIGh0dHBzOi8vZ2l0aHViLmNvbS9nb29nbGUvY2xvc3VyZS1jb21waWxlci9ibG9iL21hc3Rlci9zcmMvY29tL2dvb2dsZS9qYXZhc2NyaXB0L2pzY29tcC9wYXJzaW5nL1BhcnNlckNvbmZpZy5wcm9wZXJ0aWVzXG4gKi9cbmNvbnN0IEpTRE9DX1RBR1NfV0hJVEVMSVNUID0gbmV3IFNldChbXG4gICdhYnN0cmFjdCcsICAgICAgJ2FyZ3VtZW50JyxcbiAgJ2F1dGhvcicsICAgICAgICAnY29uc2lzdGVudElkR2VuZXJhdG9yJyxcbiAgJ2NvbnN0JywgICAgICAgICAnY29uc3RhbnQnLFxuICAnY29uc3RydWN0b3InLCAgICdjb3B5cmlnaHQnLFxuICAnZGVmaW5lJywgICAgICAgICdkZXByZWNhdGVkJyxcbiAgJ2Rlc2MnLCAgICAgICAgICAnZGljdCcsXG4gICdkaXNwb3NlcycsICAgICAgJ2VuaGFuY2UnLFxuICAnZW5oYW5jZWFibGUnLCAgICdlbnVtJyxcbiAgJ2V4cG9ydCcsICAgICAgICAnZXhwb3NlJyxcbiAgJ2V4dGVuZHMnLCAgICAgICAnZXh0ZXJucycsXG4gICdmaWxlb3ZlcnZpZXcnLCAgJ2ZpbmFsJyxcbiAgJ2hhc3NveWRlbGNhbGwnLCAnaGFzc295ZGVsdGVtcGxhdGUnLFxuICAnaGlkZGVuJywgICAgICAgICdpZCcsXG4gICdpZEdlbmVyYXRvcicsICAgJ2lnbm9yZScsXG4gICdpbXBsZW1lbnRzJywgICAgJ2ltcGxpY2l0Q2FzdCcsXG4gICdpbmhlcml0RG9jJywgICAgJ2ludGVyZmFjZScsXG4gICdqYWdnZXJJbmplY3QnLCAgJ2phZ2dlck1vZHVsZScsXG4gICdqYWdnZXJQcm92aWRlJywgJ2phZ2dlclByb3ZpZGVQcm9taXNlJyxcbiAgJ2xlbmRzJywgICAgICAgICAnbGljZW5zZScsXG4gICdsaW5rJywgICAgICAgICAgJ21lYW5pbmcnLFxuICAnbW9kaWZpZXMnLCAgICAgICdtb2ROYW1lJyxcbiAgJ21vZHMnLCAgICAgICAgICAnbmdJbmplY3QnLFxuICAnbm9hbGlhcycsICAgICAgICdub2NvbGxhcHNlJyxcbiAgJ25vY29tcGlsZScsICAgICAnbm9zaWRlZWZmZWN0cycsXG4gICdvdmVycmlkZScsICAgICAgJ293bmVyJyxcbiAgJ3BhY2thZ2UnLCAgICAgICAncGFyYW0nLFxuICAncGludG9tb2R1bGUnLCAgICdwb2x5bWVyQmVoYXZpb3InLFxuICAncHJlc2VydmUnLCAgICAgICdwcmVzZXJ2ZVRyeScsXG4gICdwcml2YXRlJywgICAgICAgJ3Byb3RlY3RlZCcsXG4gICdwdWJsaWMnLCAgICAgICAgJ3JlY29yZCcsXG4gICdyZXF1aXJlY3NzJywgICAgJ3JlcXVpcmVzJyxcbiAgJ3JldHVybicsICAgICAgICAncmV0dXJucycsXG4gICdzZWUnLCAgICAgICAgICAgJ3N0YWJsZUlkR2VuZXJhdG9yJyxcbiAgJ3N0cnVjdCcsICAgICAgICAnc3VwcHJlc3MnLFxuICAndGVtcGxhdGUnLCAgICAgICd0aGlzJyxcbiAgJ3Rocm93cycsICAgICAgICAndHlwZScsXG4gICd0eXBlZGVmJywgICAgICAgJ3VucmVzdHJpY3RlZCcsXG4gICd2ZXJzaW9uJywgICAgICAgJ3dpemFjdGlvbicsXG4gICd3aXptb2R1bGUnLFxuXSk7XG5cbi8qKlxuICogQSBsaXN0IG9mIEpTRG9jIEB0YWdzIHRoYXQgYXJlIG5ldmVyIGFsbG93ZWQgaW4gVHlwZVNjcmlwdCBzb3VyY2UuIFRoZXNlIGFyZSBDbG9zdXJlIHRhZ3MgdGhhdFxuICogY2FuIGJlIGV4cHJlc3NlZCBpbiB0aGUgVHlwZVNjcmlwdCBzdXJmYWNlIHN5bnRheC4gQXMgdHNpY2tsZSdzIGVtaXQgd2lsbCBtYW5nbGUgdHlwZSBuYW1lcyxcbiAqIHRoZXNlIHdpbGwgY2F1c2UgQ2xvc3VyZSBDb21waWxlciBpc3N1ZXMgYW5kIHNob3VsZCBub3QgYmUgdXNlZC5cbiAqL1xuY29uc3QgSlNET0NfVEFHU19CTEFDS0xJU1QgPSBuZXcgU2V0KFtcbiAgJ2F1Z21lbnRzJywgJ2NsYXNzJywgICAgICAnY29uc3RydWN0cycsICdjb25zdHJ1Y3RvcicsICdlbnVtJywgICAgICAnZXh0ZW5kcycsICdmaWVsZCcsXG4gICdmdW5jdGlvbicsICdpbXBsZW1lbnRzJywgJ2ludGVyZmFjZScsICAnbGVuZHMnLCAgICAgICAnbmFtZXNwYWNlJywgJ3ByaXZhdGUnLCAncHVibGljJyxcbiAgJ3JlY29yZCcsICAgJ3N0YXRpYycsICAgICAndGVtcGxhdGUnLCAgICd0aGlzJywgICAgICAgICd0eXBlJywgICAgICAndHlwZWRlZicsXG5dKTtcblxuLyoqXG4gKiBBIGxpc3Qgb2YgSlNEb2MgQHRhZ3MgdGhhdCBtaWdodCBpbmNsdWRlIGEge3R5cGV9IGFmdGVyIHRoZW0uIE9ubHkgYmFubmVkIHdoZW4gYSB0eXBlIGlzIHBhc3NlZC5cbiAqIE5vdGUgdGhhdCB0aGlzIGRvZXMgbm90IGluY2x1ZGUgdGFncyB0aGF0IGNhcnJ5IGEgbm9uLXR5cGUgc3lzdGVtIHR5cGUsIGUuZy4gXFxAc3VwcHJlc3MuXG4gKi9cbmNvbnN0IEpTRE9DX1RBR1NfV0lUSF9UWVBFUyA9IG5ldyBTZXQoW1xuICAnY29uc3QnLFxuICAnZXhwb3J0JyxcbiAgJ3BhcmFtJyxcbiAgJ3JldHVybicsXG5dKTtcblxuLyoqXG4gKiBSZXN1bHQgb2YgcGFyc2luZyBhIEpTRG9jIGNvbW1lbnQuIFN1Y2ggY29tbWVudHMgZXNzZW50aWFsbHkgYXJlIGJ1aWx0IG9mIGEgbGlzdCBvZiB0YWdzLlxuICogSW4gYWRkaXRpb24gdG8gdGhlIHRhZ3MsIHRoaXMgbWlnaHQgYWxzbyBjb250YWluIHdhcm5pbmdzIHRvIGluZGljYXRlIG5vbi1mYXRhbCBwcm9ibGVtc1xuICogd2hpbGUgZmluZGluZyB0aGUgdGFncy5cbiAqL1xuZXhwb3J0IGludGVyZmFjZSBQYXJzZWRKU0RvY0NvbW1lbnQge1xuICB0YWdzOiBUYWdbXTtcbiAgd2FybmluZ3M/OiBzdHJpbmdbXTtcbn1cblxuLyoqXG4gKiBwYXJzZSBwYXJzZXMgSlNEb2Mgb3V0IG9mIGEgY29tbWVudCBzdHJpbmcuXG4gKiBSZXR1cm5zIG51bGwgaWYgY29tbWVudCBpcyBub3QgSlNEb2MuXG4gKi9cbi8vIFRPRE8obWFydGlucHJvYnN0KTogcmVwcmVzZW50aW5nIEpTRG9jIGFzIGEgbGlzdCBvZiB0YWdzIGlzIHRvbyBzaW1wbGlzdGljLiBXZSBuZWVkIGZ1bmN0aW9uYWxpdHlcbi8vIHN1Y2ggYXMgbWVyZ2luZyAoYmVsb3cpLCBkZS1kdXBsaWNhdGluZyBjZXJ0YWluIHRhZ3MgKEBkZXByZWNhdGVkKSwgYW5kIHNwZWNpYWwgdHJlYXRtZW50IGZvclxuLy8gb3RoZXJzIChlLmcuIEBzdXBwcmVzcykuIFdlIHNob3VsZCBpbnRyb2R1Y2UgYSBwcm9wZXIgbW9kZWwgY2xhc3Mgd2l0aCBhIG1vcmUgc3VpdGFibGUgZGF0YVxuLy8gc3RydWN1cmUgKGUuZy4gYSBNYXA8VGFnTmFtZSwgVmFsdWVzW10+KS5cbmV4cG9ydCBmdW5jdGlvbiBwYXJzZShjb21tZW50OiBzdHJpbmcpOiBQYXJzZWRKU0RvY0NvbW1lbnR8bnVsbCB7XG4gIC8vIE1ha2Ugc3VyZSB3ZSBoYXZlIHByb3BlciBsaW5lIGVuZGluZ3MgYmVmb3JlIHBhcnNpbmcgb24gV2luZG93cy5cbiAgY29tbWVudCA9IG5vcm1hbGl6ZUxpbmVFbmRpbmdzKGNvbW1lbnQpO1xuICAvLyBUT0RPKGV2YW5tKTogdGhpcyBpcyBhIHBpbGUgb2YgaGFja3kgcmVnZXhlcyBmb3Igbm93LCBiZWNhdXNlIHdlXG4gIC8vIHdvdWxkIHJhdGhlciB1c2UgdGhlIGJldHRlciBUeXBlU2NyaXB0IGltcGxlbWVudGF0aW9uIG9mIEpTRG9jXG4gIC8vIHBhcnNpbmcuICBodHRwczovL2dpdGh1Yi5jb20vTWljcm9zb2Z0L1R5cGVTY3JpcHQvaXNzdWVzLzczOTNcbiAgY29uc3QgbWF0Y2ggPSBjb21tZW50Lm1hdGNoKC9eXFwvXFwqXFwqKFtcXHNcXFNdKj8pXFwqXFwvJC8pO1xuICBpZiAoIW1hdGNoKSByZXR1cm4gbnVsbDtcbiAgcmV0dXJuIHBhcnNlQ29udGVudHMobWF0Y2hbMV0udHJpbSgpKTtcbn1cblxuLyoqXG4gKiBwYXJzZUNvbnRlbnRzIHBhcnNlcyBKU0RvYyBvdXQgb2YgYSBjb21tZW50IHRleHQuXG4gKiBSZXR1cm5zIG51bGwgaWYgY29tbWVudCBpcyBub3QgSlNEb2MuXG4gKlxuICogQHBhcmFtIGNvbW1lbnRUZXh0IGEgY29tbWVudCdzIHRleHQgY29udGVudCwgaS5lLiB0aGUgY29tbWVudCB3L28gLyogYW5kICogLy5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHBhcnNlQ29udGVudHMoY29tbWVudFRleHQ6IHN0cmluZyk6IHt0YWdzOiBUYWdbXSwgd2FybmluZ3M/OiBzdHJpbmdbXX18bnVsbCB7XG4gIC8vIE1ha2Ugc3VyZSB3ZSBoYXZlIHByb3BlciBsaW5lIGVuZGluZ3MgYmVmb3JlIHBhcnNpbmcgb24gV2luZG93cy5cbiAgY29tbWVudFRleHQgPSBub3JtYWxpemVMaW5lRW5kaW5ncyhjb21tZW50VGV4dCk7XG4gIC8vIFN0cmlwIGFsbCB0aGUgXCIgKiBcIiBiaXRzIGZyb20gdGhlIGZyb250IG9mIGVhY2ggbGluZS5cbiAgY29tbWVudFRleHQgPSBjb21tZW50VGV4dC5yZXBsYWNlKC9eXFxzKlxcKj8gPy9nbSwgJycpO1xuICBjb25zdCBsaW5lcyA9IGNvbW1lbnRUZXh0LnNwbGl0KCdcXG4nKTtcbiAgY29uc3QgdGFnczogVGFnW10gPSBbXTtcbiAgY29uc3Qgd2FybmluZ3M6IHN0cmluZ1tdID0gW107XG4gIGZvciAoY29uc3QgbGluZSBvZiBsaW5lcykge1xuICAgIGxldCBtYXRjaCA9IGxpbmUubWF0Y2goL15cXHMqQChcXFMrKSAqKC4qKS8pO1xuICAgIGlmIChtYXRjaCkge1xuICAgICAgbGV0IFtfLCB0YWdOYW1lLCB0ZXh0XSA9IG1hdGNoO1xuICAgICAgaWYgKHRhZ05hbWUgPT09ICdyZXR1cm5zJykge1xuICAgICAgICAvLyBBIHN5bm9ueW0gZm9yICdyZXR1cm4nLlxuICAgICAgICB0YWdOYW1lID0gJ3JldHVybic7XG4gICAgICB9XG4gICAgICBsZXQgdHlwZTogc3RyaW5nfHVuZGVmaW5lZDtcbiAgICAgIGlmIChKU0RPQ19UQUdTX0JMQUNLTElTVC5oYXModGFnTmFtZSkpIHtcbiAgICAgICAgd2FybmluZ3MucHVzaChgQCR7dGFnTmFtZX0gYW5ub3RhdGlvbnMgYXJlIHJlZHVuZGFudCB3aXRoIFR5cGVTY3JpcHQgZXF1aXZhbGVudHNgKTtcbiAgICAgICAgY29udGludWU7ICAvLyBEcm9wIHRoZSB0YWcgc28gQ2xvc3VyZSB3b24ndCBwcm9jZXNzIGl0LlxuICAgICAgfSBlbHNlIGlmIChKU0RPQ19UQUdTX1dJVEhfVFlQRVMuaGFzKHRhZ05hbWUpICYmIHRleHRbMF0gPT09ICd7Jykge1xuICAgICAgICB3YXJuaW5ncy5wdXNoKFxuICAgICAgICAgICAgYHRoZSB0eXBlIGFubm90YXRpb24gb24gQCR7dGFnTmFtZX0gaXMgcmVkdW5kYW50IHdpdGggaXRzIFR5cGVTY3JpcHQgdHlwZSwgYCArXG4gICAgICAgICAgICBgcmVtb3ZlIHRoZSB7Li4ufSBwYXJ0YCk7XG4gICAgICAgIGNvbnRpbnVlO1xuICAgICAgfSBlbHNlIGlmICh0YWdOYW1lID09PSAnc3VwcHJlc3MnKSB7XG4gICAgICAgIGNvbnN0IHN1cHByZXNzTWF0Y2ggPSB0ZXh0Lm1hdGNoKC9eXFx7KC4qKVxcfSguKikkLyk7XG4gICAgICAgIGlmICghc3VwcHJlc3NNYXRjaCkge1xuICAgICAgICAgIHdhcm5pbmdzLnB1c2goYG1hbGZvcm1lZCBAc3VwcHJlc3MgdGFnOiBcIiR7dGV4dH1cImApO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIFssIHR5cGUsIHRleHRdID0gc3VwcHJlc3NNYXRjaDtcbiAgICAgICAgfVxuICAgICAgfSBlbHNlIGlmICh0YWdOYW1lID09PSAnZGljdCcpIHtcbiAgICAgICAgd2FybmluZ3MucHVzaCgndXNlIGluZGV4IHNpZ25hdHVyZXMgKGBbazogc3RyaW5nXTogdHlwZWApIGluc3RlYWQgb2YgQGRpY3QnKTtcbiAgICAgICAgY29udGludWU7XG4gICAgICB9XG5cbiAgICAgIC8vIEdyYWIgdGhlIHBhcmFtZXRlciBuYW1lIGZyb20gQHBhcmFtIHRhZ3MuXG4gICAgICBsZXQgcGFyYW1ldGVyTmFtZTogc3RyaW5nfHVuZGVmaW5lZDtcbiAgICAgIGlmICh0YWdOYW1lID09PSAncGFyYW0nKSB7XG4gICAgICAgIG1hdGNoID0gdGV4dC5tYXRjaCgvXihcXFMrKSA/KC4qKS8pO1xuICAgICAgICBpZiAobWF0Y2gpIFtfLCBwYXJhbWV0ZXJOYW1lLCB0ZXh0XSA9IG1hdGNoO1xuICAgICAgfVxuXG4gICAgICBjb25zdCB0YWc6IFRhZyA9IHt0YWdOYW1lfTtcbiAgICAgIGlmIChwYXJhbWV0ZXJOYW1lKSB0YWcucGFyYW1ldGVyTmFtZSA9IHBhcmFtZXRlck5hbWU7XG4gICAgICBpZiAodGV4dCkgdGFnLnRleHQgPSB0ZXh0O1xuICAgICAgaWYgKHR5cGUpIHRhZy50eXBlID0gdHlwZTtcbiAgICAgIHRhZ3MucHVzaCh0YWcpO1xuICAgIH0gZWxzZSB7XG4gICAgICAvLyBUZXh0IHdpdGhvdXQgYSBwcmVjZWRpbmcgQHRhZyBvbiBpdCBpcyBlaXRoZXIgdGhlIHBsYWluIHRleHRcbiAgICAgIC8vIGRvY3VtZW50YXRpb24gb3IgYSBjb250aW51YXRpb24gb2YgYSBwcmV2aW91cyB0YWcuXG4gICAgICBpZiAodGFncy5sZW5ndGggPT09IDApIHtcbiAgICAgICAgdGFncy5wdXNoKHt0YWdOYW1lOiAnJywgdGV4dDogbGluZX0pO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgY29uc3QgbGFzdFRhZyA9IHRhZ3NbdGFncy5sZW5ndGggLSAxXTtcbiAgICAgICAgbGFzdFRhZy50ZXh0ID0gKGxhc3RUYWcudGV4dCB8fCAnJykgKyAnXFxuJyArIGxpbmU7XG4gICAgICB9XG4gICAgfVxuICB9XG4gIGlmICh3YXJuaW5ncy5sZW5ndGggPiAwKSB7XG4gICAgcmV0dXJuIHt0YWdzLCB3YXJuaW5nc307XG4gIH1cbiAgcmV0dXJuIHt0YWdzfTtcbn1cblxuLyoqXG4gKiBTZXJpYWxpemVzIGEgVGFnIGludG8gYSBzdHJpbmcgdXNhYmxlIGluIGEgY29tbWVudC5cbiAqIFJldHVybnMgYSBzdHJpbmcgbGlrZSBcIiBAZm9vIHtiYXJ9IGJhelwiIChub3RlIHRoZSB3aGl0ZXNwYWNlKS5cbiAqL1xuZnVuY3Rpb24gdGFnVG9TdHJpbmcodGFnOiBUYWcsIGVzY2FwZUV4dHJhVGFncyA9IG5ldyBTZXQ8c3RyaW5nPigpKTogc3RyaW5nIHtcbiAgbGV0IG91dCA9ICcnO1xuICBpZiAodGFnLnRhZ05hbWUpIHtcbiAgICBpZiAoIUpTRE9DX1RBR1NfV0hJVEVMSVNULmhhcyh0YWcudGFnTmFtZSkgfHwgZXNjYXBlRXh0cmFUYWdzLmhhcyh0YWcudGFnTmFtZSkpIHtcbiAgICAgIC8vIEVzY2FwZSB0YWdzIHdlIGRvbid0IHVuZGVyc3RhbmQuICBUaGlzIGlzIGEgc3VidGxlXG4gICAgICAvLyBjb21wcm9taXNlIGJldHdlZW4gbXVsdGlwbGUgaXNzdWVzLlxuICAgICAgLy8gMSkgSWYgd2UgcGFzcyB0aHJvdWdoIHRoZXNlIG5vbi1DbG9zdXJlIHRhZ3MsIHRoZSB1c2VyIHdpbGxcbiAgICAgIC8vICAgIGdldCBhIHdhcm5pbmcgZnJvbSBDbG9zdXJlLCBhbmQgdGhlIHBvaW50IG9mIHRzaWNrbGUgaXNcbiAgICAgIC8vICAgIHRvIGluc3VsYXRlIHRoZSB1c2VyIGZyb20gQ2xvc3VyZS5cbiAgICAgIC8vIDIpIFRoZSBvdXRwdXQgb2YgdHNpY2tsZSBpcyBmb3IgQ2xvc3VyZSBidXQgYWxzbyBtYXkgYmUgcmVhZFxuICAgICAgLy8gICAgYnkgaHVtYW5zLCBmb3IgZXhhbXBsZSBub24tVHlwZVNjcmlwdCB1c2VycyBvZiBBbmd1bGFyLlxuICAgICAgLy8gMykgRmluYWxseSwgd2UgZG9uJ3Qgd2FudCB0byB3YXJuIGJlY2F1c2UgdXNlcnMgc2hvdWxkIGJlXG4gICAgICAvLyAgICBmcmVlIHRvIGFkZCB3aGljaGV2ZXIgSlNEb2MgdGhleSBmZWVsIGxpa2UuICBJZiB0aGUgdXNlclxuICAgICAgLy8gICAgd2FudHMgaGVscCBlbnN1cmluZyB0aGV5IGRpZG4ndCB0eXBvIGEgdGFnLCB0aGF0IGlzIHRoZVxuICAgICAgLy8gICAgcmVzcG9uc2liaWxpdHkgb2YgYSBsaW50ZXIuXG4gICAgICBvdXQgKz0gYCBcXFxcQCR7dGFnLnRhZ05hbWV9YDtcbiAgICB9IGVsc2Uge1xuICAgICAgb3V0ICs9IGAgQCR7dGFnLnRhZ05hbWV9YDtcbiAgICB9XG4gIH1cbiAgaWYgKHRhZy50eXBlKSB7XG4gICAgb3V0ICs9ICcgeyc7XG4gICAgaWYgKHRhZy5yZXN0UGFyYW0pIHtcbiAgICAgIG91dCArPSAnLi4uJztcbiAgICB9XG4gICAgb3V0ICs9IHRhZy50eXBlO1xuICAgIGlmICh0YWcub3B0aW9uYWwpIHtcbiAgICAgIG91dCArPSAnPSc7XG4gICAgfVxuICAgIG91dCArPSAnfSc7XG4gIH1cbiAgaWYgKHRhZy5wYXJhbWV0ZXJOYW1lKSB7XG4gICAgb3V0ICs9ICcgJyArIHRhZy5wYXJhbWV0ZXJOYW1lO1xuICB9XG4gIGlmICh0YWcudGV4dCkge1xuICAgIG91dCArPSAnICcgKyB0YWcudGV4dC5yZXBsYWNlKC9AL2csICdcXFxcQCcpO1xuICB9XG4gIHJldHVybiBvdXQ7XG59XG5cbi8qKiBUYWdzIHRoYXQgbXVzdCBvbmx5IG9jY3VyIG9uY2VzIGluIGEgY29tbWVudCAoZmlsdGVyZWQgYmVsb3cpLiAqL1xuY29uc3QgU0lOR0xFVE9OX1RBR1MgPSBuZXcgU2V0KFsnZGVwcmVjYXRlZCddKTtcblxuLyoqIFRhZ3MgdGhhdCBjb25mbGljdCB3aXRoIFxcQHR5cGUgaW4gQ2xvc3VyZSBDb21waWxlciAoZS5nLiBcXEBwYXJhbSkuICovXG5leHBvcnQgY29uc3QgVEFHU19DT05GTElDVElOR19XSVRIX1RZUEUgPSBuZXcgU2V0KFsncGFyYW0nLCAncmV0dXJuJ10pO1xuXG4vKiogU2VyaWFsaXplcyBhIENvbW1lbnQgb3V0IHRvIGEgc3RyaW5nLCBidXQgZG9lcyBub3QgaW5jbHVkZSB0aGUgc3RhcnQgYW5kIGVuZCBjb21tZW50IHRva2Vucy4gKi9cbmV4cG9ydCBmdW5jdGlvbiB0b1N0cmluZ1dpdGhvdXRTdGFydEVuZCh0YWdzOiBUYWdbXSwgZXNjYXBlRXh0cmFUYWdzID0gbmV3IFNldDxzdHJpbmc+KCkpOiBzdHJpbmcge1xuICByZXR1cm4gc2VyaWFsaXplKHRhZ3MsIGZhbHNlLCBlc2NhcGVFeHRyYVRhZ3MpO1xufVxuXG4vKiogU2VyaWFsaXplcyBhIENvbW1lbnQgb3V0IHRvIGEgc3RyaW5nIHVzYWJsZSBpbiBzb3VyY2UgY29kZS4gKi9cbmV4cG9ydCBmdW5jdGlvbiB0b1N0cmluZyh0YWdzOiBUYWdbXSwgZXNjYXBlRXh0cmFUYWdzID0gbmV3IFNldDxzdHJpbmc+KCkpOiBzdHJpbmcge1xuICByZXR1cm4gc2VyaWFsaXplKHRhZ3MsIHRydWUsIGVzY2FwZUV4dHJhVGFncyk7XG59XG5cbmZ1bmN0aW9uIHNlcmlhbGl6ZShcbiAgICB0YWdzOiBUYWdbXSwgaW5jbHVkZVN0YXJ0RW5kOiBib29sZWFuLCBlc2NhcGVFeHRyYVRhZ3MgPSBuZXcgU2V0PHN0cmluZz4oKSk6IHN0cmluZyB7XG4gIGlmICh0YWdzLmxlbmd0aCA9PT0gMCkgcmV0dXJuICcnO1xuICBpZiAodGFncy5sZW5ndGggPT09IDEpIHtcbiAgICBjb25zdCB0YWcgPSB0YWdzWzBdO1xuICAgIGlmICgodGFnLnRhZ05hbWUgPT09ICd0eXBlJyB8fCB0YWcudGFnTmFtZSA9PT0gJ25vY29sbGFwc2UnKSAmJlxuICAgICAgICAoIXRhZy50ZXh0IHx8ICF0YWcudGV4dC5tYXRjaCgnXFxuJykpKSB7XG4gICAgICAvLyBTcGVjaWFsLWNhc2Ugb25lLWxpbmVyIFwidHlwZVwiIGFuZCBcIm5vY29sbGFwc2VcIiB0YWdzIHRvIGZpdCBvbiBvbmUgbGluZSwgZS5nLlxuICAgICAgLy8gICAvKiogQHR5cGUge2Zvb30gKi9cbiAgICAgIHJldHVybiAnLyoqJyArIHRhZ1RvU3RyaW5nKHRhZywgZXNjYXBlRXh0cmFUYWdzKSArICcgKi9cXG4nO1xuICAgIH1cbiAgICAvLyBPdGhlcndpc2UsIGZhbGwgdGhyb3VnaCB0byB0aGUgbXVsdGktbGluZSBvdXRwdXQuXG4gIH1cblxuICBsZXQgb3V0ID0gaW5jbHVkZVN0YXJ0RW5kID8gJy8qKlxcbicgOiAnKlxcbic7XG4gIGNvbnN0IGVtaXR0ZWQgPSBuZXcgU2V0PHN0cmluZz4oKTtcbiAgZm9yIChjb25zdCB0YWcgb2YgdGFncykge1xuICAgIGlmIChlbWl0dGVkLmhhcyh0YWcudGFnTmFtZSkgJiYgU0lOR0xFVE9OX1RBR1MuaGFzKHRhZy50YWdOYW1lKSkge1xuICAgICAgY29udGludWU7XG4gICAgfVxuICAgIGVtaXR0ZWQuYWRkKHRhZy50YWdOYW1lKTtcbiAgICBvdXQgKz0gJyAqJztcbiAgICAvLyBJZiB0aGUgdGFnVG9TdHJpbmcgaXMgbXVsdGktbGluZSwgaW5zZXJ0IFwiICogXCIgcHJlZml4ZXMgb24gc3Vic2VxdWVudCBsaW5lcy5cbiAgICBvdXQgKz0gdGFnVG9TdHJpbmcodGFnLCBlc2NhcGVFeHRyYVRhZ3MpLnNwbGl0KCdcXG4nKS5qb2luKCdcXG4gKiAnKTtcbiAgICBvdXQgKz0gJ1xcbic7XG4gIH1cbiAgb3V0ICs9IGluY2x1ZGVTdGFydEVuZCA/ICcgKi9cXG4nIDogJyAnO1xuICByZXR1cm4gb3V0O1xufVxuXG4vKiogTWVyZ2VzIG11bHRpcGxlIHRhZ3MgKG9mIHRoZSBzYW1lIHRhZ05hbWUgdHlwZSkgaW50byBhIHNpbmdsZSB1bmlmaWVkIHRhZy4gKi9cbmV4cG9ydCBmdW5jdGlvbiBtZXJnZSh0YWdzOiBUYWdbXSk6IFRhZyB7XG4gIGNvbnN0IHRhZ05hbWVzID0gbmV3IFNldDxzdHJpbmc+KCk7XG4gIGNvbnN0IHBhcmFtZXRlck5hbWVzID0gbmV3IFNldDxzdHJpbmc+KCk7XG4gIGNvbnN0IHR5cGVzID0gbmV3IFNldDxzdHJpbmc+KCk7XG4gIGNvbnN0IHRleHRzID0gbmV3IFNldDxzdHJpbmc+KCk7XG4gIC8vIElmIGFueSBvZiB0aGUgdGFncyBhcmUgb3B0aW9uYWwvcmVzdCwgdGhlbiB0aGUgbWVyZ2VkIG91dHB1dCBpcyBvcHRpb25hbC9yZXN0LlxuICBsZXQgb3B0aW9uYWwgPSBmYWxzZTtcbiAgbGV0IHJlc3RQYXJhbSA9IGZhbHNlO1xuICBmb3IgKGNvbnN0IHRhZyBvZiB0YWdzKSB7XG4gICAgaWYgKHRhZy50YWdOYW1lKSB0YWdOYW1lcy5hZGQodGFnLnRhZ05hbWUpO1xuICAgIGlmICh0YWcucGFyYW1ldGVyTmFtZSkgcGFyYW1ldGVyTmFtZXMuYWRkKHRhZy5wYXJhbWV0ZXJOYW1lKTtcbiAgICBpZiAodGFnLnR5cGUpIHR5cGVzLmFkZCh0YWcudHlwZSk7XG4gICAgaWYgKHRhZy50ZXh0KSB0ZXh0cy5hZGQodGFnLnRleHQpO1xuICAgIGlmICh0YWcub3B0aW9uYWwpIG9wdGlvbmFsID0gdHJ1ZTtcbiAgICBpZiAodGFnLnJlc3RQYXJhbSkgcmVzdFBhcmFtID0gdHJ1ZTtcbiAgfVxuXG4gIGlmICh0YWdOYW1lcy5zaXplICE9PSAxKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKGBjYW5ub3QgbWVyZ2UgZGlmZmVyaW5nIHRhZ3M6ICR7SlNPTi5zdHJpbmdpZnkodGFncyl9YCk7XG4gIH1cbiAgY29uc3QgdGFnTmFtZSA9IHRhZ05hbWVzLnZhbHVlcygpLm5leHQoKS52YWx1ZTtcbiAgY29uc3QgcGFyYW1ldGVyTmFtZSA9XG4gICAgICBwYXJhbWV0ZXJOYW1lcy5zaXplID4gMCA/IEFycmF5LmZyb20ocGFyYW1ldGVyTmFtZXMpLmpvaW4oJ19vcl8nKSA6IHVuZGVmaW5lZDtcbiAgY29uc3QgdHlwZSA9IHR5cGVzLnNpemUgPiAwID8gQXJyYXkuZnJvbSh0eXBlcykuam9pbignfCcpIDogdW5kZWZpbmVkO1xuICBjb25zdCB0ZXh0ID0gdGV4dHMuc2l6ZSA+IDAgPyBBcnJheS5mcm9tKHRleHRzKS5qb2luKCcgLyAnKSA6IHVuZGVmaW5lZDtcbiAgY29uc3QgdGFnOiBUYWcgPSB7dGFnTmFtZSwgcGFyYW1ldGVyTmFtZSwgdHlwZSwgdGV4dH07XG4gIC8vIE5vdGU6IGEgcGFyYW0gY2FuIGVpdGhlciBiZSBvcHRpb25hbCBvciBhIHJlc3QgcGFyYW07IGlmIHdlIG1lcmdlZCBhblxuICAvLyBvcHRpb25hbCBhbmQgcmVzdCBwYXJhbSB0b2dldGhlciwgcHJlZmVyIG1hcmtpbmcgaXQgYXMgYSByZXN0IHBhcmFtLlxuICBpZiAocmVzdFBhcmFtKSB7XG4gICAgdGFnLnJlc3RQYXJhbSA9IHRydWU7XG4gIH0gZWxzZSBpZiAob3B0aW9uYWwpIHtcbiAgICB0YWcub3B0aW9uYWwgPSB0cnVlO1xuICB9XG4gIHJldHVybiB0YWc7XG59XG4iXX0=
/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define("tsickle/src/source_map_utils", ["require", "exports", "source-map"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var source_map_1 = require("source-map");
    /**
     * Return a new RegExp object every time we want one because the
     * RegExp object has internal state that we don't want to persist
     * between different logical uses.
     */
    function getInlineSourceMapRegex() {
        return new RegExp('^//# sourceMappingURL=data:application/json;base64,(.*)$', 'mg');
    }
    function containsInlineSourceMap(source) {
        return getInlineSourceMapCount(source) > 0;
    }
    exports.containsInlineSourceMap = containsInlineSourceMap;
    function getInlineSourceMapCount(source) {
        var match = source.match(getInlineSourceMapRegex());
        return match ? match.length : 0;
    }
    exports.getInlineSourceMapCount = getInlineSourceMapCount;
    function extractInlineSourceMap(source) {
        var inlineSourceMapRegex = getInlineSourceMapRegex();
        var previousResult = null;
        var result = null;
        // We want to extract the last source map in the source file
        // since that's probably the most recent one added.  We keep
        // matching against the source until we don't get a result,
        // then we use the previous result.
        do {
            previousResult = result;
            result = inlineSourceMapRegex.exec(source);
        } while (result !== null);
        var base64EncodedMap = previousResult[1];
        return Buffer.from(base64EncodedMap, 'base64').toString('utf8');
    }
    exports.extractInlineSourceMap = extractInlineSourceMap;
    function removeInlineSourceMap(source) {
        return source.replace(getInlineSourceMapRegex(), '');
    }
    exports.removeInlineSourceMap = removeInlineSourceMap;
    /**
     * Sets the source map inline in the file.  If there's an existing inline source
     * map, it clobbers it.
     */
    function setInlineSourceMap(source, sourceMap) {
        var encodedSourceMap = Buffer.from(sourceMap, 'utf8').toString('base64');
        if (containsInlineSourceMap(source)) {
            return source.replace(getInlineSourceMapRegex(), "//# sourceMappingURL=data:application/json;base64," + encodedSourceMap);
        }
        else {
            return source + "\n//# sourceMappingURL=data:application/json;base64," + encodedSourceMap;
        }
    }
    exports.setInlineSourceMap = setInlineSourceMap;
    function parseSourceMap(text, fileName, sourceName) {
        var rawSourceMap = JSON.parse(text);
        if (sourceName) {
            rawSourceMap.sources = [sourceName];
        }
        if (fileName) {
            rawSourceMap.file = fileName;
        }
        return rawSourceMap;
    }
    exports.parseSourceMap = parseSourceMap;
    function sourceMapConsumerToGenerator(sourceMapConsumer) {
        return source_map_1.SourceMapGenerator.fromSourceMap(sourceMapConsumer);
    }
    exports.sourceMapConsumerToGenerator = sourceMapConsumerToGenerator;
    /**
     * Tsc identifies source files by their relative path to the output file.  Since
     * there's no easy way to identify these relative paths when tsickle generates its
     * own source maps, we patch them with the file name from the tsc source maps
     * before composing them.
     */
    function sourceMapGeneratorToConsumer(sourceMapGenerator, fileName, sourceName) {
        var rawSourceMap = sourceMapGenerator.toJSON();
        if (sourceName) {
            rawSourceMap.sources = [sourceName];
        }
        if (fileName) {
            rawSourceMap.file = fileName;
        }
        return new source_map_1.SourceMapConsumer(rawSourceMap);
    }
    exports.sourceMapGeneratorToConsumer = sourceMapGeneratorToConsumer;
    function sourceMapTextToConsumer(sourceMapText) {
        // the SourceMapConsumer constructor returns a BasicSourceMapConsumer or an
        // IndexedSourceMapConsumer depending on if you pass in a RawSourceMap or a
        // RawIndexMap or the string json of either.  In this case we're passing in
        // the string for a RawSourceMap, so we always get a BasicSourceMapConsumer
        //
        // Note, the typings distributed with the library are missing this constructor overload,
        // so we must type it as any, see https://github.com/angular/tsickle/issues/750
        // tslint:disable-next-line no-any
        return new source_map_1.SourceMapConsumer(sourceMapText);
    }
    exports.sourceMapTextToConsumer = sourceMapTextToConsumer;
    function sourceMapTextToGenerator(sourceMapText) {
        return source_map_1.SourceMapGenerator.fromSourceMap(sourceMapTextToConsumer(sourceMapText));
    }
    exports.sourceMapTextToGenerator = sourceMapTextToGenerator;
    exports.NOOP_SOURCE_MAPPER = {
        shiftByOffset: function () { },
        addMapping: function () { },
        addMappingForRange: function () { },
    };
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic291cmNlX21hcF91dGlscy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy9zb3VyY2VfbWFwX3V0aWxzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRzs7Ozs7Ozs7Ozs7O0lBRUgseUNBQStFO0lBMEIvRTs7OztPQUlHO0lBQ0g7UUFDRSxPQUFPLElBQUksTUFBTSxDQUFDLDBEQUEwRCxFQUFFLElBQUksQ0FBQyxDQUFDO0lBQ3RGLENBQUM7SUFFRCxpQ0FBd0MsTUFBYztRQUNwRCxPQUFPLHVCQUF1QixDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsQ0FBQztJQUM3QyxDQUFDO0lBRkQsMERBRUM7SUFFRCxpQ0FBd0MsTUFBYztRQUNwRCxJQUFNLEtBQUssR0FBRyxNQUFNLENBQUMsS0FBSyxDQUFDLHVCQUF1QixFQUFFLENBQUMsQ0FBQztRQUN0RCxPQUFPLEtBQUssQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO0lBQ2xDLENBQUM7SUFIRCwwREFHQztJQUVELGdDQUF1QyxNQUFjO1FBQ25ELElBQU0sb0JBQW9CLEdBQUcsdUJBQXVCLEVBQUUsQ0FBQztRQUN2RCxJQUFJLGNBQWMsR0FBeUIsSUFBSSxDQUFDO1FBQ2hELElBQUksTUFBTSxHQUF5QixJQUFJLENBQUM7UUFDeEMsNERBQTREO1FBQzVELDREQUE0RDtRQUM1RCwyREFBMkQ7UUFDM0QsbUNBQW1DO1FBQ25DLEdBQUc7WUFDRCxjQUFjLEdBQUcsTUFBTSxDQUFDO1lBQ3hCLE1BQU0sR0FBRyxvQkFBb0IsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUM7U0FDNUMsUUFBUSxNQUFNLEtBQUssSUFBSSxFQUFFO1FBQzFCLElBQU0sZ0JBQWdCLEdBQUcsY0FBZSxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQzVDLE9BQU8sTUFBTSxDQUFDLElBQUksQ0FBQyxnQkFBZ0IsRUFBRSxRQUFRLENBQUMsQ0FBQyxRQUFRLENBQUMsTUFBTSxDQUFDLENBQUM7SUFDbEUsQ0FBQztJQWRELHdEQWNDO0lBRUQsK0JBQXNDLE1BQWM7UUFDbEQsT0FBTyxNQUFNLENBQUMsT0FBTyxDQUFDLHVCQUF1QixFQUFFLEVBQUUsRUFBRSxDQUFDLENBQUM7SUFDdkQsQ0FBQztJQUZELHNEQUVDO0lBRUQ7OztPQUdHO0lBQ0gsNEJBQW1DLE1BQWMsRUFBRSxTQUFpQjtRQUNsRSxJQUFNLGdCQUFnQixHQUFHLE1BQU0sQ0FBQyxJQUFJLENBQUMsU0FBUyxFQUFFLE1BQU0sQ0FBQyxDQUFDLFFBQVEsQ0FBQyxRQUFRLENBQUMsQ0FBQztRQUMzRSxJQUFJLHVCQUF1QixDQUFDLE1BQU0sQ0FBQyxFQUFFO1lBQ25DLE9BQU8sTUFBTSxDQUFDLE9BQU8sQ0FDakIsdUJBQXVCLEVBQUUsRUFDekIsdURBQXFELGdCQUFrQixDQUFDLENBQUM7U0FDOUU7YUFBTTtZQUNMLE9BQVUsTUFBTSw0REFBdUQsZ0JBQWtCLENBQUM7U0FDM0Y7SUFDSCxDQUFDO0lBVEQsZ0RBU0M7SUFFRCx3QkFBK0IsSUFBWSxFQUFFLFFBQWlCLEVBQUUsVUFBbUI7UUFDakYsSUFBTSxZQUFZLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQWlCLENBQUM7UUFDdEQsSUFBSSxVQUFVLEVBQUU7WUFDZCxZQUFZLENBQUMsT0FBTyxHQUFHLENBQUMsVUFBVSxDQUFDLENBQUM7U0FDckM7UUFDRCxJQUFJLFFBQVEsRUFBRTtZQUNaLFlBQVksQ0FBQyxJQUFJLEdBQUcsUUFBUSxDQUFDO1NBQzlCO1FBQ0QsT0FBTyxZQUFZLENBQUM7SUFDdEIsQ0FBQztJQVRELHdDQVNDO0lBRUQsc0NBQTZDLGlCQUFvQztRQUUvRSxPQUFPLCtCQUFrQixDQUFDLGFBQWEsQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDO0lBQzdELENBQUM7SUFIRCxvRUFHQztJQUVEOzs7OztPQUtHO0lBQ0gsc0NBQ0ksa0JBQXNDLEVBQUUsUUFBaUIsRUFDekQsVUFBbUI7UUFDckIsSUFBTSxZQUFZLEdBQUksa0JBQStDLENBQUMsTUFBTSxFQUFFLENBQUM7UUFDL0UsSUFBSSxVQUFVLEVBQUU7WUFDZCxZQUFZLENBQUMsT0FBTyxHQUFHLENBQUMsVUFBVSxDQUFDLENBQUM7U0FDckM7UUFDRCxJQUFJLFFBQVEsRUFBRTtZQUNaLFlBQVksQ0FBQyxJQUFJLEdBQUcsUUFBUSxDQUFDO1NBQzlCO1FBQ0QsT0FBTyxJQUFJLDhCQUFpQixDQUFDLFlBQVksQ0FBQyxDQUFDO0lBQzdDLENBQUM7SUFYRCxvRUFXQztJQUVELGlDQUF3QyxhQUFxQjtRQUMzRCwyRUFBMkU7UUFDM0UsMkVBQTJFO1FBQzNFLDJFQUEyRTtRQUMzRSwyRUFBMkU7UUFDM0UsRUFBRTtRQUNGLHdGQUF3RjtRQUN4RiwrRUFBK0U7UUFDL0Usa0NBQWtDO1FBQ2xDLE9BQU8sSUFBSSw4QkFBaUIsQ0FBQyxhQUFvQixDQUEyQixDQUFDO0lBQy9FLENBQUM7SUFWRCwwREFVQztJQUVELGtDQUF5QyxhQUFxQjtRQUM1RCxPQUFPLCtCQUFrQixDQUFDLGFBQWEsQ0FBQyx1QkFBdUIsQ0FBQyxhQUFhLENBQUMsQ0FBQyxDQUFDO0lBQ2xGLENBQUM7SUFGRCw0REFFQztJQXVDWSxRQUFBLGtCQUFrQixHQUFpQjtRQUM5QyxhQUFhLGdCQUFlLENBQUM7UUFDN0IsVUFBVSxnQkFBZSxDQUFDO1FBQzFCLGtCQUFrQixnQkFBZSxDQUFDO0tBQ25DLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIEluYy4gQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCB7UmF3U291cmNlTWFwLCBTb3VyY2VNYXBDb25zdW1lciwgU291cmNlTWFwR2VuZXJhdG9yfSBmcm9tICdzb3VyY2UtbWFwJztcbmltcG9ydCAqIGFzIHRzIGZyb20gJy4vdHlwZXNjcmlwdCc7XG5cbi8qKlxuICogVGhpcyBpbnRlcmZhY2Ugd2FzIGRlZmluZWQgaW4gQHR5cGVzL3NvdXJjZS1tYXAgYnV0IGlzIGFic2VudCBmcm9tIHRoZSB0eXBpbmdzXG4gKiBkaXN0cmlidXRlZCBpbiB0aGUgc291cmNlLW1hcCBwYWNrYWdlLlxuICogQ29waWVkIGZyb20gaHR0cHM6Ly91bnBrZy5jb20vQHR5cGVzL3NvdXJjZS1tYXBAMC41LjIvaW5kZXguZC50c1xuICogc2VlIGh0dHBzOi8vZ2l0aHViLmNvbS9hbmd1bGFyL3RzaWNrbGUvaXNzdWVzLzc1MFxuICovXG5leHBvcnQgaW50ZXJmYWNlIEJhc2ljU291cmNlTWFwQ29uc3VtZXIgZXh0ZW5kcyBTb3VyY2VNYXBDb25zdW1lciB7XG4gIGZpbGU6IHN0cmluZztcbiAgc291cmNlUm9vdDogc3RyaW5nO1xuICBzb3VyY2VzOiBzdHJpbmdbXTtcbiAgc291cmNlc0NvbnRlbnQ6IHN0cmluZ1tdO1xufVxuXG4vKipcbiAqIFRoZSB0b0pTT04gbWV0aG9kIGlzIGludHJvZHVjZWQgaW5cbiAqIGh0dHBzOi8vZ2l0aHViLmNvbS9tb3ppbGxhL3NvdXJjZS1tYXAvY29tbWl0LzdjMDZhYzgzZGQ2ZDc1ZTY1ZjcxNzI3MTg0YTJkODYzMGExNWJmNTgjZGlmZi03OTQ1ZjZiYjQ0NWQ5NTY3OTQ1NjRlMDk4ZWYyMGJiM1xuICogSG93ZXZlciB0aGVyZSBpcyBhIGJyZWFraW5nIGNoYW5nZSBpbiAwLjcuXG4gKiBzZWUgaHR0cHM6Ly9naXRodWIuY29tL2FuZ3VsYXIvdHNpY2tsZS9pc3N1ZXMvNzUwXG4gKi9cbmV4cG9ydCB0eXBlIFNvdXJjZU1hcEdlbmVyYXRvclRvSnNvbiA9IFNvdXJjZU1hcEdlbmVyYXRvciZ7XG4gIHRvSlNPTigpOiBSYXdTb3VyY2VNYXA7XG59O1xuXG4vKipcbiAqIFJldHVybiBhIG5ldyBSZWdFeHAgb2JqZWN0IGV2ZXJ5IHRpbWUgd2Ugd2FudCBvbmUgYmVjYXVzZSB0aGVcbiAqIFJlZ0V4cCBvYmplY3QgaGFzIGludGVybmFsIHN0YXRlIHRoYXQgd2UgZG9uJ3Qgd2FudCB0byBwZXJzaXN0XG4gKiBiZXR3ZWVuIGRpZmZlcmVudCBsb2dpY2FsIHVzZXMuXG4gKi9cbmZ1bmN0aW9uIGdldElubGluZVNvdXJjZU1hcFJlZ2V4KCk6IFJlZ0V4cCB7XG4gIHJldHVybiBuZXcgUmVnRXhwKCdeLy8jIHNvdXJjZU1hcHBpbmdVUkw9ZGF0YTphcHBsaWNhdGlvbi9qc29uO2Jhc2U2NCwoLiopJCcsICdtZycpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gY29udGFpbnNJbmxpbmVTb3VyY2VNYXAoc291cmNlOiBzdHJpbmcpOiBib29sZWFuIHtcbiAgcmV0dXJuIGdldElubGluZVNvdXJjZU1hcENvdW50KHNvdXJjZSkgPiAwO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gZ2V0SW5saW5lU291cmNlTWFwQ291bnQoc291cmNlOiBzdHJpbmcpOiBudW1iZXIge1xuICBjb25zdCBtYXRjaCA9IHNvdXJjZS5tYXRjaChnZXRJbmxpbmVTb3VyY2VNYXBSZWdleCgpKTtcbiAgcmV0dXJuIG1hdGNoID8gbWF0Y2gubGVuZ3RoIDogMDtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGV4dHJhY3RJbmxpbmVTb3VyY2VNYXAoc291cmNlOiBzdHJpbmcpOiBzdHJpbmcge1xuICBjb25zdCBpbmxpbmVTb3VyY2VNYXBSZWdleCA9IGdldElubGluZVNvdXJjZU1hcFJlZ2V4KCk7XG4gIGxldCBwcmV2aW91c1Jlc3VsdDogUmVnRXhwRXhlY0FycmF5fG51bGwgPSBudWxsO1xuICBsZXQgcmVzdWx0OiBSZWdFeHBFeGVjQXJyYXl8bnVsbCA9IG51bGw7XG4gIC8vIFdlIHdhbnQgdG8gZXh0cmFjdCB0aGUgbGFzdCBzb3VyY2UgbWFwIGluIHRoZSBzb3VyY2UgZmlsZVxuICAvLyBzaW5jZSB0aGF0J3MgcHJvYmFibHkgdGhlIG1vc3QgcmVjZW50IG9uZSBhZGRlZC4gIFdlIGtlZXBcbiAgLy8gbWF0Y2hpbmcgYWdhaW5zdCB0aGUgc291cmNlIHVudGlsIHdlIGRvbid0IGdldCBhIHJlc3VsdCxcbiAgLy8gdGhlbiB3ZSB1c2UgdGhlIHByZXZpb3VzIHJlc3VsdC5cbiAgZG8ge1xuICAgIHByZXZpb3VzUmVzdWx0ID0gcmVzdWx0O1xuICAgIHJlc3VsdCA9IGlubGluZVNvdXJjZU1hcFJlZ2V4LmV4ZWMoc291cmNlKTtcbiAgfSB3aGlsZSAocmVzdWx0ICE9PSBudWxsKTtcbiAgY29uc3QgYmFzZTY0RW5jb2RlZE1hcCA9IHByZXZpb3VzUmVzdWx0IVsxXTtcbiAgcmV0dXJuIEJ1ZmZlci5mcm9tKGJhc2U2NEVuY29kZWRNYXAsICdiYXNlNjQnKS50b1N0cmluZygndXRmOCcpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gcmVtb3ZlSW5saW5lU291cmNlTWFwKHNvdXJjZTogc3RyaW5nKTogc3RyaW5nIHtcbiAgcmV0dXJuIHNvdXJjZS5yZXBsYWNlKGdldElubGluZVNvdXJjZU1hcFJlZ2V4KCksICcnKTtcbn1cblxuLyoqXG4gKiBTZXRzIHRoZSBzb3VyY2UgbWFwIGlubGluZSBpbiB0aGUgZmlsZS4gIElmIHRoZXJlJ3MgYW4gZXhpc3RpbmcgaW5saW5lIHNvdXJjZVxuICogbWFwLCBpdCBjbG9iYmVycyBpdC5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHNldElubGluZVNvdXJjZU1hcChzb3VyY2U6IHN0cmluZywgc291cmNlTWFwOiBzdHJpbmcpOiBzdHJpbmcge1xuICBjb25zdCBlbmNvZGVkU291cmNlTWFwID0gQnVmZmVyLmZyb20oc291cmNlTWFwLCAndXRmOCcpLnRvU3RyaW5nKCdiYXNlNjQnKTtcbiAgaWYgKGNvbnRhaW5zSW5saW5lU291cmNlTWFwKHNvdXJjZSkpIHtcbiAgICByZXR1cm4gc291cmNlLnJlcGxhY2UoXG4gICAgICAgIGdldElubGluZVNvdXJjZU1hcFJlZ2V4KCksXG4gICAgICAgIGAvLyMgc291cmNlTWFwcGluZ1VSTD1kYXRhOmFwcGxpY2F0aW9uL2pzb247YmFzZTY0LCR7ZW5jb2RlZFNvdXJjZU1hcH1gKTtcbiAgfSBlbHNlIHtcbiAgICByZXR1cm4gYCR7c291cmNlfVxcbi8vIyBzb3VyY2VNYXBwaW5nVVJMPWRhdGE6YXBwbGljYXRpb24vanNvbjtiYXNlNjQsJHtlbmNvZGVkU291cmNlTWFwfWA7XG4gIH1cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHBhcnNlU291cmNlTWFwKHRleHQ6IHN0cmluZywgZmlsZU5hbWU/OiBzdHJpbmcsIHNvdXJjZU5hbWU/OiBzdHJpbmcpOiBSYXdTb3VyY2VNYXAge1xuICBjb25zdCByYXdTb3VyY2VNYXAgPSBKU09OLnBhcnNlKHRleHQpIGFzIFJhd1NvdXJjZU1hcDtcbiAgaWYgKHNvdXJjZU5hbWUpIHtcbiAgICByYXdTb3VyY2VNYXAuc291cmNlcyA9IFtzb3VyY2VOYW1lXTtcbiAgfVxuICBpZiAoZmlsZU5hbWUpIHtcbiAgICByYXdTb3VyY2VNYXAuZmlsZSA9IGZpbGVOYW1lO1xuICB9XG4gIHJldHVybiByYXdTb3VyY2VNYXA7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBzb3VyY2VNYXBDb25zdW1lclRvR2VuZXJhdG9yKHNvdXJjZU1hcENvbnN1bWVyOiBTb3VyY2VNYXBDb25zdW1lcik6XG4gICAgU291cmNlTWFwR2VuZXJhdG9yIHtcbiAgcmV0dXJuIFNvdXJjZU1hcEdlbmVyYXRvci5mcm9tU291cmNlTWFwKHNvdXJjZU1hcENvbnN1bWVyKTtcbn1cblxuLyoqXG4gKiBUc2MgaWRlbnRpZmllcyBzb3VyY2UgZmlsZXMgYnkgdGhlaXIgcmVsYXRpdmUgcGF0aCB0byB0aGUgb3V0cHV0IGZpbGUuICBTaW5jZVxuICogdGhlcmUncyBubyBlYXN5IHdheSB0byBpZGVudGlmeSB0aGVzZSByZWxhdGl2ZSBwYXRocyB3aGVuIHRzaWNrbGUgZ2VuZXJhdGVzIGl0c1xuICogb3duIHNvdXJjZSBtYXBzLCB3ZSBwYXRjaCB0aGVtIHdpdGggdGhlIGZpbGUgbmFtZSBmcm9tIHRoZSB0c2Mgc291cmNlIG1hcHNcbiAqIGJlZm9yZSBjb21wb3NpbmcgdGhlbS5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHNvdXJjZU1hcEdlbmVyYXRvclRvQ29uc3VtZXIoXG4gICAgc291cmNlTWFwR2VuZXJhdG9yOiBTb3VyY2VNYXBHZW5lcmF0b3IsIGZpbGVOYW1lPzogc3RyaW5nLFxuICAgIHNvdXJjZU5hbWU/OiBzdHJpbmcpOiBTb3VyY2VNYXBDb25zdW1lciB7XG4gIGNvbnN0IHJhd1NvdXJjZU1hcCA9IChzb3VyY2VNYXBHZW5lcmF0b3IgYXMgU291cmNlTWFwR2VuZXJhdG9yVG9Kc29uKS50b0pTT04oKTtcbiAgaWYgKHNvdXJjZU5hbWUpIHtcbiAgICByYXdTb3VyY2VNYXAuc291cmNlcyA9IFtzb3VyY2VOYW1lXTtcbiAgfVxuICBpZiAoZmlsZU5hbWUpIHtcbiAgICByYXdTb3VyY2VNYXAuZmlsZSA9IGZpbGVOYW1lO1xuICB9XG4gIHJldHVybiBuZXcgU291cmNlTWFwQ29uc3VtZXIocmF3U291cmNlTWFwKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHNvdXJjZU1hcFRleHRUb0NvbnN1bWVyKHNvdXJjZU1hcFRleHQ6IHN0cmluZyk6IEJhc2ljU291cmNlTWFwQ29uc3VtZXIge1xuICAvLyB0aGUgU291cmNlTWFwQ29uc3VtZXIgY29uc3RydWN0b3IgcmV0dXJucyBhIEJhc2ljU291cmNlTWFwQ29uc3VtZXIgb3IgYW5cbiAgLy8gSW5kZXhlZFNvdXJjZU1hcENvbnN1bWVyIGRlcGVuZGluZyBvbiBpZiB5b3UgcGFzcyBpbiBhIFJhd1NvdXJjZU1hcCBvciBhXG4gIC8vIFJhd0luZGV4TWFwIG9yIHRoZSBzdHJpbmcganNvbiBvZiBlaXRoZXIuICBJbiB0aGlzIGNhc2Ugd2UncmUgcGFzc2luZyBpblxuICAvLyB0aGUgc3RyaW5nIGZvciBhIFJhd1NvdXJjZU1hcCwgc28gd2UgYWx3YXlzIGdldCBhIEJhc2ljU291cmNlTWFwQ29uc3VtZXJcbiAgLy9cbiAgLy8gTm90ZSwgdGhlIHR5cGluZ3MgZGlzdHJpYnV0ZWQgd2l0aCB0aGUgbGlicmFyeSBhcmUgbWlzc2luZyB0aGlzIGNvbnN0cnVjdG9yIG92ZXJsb2FkLFxuICAvLyBzbyB3ZSBtdXN0IHR5cGUgaXQgYXMgYW55LCBzZWUgaHR0cHM6Ly9naXRodWIuY29tL2FuZ3VsYXIvdHNpY2tsZS9pc3N1ZXMvNzUwXG4gIC8vIHRzbGludDpkaXNhYmxlLW5leHQtbGluZSBuby1hbnlcbiAgcmV0dXJuIG5ldyBTb3VyY2VNYXBDb25zdW1lcihzb3VyY2VNYXBUZXh0IGFzIGFueSkgYXMgQmFzaWNTb3VyY2VNYXBDb25zdW1lcjtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHNvdXJjZU1hcFRleHRUb0dlbmVyYXRvcihzb3VyY2VNYXBUZXh0OiBzdHJpbmcpOiBTb3VyY2VNYXBHZW5lcmF0b3Ige1xuICByZXR1cm4gU291cmNlTWFwR2VuZXJhdG9yLmZyb21Tb3VyY2VNYXAoc291cmNlTWFwVGV4dFRvQ29uc3VtZXIoc291cmNlTWFwVGV4dCkpO1xufVxuXG4vKipcbiAqIEEgcG9zaXRpb24gaW4gYSBzb3VyY2UgbWFwLiBBbGwgb2Zmc2V0cyBhcmUgemVyby1iYXNlZC5cbiAqL1xuZXhwb3J0IGludGVyZmFjZSBTb3VyY2VQb3NpdGlvbiB7XG4gIC8qKiAwIGJhc2VkICovXG4gIGNvbHVtbjogbnVtYmVyO1xuICAvKiogMCBiYXNlZCAqL1xuICBsaW5lOiBudW1iZXI7XG4gIC8qKiAwIGJhc2VkIGZ1bGwgb2Zmc2V0IGluIHRoZSBmaWxlLiAqL1xuICBwb3NpdGlvbjogbnVtYmVyO1xufVxuXG5leHBvcnQgaW50ZXJmYWNlIFNvdXJjZU1hcHBlciB7XG4gIC8qKlxuICAgKiBMb2dpY2FsbHkgc2hpZnQgYWxsIHNvdXJjZSBwb3NpdGlvbnMgYnkgYG9mZnNldGAuXG4gICAqXG4gICAqIFRoaXMgbWV0aG9kIGlzIHVzZWZ1bCBpZiBjb2RlIGhhcyB0byBwcmVwZW5kIGFkZGl0aW9uYWwgdGV4dCB0byB0aGUgZ2VuZXJhdGVkIG91dHB1dCBhZnRlclxuICAgKiBzb3VyY2UgbWFwcGluZ3MgaGF2ZSBhbHJlYWR5IGJlZW4gZ2VuZXJhdGVkLiBUaGUgc291cmNlIG1hcHMgYXJlIHRoZW4gdHJhbnNwYXJlbnRseSBhZGp1c3RlZFxuICAgKiBkdXJpbmcgVHlwZVNjcmlwdCBvdXRwdXQgZ2VuZXJhdGlvbi5cbiAgICovXG4gIHNoaWZ0QnlPZmZzZXQob2Zmc2V0OiBudW1iZXIpOiB2b2lkO1xuICAvKipcbiAgICogQWRkcyBhIG1hcHBpbmcgZnJvbSBgb3JpZ2luYWxOb2RlYCBpbiBgb3JpZ2luYWxgIHBvc2l0aW9uIHRvIGl0cyBuZXcgbG9jYXRpb24gaW4gdGhlIG91dHB1dCxcbiAgICogc3Bhbm5pbmcgZnJvbSBgZ2VuZXJhdGVkYCAoYW4gb2Zmc2V0IGluIHRoZSBmaWxlKSBmb3IgYGxlbmd0aGAgY2hhcmFjdGVycy5cbiAgICovXG4gIGFkZE1hcHBpbmcoXG4gICAgICBvcmlnaW5hbE5vZGU6IHRzLk5vZGUsIG9yaWdpbmFsOiBTb3VyY2VQb3NpdGlvbiwgZ2VuZXJhdGVkOiBTb3VyY2VQb3NpdGlvbixcbiAgICAgIGxlbmd0aDogbnVtYmVyKTogdm9pZDtcbiAgLyoqXG4gICAqIEFkZHMgYSBtYXBwaW5nIGZyb20gYHN0YXJ0UG9zaXRpb25gIHRvIGBlbmRQb3NpdGlvbmAgaW4gdGhlIGdlbmVyYXRlZCBvdXRwdXQuIENvbnRyYXJ5IHRvXG4gICAqIGFkZE1hcHBpbmcsIHRoaXMgbWV0aG9kIGRvZXMgbm90IGF0dGVtcHQgdG8gYWRkIG1hcHBpbmdzIGZvciBjaGlsZCBub2Rlcywgbm9yIGRvZXMgaXQgYWx3YXlzXG4gICAqIGVtaXQgYSBtYXBwaW5nIGZvciB0aGUgZ2l2ZW4gYG9yaWdpbmFsTm9kZWAuIEl0IGFsc28gZG9lcyBub3QgYWRqdXN0IG9yaWdpbmFsIHBvc2l0aW9ucyBmb3IgYW55XG4gICAqIGxlYWRpbmcgY29tbWVudHMuXG4gICAqL1xuICBhZGRNYXBwaW5nRm9yUmFuZ2Uob3JpZ2luYWxOb2RlOiB0cy5Ob2RlLCBzdGFydFBvc2l0aW9uOiBudW1iZXIsIGVuZFBvc2l0aW9uOiBudW1iZXIpOiB2b2lkO1xufVxuXG5leHBvcnQgY29uc3QgTk9PUF9TT1VSQ0VfTUFQUEVSOiBTb3VyY2VNYXBwZXIgPSB7XG4gIHNoaWZ0QnlPZmZzZXQoKSB7Lyogbm8tb3AgKi99LFxuICBhZGRNYXBwaW5nKCkgey8qIG5vLW9wICovfSxcbiAgYWRkTWFwcGluZ0ZvclJhbmdlKCkgey8qIG5vLW9wICovfSxcbn07XG4iXX0=
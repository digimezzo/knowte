(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
	typeof define === 'function' && define.amd ? define('@ngx-translate/http-loader', ['exports'], factory) :
	(factory((global['ngx-translate'] = global['ngx-translate'] || {}, global['ngx-translate']['http-loader'] = {})));
}(this, (function (exports) { 'use strict';

var TranslateHttpLoader = /** @class */ (function () {
    function TranslateHttpLoader(http, prefix, suffix) {
        if (prefix === void 0) { prefix = "/assets/i18n/"; }
        if (suffix === void 0) { suffix = ".json"; }
        this.http = http;
        this.prefix = prefix;
        this.suffix = suffix;
    }
    TranslateHttpLoader.prototype.getTranslation = function (lang) {
        return this.http.get("" + this.prefix + lang + this.suffix);
    };
    return TranslateHttpLoader;
}());

exports.TranslateHttpLoader = TranslateHttpLoader;

Object.defineProperty(exports, '__esModule', { value: true });

})));
//# sourceMappingURL=ngx-translate-http-loader.umd.js.map

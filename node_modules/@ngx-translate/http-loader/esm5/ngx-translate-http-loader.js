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

export { TranslateHttpLoader };
//# sourceMappingURL=ngx-translate-http-loader.js.map

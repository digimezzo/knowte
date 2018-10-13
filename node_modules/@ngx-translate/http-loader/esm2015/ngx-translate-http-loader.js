/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes} checked by tsc
 */
class TranslateHttpLoader {
    /**
     * @param {?} http
     * @param {?=} prefix
     * @param {?=} suffix
     */
    constructor(http, prefix = "/assets/i18n/", suffix = ".json") {
        this.http = http;
        this.prefix = prefix;
        this.suffix = suffix;
    }
    /**
     * Gets the translations from the server
     * @param {?} lang
     * @return {?}
     */
    getTranslation(lang) {
        return this.http.get(`${this.prefix}${lang}${this.suffix}`);
    }
}

/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes} checked by tsc
 */

/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes} checked by tsc
 */
/**
 * Generated bundle index. Do not edit.
 */

export { TranslateHttpLoader };
//# sourceMappingURL=ngx-translate-http-loader.js.map

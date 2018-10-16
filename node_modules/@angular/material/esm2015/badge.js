/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { AriaDescriber, A11yModule } from '@angular/cdk/a11y';
import { coerceBooleanProperty } from '@angular/cdk/coercion';
import { DOCUMENT } from '@angular/common';
import { Directive, ElementRef, Inject, Input, NgZone, Optional, Renderer2, NgModule } from '@angular/core';
import { MatCommonModule } from '@angular/material/core';

/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes} checked by tsc
 */
let /** @type {?} */ nextId = 0;
/**
 * Directive to display a text badge.
 */
class MatBadge {
    /**
     * @param {?} _document
     * @param {?} _ngZone
     * @param {?} _elementRef
     * @param {?} _ariaDescriber
     * @param {?=} _renderer
     */
    constructor(_document, _ngZone, _elementRef, _ariaDescriber, _renderer) {
        this._document = _document;
        this._ngZone = _ngZone;
        this._elementRef = _elementRef;
        this._ariaDescriber = _ariaDescriber;
        this._renderer = _renderer;
        /**
         * Whether the badge has any content.
         */
        this._hasContent = false;
        this._color = 'primary';
        this._overlap = true;
        /**
         * Position the badge should reside.
         * Accepts any combination of 'above'|'below' and 'before'|'after'
         */
        this.position = 'above after';
        /**
         * Size of the badge. Can be 'small', 'medium', or 'large'.
         */
        this.size = 'medium';
        /**
         * Unique id for the badge
         */
        this._id = nextId++;
    }
    /**
     * The color of the badge. Can be `primary`, `accent`, or `warn`.
     * @return {?}
     */
    get color() { return this._color; }
    /**
     * @param {?} value
     * @return {?}
     */
    set color(value) {
        this._setColor(value);
        this._color = value;
    }
    /**
     * Whether the badge should overlap its contents or not
     * @return {?}
     */
    get overlap() { return this._overlap; }
    /**
     * @param {?} val
     * @return {?}
     */
    set overlap(val) {
        this._overlap = coerceBooleanProperty(val);
    }
    /**
     * The content for the badge
     * @return {?}
     */
    get content() { return this._content; }
    /**
     * @param {?} value
     * @return {?}
     */
    set content(value) {
        this._content = value;
        this._hasContent = value != null && `${value}`.trim().length > 0;
        this._updateTextContent();
    }
    /**
     * Message used to describe the decorated element via aria-describedby
     * @return {?}
     */
    get description() { return this._description; }
    /**
     * @param {?} newDescription
     * @return {?}
     */
    set description(newDescription) {
        if (newDescription !== this._description) {
            this._updateHostAriaDescription(newDescription, this._description);
            this._description = newDescription;
        }
    }
    /**
     * Whether the badge is hidden.
     * @return {?}
     */
    get hidden() { return this._hidden; }
    /**
     * @param {?} val
     * @return {?}
     */
    set hidden(val) {
        this._hidden = coerceBooleanProperty(val);
    }
    /**
     * Whether the badge is above the host or not
     * @return {?}
     */
    isAbove() {
        return this.position.indexOf('below') === -1;
    }
    /**
     * Whether the badge is after the host or not
     * @return {?}
     */
    isAfter() {
        return this.position.indexOf('before') === -1;
    }
    /**
     * @return {?}
     */
    ngOnDestroy() {
        if (this.description && this._badgeElement) {
            this._ariaDescriber.removeDescription(this._badgeElement, this.description);
        }
    }
    /**
     * Injects a span element into the DOM with the content.
     * @return {?}
     */
    _updateTextContent() {
        if (!this._badgeElement) {
            this._badgeElement = this._createBadgeElement();
        }
        else {
            this._badgeElement.textContent = this.content;
        }
        return this._badgeElement;
    }
    /**
     * Creates the badge element
     * @return {?}
     */
    _createBadgeElement() {
        // @breaking-change 8.0.0 Remove null check for _renderer
        const /** @type {?} */ rootNode = this._renderer || this._document;
        const /** @type {?} */ badgeElement = rootNode.createElement('span');
        const /** @type {?} */ activeClass = 'mat-badge-active';
        badgeElement.setAttribute('id', `mat-badge-content-${this._id}`);
        badgeElement.classList.add('mat-badge-content');
        badgeElement.textContent = this.content;
        if (this.description) {
            badgeElement.setAttribute('aria-label', this.description);
        }
        this._elementRef.nativeElement.appendChild(badgeElement);
        // animate in after insertion
        if (typeof requestAnimationFrame === 'function') {
            this._ngZone.runOutsideAngular(() => {
                requestAnimationFrame(() => {
                    badgeElement.classList.add(activeClass);
                });
            });
        }
        else {
            badgeElement.classList.add(activeClass);
        }
        return badgeElement;
    }
    /**
     * Sets the aria-label property on the element
     * @param {?} newDescription
     * @param {?} oldDescription
     * @return {?}
     */
    _updateHostAriaDescription(newDescription, oldDescription) {
        // ensure content available before setting label
        const /** @type {?} */ content = this._updateTextContent();
        if (oldDescription) {
            this._ariaDescriber.removeDescription(content, oldDescription);
        }
        if (newDescription) {
            this._ariaDescriber.describe(content, newDescription);
        }
    }
    /**
     * Adds css theme class given the color to the component host
     * @param {?} colorPalette
     * @return {?}
     */
    _setColor(colorPalette) {
        if (colorPalette !== this._color) {
            if (this._color) {
                this._elementRef.nativeElement.classList.remove(`mat-badge-${this._color}`);
            }
            if (colorPalette) {
                this._elementRef.nativeElement.classList.add(`mat-badge-${colorPalette}`);
            }
        }
    }
}
MatBadge.decorators = [
    { type: Directive, args: [{
                selector: '[matBadge]',
                host: {
                    'class': 'mat-badge',
                    '[class.mat-badge-overlap]': 'overlap',
                    '[class.mat-badge-above]': 'isAbove()',
                    '[class.mat-badge-below]': '!isAbove()',
                    '[class.mat-badge-before]': '!isAfter()',
                    '[class.mat-badge-after]': 'isAfter()',
                    '[class.mat-badge-small]': 'size === "small"',
                    '[class.mat-badge-medium]': 'size === "medium"',
                    '[class.mat-badge-large]': 'size === "large"',
                    '[class.mat-badge-hidden]': 'hidden || !_hasContent',
                },
            },] },
];
/** @nocollapse */
MatBadge.ctorParameters = () => [
    { type: undefined, decorators: [{ type: Optional }, { type: Inject, args: [DOCUMENT,] },] },
    { type: NgZone, },
    { type: ElementRef, },
    { type: AriaDescriber, },
    { type: Renderer2, },
];
MatBadge.propDecorators = {
    "color": [{ type: Input, args: ['matBadgeColor',] },],
    "overlap": [{ type: Input, args: ['matBadgeOverlap',] },],
    "position": [{ type: Input, args: ['matBadgePosition',] },],
    "content": [{ type: Input, args: ['matBadge',] },],
    "description": [{ type: Input, args: ['matBadgeDescription',] },],
    "size": [{ type: Input, args: ['matBadgeSize',] },],
    "hidden": [{ type: Input, args: ['matBadgeHidden',] },],
};

/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes} checked by tsc
 */
class MatBadgeModule {
}
MatBadgeModule.decorators = [
    { type: NgModule, args: [{
                imports: [
                    A11yModule,
                    MatCommonModule
                ],
                exports: [MatBadge],
                declarations: [MatBadge],
            },] },
];

/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes} checked by tsc
 */

/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes} checked by tsc
 */

export { MatBadgeModule, MatBadge };
//# sourceMappingURL=badge.js.map

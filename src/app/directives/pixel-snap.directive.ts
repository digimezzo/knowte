import { AfterViewInit, Directive, ElementRef, NgZone, OnDestroy } from '@angular/core';

// Keeps a badge on whole device pixels, so its background and text are rounded the same way and the text stays centered.
@Directive({
    selector: '[appPixelSnap]',
})
export class PixelSnapDirective implements AfterViewInit, OnDestroy {
    private resizeObserver: ResizeObserver;
    private mutationObserver: MutationObserver;
    private animationFrame: number = 0;

    public constructor(
        private elementRef: ElementRef<HTMLElement>,
        private zone: NgZone,
    ) {}

    public ngAfterViewInit(): void {
        if (typeof ResizeObserver === 'undefined' || typeof MutationObserver === 'undefined') {
            return;
        }

        const element: HTMLElement = this.elementRef.nativeElement;
        const observedContainer: HTMLElement = element.parentElement ?? element;

        this.zone.runOutsideAngular(() => {
            this.resizeObserver = new ResizeObserver(() => this.scheduleSnap());
            this.resizeObserver.observe(element);
            this.resizeObserver.observe(observedContainer);

            this.mutationObserver = new MutationObserver(() => this.scheduleSnap());
            this.mutationObserver.observe(observedContainer, { characterData: true, childList: true, subtree: true });

            this.scheduleSnap();
        });
    }

    public ngOnDestroy(): void {
        this.resizeObserver?.disconnect();
        this.mutationObserver?.disconnect();
        cancelAnimationFrame(this.animationFrame);
    }

    private scheduleSnap(): void {
        cancelAnimationFrame(this.animationFrame);
        this.animationFrame = requestAnimationFrame(() => this.snap());
    }

    private snap(): void {
        const element: HTMLElement = this.elementRef.nativeElement;
        const pixelRatio: number = window.devicePixelRatio || 1;

        element.style.width = '';
        element.style.transform = '';

        const range: Range = document.createRange();
        range.selectNodeContents(element);
        let width: number = Math.ceil(range.getBoundingClientRect().width * pixelRatio) / pixelRatio;

        const style: CSSStyleDeclaration = getComputedStyle(element);

        if (style.boxSizing === 'border-box') {
            width +=
                parseFloat(style.paddingLeft) +
                parseFloat(style.paddingRight) +
                parseFloat(style.borderLeftWidth) +
                parseFloat(style.borderRightWidth);
        }

        element.style.width = `${width}px`;

        const rect: DOMRect = element.getBoundingClientRect();
        const offsetX: number = Math.round(rect.left * pixelRatio) / pixelRatio - rect.left;
        const offsetY: number = Math.round(rect.top * pixelRatio) / pixelRatio - rect.top;

        element.style.transform = `translate(${offsetX}px, ${offsetY}px)`;
    }
}

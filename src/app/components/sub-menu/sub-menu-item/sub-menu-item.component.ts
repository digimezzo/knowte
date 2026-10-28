import { AfterViewInit, Component, ElementRef, Input, OnDestroy, ViewChild } from '@angular/core';

const countLabelHorizontalPadding: number = 12;
const countLabelMinWidth: number = 22;

@Component({
    selector: 'app-sub-menu-item',
    host: { style: 'display: block' },
    templateUrl: './sub-menu-item.component.html',
    styleUrls: ['./sub-menu-item.component.scss'],
})
export class SubMenuItemComponent implements AfterViewInit, OnDestroy {
    private resizeObserver: ResizeObserver;
    private countTextElement: HTMLElement;
    private countLabelElement: HTMLElement;

    @ViewChild('labelContainer', { static: true })
    public labelContainer: ElementRef<HTMLElement>;

    @ViewChild('labelMeasure', { static: true })
    public labelMeasure: ElementRef<HTMLElement>;

    @ViewChild('countText')
    public set countText(value: ElementRef<HTMLElement> | undefined) {
        if (this.countTextElement != undefined) {
            this.resizeObserver?.unobserve(this.countTextElement);
        }

        this.countTextElement = value?.nativeElement;
        this.countLabelElement = this.countTextElement?.parentElement ?? undefined;

        if (this.countTextElement != undefined) {
            this.resizeObserver?.observe(this.countTextElement);
        }
    }

    @Input()
    public page: number;

    @Input()
    public selectedPage: number;
    @Input()
    public count: number = -1;
    @Input()
    public text: string;

    public ngAfterViewInit(): void {
        if (typeof ResizeObserver === 'undefined') {
            return;
        }

        // Whole-pixel widths keep the badge on pixel boundaries so its text renders centered.
        this.resizeObserver = new ResizeObserver(() => this.snapWidthsToPixels());
        this.resizeObserver.observe(this.labelMeasure.nativeElement);

        if (this.countTextElement != undefined) {
            this.resizeObserver.observe(this.countTextElement);
        }
    }

    public ngOnDestroy(): void {
        this.resizeObserver?.disconnect();
    }

    private snapWidthsToPixels(): void {
        const labelWidth: number = this.labelMeasure.nativeElement.getBoundingClientRect().width;
        this.labelContainer.nativeElement.style.width = `${Math.ceil(labelWidth)}px`;

        if (this.countTextElement != undefined && this.countLabelElement != undefined) {
            const textWidth: number = this.countTextElement.getBoundingClientRect().width;
            const badgeWidth: number = Math.max(countLabelMinWidth, Math.ceil(textWidth) + countLabelHorizontalPadding);
            this.countLabelElement.style.width = `${badgeWidth}px`;
        }
    }
}

import { DeleteAction, ResizeAction, AlignAction, ImageSpec } from 'quill-blot-formatter';

/**
 * Fixes Quill Blot Formatter issues with scrolling.
 * See: https://github.com/Fandom-OSS/quill-blot-formatter/issues/7
 */
export class CustomImageSpec extends ImageSpec {
  public getActions(): (typeof DeleteAction | typeof ResizeAction | typeof AlignAction)[] {
    return [DeleteAction, ResizeAction, AlignAction];
  }

  public init(): void {
    this.formatter.quill.root.addEventListener('click', this.onClick);

    // Handling scroll event
    this.formatter.quill.root.addEventListener('scroll', () => {
      this.formatter.repositionOverlay();
    });

    // Handling align
    this.formatter.quill.on('editor-change', (eventName, ...args) => {
      if (eventName === 'selection-change' && args[2] === 'api') {
        setTimeout(() => {
          this.formatter.repositionOverlay();
        }, 10);
      }
    });
  }
}

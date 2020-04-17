export class FontSize {
    constructor(public normalSize: number) {
    }

    public smallSize: number = this.normalSize * 0.85;
    public largeSize: number = this.normalSize * 1.42;
    public largerSize: number = this.normalSize * 1.72;
}

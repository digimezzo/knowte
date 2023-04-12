export class FontSize {
    constructor(public normalSize: number) {}

    public largeSize: number = this.normalSize * 1.42;
    public largerSize: number = this.normalSize * 1.72;
}

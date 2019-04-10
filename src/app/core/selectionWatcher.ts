export class SelectionWatcher {
    constructor() { }

    private items: any[];
    private isWatching: boolean = false;
    private lastSelectedItem: any;

    public reset(items: any[], selectFirstItem: boolean = false): void {
        this.items = items;

        if (this.items.length > 0) {
            this.items.forEach(x => x.isSelected = false);

            if (selectFirstItem) {
                this.items[0].isSelected = true;
            }
        }

        this.isWatching = true;
    }

    public selectItemsInBetween(item: any): void {
        if (!this.isWatching) {
            return;
        }

        let currentItemIndex: number = this.items.indexOf(item);
        let lastSelectedItemIndex: number = this.items.indexOf(item);

        if (this.lastSelectedItem) {
            lastSelectedItemIndex = this.items.indexOf(this.lastSelectedItem);
        }

        let lowIndex: number = currentItemIndex;
        let highIndex: number = lastSelectedItemIndex;

        if (currentItemIndex > lastSelectedItemIndex) {
            lowIndex = lastSelectedItemIndex;
            highIndex = currentItemIndex;
        }

        for (var i = 0; i < this.items.length; i++) {
            if (lowIndex <= i && i <= highIndex) {
                this.items[i].isSelected = true;
                this.lastSelectedItem = item;
            }
        }
    }

    public selectSingleItem(item: any): void {
        if (!this.isWatching) {
            return;
        }

        let currentItemIndex: number = this.items.indexOf(item);

        for (var i = 0; i < this.items.length; i++) {
            this.items[i].isSelected = false;

            if (i === currentItemIndex) {
                this.items[i].isSelected = true;
                this.lastSelectedItem = item;
            }
        }
    }

    public toggleItemSelection(item: any): void {
        if (!this.isWatching) {
            return;
        }

        item.isSelected = !item.isSelected;

        if (item.isSelected) {
            this.lastSelectedItem = item;
        }
    }
}
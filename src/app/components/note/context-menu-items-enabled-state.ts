export class ContextMenuItemsEnabledState{
    public constructor(public hasSelectedText: boolean, public clipboardHasItems: boolean){}


    public get canCut() : boolean {
        return this.hasSelectedText;
    }
    
    public get canCopy() : boolean {
        return this.hasSelectedText;
    }

    public get canPaste() : boolean {
        return this.clipboardHasItems;
    }

    public get canDelete() : boolean {
        return this.hasSelectedText;
    }
}
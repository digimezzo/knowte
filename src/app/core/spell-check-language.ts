export class SpellCheckLanguage {
    public constructor(public code: string, public englishName: string, public localizedName: string, public hasLatinCharacters: boolean) {}

    public isEnabled: boolean = false;

    public get sortName(): string {
        return this.hasLatinCharacters ? this.localizedName : this.englishName;
    }
}

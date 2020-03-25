import * as nanoid from 'nanoid';

export class Notebook {
    constructor(public name: string) {
    }

    public id: string = nanoid();
    public isDefault: boolean = false;
    public isSelected: boolean;
}

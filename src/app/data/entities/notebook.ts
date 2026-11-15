import { nanoid } from 'nanoid';
import { ISelectable } from './i-selectable';

export class Notebook implements ISelectable {
    constructor(public name: string, public isSelected: boolean = false) {}

    public id: string = nanoid();
    public isDefault: boolean = false;
    public isArchived?: boolean = false;
}

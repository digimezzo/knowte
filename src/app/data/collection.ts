import * as nanoid from 'nanoid';

export class Collection{
    constructor(public name: string, public isActive: boolean) {
        this.id = nanoid();
        this.nameLower = name.toLowerCase();
    }

    public id: string;
    public nameLower: string;
}
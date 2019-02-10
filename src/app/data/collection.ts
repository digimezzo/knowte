import * as nanoid from 'nanoid';

export class Collection{
    constructor(public name: string, public isActive: boolean) {
    }

    public id: string = nanoid();
}
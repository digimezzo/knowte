import { UniqueId } from "../core/uniqueId";

export class Collection{
    constructor(public name: string, public isActive: boolean) {
        this.id = UniqueId.create();
    }

    public id: string;
}
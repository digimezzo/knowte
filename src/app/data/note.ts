import * as moment from 'moment'
import * as nanoid from 'nanoid';

export class Note{
    constructor(public title: string, public notebookId: string, public collectionId: string) {
    }

    public id: string = nanoid();
    public isOpen: boolean = false;
    public isMarked: boolean = false;
    public creationDate: number = moment().valueOf();
    public modificationDate: number = moment().valueOf();
    public displayModificationDate: string;
}
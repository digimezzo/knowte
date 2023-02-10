import * as moment from 'moment';
import { nanoid } from 'nanoid';

export class Note {
    constructor(public title: string, public notebookId: string, public isMarkdownNote: boolean) {}

    public id: string = nanoid();
    public isMarked: boolean = false;
    public isEncrypted: boolean = false;
    public secretKeyHash: string = '';
    public creationDate: number = moment().valueOf();
    public modificationDate: number = moment().valueOf();
    public text: string = '';
    public displayModificationDate: string;
    public displayExactModificationDate: string;
    public isSelected: boolean = false;
    public closedTasksCount: number = 0;
    public totalTasksCount: number = 0;
    public isTrashed: boolean = false;
    public trashedDate: number = 0;
    public displayTrashedDate: string;
}

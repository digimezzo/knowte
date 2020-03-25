import * as moment from 'moment';
import * as nanoid from 'nanoid';

export class Note {
    constructor(public title: string, public notebookId: string) {
    }

    public id: string = nanoid();
    public isMarked: boolean = false;
    public creationDate: number = moment().valueOf();
    public modificationDate: number = moment().valueOf();
    public text: string = '';
    public displayModificationDate: string;
    public displayExactModificationDate: string;
    public isSelected: boolean;
    public closedTasksCount: number = 0;
    public totalTasksCount: number = 0;
}

export class TasksCount{
    constructor(public openTasksCount: number, public closedTasksCount: number) {
        this.totalTasksCount = openTasksCount + closedTasksCount;
    }

    public totalTasksCount: number;
}
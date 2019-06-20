import { Component, OnInit, Input } from '@angular/core';

@Component({
    selector: 'tasks-progress-component',
    templateUrl: './tasksProgress.component.html',
    styleUrls: ['./tasksProgress.component.scss']
})
export class TasksProgressComponent implements OnInit {
    constructor() {
    }

    @Input() public closedTasksCount: number;
    @Input() public totalTasksCount: number;

    public ngOnInit(): void {
    }
}

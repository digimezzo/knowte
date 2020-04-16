import { Component, OnInit, Input } from '@angular/core';

@Component({
    selector: 'app-tasks-progress',
    templateUrl: './tasks-progress.component.html',
    styleUrls: ['./tasks-progress.component.scss']
})
export class TasksProgressComponent implements OnInit {
    private _closedTasksCount: number;
    private _totalTasksCount: number;

    constructor() {
    }

    public get closedTasksCount(): number {
        return this._closedTasksCount;
    }

    @Input()
    public set closedTasksCount(v: number) {
        this._closedTasksCount = v;
        this.calculateWidth();
    }

    public get totalTasksCount(): number {
        return this._totalTasksCount;
    }

    @Input()
    public set totalTasksCount(v: number) {
        this._totalTasksCount = v;
        this.calculateWidth();
    }

    public width: Number;

    public ngOnInit(): void {
        this.calculateWidth();
    }

    private calculateWidth(): void {
        const maxWidth: number = 75;
        this.width = (this.closedTasksCount / this.totalTasksCount) * maxWidth;
    }
}

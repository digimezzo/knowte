import { Injectable } from '@angular/core';

@Injectable()
export class Scheduler {
    public async sleepAsync(milliseconds: number): Promise<void> {
        return new Promise((resolve) => setTimeout(resolve, milliseconds));
    }

    public async sleep(milliseconds: number): Promise<void> {
        return new Promise<void>((resolve) => setTimeout(resolve, milliseconds));
    }
}

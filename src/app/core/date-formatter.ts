import { Injectable } from '@angular/core';
import * as moment from 'moment';
import { Moment } from 'moment';

@Injectable()
export class DateFormatter {
    public getFormattedDate(millisecondsSinceEpoch: number): string {
        const m: Moment = moment(millisecondsSinceEpoch);
        return m.format('dddd, MMMM D, YYYY');
    }
}

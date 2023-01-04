import { Injectable } from '@angular/core';
import * as moment from 'moment';
import { Duration, Moment } from 'moment';
import { DateFormatter } from '../../core/date-formatter';
import { NoteDateFormatResult } from '../results/note-date-format-result';
import { TranslatorService } from '../translator/translator.service';

@Injectable()
export class NoteDateFormatter {
    public constructor(private translator: TranslatorService, private dateFormatter: DateFormatter) {}

    public async getNoteDateFormatAsync(millisecondsSinceEpoch: number, useExactDates: boolean): Promise<NoteDateFormatResult> {
        const result: NoteDateFormatResult = new NoteDateFormatResult();
        const nowDateOnly: Moment = moment().startOf('day');
        const modificationDateOnly: Moment = moment(millisecondsSinceEpoch).startOf('day');
        const duration: Duration = moment.duration(nowDateOnly.diff(modificationDateOnly));

        if (duration.asMonths() >= 12) {
            result.dateText = await this.translator.getAsync('NoteDates.LongAgo');
        } else if (duration.asMonths() >= 11) {
            result.dateText = await this.translator.getAsync('NoteDates.MonthsAgo', { count: 11 });
        } else if (duration.asMonths() >= 10) {
            result.dateText = await this.translator.getAsync('NoteDates.MonthsAgo', { count: 10 });
        } else if (duration.asMonths() >= 9) {
            result.dateText = await this.translator.getAsync('NoteDates.MonthsAgo', { count: 9 });
        } else if (duration.asMonths() >= 8) {
            result.dateText = await this.translator.getAsync('NoteDates.MonthsAgo', { count: 8 });
        } else if (duration.asMonths() >= 7) {
            result.dateText = await this.translator.getAsync('NoteDates.MonthsAgo', { count: 7 });
        } else if (duration.asMonths() >= 6) {
            result.dateText = await this.translator.getAsync('NoteDates.MonthsAgo', { count: 6 });
        } else if (duration.asMonths() >= 5) {
            result.dateText = await this.translator.getAsync('NoteDates.MonthsAgo', { count: 5 });
        } else if (duration.asMonths() >= 4) {
            result.dateText = await this.translator.getAsync('NoteDates.MonthsAgo', { count: 4 });
        } else if (duration.asMonths() >= 3) {
            result.dateText = await this.translator.getAsync('NoteDates.MonthsAgo', { count: 3 });
        } else if (duration.asMonths() >= 2) {
            result.dateText = await this.translator.getAsync('NoteDates.MonthsAgo', { count: 2 });
        } else if (duration.asMonths() >= 1) {
            result.dateText = await this.translator.getAsync('NoteDates.MonthsAgo', { count: 1 });
        } else if (duration.asDays() >= 21) {
            result.dateText = await this.translator.getAsync('NoteDates.WeeksAgo', { count: 3 });
        } else if (duration.asDays() >= 14) {
            result.dateText = await this.translator.getAsync('NoteDates.WeeksAgo', { count: 2 });
        } else if (duration.asDays() >= 8) {
            result.dateText = await this.translator.getAsync('NoteDates.LastWeek');
        } else if (duration.asDays() >= 7) {
            result.dateText = await this.translator.getAsync('NoteDates.DaysAgo', { count: 7 });
            result.isThisWeekNote = true;
        } else if (duration.asDays() >= 6) {
            result.dateText = await this.translator.getAsync('NoteDates.DaysAgo', { count: 6 });
            result.isThisWeekNote = true;
        } else if (duration.asDays() >= 5) {
            result.dateText = await this.translator.getAsync('NoteDates.DaysAgo', { count: 5 });
            result.isThisWeekNote = true;
        } else if (duration.asDays() >= 4) {
            result.dateText = await this.translator.getAsync('NoteDates.DaysAgo', { count: 4 });
            result.isThisWeekNote = true;
        } else if (duration.asDays() >= 3) {
            result.dateText = await this.translator.getAsync('NoteDates.DaysAgo', { count: 3 });
            result.isThisWeekNote = true;
        } else if (duration.asDays() >= 2) {
            result.dateText = await this.translator.getAsync('NoteDates.DaysAgo', { count: 2 });
            result.isThisWeekNote = true;
        } else if (duration.asDays() >= 1) {
            result.dateText = await this.translator.getAsync('NoteDates.Yesterday');
            result.isYesterdayNote = true;
            result.isThisWeekNote = true;
        } else if (duration.asDays() >= 0) {
            result.dateText = await this.translator.getAsync('NoteDates.Today');
            result.isTodayNote = true;
            result.isThisWeekNote = true;
        }

        if (useExactDates) {
            result.dateText = this.dateFormatter.getFormattedDate(millisecondsSinceEpoch);
        }

        return result;
    }
}

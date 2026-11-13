import moment, { Moment } from 'moment';

export class DateUtils {
    public static getFormattedDate(millisecondsSinceEpoch: number): string {
        const m: Moment = moment(millisecondsSinceEpoch);
        return m.format('dddd, MMMM D, YYYY');
    }
}

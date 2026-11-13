import { Mock } from 'typemoq';
import { DateUtils } from '../../common/utils/date-utils';
import { TranslatorService } from '../translator/translator.service';
import { NoteDateFormatter } from './note-date-formatter';

describe('NoteDateFormatter', () => {
    const translator = Mock.ofType<TranslatorService>();
    let formatter: NoteDateFormatter;

    beforeEach(() => {
        jest.useFakeTimers().setSystemTime(new Date(2026, 10, 13, 12));
        translator.reset();
        translator.setup((x) => x.getAsync('NoteDates.Today')).returns(async () => 'Today');
        translator.setup((x) => x.getAsync('NoteDates.Yesterday')).returns(async () => 'Yesterday');
        formatter = new NoteDateFormatter(translator.object);
    });

    afterEach(() => jest.useRealTimers());

    it('formats today and yesterday using relative dates', async () => {
        const today = await formatter.getNoteDateFormatAsync(new Date(2026, 10, 13, 9).getTime(), false);
        const yesterday = await formatter.getNoteDateFormatAsync(new Date(2026, 10, 12, 9).getTime(), false);

        expect(today.dateText).toBe('Today');
        expect(today.isTodayNote).toBe(true);
        expect(yesterday.dateText).toBe('Yesterday');
        expect(yesterday.isYesterdayNote).toBe(true);
    });

    it('uses the exact date when requested', async () => {
        const timestamp = new Date(2026, 10, 13, 9).getTime();
        const result = await formatter.getNoteDateFormatAsync(timestamp, true);

        expect(DateUtils.getFormattedDate(timestamp)).toBe('Friday, November 13, 2026');
        expect(result.dateText).toBe('Friday, November 13, 2026');
        expect(result.isTodayNote).toBe(true);
    });
});

import { TagUtils } from './tag-utils';

describe('TagUtils', () => {
    it('trims names, ignores blanks and removes case-insensitive duplicates', () => {
        expect(TagUtils.normalize([' Work ', '', 'work', 'HOME', 'home', 'project alpha', '  ']))
            .toEqual(['Work', 'HOME', 'project alpha']);
    });

    it('supports missing tags on older notes and exports', () => {
        expect(TagUtils.normalize(undefined)).toEqual([]);
    });

    it('does not mutate the original tags', () => {
        const tags = [' Work ', 'work'];
        expect(TagUtils.normalize(tags)).toEqual(['Work']);
        expect(tags).toEqual([' Work ', 'work']);
    });

    it.each([null, 'work', [123], ['work', null]])('rejects invalid tag metadata: %p', (tags) => {
        expect(() => TagUtils.normalize(JSON.parse(JSON.stringify(tags)))).toThrow('Tags must be an array of strings.');
    });

    it.each([
        ['t:work', { tag: 'work', text: '' }],
        [' T:Work ', { tag: 'work', text: '' }],
        ['t: work meeting ', { tag: 'work', text: 'meeting' }],
        ['t:work meeting budget', { tag: 'work', text: 'meeting budget' }],
        ['t:work\tmeeting\nbudget', { tag: 'work', text: 'meeting\nbudget' }],
        ['t:"project alpha"', { tag: 'project alpha', text: '' }],
        ['t:"Project Alpha" meeting', { tag: 'project alpha', text: 'meeting' }],
        ['t: " project alpha " meeting ', { tag: 'project alpha', text: 'meeting' }],
        ['t:', { tag: '', text: '' }],
        ['t:   ', { tag: '', text: '' }],
        ['t:""', { tag: '', text: '' }],
        ['t:"project alpha', { tag: '', text: '' }],
        ['t:"project alpha"meeting', { tag: '', text: '' }],
        ['work', { text: 'work' }],
        ['meeting t:work', { text: 'meeting t:work' }],
        ['tag:work', { text: 'tag:work' }],
        ['', { text: '' }],
        [undefined, { text: '' }],
    ])('parses tag and text searches: %p', (query, search) => {
        expect(TagUtils.parseSearch(query)).toEqual(search);
    });
});

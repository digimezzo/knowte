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
        ['t:work', { tags: ['work'], text: '' }],
        [' T:Work ', { tags: ['work'], text: '' }],
        ['t: work meeting ', { tags: ['work'], text: 'meeting' }],
        ['t:work meeting budget', { tags: ['work'], text: 'meeting budget' }],
        ['t:work\tmeeting\nbudget', { tags: ['work'], text: 'meeting\nbudget' }],
        ['t:"project alpha"', { tags: ['project alpha'], text: '' }],
        ['t:"Project Alpha" meeting', { tags: ['project alpha'], text: 'meeting' }],
        ['t: " project alpha " meeting ', { tags: ['project alpha'], text: 'meeting' }],
        ['t:work t:urgent', { tags: ['work', 'urgent'], text: '' }],
        ['t:WORK T:Urgent meeting budget', { tags: ['work', 'urgent'], text: 'meeting budget' }],
        ['t:"project alpha" t:"needs review" meeting', { tags: ['project alpha', 'needs review'], text: 'meeting' }],
        ['t:work t:work', { tags: ['work', 'work'], text: '' }],
        ['t:work t:', { tags: [''], text: '' }],
        ['t:work t:"urgent', { tags: [''], text: '' }],
        ['t:', { tags: [''], text: '' }],
        ['t:   ', { tags: [''], text: '' }],
        ['t:""', { tags: [''], text: '' }],
        ['t:"project alpha', { tags: [''], text: '' }],
        ['t:"project alpha"meeting', { tags: [''], text: '' }],
        ['work', { tags: [], text: 'work' }],
        ['meeting t:work', { tags: [], text: 'meeting t:work' }],
        ['tag:work', { tags: [], text: 'tag:work' }],
        ['', { tags: [], text: '' }],
        [undefined, { tags: [], text: '' }],
    ])('parses tag and text searches: %p', (query, search) => {
        expect(TagUtils.parseSearch(query)).toEqual(search);
    });
});

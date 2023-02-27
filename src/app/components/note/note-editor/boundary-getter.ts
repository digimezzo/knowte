import { Injectable } from '@angular/core';
import { LineBoundary } from './line-boundary';
import { WordBoundary } from './word-boundary';

@Injectable()
export class BoundaryGetter {
    public constructor() {}

    public getWordBoundary(element: any): WordBoundary {
        const pattern: RegExp = /\r?\n|\r|\s/;
        let start: number = 0;

        for (let index = 0; index < element.selectionStart; index++) {
            if (element.value.substr(index, 1).match(pattern)) {
                start = index + 1;
            }
        }

        let end: number = element.selectionEnd;

        let foundEndOfWord: boolean = false;

        // TODO: is there a better way to find the end of a word?
        for (let index = element.selectionStart; index < element.selectionStart + 100; index++) {
            if (element.value.substr(index, 1).match(pattern)) {
                if (!foundEndOfWord) {
                    foundEndOfWord = true;
                    end = index;
                }
            }
        }

        return new WordBoundary(start, end);
    }

    public getLineBoundary(element: any): LineBoundary {
        const pattern: RegExp = /\r?\n|\r/;

        let start: number = 0;

        for (let index = 0; index < element.selectionStart; index++) {
            if (element.value.substr(index, 1).match(pattern)) {
                start = index + 1;
            }
        }

        let end: number = element.selectionEnd;

        let foundEndOfLine: boolean = false;

        // TODO: is there a better way to find the end of a line?
        for (let index = element.selectionStart; index < element.selectionStart + 10000; index++) {
            if (element.value.substr(index, 1).match(pattern)) {
                if (!foundEndOfLine) {
                    foundEndOfLine = true;
                    end = index;
                }
            }
        }

        return new LineBoundary(start, end);
    }
}

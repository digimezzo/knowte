import { Injectable } from '@angular/core';
import { LineBoundary } from './line-boundary';
import { WordBoundary } from './word-boundary';

@Injectable()
export class BoundaryGetter {
    public constructor() {}

    public getWordBoundary(element: HTMLTextAreaElement | HTMLInputElement): WordBoundary {
        const pattern: RegExp = /\r?\n|\r|\s/;
        const selectionStart: number = element.selectionStart ?? 0;
        const selectionEnd: number = element.selectionEnd ?? selectionStart;
        let start: number = 0;

        for (let index = 0; index < selectionStart; index++) {
            if (element.value.substr(index, 1).match(pattern)) {
                start = index + 1;
            }
        }

        let end: number = selectionEnd;

        let foundEndOfWord: boolean = false;

        // TODO: is there a better way to find the end of a word?
        for (let index = selectionStart; index < selectionStart + 100; index++) {
            if (element.value.substr(index, 1).match(pattern)) {
                if (!foundEndOfWord) {
                    foundEndOfWord = true;
                    end = index;
                }
            }
        }

        return new WordBoundary(start, end);
    }

    public getLineBoundary(element: HTMLTextAreaElement | HTMLInputElement): LineBoundary {
        const pattern: RegExp = /\r?\n|\r/;
        const selectionStart: number = element.selectionStart ?? 0;
        const selectionEnd: number = element.selectionEnd ?? selectionStart;

        let start: number = 0;

        for (let index = 0; index < selectionStart; index++) {
            if (element.value.substr(index, 1).match(pattern)) {
                start = index + 1;
            }
        }

        let end: number = selectionEnd;

        let foundEndOfLine: boolean = false;

        // TODO: is there a better way to find the end of a line?
        for (let index = selectionStart; index < selectionStart + 10000; index++) {
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

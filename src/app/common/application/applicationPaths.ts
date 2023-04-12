import * as path from 'path';
import sanitize from 'sanitize-filename';
import { Constants } from './constants';

export class ApplicationPaths {
    public static readonly themesFolder: string = 'Themes';

    public static getNoteExportPath(exportDirectory: string, noteTitle: string, isMarkdownNote: boolean): string {
        let extension: string = Constants.classicNoteExportExtension;

        if (isMarkdownNote) {
            extension = Constants.markdownNoteExportExtension;
        }

        return path.join(exportDirectory, `${sanitize(noteTitle)}${extension}`);
    }

    public static getPdfExportPath(exportDirectory: string, noteTitle: string): string {
        return path.join(exportDirectory, `${sanitize(noteTitle)}.pdf`);
    }
}

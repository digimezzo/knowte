import { Injectable } from '@angular/core';
import { ipcRenderer } from 'electron';
import * as fs from 'fs-extra';
import { FileAccess } from '../../core/file-access';
import { Logger } from '../../core/logger';

@Injectable()
export class PrintService {
    public constructor(private fileAccess: FileAccess, private logger: Logger) {}

    public async printAsync(pageTitle: string, pageContent: string, isMarkdownNote: boolean): Promise<void> {
        try {
            const printHtmlFilePath: string = await this.writePrintHtmlFileAsync(pageTitle, pageContent, isMarkdownNote);

            const data: any = { printHtmlFilePath };

            this.logger.info('Sending "print" command to main.', 'PrintService', 'printAsync');

            ipcRenderer.send('print', data);
        } catch (error) {
            this.logger.error(`Printing failed. Error: ${error.message}`, 'PrintService', 'printAsync');
        }
    }

    public async exportToPdfAsync(pdfFilePath: string, pageTitle: string, pageContent: string, isMarkdownNote: boolean): Promise<void> {
        try {
            const printHtmlFilePath: string = await this.writePrintHtmlFileAsync(pageTitle, pageContent, isMarkdownNote);

            const data: any = { pdfFilePath, printHtmlFilePath };

            this.logger.info(`Sending "printToPDF" command with filePath='${pdfFilePath}' to main.`, 'PrintService', 'exportToPdfAsync');

            ipcRenderer.send('printToPDF', data);
        } catch (error) {
            this.logger.error(`Export to PDF failed. Error: ${error.message}`, 'PrintService', 'exportToPdfAsync');
        }
    }

    private createPrintHtmlFileContent(pageTitle: string, pageContent: string, isMarkdownNote: boolean): string {
        let printCss: string = this.createClassicPrintCss();

        if (isMarkdownNote) {
            printCss = this.createMarkdownPrintCss();
        }
        return `<html><body><div>${printCss}<div class="page-title">${pageTitle}</div><div>${pageContent}</div></div></body></html>`;
    }

    private createClassicPrintCss(): string {
        // Font stacks from: https://gist.github.com/001101/a8b0e5ce8fd81225bed7
        return `<style type="text/css" scoped>
                    * {
                        font-family: Corbel, "Lucida Grande", "Lucida Sans Unicode", "Lucida Sans", "DejaVu Sans", "Bitstream Vera Sans", "Liberation Sans", Verdana, "Verdana Ref", sans serif;
                    }

                    body {
                        -webkit-print-color-adjust:exact;
                    }

                    h1,
                    a {
                        color: #1d7dd4;
                    }

                    h2{
                        color: #748393;
                    }

                    pre {
                        background-color: #f0f0f0;
                        border-radius: 3px;
                        white-space: pre-wrap;
                        margin: 5px 0 5px 0;
                        padding: 5px 10px;
                    }

                    pre.ql-syntax {
                        background-color: #23241f;
                        color: #f8f8f2;
                        overflow: visible;

                        font-family: Consolas, "Andale Mono WT", "Andale Mono", "Lucida Console", "Lucida Sans Typewriter", "DejaVu Sans Mono", "Bitstream Vera Sans Mono", "Liberation Mono", "Nimbus Mono L", Monaco, "Courier New", Courier, monospace;
                    }

                    blockquote {
                        border-left: 4px solid #ccc;
                        margin: 5px 0 5px 0;
                        padding: 0 0 0 16px;
                    }

                    .page-title{
                        font-size: 30px;
                    }
                </style>`;
    }

    private createMarkdownPrintCss(): string {
        return `<style type="text/css" scoped>
                    * {
                        font-family: Corbel, "Lucida Grande", "Lucida Sans Unicode", "Lucida Sans", "DejaVu Sans", "Bitstream Vera Sans", "Liberation Sans", Verdana, "Verdana Ref", sans serif;
                    }

                    body {
                        -webkit-print-color-adjust:exact;
                    }

                    h1,
                    a {
                        color: #1d7dd4;
                    }

                    h2{
                        color: #748393;
                    }

                    pre {
                        background-color: #f0f0f0;
                        border-radius: 3px;
                        white-space: pre-wrap;
                        margin: 5px 0 5px 0;
                        padding: 5px 10px;
                    }

                    pre.ql-syntax {
                        background-color: #23241f;
                        color: #f8f8f2;
                        overflow: visible;

                        font-family: Consolas, "Andale Mono WT", "Andale Mono", "Lucida Console", "Lucida Sans Typewriter", "DejaVu Sans Mono", "Bitstream Vera Sans Mono", "Liberation Mono", "Nimbus Mono L", Monaco, "Courier New", Courier, monospace;
                    }

                    blockquote {
                        border-left: 4px solid #ccc;
                        margin: 5px 0 5px 0;
                        padding: 0 0 0 16px;
                    }

                    .page-title{
                        font-size: 30px;
                    }
                </style>`;
    }

    private createPrintHtmlFilePath(): string {
        return this.fileAccess.combinePath(this.fileAccess.applicationDataDirectory(), 'print.html');
    }

    private async writePrintHtmlFileAsync(pageTitle: string, pageContent: string, isMarkdownNote: boolean): Promise<string> {
        const printHtmlFilePath: string = this.createPrintHtmlFilePath();
        const printHtmlFileContent: string = this.createPrintHtmlFileContent(pageTitle, pageContent, isMarkdownNote);

        try {
            await fs.writeFile(printHtmlFilePath, printHtmlFileContent);
        } catch (error) {
            this.logger.error(`Could not create print.html file. Error: ${error.message}`, 'PrintService', 'writePrintHtmlFileAsync');
            throw error;
        }

        return printHtmlFilePath;
    }
}

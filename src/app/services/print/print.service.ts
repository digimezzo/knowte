import { Injectable } from '@angular/core';
import { ipcRenderer } from 'electron';
import { Logger } from '../../common/logging/logger';
import { TemporaryStorageService } from '../temporary-storage/temporary-storage.service';

@Injectable()
export class PrintService {
    public constructor(private temporaryStorageService: TemporaryStorageService, private logger: Logger) {}

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
        return `<html><body><div>${this.createPrintCss(
            isMarkdownNote
        )}<div class="page-title">${pageTitle}</div><div>${pageContent}</div></div></body></html>`;
    }

    private createPrintCss(isMarkdownNote: boolean): string {
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

                    h1{
                        padding-bottom: 0.3em;
                        ${isMarkdownNote ? 'border-bottom: 1px solid #d7dee4;' : ''}
                    }

                    h2{
                        color: #748393;
                        padding-bottom: 0.3em;
                        ${isMarkdownNote ? 'border-bottom: 1px solid #d7dee4;' : ''}
                    }

                    pre {
                        background-color: #f6f8fa;
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
                        border-left: 4px solid #d0d7de;
                        margin: 5px 0 5px 0;
                        padding: 0 0 0 16px;
                        color: #57606a;
                    }

                    .page-title{
                        font-size: 30px;
                    }

                    table{
                        border-spacing: 0;
                        border-collapse: collapse;
                        margin-top: 0;
                        margin-bottom: 16px;
                    }

                    table th,
                    table td {
                        padding: 6px 13px;
                        border: 1px solid #d0d7de;
                    }

                    table tr {
                        background-color: #ffffff;
                        border-top: 1px solid #d7dee4;
                    }

                    table tr:nth-child(2n) {
                        background-color: #f6f8fa;
                    }
                </style>`;
    }

    private async writePrintHtmlFileAsync(pageTitle: string, pageContent: string, isMarkdownNote: boolean): Promise<string> {
        const printHtmlFileContent: string = this.createPrintHtmlFileContent(pageTitle, pageContent, isMarkdownNote);

        try {
            const printHtmlFilePath: string = await this.temporaryStorageService.createPrintHtmlFileAsync(printHtmlFileContent);

            return printHtmlFilePath;
        } catch (error) {
            this.logger.error(`Could not create print.html file. Error: ${error.message}`, 'PrintService', 'writePrintHtmlFileAsync');
            throw error;
        }
    }
}

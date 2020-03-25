import { Injectable } from '@angular/core';
import { ipcRenderer } from 'electron';
import { Logger } from './logger';

@Injectable({
    providedIn: 'root'
})
export class WorkerManager {
    constructor(private logger: Logger) {

    }
    public print(pageTitle: string, pageContent: string): void {
        this.sendCommandToWorker('print', `<div>${this.createPrintCss()}<p class="page-title">${pageTitle}</p><p>${pageContent}</p></div>`);
    }

    public exportToPdf(pdfFileName: string, pdfTitle: string, pdfContent: string): void {
        const content: any = {
            savePath: pdfFileName,
            text: `<div>${this.createPrintCss()}<p class="page-title">${pdfTitle}</p><p>${pdfContent}</p></div>`
        };

        this.sendCommandToWorker('printPDF', content);
        this.logger.info('EXPOTR PDF:' + pdfFileName , '', '');
    }

    private sendCommandToWorker(command: string, content: any): void {
        ipcRenderer.send(command, content);
    }

    private createPrintCss(): string {
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
}

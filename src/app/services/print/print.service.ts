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
                        background-color: #eee;
                        color: black;
                        border-radius: 3px;
                        padding: 2px 5px;
                        font-family: Consolas, "Andale Mono WT", "Andale Mono", "Lucida Console", "Lucida Sans Typewriter", "DejaVu Sans Mono", "Bitstream Vera Sans Mono", "Liberation Mono", "Nimbus Mono L", Monaco, "Courier New", Courier, monospace;
                    }

                    code {
                        background-color: #eee;
                        color: black;
                        border-radius: 3px;
                        font-family: Consolas, "Andale Mono WT", "Andale Mono", "Lucida Console", "Lucida Sans Typewriter", "DejaVu Sans Mono", "Bitstream Vera Sans Mono", "Liberation Mono", "Nimbus Mono L", Monaco, "Courier New", Courier, monospace;
                    }
                    
                    code:not(pre code) {
                        padding: 2px 5px;
                    }

                    pre.mermaid {
                        background-color: transparent;
                        border-radius: 0;
                        padding: 0;
                    }

                    blockquote {
                        border-left: 4px solid #d0d0d0;
                        margin: 5px 0 5px 0;
                        padding: 0 0 0 16px;
                        color: #575757;
                    }

                    .task-list-item {
                        margin-left: -1.5em;
                        list-style-type: none;
                    }

                    .task-list-checkbox {
                        position: relative;
                        display: inline-block;
                        box-sizing: border-box;
                        width: 1em;
                        height: 1em;
                        margin: 0 0.4em 0 0;
                        border: 1px solid #8c959f;
                        border-radius: 3px;
                        background-color: #f6f8fa;
                        vertical-align: -0.15em;
                    }

                    .task-list-checkbox-checked {
                        background-color: #eaeef2;
                    }

                    .task-list-checkbox-checked::after {
                        position: absolute;
                        top: 0.17em;
                        left: 0.15em;
                        width: 0.66em;
                        height: 0.58em;
                        background-color: #24292f;
                        clip-path: polygon(0 48%, 14% 34%, 37% 57%, 83% 5%, 100% 19%, 37% 100%);
                        content: '';
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
                        border: 1px solid #d0d0d0;
                    }

                    table tr {
                        background-color: #ffffff;
                        border-top: 1px solid #d7d7d7;
                    }

                    table tr:nth-child(2n) {
                        background-color: #eee;
                    }
                </style>`;
    }

    private async renderMermaidDiagramsForPaperAsync(pageContent: string): Promise<string> {
        const template: HTMLTemplateElement = document.createElement('template');
        template.innerHTML = pageContent;
        const nodes = template.content.querySelectorAll<HTMLElement>('pre.mermaid[data-mermaid-source]');

        if (nodes.length === 0) {
            return pageContent;
        }

        const mermaid = (await import('mermaid')).default;
        // The preview may use a dark theme, but paper is always white.
        mermaid.initialize({ startOnLoad: false, securityLevel: 'strict', darkMode: false, theme: 'default' });

        for (let i = 0; i < nodes.length; i++) {
            try {
                const { svg } = await mermaid.render(`knowte-print-mermaid-${i}`, nodes[i].dataset.mermaidSource);
                nodes[i].innerHTML = svg;
            } catch (error) {
                this.logger.error(`Could not render Mermaid diagram for printing. Cause: ${error}`, 'PrintService', 'renderMermaidDiagramsForPaperAsync');
            }
        }

        return template.innerHTML;
    }

    private async writePrintHtmlFileAsync(pageTitle: string, pageContent: string, isMarkdownNote: boolean): Promise<string> {
        if (isMarkdownNote) {
            pageContent = await this.renderMermaidDiagramsForPaperAsync(pageContent);
        }

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

import { Injectable } from '@angular/core';
import { ContextMenuParams, WebContents } from 'electron';
import { BaseSettings } from '../../core/base-settings';
import { TranslatorService } from '../../services/translator/translator.service';
import * as remote from '@electron/remote';
import { ContextMenuItemsEnabledState } from './context-menu-items-enabled-state';

@Injectable()
export class NoteContextMenuFactory {
    public constructor(private translator: TranslatorService, private settings: BaseSettings) {}

    public async createAsync(
        webContents: WebContents,
        params: ContextMenuParams,
        contextMenuItemsEnabledState: ContextMenuItemsEnabledState,
        cutAction: () => void,
        copyAction: () => void,
        pasteAction: () => void,
        deleteAction: () => void,
    ): Promise<void> {
        const contextMenu = new remote.Menu();

        // Add each spelling suggestion
        if (
            this.settings.enableSpellChecker &&
            params.dictionarySuggestions !== null &&
            params.dictionarySuggestions !== undefined &&
            params.dictionarySuggestions.length > 0
        ) {
            for (const suggestion of params.dictionarySuggestions) {
                contextMenu.append(
                    new remote.MenuItem({
                        label: suggestion,
                        click: () => webContents.replaceMisspelling(suggestion),
                    })
                );
            }

            contextMenu.append(
                new remote.MenuItem({
                    type: 'separator',
                })
            );
        }

        // Add fixed items
        contextMenu.append(
            new remote.MenuItem({
                label: await this.translator.getAsync('ContextMenu.Cut'),
                click: () => cutAction(),
                enabled: contextMenuItemsEnabledState.canCut,
            })
        );

        contextMenu.append(
            new remote.MenuItem({
                label: await this.translator.getAsync('ContextMenu.Copy'),
                click: () => copyAction(),
                enabled: contextMenuItemsEnabledState.canCopy,
            })
        );

        contextMenu.append(
            new remote.MenuItem({
                label: await this.translator.getAsync('ContextMenu.Paste'),
                click: () => pasteAction(),
                enabled: contextMenuItemsEnabledState.canPaste,
            })
        );

        contextMenu.append(
            new remote.MenuItem({
                label: await this.translator.getAsync('ContextMenu.Delete'),
                click: () => deleteAction(),
                enabled: contextMenuItemsEnabledState.canDelete,
            })
        );

        contextMenu.popup();
    }
}

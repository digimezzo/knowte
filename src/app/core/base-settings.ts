export class BaseSettings implements BaseSettings {
    public defaultLanguage: string;
    public language: string;
    public checkForUpdates: boolean;
    public useCustomTitleBar: boolean;
    public fontSize: number;
    public colorScheme: string;
    public closeNotesWithEscape: boolean;
    public fontSizeInNotes: number;
    public showExactDatesInTheNotesList: boolean;
    public storageDirectory: string;
    public activeCollection: string;
    public notebooksPaneWidth: number;
    public moveDeletedNotesToTrash: boolean;
    public useLightHeaderBar: boolean;
}

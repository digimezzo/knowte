export abstract class BaseSettings {
    public abstract defaultLanguage: string;
    public abstract language: string;
    public abstract checkForUpdates: boolean;
    public abstract useCustomTitleBar: boolean;
    public abstract fontSize: number;
    public abstract theme: string;
    public abstract closeNotesWithEscape: boolean;
    public abstract noteZoomPercentage: number;
    public abstract showExactDatesInTheNotesList: boolean;
    public abstract storageDirectory: string;
    public abstract activeCollection: string;
    public abstract notebooksPaneWidth: number;
    public abstract moveDeletedNotesToTrash: boolean;
    public abstract useLightHeaderBar: boolean;
    public abstract enableSpellChecker: boolean;
    public abstract activeSpellCheckLanguages: string;
    public abstract canCreateClassicNotes: boolean;
    public abstract canCreateMarkdownNotes: boolean;
    public abstract followSystemTheme: boolean;
    public abstract useLightBackgroundTheme: boolean;
    public abstract followSystemColor: boolean;
}

import { FontSize } from '../../core/font-size';
import { Theme } from './theme/theme';

export abstract class BaseAppearanceService {
    public abstract windowHasNativeTitleBar: boolean;
    public abstract isUsingLightTheme: boolean;
    public abstract followSystemTheme: boolean;
    public abstract useLightBackgroundTheme: boolean;
    public abstract followSystemColor: boolean;
    public abstract themes: Theme[];
    public abstract selectedTheme: Theme;
    public abstract fontSizes: FontSize[];
    public abstract selectedFontSize: FontSize ;
    public abstract themesDirectoryPath: string;
    public abstract refreshThemes(): void;
    public abstract applyAppearance(): void;
    public abstract startWatchingThemesDirectory(): void;
    public abstract stopWatchingThemesDirectory(): void;
}

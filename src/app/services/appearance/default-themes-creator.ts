import { Injectable } from '@angular/core';
import { Theme } from './theme/theme';
import { ThemeCoreColors } from './theme/theme-core-colors';
import { ThemeCreator } from './theme/theme-creator';
import { ThemeNeutralColors } from './theme/theme-neutral-colors';

@Injectable()
export class DefaultThemesCreator {
    private creator: ThemeCreator = new ThemeCreator('Digimezzo', 'digimezzo@outlook.com');

    public createAllThemes(): Theme[] {
        const themes: Theme[] = [];
        themes.push(this.createKnowteTheme());
        themes.push(this.createLimerenceTheme());

        return themes;
    }

    private createKnowteTheme(): Theme {
        const darkColors: ThemeNeutralColors = new ThemeNeutralColors(
            '#242424', // background
            '#fff', // primaryText
            '#5e5e5e', // secondaryText
            '#404040', // separator
            '#383838', // contextMenuBackground
            '#fff', // contextMenuPrimaryText
            '#6e6e6e', // contextMenuSecondaryText
            '#565656', // contextMenuSeparator
            'rgba(255, 255, 255, 0.03)', // hoverBackground
            'rgba(255, 255, 255, 0.06)', // selectionBackground
            '#999', // sliderBackground
            '#fff', // sliderThumb
            '#fff', // primaryButtonText
            '#454545', // secondaryButtonBackground
            '#fff', // secondaryButtonText
            '#242424', // editorDefaultBackground
            '#2a2a2a', // editorSubtleBackground
            '#444', // editorDefaultBorder
            '#333', // editorSubtleBorder
            '#fff', // editorPrimaryText
            '#5e5e5e' // editorSecondaryText
        );

        const lightColors: ThemeNeutralColors = new ThemeNeutralColors(
            '#242424', // background
            '#fff', // primaryText
            '#5e5e5e', // secondaryText
            '#404040', // separator
            '#383838', // contextMenuBackground
            '#fff', // contextMenuPrimaryText
            '#6e6e6e', // contextMenuSecondaryText
            '#565656', // contextMenuSeparator
            'rgba(255, 255, 255, 0.03)', // hoverBackground
            'rgba(255, 255, 255, 0.06)', // selectionBackground
            '#999', // sliderBackground
            '#fff', // sliderThumb
            '#fff', // primaryButtonText
            '#454545', // secondaryButtonBackground
            '#fff', // secondaryButtonText
            '#242424', // editorDefaultBackground
            '#2a2a2a', // editorSubtleBackground
            '#444', // editorDefaultBorder
            '#333', // editorSubtleBorder
            '#fff', // editorPrimaryText
            '#5e5e5e' // editorSecondaryText
        );

        return new Theme('Knowte', this.creator, new ThemeCoreColors('#6260e3', '#429beb', '#4872e5'), darkColors, lightColors);
    }

    private createLimerenceTheme(): Theme {
        const darkColors: ThemeNeutralColors = new ThemeNeutralColors(
            '#242424', // background
            '#fff', // primaryText
            '#5e5e5e', // secondaryText
            '#404040', // separator
            '#383838', // contextMenuBackground
            '#fff', // contextMenuPrimaryText
            '#6e6e6e', // contextMenuSecondaryText
            '#565656', // contextMenuSeparator
            'rgba(255, 255, 255, 0.03)', // hoverBackground
            'rgba(255, 255, 255, 0.06)', // selectionBackground
            '#999', // sliderBackground
            '#fff', // sliderThumb
            '#fff', // primaryButtonText
            '#454545', // secondaryButtonBackground
            '#fff', // secondaryButtonText
            '#242424', // editorDefaultBackground
            '#2a2a2a', // editorSubtleBackground
            '#444', // editorDefaultBorder
            '#333', // editorSubtleBorder
            '#fff', // editorPrimaryText
            '#5e5e5e' // editorSecondaryText
        );

        const lightColors: ThemeNeutralColors = new ThemeNeutralColors(
            '#242424', // background
            '#fff', // primaryText
            '#5e5e5e', // secondaryText
            '#404040', // separator
            '#383838', // contextMenuBackground
            '#fff', // contextMenuPrimaryText
            '#6e6e6e', // contextMenuSecondaryText
            '#565656', // contextMenuSeparator
            'rgba(255, 255, 255, 0.03)', // hoverBackground
            'rgba(255, 255, 255, 0.06)', // selectionBackground
            '#999', // sliderBackground
            '#fff', // sliderThumb
            '#fff', // primaryButtonText
            '#454545', // secondaryButtonBackground
            '#fff', // secondaryButtonText
            '#242424', // editorDefaultBackground
            '#2a2a2a', // editorSubtleBackground
            '#444', // editorDefaultBorder
            '#333', // editorSubtleBorder
            '#fff', // editorPrimaryText
            '#5e5e5e' // editorSecondaryText
        );

        return new Theme('Limerence', this.creator, new ThemeCoreColors('#fd297b', '#ff655b ', '#ff3c62'), darkColors, lightColors);
    }
}

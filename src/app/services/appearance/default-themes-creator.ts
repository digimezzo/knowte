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

        return themes;
    }

    private createKnowteTheme(): Theme {
        const darkColors: ThemeNeutralColors = new ThemeNeutralColors(
            '#5e5e5e', // windowButtonIcon
            'rgba(255, 255, 255, 0.05)', // hoveredItemBackground
            'rgba(255, 255, 255, 0.1)', // selectedItemBackground
            '#666', // tabText
            '#fff', // selectedTabText
            '#1a1a1a', // mainBackground
            '#111', // headerBackground
            '#171717', // dragImageBackground
            '#363636', // dragImageBorder
            '#fff', // primaryText
            '#5e5e5e', // secondaryText
            '#999', // sliderBackground
            '#fff', // sliderThumbBackground
            '#363636', // paneSeparators
            '#363636', // settingsSeparators
            '#363636', // contextMenuSeparators
            '#4883e0', // scrollBars
            '#111', // dialogBackground
            '#5e5e5e' // commandIcon
        );

        const lightColors: ThemeNeutralColors = new ThemeNeutralColors(
            '#838383', // windowButtonIcon
            'rgba(0, 0, 0, 0.05)', // hoveredItemBackground
            'rgba(0, 0, 0, 0.1)', // selectedItemBackground
            '#909090', // tabText
            '#000', // selectedTabText
            '#f5f5f5', // mainBackground
            '#fdfdfd', // headerBackground
            '#efefef', // dragImageBackground
            '#d7d7d7', // dragImageBorder
            '#000', // primaryText
            '#838383', // secondaryText
            '#666', // sliderBackground
            '#000', // sliderThumbBackground
            '#d7d7d7', // paneSeparators
            '#d7d7d7', // settingsSeparators
            '#d7d7d7', // contextMenuSeparators
            '#4883e0', // scrollBars
            '#fdfdfd', // dialogBackground
            '#838383' // commandIcon
        );

        return new Theme('Knowte', this.creator, new ThemeCoreColors('#6260e3', '#429beb', '#4872e5'), darkColors, lightColors);
    }
}

import {Injectable} from '@angular/core';
import {Theme} from './theme/theme';
import {ThemeCoreColors} from './theme/theme-core-colors';
import {ThemeCreator} from './theme/theme-creator';
import {ThemeNeutralColors} from './theme/theme-neutral-colors';

@Injectable()
export class DefaultThemesCreator {
    private creator: ThemeCreator = new ThemeCreator('Digimezzo', 'digimezzo@outlook.com');

    private darkColors: ThemeNeutralColors = new ThemeNeutralColors(
        '#242424', // background
        '#fff', // primaryText
        '#6e6e6e', // secondaryText
        '#454545', // separator
        '#383838', // contextMenuBackground
        '#fff', // contextMenuPrimaryText
        '#7e7e7e', // contextMenuSecondaryText
        '#565656', // contextMenuSeparator
        'rgba(255, 255, 255, 0.03)', // hoverBackground
        'rgba(255, 255, 255, 0.06)', // selectionBackground
        '#fff', // primaryButtonText
        '#454545', // secondaryButtonBackground
        '#fff', // secondaryButtonText
        '#242424', // editorBackground
        '#3b3b3b', // editorCodeBackground
        '#454545', // editorBorder
        '#fff', // editorPrimaryText
        '#6e6e6e', // editorSecondaryText
        '#454545', // buttonBorder
        '#fff', // highlightForeground
        '#fff', // tooltipText
        '#2e2e2e', // sliderBackground
        '#fff' // sliderThumbBackground
    );

    private lightColors: ThemeNeutralColors = new ThemeNeutralColors(
        '#fafafa', // background
        '#000', // primaryText
        '#888', // secondaryText
        '#ccc', // separator
        '#fff', // contextMenuBackground
        '#000', // contextMenuPrimaryText
        '#888', // contextMenuSecondaryText
        '#ccc', // contextMenuSeparator
        'rgba(0, 0, 0, 0.06)', // hoverBackground
        'rgba(0, 0, 0, 0.10)', // selectionBackground
        '#fff', // primaryButtonText
        '#fff', // secondaryButtonBackground
        '#666', // secondaryButtonText
        '#fafafa', // editorBackground
        '#dedede', // editorCodeBackground
        '#ccc', // editorBorder
        '#000', // editorPrimaryText
        '#888', // editorSecondaryText
        '#ccc', // buttonBorder
        '#fff', // highlightForeground
        '#fff', // tooltipText,
        '#dedede', // sliderBackground
        '#000' // sliderThumbBackground
    );

    public createAllThemes(): Theme[] {
        const themes: Theme[] = [];
        themes.push(this.createKnowteTheme());
        themes.push(this.createSanguineTheme());
        themes.push(this.createPurpleLakeTheme());
        themes.push(this.createBloodyMaryTheme());
        themes.push(this.createQuepalTheme());
        themes.push(this.createAdwaitaTheme());

        return themes;
    }

    private createKnowteTheme(): Theme {
        return new Theme('Knowte', this.creator, new ThemeCoreColors('#6260e3', '#429beb', '#4872e5'), this.darkColors, this.lightColors);
    }

    private createSanguineTheme(): Theme {
        return new Theme('Sanguine', this.creator, new ThemeCoreColors('#dd3455', '#f28e42', '#e9604b'), this.darkColors, this.lightColors);
    }

    private createPurpleLakeTheme(): Theme {
        return new Theme(
            'Purple Lake',
            this.creator,
            new ThemeCoreColors('#8f3b92', '#ed4784', '#b33b8c'),
            this.darkColors,
            this.lightColors
        );
    }

    private createBloodyMaryTheme(): Theme {
        return new Theme(
            'Bloody Mary',
            this.creator,
            new ThemeCoreColors('#df3b7c', '#f05537', '#ef425a'),
            this.darkColors,
            this.lightColors
        );
    }

    private createQuepalTheme(): Theme {
        return new Theme('Quepal', this.creator, new ThemeCoreColors('#00998c', '#38EF7D', '#4ec486'), this.darkColors, this.lightColors);
    }

    private createAdwaitaTheme(): Theme {
        const darkColors: ThemeNeutralColors = new ThemeNeutralColors(
            '#222226', // background
            '#ffffff', // primaryText
            '#99999b', // secondaryText
            '#333337', // separator
            '#36363a', // contextMenuBackground
            '#ffffff', // contextMenuPrimaryText
            '#99999b', // contextMenuSecondaryText
            '#4d4d51', // contextMenuSeparator
            'rgba(255, 255, 255, 0.07)', // hoverBackground
            'rgba(255, 255, 255, 0.10)', // selectionBackground
            '#ffffff', // primaryButtonText
            '#4d4d51', // secondaryButtonBackground
            '#ffffff', // secondaryButtonText
            '#222226', // editorBackground
            '#36363a', // editorCodeBackground
            '#333337', // editorBorder
            '#ffffff', // editorPrimaryText
            '#99999b', // editorSecondaryText
            '#4d4d51', // buttonBorder
            '#ffffff', // highlightForeground
            '#ffffff', // tooltipText
            '#4d4d51', // sliderBackground
            '#ffffff' // sliderThumbBackground
        );

        const lightColors: ThemeNeutralColors = new ThemeNeutralColors(
            '#fafafb', // background
            '#323237', // primaryText
            '#979799', // secondaryText
            '#d2d2d4', // separator
            '#ffffff', // contextMenuBackground
            '#323237', // contextMenuPrimaryText
            '#979799', // contextMenuSecondaryText
            '#d2d2d4', // contextMenuSeparator
            'rgba(46, 52, 54, 0.06)', // hoverBackground
            'rgba(46, 52, 54, 0.10)', // selectionBackground
            '#ffffff', // primaryButtonText
            '#e0e0e1', // secondaryButtonBackground
            '#323237', // secondaryButtonText
            '#fafafb', // editorBackground
            '#dcdcdd', // editorCodeBackground
            '#d2d2d4', // editorBorder
            '#323237', // editorPrimaryText
            '#979799', // editorSecondaryText
            '#e0e0e1', // buttonBorder
            '#ffffff', // highlightForeground
            '#ffffff', // tooltipText
            '#e0e0e1', // sliderBackground
            '#323237' // sliderThumbBackground
        );

        return new Theme('Adwaita', this.creator, new ThemeCoreColors('#3584e4', '#5ca4ff', '#3584e4'), darkColors, lightColors);
    }
}

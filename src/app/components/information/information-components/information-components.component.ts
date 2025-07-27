import { Component, ViewEncapsulation } from '@angular/core';
import {Constants} from "../../../common/application/constants";

@Component({
    selector: 'app-information-components',
    host: { style: 'display: block; width: 100%;' },
    templateUrl: './information-components.component.html',
    styleUrls: ['./information-components.component.scss'],
    encapsulation: ViewEncapsulation.None,
})
export class InformationComponentsComponent {
    public constructor() {}

    public externalComponents: any[] = Constants.externalComponents;
}

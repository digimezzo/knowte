import { Component, OnInit, Input, ViewEncapsulation } from '@angular/core';
import { Constants } from '../../core/constants';
import { ProductDetails } from '../../core/product-details';

@Component({
  selector: 'app-logo-full',
  host: { 'style': 'display: block' },
  templateUrl: './logo-full.component.html',
  styleUrls: ['./logo-full.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class LogoFullComponent implements OnInit {
  constructor(private productDetails: ProductDetails) {
  }

  @Input() public textColor: string;
  public applicationName: string = this.productDetails.name.toUpperCase();

  public ngOnInit(): void {
  }
}

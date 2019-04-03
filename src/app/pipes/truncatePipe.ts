import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'truncate'
})
export class TruncatePipe implements PipeTransform {
  transform(value: string, limit: number, completeWords: boolean, ellipsis = '...') {

    if (!value) {
      return;
    }
    
    if (value.length < limit) {
      return `${value.substr(0, limit)}`;
    }

    if (completeWords) {
      limit = value.substr(0, limit).lastIndexOf(' ');
    }
    return `${value.substr(0, limit)}${ellipsis}`;
  }
}
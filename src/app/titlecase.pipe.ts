import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'titlecase'
})
export class TitlecasePipe implements PipeTransform {
  transform(value: string): string {
    if (!value) return value;
    return value.replace(/\w\S*/g, (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase());
  }
}
 
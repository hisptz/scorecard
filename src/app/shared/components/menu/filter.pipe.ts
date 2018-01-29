import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'filter'
})
export class FilterPipe implements PipeTransform {

  transform(value: any, term: any): any {

    // return all if no term is provided
    if (term === undefined) { return value; }

    return value.filter(function(val) {
      return val.name.toLowerCase().includes(term.toLowerCase()) || val.displayName.toLowerCase().includes(term.toLowerCase());
    });
  }
}

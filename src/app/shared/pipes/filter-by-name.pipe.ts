import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'filterByName'
})
export class FilterByNamePipe implements PipeTransform {

  transform(value: any[], name: any): any {
    if (name !== undefined) {
      // filter users, users which match and return true will be kept, false will be filtered out
      if (value.length !== 0 && name !== null) {
        const splitData = name.split(' ');
        return value.filter((item) => {
          let found = true;
          splitData.forEach((str) => {
            if (item.name.toLowerCase().indexOf(str.toLowerCase()) === -1) {
              found = false;
            }
          });
          return found;
        });
      }

    }
    return value;
  }

}

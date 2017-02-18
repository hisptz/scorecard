import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'filterByName'
})
export class FilterByNamePipe implements PipeTransform {

  transform(value: any[], name: any): any {
    if (name !== undefined) {
      // filter users, users which match and return true will be kept, false will be filtered out
      if(value.length !== 0 && name !== null){
        return value.filter((item) => {
          return (item.name.toLowerCase().indexOf(name.toLowerCase()) !== -1);
        });
      }

    }
    return value;
  }

}

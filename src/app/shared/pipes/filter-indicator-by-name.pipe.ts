import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'filterIndicatorByName'
})
export class FilterIndicatorByNamePipe implements PipeTransform {

  transform(value: any[], name: any): any {
    if (name !== undefined) {
      // filter users, users which match and return true will be kept, false will be filtered out
      if (value.length !== 0 && name !== null){
        return value.filter((item) => {
          let checker = false;
          for ( const indicator of item.indicators ){
            if (indicator.title.toLowerCase().indexOf(name.toLowerCase()) !== -1)
              checker = true;
          }
          return checker;
        });
      }

    }
    return value;
  }

}

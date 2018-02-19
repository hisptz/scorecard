import { Pipe, PipeTransform } from '@angular/core';
import * as _ from 'lodash';

@Pipe({
  name: 'scoreCardFilter'
})
export class ScoreCardFilterPipe implements PipeTransform {

  transform(value: any[], name: any): any {

    if (name !== undefined && value) {
      // filter users, users which match and return true will be kept, false will be filtered out
      if (value.length !== 0 && name !== null) {
        let splitData = name;
        [',', '[', ']', '(', ')', ',', '.', '-', '_'].forEach((char) => {
          splitData = splitData.split(char).join(' ');
        });
        return _.sortBy(value.filter((item) => {
          let found = true;
          splitData.split(' ').forEach((str) => {
            if (item.name.toLowerCase().indexOf(str.toLowerCase()) === -1 && item.description.toLowerCase().indexOf(str.toLowerCase()) === -1) {
              found = false;
            }
          });
          return found;
        }), [(item: any) => item.data.header.title]);
      }

    }
    // if (name !== undefined) {
    //   // filter users, users which match and return true will be kept, false will be filtered out
    //   if (value.length !== 0 && name != null) {
    //     return _.sortBy(value.filter((scorecard) => {
    //       return (scorecard.data.create-header.title.toLowerCase().indexOf(name.toLowerCase()) !== -1);
    //     }), [(item: any) => item.data.create-header.title]);
    //   }
    //
    // }
    return _.sortBy(value, [(item: any) => item.data.header.title]);
  }

}

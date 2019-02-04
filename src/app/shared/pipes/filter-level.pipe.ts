import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'filterLevel',
  pure: false
})
export class FilterLevelPipe implements PipeTransform {

  transform(input: any, orgUnitTree?, selectedOrganisatioUnit?): any {
    const output = [];
    input.forEach((orgUnit) => {
      if (selectedOrganisatioUnit.length > 0) {
        let largest_level = selectedOrganisatioUnit[0].level;
        selectedOrganisatioUnit.forEach( ou => {
          if (ou.level < largest_level) {
            largest_level = ou.level;
          }
        });
        if (largest_level < orgUnit.level) {
          output.push(orgUnit);
        }
      }else {
        if (orgUnit.level > orgUnitTree.level) {
          output.push(orgUnit);
        }
      }
    });
    return output;
  }

}

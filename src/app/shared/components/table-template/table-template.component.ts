import {ChangeDetectionStrategy, Component, Input, OnInit} from '@angular/core';

@Component({
  moduleId: module.id,
  selector: 'app-table-template',
  templateUrl: './table-template.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrls: ['./table-template.component.css']
})
export class TableTemplateComponent implements OnInit {

  @Input() tableObject: any;
  sort_direction: string[] = [];
  current_sorting: boolean[] = [];

  constructor() {
  }

  ngOnInit() {
  }


  sortData(tableObject, n, isLastItem) {
    if (tableObject.columns.length === 1 && isLastItem) {
      this.current_sorting = [];
      this.current_sorting[n] = true;
      let table, rows, switching, i, x, y, shouldSwitch, dir, switchcount = 0;
      table = document.getElementById('myPivotTable');
      switching = true;
      // Set the sorting direction to ascending:
      dir = 'asc';
      /*Make a loop that will continue until
       no switching has been done:*/
      while (switching) {
        // start by saying: no switching is done:
        switching = false;
        rows = table.getElementsByTagName('TR');
        /*Loop through all table rows (except the
         first, which contains table headers):*/
        for (i = 0; i < (rows.length - 1); i++) {
          // start by saying there should be no switching:
          shouldSwitch = false;
          /*Get the two elements you want to compare,
           one from current row and one from the next:*/
          x = rows[i].getElementsByTagName('TD')[n];
          y = rows[i + 1].getElementsByTagName('TD')[n];
          /*check if the two rows should switch place,
           based on the direction, asc or desc:*/
          if (dir === 'asc') {
            if (parseFloat(x.innerHTML)) {
              if (parseFloat(x.innerHTML) > parseFloat(y.innerHTML)) {
                // if so, mark as a switch and break the loop:
                shouldSwitch = true;
                break;
              }
            } else {
              if (x.innerHTML.toLowerCase() > y.innerHTML.toLowerCase()) {
                // if so, mark as a switch and break the loop:
                shouldSwitch = true;
                break;
              }
            }
            this.sort_direction[n] = 'asc';
          } else if (dir === 'desc') {
            if (parseFloat(x.innerHTML)) {
              if (parseFloat(x.innerHTML) < parseFloat(y.innerHTML)) {
                // if so, mark as a switch and break the loop:
                shouldSwitch = true;
                break;
              }
            } else {
              if (x.innerHTML.toLowerCase() < y.innerHTML.toLowerCase()) {
                // if so, mark as a switch and break the loop:
                shouldSwitch = true;
                break;
              }
            }
            this.sort_direction[n] = 'desc';
          }
        }
        if (shouldSwitch) {
          /*If a switch has been marked, make the switch
           and mark that a switch has been done:*/
          rows[i].parentNode.insertBefore(rows[i + 1], rows[i]);
          switching = true;
          // Each time a switch is done, increase this count by 1:
          switchcount++;
        } else {
          /*If no switching has been done AND the direction is 'asc',
           set the direction to 'desc' and run the while loop again.*/
          if (switchcount === 0 && dir === 'asc') {
            dir = 'desc';
            this.sort_direction[n] = 'desc';
            switching = true;
          }
        }
      }
    }

  }

}

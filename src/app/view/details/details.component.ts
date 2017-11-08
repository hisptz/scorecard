import {Component, Input, OnInit} from '@angular/core';

@Component({
  selector: 'app-details',
  templateUrl: './details.component.html',
  styleUrls: ['./details.component.css']
})
export class DetailsComponent implements OnInit {

  @Input() orgUnitModel: any = null;
  @Input() selectedPeriod: any = null;
  @Input() periodType: any = null;
  @Input() year: any = null;
  @Input() selectedOrganisationUnit: any = null;
  @Input() analytics: any = null;
  @Input() chartObject: any = null;
  @Input() tableObject: any = null;
  @Input() mapObjet: any = null;
  @Input() loading: any = true;

  constructor() { }

  ngOnInit() {
  }

}

import {ChangeDetectionStrategy, Component, Input, OnInit} from '@angular/core';

@Component({
  selector: 'app-scorecard-header',
  templateUrl: './header.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrls: ['./header.component.css']
})
export class ScorecardHearderComponent implements OnInit {

  @Input() legendset_definitions: any = [];
  @Input() show_legend_definition: any = [];
  @Input() template_content: any = '';
  @Input() scorecard_title: any = '';
  @Input() organisation_unit_title: any = '';
  @Input() period_title: any = '';
  @Input() has_error: boolean = false;
  @Input() has_bottleneck: boolean = false;

  constructor() { }

  ngOnInit() {
  }

}

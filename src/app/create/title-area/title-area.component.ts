import {ChangeDetectionStrategy, Component, OnInit, Input} from '@angular/core';

@Component({
  selector: 'app-title-area',
  templateUrl: './title-area.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrls: ['./title-area.component.css']
})
export class TitleAreaComponent implements OnInit {

  @Input() template: any = '';
  @Input() show_legend_definition: boolean = false;
  @Input() legendset_definitions: any = null;
  constructor() { }

  ngOnInit() {
  }

  showTextEditor() {

  }


}

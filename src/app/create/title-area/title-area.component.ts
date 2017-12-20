import {ChangeDetectionStrategy, Component, OnInit, Input} from '@angular/core';
import {ApplicationState} from '../../store/reducers';
import {Store} from '@ngrx/store';
import {SetEdditingHeader} from '../../store/actions/create.actions';

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
  constructor(
    private store: Store<ApplicationState>
  ) { }

  ngOnInit() {
  }

  showTextEditor() {
    this.store.dispatch(new SetEdditingHeader(true));
  }


}

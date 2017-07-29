import { Component, OnInit } from '@angular/core';
import {Store} from '@ngrx/store';
import {ApplicationState} from '../store/application.state';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {

  constructor(private store: Store<ApplicationState>) {
    store.select(state => state.uiState).subscribe(uiState => console.log(uiState));
  }

  ngOnInit() {
  }

}

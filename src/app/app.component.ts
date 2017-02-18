import { Component } from '@angular/core';
import {Constants} from "./shared/costants";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  application_url: string;

  constructor(private constant: Constants) {
    this.application_url = constant.root_dir;
  }
}

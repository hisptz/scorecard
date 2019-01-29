import { Component, OnInit } from '@angular/core';
import {TranslateService} from '@ngx-translate/core';

@Component({
  selector: 'app-documentation',
  templateUrl: './documentation.component.html',
  styleUrls: ['./documentation.component.css']
})
export class DocumentationComponent implements OnInit {

  constructor(
    private translate: TranslateService) { }

  ngOnInit() {
  }
  switchLanguage(language: string) {
    this.translate.use(language);
  }

}

import {ChangeDetectionStrategy, Component, EventEmitter, OnInit, Output} from '@angular/core';
import {TranslateService} from "@ngx-translate/core";

@Component({
  selector: 'app-view-header',
  templateUrl: './header.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit {

  @Output() onGoHomePage = new EventEmitter();
  @Output() onTourStart = new EventEmitter();
  show_more: boolean = false;
  constructor(private translate: TranslateService) { }

  ngOnInit() {
  }

  goToHomePage() {
    this.onGoHomePage.emit();
  }

  startTour() {
    this.onTourStart.emit();
  }

  switchLanguage(language: string) {
    this.translate.use(language);
  }

}

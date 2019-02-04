import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { LoadingNotificationComponent } from './loading-notification.component';

describe('LoadingNotificationComponent', () => {
  let component: LoadingNotificationComponent;
  let fixture: ComponentFixture<LoadingNotificationComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ LoadingNotificationComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LoadingNotificationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

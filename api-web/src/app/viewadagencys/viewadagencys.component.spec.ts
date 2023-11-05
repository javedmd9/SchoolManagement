import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewadagencysComponent } from './viewadagencys.component';

describe('ViewadagencysComponent', () => {
  let component: ViewadagencysComponent;
  let fixture: ComponentFixture<ViewadagencysComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ViewadagencysComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ViewadagencysComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

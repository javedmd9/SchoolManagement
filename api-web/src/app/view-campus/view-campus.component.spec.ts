import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewCampusComponent } from './view-campus.component';

describe('ViewCampusComponent', () => {
  let component: ViewCampusComponent;
  let fixture: ComponentFixture<ViewCampusComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ViewCampusComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ViewCampusComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

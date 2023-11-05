import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ManageadagencyComponent } from './manageadagency.component';

describe('ManageadagencyComponent', () => {
  let component: ManageadagencyComponent;
  let fixture: ComponentFixture<ManageadagencyComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ManageadagencyComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ManageadagencyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

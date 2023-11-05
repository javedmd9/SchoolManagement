import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AssignSubjectComponent } from './assign-subject.component';

describe('AssignSubjectComponent', () => {
  let component: AssignSubjectComponent;
  let fixture: ComponentFixture<AssignSubjectComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AssignSubjectComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AssignSubjectComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateCampusComponent } from './create-campus.component';

describe('CreateCampusComponent', () => {
  let component: CreateCampusComponent;
  let fixture: ComponentFixture<CreateCampusComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CreateCampusComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CreateCampusComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

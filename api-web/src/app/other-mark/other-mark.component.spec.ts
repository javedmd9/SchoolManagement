import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OtherMarkComponent } from './other-mark.component';

describe('OtherMarkComponent', () => {
  let component: OtherMarkComponent;
  let fixture: ComponentFixture<OtherMarkComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ OtherMarkComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(OtherMarkComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

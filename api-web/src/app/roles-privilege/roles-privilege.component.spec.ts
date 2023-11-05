import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RolesPrivilegeComponent } from './roles-privilege.component';

describe('RolesPrivilegeComponent', () => {
  let component: RolesPrivilegeComponent;
  let fixture: ComponentFixture<RolesPrivilegeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ RolesPrivilegeComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(RolesPrivilegeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

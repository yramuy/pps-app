import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UserRolesAddComponent } from './user-roles-add.component';

describe('UserRolesAddComponent', () => {
  let component: UserRolesAddComponent;
  let fixture: ComponentFixture<UserRolesAddComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [UserRolesAddComponent]
    });
    fixture = TestBed.createComponent(UserRolesAddComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

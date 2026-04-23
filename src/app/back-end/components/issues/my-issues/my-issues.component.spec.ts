import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MyIssuesComponent } from './my-issues.component';

describe('MyIssuesComponent', () => {
  let component: MyIssuesComponent;
  let fixture: ComponentFixture<MyIssuesComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [MyIssuesComponent]
    });
    fixture = TestBed.createComponent(MyIssuesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

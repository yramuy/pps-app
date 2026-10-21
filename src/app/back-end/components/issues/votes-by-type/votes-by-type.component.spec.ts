import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VotesByTypeComponent } from './votes-by-type.component';

describe('VotesByTypeComponent', () => {
  let component: VotesByTypeComponent;
  let fixture: ComponentFixture<VotesByTypeComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [VotesByTypeComponent]
    });
    fixture = TestBed.createComponent(VotesByTypeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

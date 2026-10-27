import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VotesByMeComponent } from './votes-by-me.component';

describe('VotesByMeComponent', () => {
  let component: VotesByMeComponent;
  let fixture: ComponentFixture<VotesByMeComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [VotesByMeComponent]
    });
    fixture = TestBed.createComponent(VotesByMeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

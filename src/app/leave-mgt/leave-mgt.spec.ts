import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LeaveMgtComponent } from './leave-mgt.component';

describe('LeaveMgt', () => {
  let component: LeaveMgtComponent;
  let fixture: ComponentFixture<LeaveMgtComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LeaveMgtComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LeaveMgtComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

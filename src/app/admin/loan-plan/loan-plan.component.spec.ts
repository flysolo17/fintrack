import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LoanPlanComponent } from './loan-plan.component';

describe('LoanPlanComponent', () => {
  let component: LoanPlanComponent;
  let fixture: ComponentFixture<LoanPlanComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [LoanPlanComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(LoanPlanComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

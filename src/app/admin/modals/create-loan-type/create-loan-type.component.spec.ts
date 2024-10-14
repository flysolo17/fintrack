import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateLoanTypeComponent } from './create-loan-type.component';

describe('CreateLoanTypeComponent', () => {
  let component: CreateLoanTypeComponent;
  let fixture: ComponentFixture<CreateLoanTypeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [CreateLoanTypeComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(CreateLoanTypeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

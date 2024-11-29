import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateBorrowerComponent } from './create-borrower.component';

describe('CreateBorrowerComponent', () => {
  let component: CreateBorrowerComponent;
  let fixture: ComponentFixture<CreateBorrowerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [CreateBorrowerComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(CreateBorrowerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

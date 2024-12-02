import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BorrowerHomeComponent } from './borrower-home.component';

describe('BorrowerHomeComponent', () => {
  let component: BorrowerHomeComponent;
  let fixture: ComponentFixture<BorrowerHomeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [BorrowerHomeComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(BorrowerHomeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

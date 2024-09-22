import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BorrowerMainComponent } from './borrower-main.component';

describe('BorrowerMainComponent', () => {
  let component: BorrowerMainComponent;
  let fixture: ComponentFixture<BorrowerMainComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [BorrowerMainComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(BorrowerMainComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

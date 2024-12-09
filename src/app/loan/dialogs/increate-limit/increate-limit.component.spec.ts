import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IncreateLimitComponent } from './increate-limit.component';

describe('IncreateLimitComponent', () => {
  let component: IncreateLimitComponent;
  let fixture: ComponentFixture<IncreateLimitComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [IncreateLimitComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(IncreateLimitComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

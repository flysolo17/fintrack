import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CollectorPerformanceComponent } from './collector-performance.component';

describe('CollectorPerformanceComponent', () => {
  let component: CollectorPerformanceComponent;
  let fixture: ComponentFixture<CollectorPerformanceComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [CollectorPerformanceComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(CollectorPerformanceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

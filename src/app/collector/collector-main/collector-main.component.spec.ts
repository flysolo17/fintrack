import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CollectorMainComponent } from './collector-main.component';

describe('CollectorMainComponent', () => {
  let component: CollectorMainComponent;
  let fixture: ComponentFixture<CollectorMainComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [CollectorMainComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(CollectorMainComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

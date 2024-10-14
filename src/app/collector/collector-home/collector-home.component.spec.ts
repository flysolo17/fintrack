import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CollectorHomeComponent } from './collector-home.component';

describe('CollectorHomeComponent', () => {
  let component: CollectorHomeComponent;
  let fixture: ComponentFixture<CollectorHomeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [CollectorHomeComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(CollectorHomeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

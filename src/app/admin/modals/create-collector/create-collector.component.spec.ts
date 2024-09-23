import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateCollectorComponent } from './create-collector.component';

describe('CreateCollectorComponent', () => {
  let component: CreateCollectorComponent;
  let fixture: ComponentFixture<CreateCollectorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [CreateCollectorComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(CreateCollectorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

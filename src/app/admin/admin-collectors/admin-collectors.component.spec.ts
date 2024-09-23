import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminCollectorsComponent } from './admin-collectors.component';

describe('AdminCollectorsComponent', () => {
  let component: AdminCollectorsComponent;
  let fixture: ComponentFixture<AdminCollectorsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [AdminCollectorsComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(AdminCollectorsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

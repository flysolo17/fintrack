import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProfileBorrowerComponent } from './profile-borrower.component';

describe('ProfileBorrowerComponent', () => {
  let component: ProfileBorrowerComponent;
  let fixture: ComponentFixture<ProfileBorrowerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ProfileBorrowerComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ProfileBorrowerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-profile-admin',
  templateUrl: './profile-admin.component.html',
  styleUrls: ['./profile-admin.component.css'],
})
export class ProfileAdminComponent implements OnInit {
  admin = {
    id: 1,
    name: 'John Doe',
    role: 'Manager',
    contact: '123-456-7890',
  };

  profilePicture: string | ArrayBuffer | null = null; // For the selected image preview
  defaultPicture = 'assets/default-profile.png'; // Default image if no picture is uploaded

  constructor() {}

  ngOnInit(): void {}

  updateProfile(): void {
    console.log('Updated Profile:', this.admin);
    alert('Profile updated successfully!');
  }

  cancelEdit(): void {
    console.log('Edit canceled');
  }

  onPictureSelected(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        this.profilePicture = reader.result; // Preview the image
      };
      reader.readAsDataURL(file);
    }
  }
}

import {
  Component,
  ElementRef,
  EventEmitter,
  Input,
  Output,
  ViewChild,
} from '@angular/core';

@Component({
  selector: 'app-image-picker',

  templateUrl: './image-picker.component.html',
  styleUrl: './image-picker.component.css',
})
export class ImagePickerComponent {
  @Input() selectedImage: string | ArrayBuffer | null = null;
  @Output() onSelected = new EventEmitter<File>();
  @ViewChild('fileInput') fileInput!: ElementRef;
  isDragging = false;
  onDragOver(event: DragEvent) {
    event.preventDefault();
  }
  onClick() {
    this.fileInput.nativeElement.click();
  }

  onDragLeave(event: DragEvent) {
    event.preventDefault();
    this.isDragging = false;
  }
  onDrop(event: DragEvent) {
    event.preventDefault();
    const files = event.dataTransfer?.files;
    if (files && files.length > 0) {
      this.readFile(files[0]);
      this.onSelected.emit(files[0]);
    }
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.readFile(input.files[0]);
      this.onSelected.emit(input.files[0]);
    }
  }

  private readFile(file: File) {
    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result) {
        this.selectedImage = e.target.result;
      }
    };
    reader.readAsDataURL(file);
  }
}

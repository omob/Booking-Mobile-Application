import { Component, EventEmitter, OnInit, Output, ViewChild, ElementRef, Input } from '@angular/core';
import { CameraResultType, CameraSource, Capacitor, Plugins } from '@capacitor/core';
import { AlertController, Platform } from '@ionic/angular';

@Component({
  selector: 'app-image-picker',
  templateUrl: './image-picker.component.html',
  styleUrls: ['./image-picker.component.scss'],
})
export class ImagePickerComponent implements OnInit {

  @Output() imagePick = new EventEmitter<string | File>();
  @ViewChild('filePicker') filePicker: ElementRef<HTMLInputElement>;
  @Input() showPreview = false;

  selectedImage: string;
  usePicker = false;

  constructor(
    private platform: Platform,
    private alertCtrl: AlertController) { }

  ngOnInit() {
    if (
      (this.platform.is('mobile') && !this.platform.is('hybrid')) ||
      this.platform.is('desktop')
    ) {
      this.usePicker = true;
    }
  }

  async onPickImage() {
    if (!Capacitor.isPluginAvailable('Camera')) {
      this.filePicker.nativeElement.click();
      return;
    }

    // to-do.... add action sheet to make user select between camera and file chooser

    try {
      const image = await Plugins.Camera.getPhoto({
          quality: 50,
          source: CameraSource.Prompt,
          correctOrientation: true,
          height: 320,
          width: 200,
          resultType: CameraResultType.DataUrl
        });

      this.selectedImage = image.dataUrl;
      this.imagePick.emit(image.dataUrl);

    } catch (e) {
      if (this.usePicker) {
        this.filePicker.nativeElement.click();
      }
    }

  }

  onFileChosen(event: Event) {
    const pickedFile = (event.target as HTMLInputElement).files[0];

    if (!pickedFile) {
      this.selectedImage = null;
      this.imagePick.emit(null);
      return;
    }

    const fileReader = new FileReader();
    fileReader.onload = () => {
      const dataUrl = fileReader.result.toString();
      this.selectedImage = dataUrl;

      this.imagePick.emit(pickedFile);
    };
    fileReader.readAsDataURL(pickedFile);
  }
}

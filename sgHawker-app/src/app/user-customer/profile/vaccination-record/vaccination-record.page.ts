import { SessionService } from './../../../services/session.service';
import { UserService } from 'src/app/services/user.service';
import { AlertController } from '@ionic/angular';
import { Component, OnInit } from '@angular/core';
import { User } from 'src/app/models/user';

@Component({
  selector: 'app-vaccination-record',
  templateUrl: './vaccination-record.page.html',
  styleUrls: ['./vaccination-record.page.scss'],
})
export class VaccinationRecordPage implements OnInit {

  file: any;
  imagePath: any;
  imgURL: any;
  previewPic: boolean;
  user: User;

  constructor(
    private alertController: AlertController,
    private userService: UserService,
    private sessionService: SessionService
  ) { }

  ngOnInit() {
    this.user = this.sessionService.getCurrentUser();
  }

  preview(files) {
    if (files.length === 0) {
      return;
    }

    const mimeType = files[0].type;
    if (mimeType.match(/image\/*/) == null) {
      return this.alertController.create({
        cssClass: '',
        header: 'Only images are supported!',
        buttons: [
          {
            text: 'Dismiss',
            role: 'cancel',
          }
        ]
      }).then(x => x.present());
    }

    const reader = new FileReader();
    this.imagePath = files;
    this.file = files[0];
    reader.readAsDataURL(files[0]);
    reader.onload = (_event) => {
      this.imgURL = reader.result;
    };
    this.previewPic = true;
  }

  removeImage() {
    this.imgURL = undefined;
    this.imagePath = undefined;
    this.file = undefined;
    this.previewPic = false;
  }

  upload() {
    this.userService.uploadVaccinationCert(this.sessionService.getCurrentUser().email, this.file).subscribe(
      success => {
        this.alertController.create({
          header: 'Upload success',
          message: `
          <p>Please wait as the administrator to review and approve your certificate.</p>
          <br/>
          <b>Please refrain from uploading multiple images as it will slow down the verification process</b>
          `,
          buttons: [
            {
              role: 'cancel',
              text: 'Okay'
            }
          ]
        })
          .then(x => x.present());
        this.removeImage();
      },
      error => {
        this.alertController.create({
          header: 'Upload failed',
          message: 'Please try again later',
          buttons: [
            {
              role: 'cancel',
              text: 'Okay'
            }
          ]
        })
          .then(x => x.present());
      });
  }
}

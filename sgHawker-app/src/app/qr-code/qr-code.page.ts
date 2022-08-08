import {
  AfterViewInit,
  Component,
  ElementRef,
  OnInit,
  ViewChild,
} from '@angular/core';
import { Router } from '@angular/router';
import {
  AlertController,
  IonBackButtonDelegate,
  LoadingController,
  ToastController,
} from '@ionic/angular';
import jsQR from 'jsqr';
import { HawkerCenter } from '../models/submodels/hawkerCenter';
import { OutletService } from '../services/outlet.service';
import { SessionService } from '../services/session.service';
import { Location } from '@angular/common';

interface ItemDisplay {
  mainTitle: string;
  secondaryTitle?: string;
  navigationUrl: string;
  imgSrc: string;
}
@Component({
  selector: 'app-qr-code',
  templateUrl: './qr-code.page.html',
  styleUrls: ['./qr-code.page.scss'],
})
export class QrCodePage implements OnInit, AfterViewInit {
  @ViewChild('video', { static: false }) video: ElementRef;
  @ViewChild('canvas', { static: false }) canvas: ElementRef;
  @ViewChild(IonBackButtonDelegate, { static: false })
  backButton: IonBackButtonDelegate;

  videoElement: any;
  canvasElement: any;
  canvasContext: any;
  scanActive = false;
  scanResult = null;
  loading: HTMLIonLoadingElement = null;
  allHawkerCentres: HawkerCenter[];
  currentHawkerCentre: HawkerCenter;
  errorPresent: boolean;
  currentItemDisplay: ItemDisplay;

  constructor(
    private toastController: ToastController,
    private loadingController: LoadingController,
    private outletService: OutletService,
    private sessionService: SessionService,
    private router: Router,
    private alertController: AlertController,
    private location: Location
  ) { }

  ngAfterViewInit() {
    this.videoElement = this.video.nativeElement;
    this.canvasElement = this.canvas.nativeElement;
    this.canvasContext = this.canvasElement.getContext('2d');
    if (this.backButton) {
      this.setBackButtonAction();
    }
  }

  ngOnInit() {
    this.outletService.findAllHawkerCenters().subscribe((hc) => {
      this.allHawkerCentres = hc;
    });
  }

  async startScan() {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: 'environment' },
    });
    this.videoElement.srcObject = stream;
    this.videoElement.setAttribute('playsinline', true);
    this.loading = await this.loadingController.create({});
    await this.loading.present();
    this.videoElement.play();
    requestAnimationFrame(this.scanQR.bind(this));
  }

  stopScan() {
    this.scanActive = false;
    this.videoElement.pause();
    if (this.videoElement.srcObject) {
      this.videoElement.srcObject.getTracks()[0].stop();
    }
  }

  async scanQR() {
    if (this.videoElement.readyState === this.videoElement.HAVE_ENOUGH_DATA) {
      if (this.loading) {
        await this.loading.dismiss();
        this.loading = null;
        this.scanActive = true;
      }
      this.canvasElement.height = this.videoElement.videoHeight;
      this.canvasElement.width = this.videoElement.videoWidth;

      this.canvasContext.drawImage(
        this.videoElement,
        0,
        0,
        this.canvasElement.width,
        this.canvasElement.height
      );

      const imageData = this.canvasContext.getImageData(
        0,
        0,
        this.canvasElement.width,
        this.canvasElement.height
      );
      const qrcode = jsQR(imageData.data, imageData.width, imageData.height, {
        inversionAttempts: 'dontInvert',
      });
      if (qrcode) {
        this.errorPresent = false;
        this.scanActive = false;
        this.scanResult = qrcode.data;

        const currentHawkerCentre = this.allHawkerCentres.find(
          (hc) => hc.hawkerCenterName === this.scanResult
        );
        if (currentHawkerCentre) {
          this.currentItemDisplay = {
            mainTitle: currentHawkerCentre.hawkerCenterName,
            secondaryTitle: currentHawkerCentre.hawkerCentreAddress,
            navigationUrl:
              '/customer/home/' + currentHawkerCentre.hawkerCenterName,
            imgSrc:
              'https://avatars.dicebear.com/api/initials/' +
              currentHawkerCentre.hawkerCenterName +
              '.svg',
          };
          this.sessionService.setIsGuestHawkerCenter(true);
        } else {
          this.outletService.getOutletDetails(this.scanResult).subscribe(
            (outlet) => {
              this.currentItemDisplay = {
                mainTitle: outlet.outletName,
                secondaryTitle: outlet.hawkerCentreName,
                navigationUrl: '/customer/home/hawkerOutlets/' + outlet._id,
                imgSrc: '/api/' + outlet.hawkerAccount.profileImgSrc,
              };
            },
            (err) => {
              this.errorPresent = true;
              this.presentAlert();
            }
          );
          this.sessionService.setIsGuestHawkerCenter(false);
        }
      } else {
        if (this.scanActive) {
          requestAnimationFrame(this.scanQR.bind(this));
        }
      }
    } else {
      requestAnimationFrame(this.scanQR.bind(this));
    }
  }

  reset() {
    this.scanResult = null;
  }

  navigateToPage(url) {
    this.sessionService.setIsLogin(true);
    if (!this.sessionService.getCurrentUser()) {
      this.sessionService.setIsGuest(true);
    }
    this.router.navigate([url]);
    this.videoElement.pause();
    this.videoElement.srcObject.getTracks()[0].stop();
  }

  // async showQRToast() {
  //   const toast = await this.toastController.create({
  //     message: 'Open ' + this.scanResult + '?',
  //     position: 'bottom',
  //     buttons: [
  //       {
  //         text: 'Open',
  //         handler: () => {
  //           window.open(this.scanResult, '_system', 'location=yes');
  //         },
  //       },
  //     ],
  //   });
  //   toast.present();
  // }

  async presentAlert() {
    const alert = await this.alertController.create({
      header: 'Invalid QR code',
      message: 'Please scan a proper sgHawker\'s QR Code.',
      buttons: [
        {
          text: 'Scan again',
          handler: () => {
            this.scanResult = null;
            this.startScan();
          },
        },
      ],
    });

    await alert.present();
  }

  setBackButtonAction() {
    this.backButton.onClick = () => {
      this.location.back();
    };
  }
}

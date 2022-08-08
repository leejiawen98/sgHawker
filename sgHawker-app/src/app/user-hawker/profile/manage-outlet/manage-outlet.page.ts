import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute, NavigationExtras } from '@angular/router';
import { OutletService } from '../../../services/outlet.service';
import { ModalController, PopoverController } from '@ionic/angular';
import { ViewOutletQrPage } from './view-outlet-qr/view-outlet-qr.page';
import { SessionService } from '../../../services/session.service';
import { PopoverComponentComponent } from '../../../shared/popover-component/popover-component.component';
import { Outlet } from 'src/app/models/outlet';


@Component({
  selector: 'app-manage-outlet',
  templateUrl: './manage-outlet.page.html',
  styleUrls: ['./manage-outlet.page.scss'],
})
export class ManageOutletPage implements OnInit {

  id: string;
  outlets: any[] = [];
  outlet: Outlet;
  automaticClose = false;

  constructor(
    public router: Router,
    public route: ActivatedRoute,
    private outletService: OutletService,
    public modalCtrl: ModalController,
    private sessionService: SessionService,
    private popoverController: PopoverController
  ) {}

  ngOnInit() {
    // this.id = this.route.snapshot.paramMap.get('id');
    this.id = this.sessionService.getCurrentUser()._id;
    this.outlet = this.sessionService.getCurrentOutlet();
  }

  ionViewWillEnter() {
    this.outlet = this.sessionService.getCurrentOutlet();
    if (this.outlet.isMaster) {
      this.getHawkerOutlets();
    } else {
      this.outlets[0] = this.outlet;
    }
  }

  getHawkerOutlets() {
    this.outletService
      .getHawkerOutlets(this.id)
      .subscribe(res => {
        this.outlets = res;
        this.outlets[0].open = false;
      });
  }

  editOutlet(outletId) {
    const navigationExtras: NavigationExtras = {
      queryParams: {
        hawkerId: this.id
      }
    };
    this.router.navigate(['hawker/profile/manage-outlet/edit-outlet-details/' + outletId], navigationExtras);
  }

  async presentViewQRModal(outletId) {
    const modal = await this.modalCtrl.create({
      component: ViewOutletQrPage,
      cssClass: 'view-outlet-modal-css',
      componentProps: {
        item: outletId
      },
      showBackdrop: true,
      backdropDismiss: false
    });
    modal.onDidDismiss()
      .then((data) => {
      });
    return await modal.present();
  }
}


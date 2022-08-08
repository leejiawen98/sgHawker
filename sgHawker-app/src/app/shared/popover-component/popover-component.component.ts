import { Component, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { PopoverController } from '@ionic/angular';
import { Outlet } from 'src/app/models/outlet';
import { User } from 'src/app/models/user';
import { SessionService } from 'src/app/services/session.service';

@Component({
  selector: 'app-popover-component',
  templateUrl: './popover-component.component.html',
  styleUrls: ['./popover-component.component.scss'],
})
export class PopoverComponentComponent implements OnInit {
  @Input() items: {
    label: string;
    eventHandler: () => void;
    type?: 'ADD' | 'MANAGE' | 'FOOD' | 'SET' | 'CARD' | 'BANK' | 'SYNC-MENU' | 'STOP' | 'FAVOURITE' | 'QRCODE';
  }[];

  hawker: User;
  outlet: Outlet;

  constructor(
    private router: Router,
    private popoverController: PopoverController,
    private sessionService: SessionService
  ) { }

  ngOnInit() {
    this.hawker = this.sessionService.getCurrentUser();
    this.outlet = this.sessionService.getCurrentOutlet();
  }

  dismissModalCtrller() {
    this.popoverController.dismiss({});
  }
  navigateToAddMenuPage = (i) => {
    this.items[i].eventHandler();
    this.dismissModalCtrller();
  };

  dismiss() {
    this.popoverController.dismiss();
  }
}

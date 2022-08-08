/* eslint-disable no-underscore-dangle */
import { ThisReceiver } from '@angular/compiler';
import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AlertController, ModalController, PickerController, PickerOptions, ToastController } from '@ionic/angular';
import { AccountTypeEnum } from 'src/app/models/enums/account-type-enum.enum';
import { ComplaintCategoryEnum } from 'src/app/models/enums/complaint-category-enum';
import { OrderTypeEnum } from 'src/app/models/enums/order-type-enum.enum';
import { ReportTypeEnum } from 'src/app/models/enums/report-type-enum';
import { Order } from 'src/app/models/order';
import { Outlet } from 'src/app/models/outlet';
import { User } from 'src/app/models/user';
import { OrderService } from 'src/app/services/order.service';
import { ReportService } from 'src/app/services/report.service';
import { SessionService } from 'src/app/services/session.service';
import { UserAddressPageModule } from 'src/app/user-customer/profile/user-address/user-address.module';

@Component({
  selector: 'app-create-report-modal',
  templateUrl: './create-report-modal.component.html',
  styleUrls: ['./create-report-modal.component.scss'],
})
export class CreateReportModalComponent implements OnInit {

  @Input() order: Order;
  @Input() accountType: AccountTypeEnum;
  @Input() reportCustomer: boolean;
  // @Input() numberOfDaysAfterOrder: number;

  user: User;
  outlet: Outlet;
  listOfDeliverers: Map<string, any[]>;
  listOfCustomers: Map<string, any[]>;
  delivererDetails = [];
  customerDetails = [];
  orderDetails = [];

  selectedOption: string;
  selectedUserId: string;
  selectedOrderId: string;

  allComplaintCategories = [];
  selectedComplaintCategory: ComplaintCategoryEnum;

  reportForm: FormGroup;
  formValid: boolean;

  imagePath: any;
  file: any;
  imgURL: any;
  previewPic: boolean;

  constructor(
    private modalController: ModalController,
    private pickerController: PickerController,
    private alertController: AlertController,
    private toastController: ToastController,
    private formBuilder: FormBuilder,
    private reportService: ReportService,
    private sessionService: SessionService,
    private orderService: OrderService,
  ) { }

  ngOnInit() {
    this.initCategories();
    this.formValid = true;
    this.reportForm = this.formBuilder.group({
      category: ['', [Validators.required]],
      description: ['', [Validators.required]],
    });
    if (this.accountType === AccountTypeEnum.CUSTOMER) {
      this.user = this.sessionService.getCurrentUser();
      if (this.reportCustomer) {
        this.orderService.findAllAssociatedOrders(this.user._id).subscribe(orders => {
          if (orders.length <= 0) {
            this.alertController.create({
              cssClass: '',
              header: 'You are unable to report any users.',
              buttons: [
                {
                  text: 'Go Back',
                  handler: () => {
                    this.closeModal();
                  }
                }
              ]
            }).then(x => x.present());
          } else {
            this.listOfCustomers = new Map();
            this.listOfDeliverers = new Map();
            orders.forEach(order => {
              //current user is a customer, wants to find list of deliverers
              if (order.deliverer && order.customer._id === this.user._id) {
                if (this.listOfDeliverers.has(order.deliverer._id)) {
                  this.listOfDeliverers.get(order.deliverer._id).push({
                    text: '#' + order._id.substring(order._id.length - 5),
                    value: order._id
                  });
                } else {
                  const arr = [];
                  arr.push({
                    text: '#' + order._id.substring(order._id.length - 5),
                    value: order._id
                  });
                  this.listOfDeliverers.set(order.deliverer._id, []);
                  this.delivererDetails.push({
                    text: order.deliverer.name,
                    value: order.deliverer._id
                  });
                }
                //current user is a deliverer, wants to find list of customers
              } else if (order.deliverer && order.deliverer._id === this.user._id) {
                if (order.deliverer._id === this.user._id) {
                  if (this.listOfCustomers.has(order.customer._id)) {
                    this.listOfCustomers.get(order.customer._id).push({
                      text: '#' + order._id.substring(order._id.length - 5),
                      value: order._id
                    });
                  } else {
                    const arr = [];
                    arr.push({
                      text: '#' + order._id.substring(order._id.length - 5),
                      value: order._id
                    });
                    this.listOfCustomers.set(order.customer._id, arr);
                    this.customerDetails.push({
                      text: order.customer.name,
                      value: order.customer._id
                    });
                  }
                }
              }
            });
          }
        });
      }
    } else {
      this.outlet = this.sessionService.getCurrentOutlet();
    }
  }

  getTotalOrderItems(): number {
    const foodBundleItems = this.order.foodBundleOrderItems ? this.order.foodBundleOrderItems.length : 0;
    const indiOrderItems = this.order.individualOrderItems ? this.order.individualOrderItems.length : 0;
    return foodBundleItems + indiOrderItems;
  }

  closeModal() {
    this.modalController.dismiss();
  }

  updateSelectedOption(event) {
    this.selectedOption = event.detail.value;
  }

  async showCategoryPicker() {
    const options: PickerOptions = {
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel'
        },
        {
          text: 'Confirm',
          handler: (value) => {
            this.reportForm.get('category').setValue(value.category.value);
          }
        }
      ],
      columns: [{
        name: 'category',
        options: this.allComplaintCategories,
        selectedIndex: this.retrieveCategoryIndex(),
      }]
    };

    const picker = await this.pickerController.create(options);
    picker.present();

    //just to fix some issues with the picker
    picker.onDidDismiss().then(async data => {
      const category = await picker.getColumn('category');
      category.options.forEach(element => {
        delete element.selected;
        delete element.duration;
        delete element.transform;
      });
    });
  }

  async showUsersPicker() {
    if (!this.selectedOption) {
      this.alertController.create({
        cssClass: '',
        header: 'Select the type of users you want to report.',
        buttons: [
          {
            text: 'Dismiss',
            role: 'cancel',
          }
        ]
      }).then(x => x.present());
    } else {
      let users = [];
      if (this.selectedOption === 'deliverer') {
        users = this.delivererDetails;
      } else if (this.selectedOption === 'customer') {
        users = this.customerDetails;
      }

      const options: PickerOptions = {
        buttons: [
          {
            text: 'Cancel',
            role: 'cancel'
          },
          {
            text: 'Confirm',
            handler: (value) => {
              this.selectedUserId = value.userName.value;
            }
          }
        ],
        columns: [{
          name: 'userName',
          options: users,
          selectedIndex: this.retrieveUserIndex(users),
        }]
      };

      const picker = await this.pickerController.create(options);
      picker.present();

      //just to fix some issues with the picker
      picker.onDidDismiss().then(async data => {
        const userName = await picker.getColumn('userName');
        userName.options.forEach(element => {
          delete element.selected;
          delete element.duration;
          delete element.transform;
        });
      });
    }
  }

  async showOrderPicker() {
    if (!this.selectedUserId) {
      this.alertController.create({
        cssClass: '',
        header: 'Select a user to report.',
        buttons: [
          {
            text: 'Dismiss',
            role: 'cancel',
          }
        ]
      }).then(x => x.present());
    } else {
      let orders = [];
      if (this.selectedOption === 'deliverer') {
        orders = this.listOfDeliverers.get(this.selectedUserId);
      } else if (this.selectedOption === 'customer') {
        orders = this.listOfCustomers.get(this.selectedUserId);
      }

      const options: PickerOptions = {
        buttons: [
          {
            text: 'Cancel',
            role: 'cancel'
          },
          {
            text: 'Confirm',
            handler: (value) => {
              this.selectedOrderId = value.orders.value;
              // this.reportForm.get('userId').setValue(value.userType.value);
            }
          }
        ],
        columns: [{
          name: 'orders',
          options: orders,
          selectedIndex: this.retrieveOrderIndex(orders),
        }]
      };

      const picker = await this.pickerController.create(options);
      picker.present();

      //just to fix some issues with the picker
      picker.onDidDismiss().then(async data => {
        const orders = await picker.getColumn('orders');
        orders.options.forEach(element => {
          delete element.selected;
          delete element.duration;
          delete element.transform;
        });
      });
    }
  }

  displaySelectedUserName() {
    let result;
    if (this.selectedOption === 'deliverer') {
      this.delivererDetails.forEach(value => {
        if (value.value === this.selectedUserId) {
          result = value.text;
        }
      });
    } else {
      this.customerDetails.forEach(value => {
        if (value.value === this.selectedUserId) {
          result = value.text;
        }
      });
    }
    return result;
  }

  displaySelectedOrderId() {
    let result;
    if (this.selectedOption === 'deliverer') {
      this.listOfDeliverers.get(this.selectedUserId).forEach(value => {
        if (value.value === this.selectedOrderId) {
          result = value.text;
        }
      });
    } else {
      this.listOfCustomers.get(this.selectedUserId).forEach(value => {
        if (value.value === this.selectedOrderId) {
          result = value.text;
        }
      });
    }
    return result;
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
  }

  checkFormValid() {
    this.formValid = true;
    if (this.reportCustomer && (!this.selectedOption || !this.selectedUserId || !this.selectedOrderId)) {
      this.formValid = false;
      return;
    }
    const controls = this.reportForm.controls;
    for (const name in controls) {
      if (controls[name].invalid) {
        this.formValid = false;
        return;
      }
    }
    if (!this.imgURL) {
      this.formValid = false;
      return;
    }
  }

  cancelSubmitReport() {
    if (this.category.value ||
      this.description.value ||
      this.imgURL || (
        this.reportCustomer && (
          this.selectedOption ||
          this.selectedUserId ||
          this.selectedOrderId)
      )) {
      this.alertController.create({
        message: 'Are you sure you want to cancel? All changes will be lost.',
        buttons: [
          {
            text: 'Confirm',
            handler: () => {
              this.closeModal();
            }
          },
          {
            text: 'Cancel',
            role: 'cancel',
          },
        ]
      }).then(x => x.present());
    } else {
      this.closeModal();
    }
  }

  async submitReport() {
    this.checkFormValid();
    if (this.formValid) {
      const formData = new FormData();
      formData.append('reportType', ReportTypeEnum.COMPLAINT);
      formData.append('complaintCategory', this.category.value);
      formData.append('reportDescription', this.description.value);
      if (this.file) {
        formData.append('file', this.file);
      }
      if (this.order) {
        formData.append('order', JSON.stringify(this.order));
      }
      if (this.reportCustomer) {
        const order = await this.orderService.findOrderByOrderId(this.selectedOrderId).toPromise();
        formData.append('order', JSON.stringify(order));
      }
      if (this.user) {
        formData.append('user', JSON.stringify(this.user));
      }
      if (this.outlet) {
        formData.append('outlet', JSON.stringify(this.outlet));
      }

      this.reportService.createNewComplaint(formData).subscribe(submittedReport => {
        const id = submittedReport._id.substring(submittedReport._id.length - 5);
        this.presentToast(`Report has been created (Report #${id})`);
        this.closeModal();
      });
    }
  }

  async presentToast(msg) {
    const toast = await this.toastController.create({
      message: msg,
      duration: 2000,
    });
    toast.present();
  }

  get category() {
    return this.reportForm.get('category');
  }

  get description() {
    return this.reportForm.get('description');
  }

  private retrieveCategoryIndex() {
    let result = 0;
    this.allComplaintCategories.forEach((x, id) => {
      if (x.value === this.category.value) {
        result = id;
      }
    });
    return result;
  }

  private retrieveUserIndex(users) {
    if (!this.selectedUserId) {
      return 0;
    }
    let result = 0;
    users.forEach((x, id) => {
      if (x.value === this.selectedUserId) {
        result = id;
      }
    });
    return result;
  }

  private retrieveOrderIndex(orders) {
    if (!this.selectedOrderId) {
      return 0;
    }
    let result = 0;
    orders.forEach((x, id) => {
      if (x.value === this.selectedOrderId) {
        result = id;
      }
    });
    return result;
  }

  private initCategories() {
    const tempArray = [];
    if (this.reportCustomer || (this.order && this.accountType === 'CUSTOMER')) {
      //not the deliverer
      if (this.reportCustomer ||
        (this.order.orderType === OrderTypeEnum.DELIVERY && this.user && this.user._id !== this.order.deliverer._id)) {
        tempArray.push(
          ComplaintCategoryEnum.POOR_ARRIVED_FOOD_CONDITION,
          ComplaintCategoryEnum.INCORRECT_FOOD_PREPARATION,
          ComplaintCategoryEnum.MISSING_ORDER_ITEM,
          ComplaintCategoryEnum.WRONG_ORDER,
          ComplaintCategoryEnum.MISSING_ORDER,
          ComplaintCategoryEnum.SAFETY,
          ComplaintCategoryEnum.LONG_DELIVERY,
          ComplaintCategoryEnum.MISSING_DELIVERY,
          ComplaintCategoryEnum.INCORRECT_OUTLET_INFO,
          ComplaintCategoryEnum.POOR_SERVICE
        );
      } else if (this.order.orderType === OrderTypeEnum.TAKE_AWAY) {
        tempArray.push(
          ComplaintCategoryEnum.POOR_ARRIVED_FOOD_CONDITION,
          ComplaintCategoryEnum.INCORRECT_FOOD_PREPARATION,
          ComplaintCategoryEnum.MISSING_ORDER_ITEM,
          ComplaintCategoryEnum.WRONG_ORDER,
          ComplaintCategoryEnum.MISSING_ORDER,
        );
      }
    }

    if (!this.reportCustomer) {
      tempArray.push(
        ComplaintCategoryEnum.INCORRECT_PAYMENT,
        ComplaintCategoryEnum.INCORRECT_CASHBACK,
        ComplaintCategoryEnum.OTHERS
      );
    }

    tempArray.forEach(x => {
      this.allComplaintCategories.push({
        text: x.toString().replaceAll('_', ' '),
        value: x
      });
    });
  }

}

import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { DatePicker } from '@ionic-native/date-picker/ngx';
import { AlertController, LoadingController, MenuController, Platform, ToastController } from '@ionic/angular';
import { ServicesService } from 'src/app/services.service';
import { Camera, CameraOptions } from '@ionic-native/camera/ngx';
import { Chooser } from '@ionic-native/chooser/ngx';
import { Base64 } from '@ionic-native/base64/ngx';
import { WebView } from '@ionic-native/ionic-webview/ngx';
import { BackgroundMode } from '@awesome-cordova-plugins/background-mode/ngx';
@Component({
  selector: 'app-documentmanagement',
  templateUrl: './documentmanagement.page.html',
  styleUrls: ['./documentmanagement.page.scss'],
})
export class DocumentmanagementPage implements OnInit {
  bookingcount = 0;
  frontimage = "";
  backimage = "";
  frontfile = "";
  backfile = "";
  driverid = JSON.parse(localStorage.getItem('driver_data')).id;
  present = false;
  presentdata;
  isAndroid = false;
  intervalset01: any;
  constructor(
    private menu: MenuController,
    private platform: Platform,
    private service: ServicesService,
    private route: Router,
    private datepicker: DatePicker,
    private loader: LoadingController,
    private toast: ToastController,
    private camera: Camera,
    private chooser: Chooser,
    private base64: Base64,
    private webview: WebView,
    private alert: AlertController,
    private backgroundmode: BackgroundMode,
  ) { }

  async ionViewWillLeave(){
    if(this.intervalset01){
      clearInterval(this.intervalset01);
    }
  }

  playAudio(){
    let audio = new Audio();
    audio.pause();
    audio.src = "https://quickcabtaxiservice.com/storage/app/public/app_notification_sound/newbook.wav";
    audio.load();
    audio.play();

    setTimeout(function(){
        audio.pause();
        audio.currentTime = 0;
    }, 4000);
  }

  async ngOnInit() {

    if (this.platform.platforms().includes("android")){
      this.isAndroid = true
  }

    this.platform.backButton.subscribeWithPriority(9999, () => {
      document.addEventListener('backbutton', function (event) {
        event.preventDefault();
        event.stopPropagation();
      }, false);
    });

    let servicedata = {
      driver_id: this.driverid
    }
    let ld = this.loader.create({
      message: "Checking License Information."
    });
    (await ld).present().then(async () => {


      this.service.CheckDriverLicenseFormService(servicedata).subscribe(
        async data => {
          if (!!data && data.success == true) {
            console.log(data.flag);

            if (data.flag != 0) {
              this.loader.dismiss();
              this.present = true;
              if(data.licence_details[0].image_front != ''){
                data.licence_details[0].image_front = "https://quickcabtaxiservice.com/storage/app/public/" + data.licence_details[0].image_front;

              }
              if(data.licence_details[0].image_back != ''){
                data.licence_details[0].image_back = "https://quickcabtaxiservice.com/storage/app/public/" + data.licence_details[0].image_back;

              }

              this.presentdata = data.licence_details[0];
              // let tm = this.toast.create({
              //   message: "Please contact QuickCab Support to Update your License Information.",
              //   duration: 3000
              // });
              // (await tm).present();
              let ar = this.alert.create({
                message: 'Please contact QuickCab Support to Update your License Information.',
                buttons: ['OK']
              });
              (await ar).present();
            }
            else {
              this.loader.dismiss();
              this.present = false;
            }
          }
        }
      );
    });

    this.intervalset01 = setInterval(() => {
      let servicedata = {
        driver_id: this.driverid
      }

      this.service.GetUserBookingsService(servicedata).subscribe(
        data => {
          console.log(data);

          if (!!data && data.success == true) {
            this.bookingcount = data.booked_users.length;
            if (data.booked_users.length > 0) {
              // this.audio.play('caralarm1')
              this.playAudio();
              for (let i = 0; i < data.booked_users.length; i++) {
                let rideid = data.booked_users[i].id;
                let sdata = {
                  ride_id: rideid
                };
                this.service.GetRideDetailsService(sdata).subscribe(
                  ridedata => {
                    console.log("ride data = ", ridedata);
                    let prc = ridedata.totalprice;
                    if (!!ridedata && ridedata.success == true) {
                      data.booked_users[i].estimated_price = Math.round(prc)
                    }
                  }
                )
              }


              // this.bookings = data.booked_users;
              // this.bookingcounts = 1;

            }
            else {
              // this.bookings = [];
              this.bookingcount = 0;

            }
          }
          // console.log("bookings:- ", this.bookings);

        }
      );
    }, 6000);
  }
  menuon() {
    this.menu.enable(true, 'menu');
    this.menu.open('menu')
  }
  openchooser() {
    this.closechooserfront();
    document.getElementById('optionchooser_doc').style.display = 'block';
    let point = -25;
    let maxpoint = 0;
    setInterval(() => {
      point = point + 5;
      if (point <= maxpoint) {
        document.getElementById('optionchooser_doc').style.bottom = point + "%";
      }
    }, 100);
  }
  closechooser() {
    let point = 0;
    let maxpoint = -25;
    setInterval(() => {
      point = point - 5;
      if (point > maxpoint) {
        document.getElementById('optionchooser_doc').style.bottom = point + "%";
      }
      if (point == maxpoint) {
        document.getElementById('optionchooser_doc').style.display = 'none';
      }
    }, 100)
  }

  openchooserfront() {
    this.closechooser();
    document.getElementById('optionchooserfront_doc').style.display = 'block';
    let point = -25;
    let maxpoint = 0;
    setInterval(() => {
      point = point + 5;
      if (point <= maxpoint) {
        document.getElementById('optionchooserfront_doc').style.bottom = point + "%";
      }
    }, 100);
  }
  closechooserfront() {
    let point = 0;
    let maxpoint = -25;
    setInterval(() => {
      point = point - 5;
      if (point > maxpoint) {
        document.getElementById('optionchooserfront_doc').style.bottom = point + "%";
      }
      if (point == maxpoint) {
        document.getElementById('optionchooserfront_doc').style.display = 'none';
      }
    }, 100)
  }

  opencamerafront() {
    let options: CameraOptions = {
      quality: 80,
      destinationType: this.camera.DestinationType.FILE_URI,
      encodingType: this.camera.EncodingType.JPEG,
      mediaType: this.camera.MediaType.PICTURE,
      correctOrientation: true,
    }

    this.camera.getPicture(options).then((resp) => {
      this.closechooserfront();
      console.log(resp);

      let webpath = this.webview.convertFileSrc(resp.toString());
      let b64 = this.base64.encodeFile(resp);
      let b64image = "";
      b64.then((resp2) => {
        console.log(resp2);

        let arrimg = resp2.split(",");

        let b64img = arrimg[1];
        this.frontimage = b64img.toString();
        this.frontfile = webpath;
        console.log("front : ", b64img.toString());

      })

    })
  }
  openfilemanagerfront() {
    this.chooser.getFile().then(async (file) => {
      console.log(file);

      this.closechooserfront();
      let mediatype = file['mediaType'].toString();
      let filestypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'];
      if (!filestypes.includes(mediatype)) {
        let tm = this.toast.create({
          message: 'Only Images are Accepted (JPEG/JPG/PNG/WEBP)',
          duration: 2000
        });
        (await tm).present().then(() => {
          this.openchooserfront();
        })
      }
      if (filestypes.includes(mediatype)) {
        let imageFile = this.webview.convertFileSrc(file.uri);
        this.frontfile = imageFile;
        let arraysection = file.dataURI.split(",");
        let fileb64 = arraysection[1];
        this.frontimage = fileb64;
      }
    })
  }
  delfront() {
    this.frontfile = "";
    this.frontimage = "";
  }

  opencamera() {
    let options: CameraOptions = {
      quality: 80,
      destinationType: this.camera.DestinationType.FILE_URI,
      encodingType: this.camera.EncodingType.JPEG,
      mediaType: this.camera.MediaType.PICTURE,
      correctOrientation: true,
    }

    this.camera.getPicture(options).then((resp) => {
      this.closechooser();
      console.log(resp);

      let webpath = this.webview.convertFileSrc(resp.toString());
      let b64 = this.base64.encodeFile(resp);
      let b64image = "";
      b64.then((resp2) => {
        console.log(resp2);

        let arrimg = resp2.split(",");

        let b64img = arrimg[1];
        this.backimage = b64img.toString();
        this.backfile = webpath;


        console.log("back :", b64img.toString());
      })

    })
  }
  openfilemanager() {
    this.chooser.getFile().then(async (file) => {
      this.closechooser();
      let mediatype = file.mediaType.toString();
      let filestypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'];
      if (!filestypes.includes(mediatype)) {
        let tm = this.toast.create({
          message: 'Only Images are Accepted (JPEG/JPG/PNG/WEBP)',
          duration: 2000
        });
        (await tm).present().then(() => {
          this.openchooser();
        })
      }
      if (filestypes.includes(mediatype)) {
        let imageFile = this.webview.convertFileSrc(file.uri);
        this.backfile = imageFile;
        let arraysection = file.dataURI.split(",");
        let fileb64 = arraysection[1];
        this.backimage = fileb64;
      }
    })
  }
  delback() {
    this.backfile = "";
    this.backimage = "";
  }

  checklicense() {
    let lc = (<HTMLInputElement>document.getElementById('license')).value;
    if (lc.length < 1) {
      document.getElementById('license').style.backgroundColor = '#f9b6ac';
    }
    else {
      document.getElementById('license').style.backgroundColor = '#ffffff';
    }
  }
  async savedocument() {
    let ar = this.alert.create({
      header: 'Confirm',
      message: "Do you want to Review your License details again before Submit ?",
      buttons: [
        {
          text: 'Review',
          handler: () => {
            console.log("document review called");
          },
        },
        {
          text: 'Submit',
          handler: async () => {
            let servicedata = {
              driver_id: this.driverid,
              license_no: (<HTMLInputElement>document.getElementById('license')).value,
              front_image: this.frontimage,
              back_image: this.backimage
            }
            console.log(servicedata);

            this.validateall(servicedata);
            let validations = this.validatedata(servicedata);
            console.log(validations);

            if (validations['success'] == false) {
              let tm = this.toast.create({
                message: validations['message'],
                duration: 2000
              });
              (await tm).present();
            }
            else {
              let ld = this.loader.create({
                message: "Saving License Form......"
              });
              (await ld).present().then(async () => {
                this.service.DriverLicenseUploadService(servicedata).subscribe(
                  async data => {
                    console.log("dtr: ", data);

                    if (!!data && data.success == true) {
                      this.loader.dismiss();
                      let tm = this.toast.create({
                        message: "License Form Successfully Uploaded.",
                        duration: 2000
                      });
                      (await tm).present().then(() => {
                        window.location.reload();
                      })
                    }
                    else {
                      this.loader.dismiss();
                      let tm = this.toast.create({
                        message: "Cannot Save License Form. Server Error! Please Try Again Later.",
                        duration: 2000
                      });
                      (await tm).present();
                    }
                  },
                  async err => {
                    this.loader.dismiss();
                    let tm = this.toast.create({
                      message: "Sorry, Cannot connect to the server! Please Try Again Later.",
                      duration: 2000
                    });
                    (await tm).present();
                  }
                )
              })
            }
          }
        }
      ]
    });
    (await ar).present();

  }

  validateall(sd) {
    if (sd['license_no'].length < 1) {
      document.getElementById('license').style.backgroundColor = '#f9b6ac';
    }
  }

  validatedata(sd) {
    console.log(sd);

    if (sd['license_no'] == "") {
      let codes = {
        success: false,
        message: 'Please Enter Your Driving License Number'
      };
      return codes;
    }
    else {
      if (sd['front_image'].length < 1) {
        let codes = {
          success: false,
          message: 'Please Upload The Front Side Image of Your License Card'
        };
        return codes;
      }
      else {
        if (sd['back_image'].length < 1) {
          let codes = {
            success: false,
            message: 'Please Upload The Back Side Image of Your License Card'
          };
          return codes;
        }
        else {
          let codes = {
            success: true,
            message: 'All Data Validated'
          };
          return codes;
        }
      }
    }
  }

  viewbookings() {
    this.route.navigate(['/pages/viewbookings']);
  }
}

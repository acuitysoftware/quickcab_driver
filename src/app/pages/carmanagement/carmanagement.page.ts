import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { DatePicker } from '@ionic-native/date-picker/ngx';
import { AlertController, LoadingController, MenuController, Platform, ToastController } from '@ionic/angular';
import { ServicesService } from 'src/app/services.service';
import { Camera, CameraOptions } from '@ionic-native/camera/ngx';
import { Chooser } from '@ionic-native/chooser/ngx';
import { Base64 } from '@ionic-native/base64/ngx';
import { WebView } from '@ionic-native/ionic-webview/ngx';
import { TypeModifier } from '@angular/compiler/src/output/output_ast';
import { BackgroundMode } from '@awesome-cordova-plugins/background-mode/ngx';
import { LocalNotifications } from '@awesome-cordova-plugins/local-notifications/ngx';

@Component({
  selector: 'app-carmanagement',
  templateUrl: './carmanagement.page.html',
  styleUrls: ['./carmanagement.page.scss'],
})
export class CarmanagementPage implements OnInit {
  bookingcount = 0;
  todaysdate = new Date();
  frontimage = "";
  backimage = "";
  frontfile = "";
  backfile = "";
  driverid = JSON.parse(localStorage.getItem('driver_data')).id;
  present = false;
  presentdata;
  fueltypes = ['Petrol', 'Diesel', 'Electric', 'CNG'];
  transcolors = [];
  transmodels = [];
  transtypes = [];
  intervalset01: any;
  isAndroid = false;
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
    private bgmode: BackgroundMode,
    private localpush: LocalNotifications,
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
    //this.bgmode.enable();

    this.platform.backButton.subscribeWithPriority(9999, () => {
      document.addEventListener('backbutton', function (event) {
        event.preventDefault();
        event.stopPropagation();
      }, false);
    });

    if (this.platform.platforms().includes("android")){
      this.isAndroid = true
  }
    
    let servdata = {
      driver_id: this.driverid
    }
    let ld = this.loader.create({
      message: "Checking Car Registration Information."
    });
    (await ld).present().then(async () => {
      this.service.CheckCarRegisterFormService(servdata).subscribe(
        async data => {
          if (!!data && data.success == true) {
            if (data.flag > 0) {
              this.loader.dismiss();
              this.present = true;
              if(data.register_details[0].cert_front_img != ''){
                data.register_details[0].cert_front_img = "https://quickcabtaxiservice.com/storage/app/public/" + data.register_details[0].cert_front_img;

              }
              if(data.register_details[0].cert_back_img != ''){
                data.register_details[0].cert_back_img = "https://quickcabtaxiservice.com/storage/app/public/" + data.register_details[0].cert_back_img;

              }
              this.presentdata = data.register_details[0];
              let ar = this.alert.create({
                message: "Please contact QuickCab Support to Activate your Car / Update information.",
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
      )
    });
    this.service.GetTransportColorService().subscribe(
      data => {
        if (!!data && data.success == true) {
          console.log(data);
          this.transcolors = data.color_list;
        }
      }
    );

    // this.service.GetTransportModelService().subscribe(
    //   data => {
    //     if (!!data && data.success == true) {
    //       console.log(data);
    //       this.transmodels = data.model_list;
    //     }
    //   }
    // );

    this.service.GetTransportTypeService().subscribe(
      data => {
        if (!!data && data.success == true) {
          console.log(data);
          this.transtypes = data.type_list;
        }
      }
    );

    this.intervalset01 = setInterval(() => {
      // this.localpush.clearAll();
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
              this.localpush.schedule({
                id: 1,
                title: 'Quick Cab User Booking ',
                text: 'You Have ' + data.booked_users.length + " New Booking. Please Accept / Reject From QuickCab Driver App.",
                icon: 'https://quickcabtaxiservice.com/storage/app/public/quickcabicon.png'
              })


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
    document.getElementById('optionchooser').style.display = 'block';
    let point_bo = -25;
    let maxpoint_bo = 0;
    setInterval(() => {
      point_bo = point_bo + 5;
      if (point_bo <= maxpoint_bo) {
        document.getElementById('optionchooser').style.bottom = point_bo + "%";
      }
    }, 100);
  }
  closechooser() {
    let point_bc = 0;
    let maxpoint_bc = -25;
    setInterval(() => {
      point_bc = point_bc - 5;
      if (point_bc > maxpoint_bc) {
        document.getElementById('optionchooser').style.bottom = point_bc + "%";
      }
      if (point_bc == maxpoint_bc) {
        document.getElementById('optionchooser').style.display = 'none';
      }
    }, 100)
  }

  openchooserfront() {
    this.closechooser();
    document.getElementById('optionchooserfront').style.display = 'block';
    let point_fo = -25;
    let maxpoint_fo = 0;
    setInterval(() => {
      point_fo = point_fo + 5;
      if (point_fo <= maxpoint_fo) {
        document.getElementById('optionchooserfront').style.bottom = point_fo + "%";
      }
    }, 100);
  }
  closechooserfront() {
    let point_fc = 0;
    let maxpoint_fc = -25;
    setInterval(() => {
      point_fc = point_fc - 5;
      if (point_fc > maxpoint_fc) {
        document.getElementById('optionchooserfront').style.bottom = point_fc + "%";
      }
      if (point_fc == maxpoint_fc) {
        document.getElementById('optionchooserfront').style.display = 'none';
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
  // opencamera() {
  //   let options: CameraOptions = {
  //     quality: 80,
  //     destinationType: this.camera.DestinationType.FILE_URI,
  //     encodingType: this.camera.EncodingType.JPEG,
  //     mediaType: this.camera.MediaType.PICTURE,
  //     correctOrientation: true,
  //   }

  //   this.camera.getPicture(options).then((resp) => {
  //     this.closechooser();
  //     console.log(resp);

  //     let webpath = this.webview.convertFileSrc(resp.toString());
  //     let b64 = this.base64.encodeFile(resp);
  //     let b64image = "";
  //     b64.then((resp2) => {
  //       let b64split = resp2.split(',');
  //       b64image = b64split[1];
  //       this.backimage = b64image;
  //       this.backfile = webpath;
  //     })

  //   })
  // }
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

  openfueltypes() {
    document.getElementById('fuelchooser').style.display = 'block';
  }
  closefueltypes() {
    document.getElementById('fuelchooser').style.display = 'none';
  }
  getfueltype(fueltype) {
    document.getElementById('fuelchooser').style.display = 'none';
    document.getElementById('fuels').innerHTML = fueltype;
  }

  opencolortypes() {
    document.getElementById('colorchooser').style.display = 'block';
  }
  closecolortypes() {
    document.getElementById('colorchooser').style.display = 'none';
  }
  getcolortypes(colortype, typeid) {
    document.getElementById('colorchooser').style.display = 'none';
    document.getElementById('colors').innerHTML = colortype;
    document.getElementById('colorids').innerHTML = typeid;
  }

  async openmodeltypes() {
    let typeval = document.getElementById('types').innerHTML;
    if (typeval == "Select A Transport Type") {
      let tm = this.toast.create({
        message: "Please Select A Transport Type.",
        duration: 1500
      });
      (await tm).present();
    }
    else {
      let typeid = document.getElementById('typeids').innerHTML;
      let servicedata = {
        type_id: typeid
      };
      let ld = this.loader.create({
        message: "Loading Cars…"
      });
      (await ld).present();
      this.service.GetTransportModelService(servicedata).subscribe(
        async data => {
          if (!!data && data.success == true) {
            this.loader.dismiss();
            this.transmodels = data.model_list;
            document.getElementById('modelchooser').style.display = 'block';
          }
          else {
            this.loader.dismiss();
            let tm = this.toast.create({
              message: "No Cars Found!",
              duration: 2000
            });
            (await tm).present();
          }
        }
      )
    }

  }
  closemodeltypes() {
    document.getElementById('modelchooser').style.display = 'none';
  }
  getmodeltypes(modeltype, typeid) {
    document.getElementById('modelchooser').style.display = 'none';
    document.getElementById('models').innerHTML = modeltype;
    document.getElementById('modelids').innerHTML = typeid;
  }

  opentypetypes() {
    document.getElementById('typechooser').style.display = 'block';
  }
  closetypetypes() {
    document.getElementById('typechooser').style.display = 'none';
  }
  gettypetypes(typetype, typeid) {
    document.getElementById('typechooser').style.display = 'none';
    document.getElementById('types').innerHTML = typetype;
    document.getElementById('typeids').innerHTML = typeid;
  }

  async openmfgdate() {
    this.datepicker.show({
      date: new Date(),
      mode: 'date',
      androidTheme: this.datepicker.ANDROID_THEMES.THEME_DEVICE_DEFAULT_LIGHT,
      maxDate: new Date()
    }).then(async (resp) => {
      if (resp > new Date()) {
        let tm = this.toast.create({
          message: "Cannot exceed today's date",
          duration: 2500
        });
        (await tm).present().then(() => {
          this.openmfgdate();
        })
      }
      else {
        document.getElementById('mfgdate').innerHTML = resp.getDate() + "-" + (resp.getMonth() + 1) + "-" + resp.getFullYear();
      }
    })
  }

  async openregdate() {
    this.datepicker.show({
      date: new Date(),
      mode: 'date',
      androidTheme: this.datepicker.ANDROID_THEMES.THEME_DEVICE_DEFAULT_LIGHT,
      maxDate: new Date()
    }).then(async (resp) => {
      if (resp > new Date()) {
        let tm = this.toast.create({
          message: "Cannot exceed today's date",
          duration: 2500
        });
        (await tm).present().then(() => {
          this.openregdate();
        })
      }
      else {
        document.getElementById('regdate').innerHTML = resp.getDate() + "-" + (resp.getMonth() + 1) + "-" + resp.getFullYear();
      }
    })
  }


  async submitdata() {

    let mfgdatedata = (<HTMLFontElement>document.getElementById('mfgdate')).innerHTML;
    let mfgsplit = mfgdatedata.split("-");
    let mfgdate = "";
    if (mfgsplit[1].length > 1) {
      if (mfgsplit[0].length > 1) {
        mfgdate = mfgsplit[2] + "-" + mfgsplit[1] + "-" + mfgsplit[0];
      }
      if (mfgsplit[0].length < 2) {
        mfgdate = mfgsplit[2] + "-" + mfgsplit[1] + "-0" + mfgsplit[0];
      }
    }
    if (mfgsplit[1].length < 2) {
      if (mfgsplit[0].length > 1) {
        mfgdate = mfgsplit[2] + "-0" + mfgsplit[1] + "-" + mfgsplit[0];
      }
      if (mfgsplit[0].length < 2) {
        mfgdate = mfgsplit[2] + "-0" + mfgsplit[1] + "-0" + mfgsplit[0];
      }
    }

    let regdatedata = (<HTMLFontElement>document.getElementById('regdate')).innerHTML;
    let regsplit = regdatedata.split("-");
    let regdate = "";
    if (regsplit[1].length > 1) {
      if (regsplit[0].length > 1) {
        regdate = regsplit[2] + "-" + regsplit[1] + "-" + regsplit[0];
      }
      if (regsplit[0].length < 2) {
        regdate = regsplit[2] + "-" + regsplit[1] + "-0" + regsplit[0];
      }
    }
    if (regsplit[1].length < 2) {
      if (regsplit[0].length > 1) {
        regdate = regsplit[2] + "-0" + regsplit[1] + "-" + regsplit[0];
      }
      if (regsplit[0].length < 2) {
        regdate = regsplit[2] + "-0" + regsplit[1] + "-0" + regsplit[0];
      }
    }

    let jsondata = {
      driver_id: this.driverid,
      trans_type: (<HTMLFontElement>document.getElementById('typeids')).innerHTML,
      trans_model: (<HTMLFontElement>document.getElementById('modelids')).innerHTML,
      registration_no: (<HTMLInputElement>document.getElementById('carreg')).value,
      trans_color: (<HTMLFontElement>document.getElementById('colorids')).innerHTML,
      fuel_type: (<HTMLFontElement>document.getElementById('fuels')).innerHTML.toLowerCase(),
      date_mfg: mfgdate,
      date_reg: regdate,
      cert_front_image: this.frontimage,
      cert_back_image: this.backimage
    };
    console.log("car mgm data : ", jsondata);
    let ar = this.alert.create({
      header: 'Confirm',
      message: ' Do you want to Review  your Car details again before Submit?',
      buttons: [
        {
          text: 'Review',
          handler: () => {
            console.log(jsondata)
          }
        },
        {
          text: 'Submit',
          handler: async () => {
            let validations = this.validatedata(jsondata);
            if (validations.success == false) {
              let tm = this.toast.create({
                message: validations.message,
                duration: 2000
              });
              (await tm).present();
            }
            else {

              let ld = this.loader.create({
                message: "Uploading Data......"
              });
              (await ld).present().then(async () => {
                this.service.DriverCarDetailsUploadService(jsondata).subscribe(
                  async data => {
                    if (!!data && data.success == true) {
                      this.loader.dismiss();
                      let tm = this.toast.create({
                        message: 'Successfully uploaded',
                        duration: 3000
                      });
                      (await tm).present().then(() => {
                        window.location.reload();
                      });
                    }
                    else {
                      this.loader.dismiss();
                      let tm = this.toast.create({
                        message: 'Sorry, Cannot connect to Server. Please Try Again Later!',
                        duration: 3000
                      });
                      (await tm).present();
                    }
                  }
                );
              });
            }
          }
        }
      ]
    });
    (await ar).present();
  }

  validatedata(jd) {
    if (Number(jd['trans_type']) < 1) {
      let codes = {
        success: false,
        message: "Please Select A Transport Type"
      };
      return codes;
    }
    else {
      if (Number(jd['trans_model']) < 1) {
        let codes = {
          success: false,
          message: "Please Select Your Car"
        };
        return codes;
      }
      else {
        if (Number(jd['trans_color']) < 1) {
          let codes = {
            success: false,
            message: "Please Select A Color"
          };
          return codes;
        }
        else {
          if (jd['fuel_type'] == "Select Fuel Type") {
            let codes = {
              success: false,
              message: "Please Select A Fuel Type"
            };
            return codes;
          }
          else {
            if (jd['registration_no'] == "" || jd['registration_no'].length < 1) {
              let codes = {
                success: false,
                message: "Please Enter A Car Registration Number"
              };
              return codes;
            }
            else {
              let dateexp = "[0-9]{4}-[0-9]{2}-[0-9]{2}"
              if (!jd['date_mfg'].match(dateexp)) {
                let codes = {
                  success: false,
                  message: "Please Select A Manufacturing Date"
                };
                return codes;
              }
              else {
                let dtexp = "[0-9]{4}-[0-9]{2}-[0-9]{2}";
                if (!jd['date_reg'].match(dtexp)) {
                  let codes = {
                    success: false,
                    message: "Please Select A Registration Date"
                  };
                  return codes;
                }
                else {
                  let mfd = new Date(jd['date_mfg']);
                  let rgd = new Date(jd['date_reg']);
                  if (rgd < mfd) {
                    let codes = {
                      success: false,
                      message: "Date Of Registration cannot be before  Manufacting Date"
                    };
                    return codes;
                  }
                  else {
                    if (jd['cert_front_image'] == "" || jd['cert_front_image'] < 1) {
                      let codes = {
                        success: false,
                        message: "Please Upload Your Car Reg Certificate Front-side Image"
                      };
                      return codes;
                    }
                    else {
                      if (jd['cert_back_image'] == "" || jd['cert_back_image'] < 1) {
                        let codes = {
                          success: false,
                          message: "Please Upload Your Car Reg Certificate Back-side Image"
                        };
                        return codes;
                      }
                      else {
                        let codes = {
                          success: true,
                          message: "All Data Validated"
                        };
                        return codes;
                      }
                    }
                  }

                }

              }
            }
          }
        }
      }
    }
  }

  capzcarregno() {
    let carregval = (<HTMLInputElement>document.getElementById('carreg')).value;
    carregval = carregval.toUpperCase();
    (<HTMLInputElement>document.getElementById('carreg')).value = carregval;
  }

  viewbookings() {
    this.bgmode.disable();
    this.localpush.clearAll();
    clearInterval(this.intervalset01);
    /*(<HTMLAudioElement>document.getElementById('bgalert')).pause();*/
    this.route.navigate(['/pages/viewbookings']);
  }
}


import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute} from '@angular/router';
import { DatePicker } from '@ionic-native/date-picker/ngx';
import { AlertController, LoadingController, MenuController, Platform, ToastController } from '@ionic/angular';
import { ServicesService } from 'src/app/services.service';
import { Camera, CameraOptions } from '@ionic-native/camera/ngx';
import { Chooser } from '@ionic-native/chooser/ngx';
import { Base64 } from '@ionic-native/base64/ngx';
import { WebView } from '@ionic-native/ionic-webview/ngx';
import { LocalNotifications } from '@awesome-cordova-plugins/local-notifications/ngx';
import { BackgroundMode } from '@awesome-cordova-plugins/background-mode/ngx';
@Component({
  selector: 'app-profile',
  templateUrl: './profile.page.html',
  styleUrls: ['./profile.page.scss'],
})
export class ProfilePage implements OnInit{
  bookingcount = 0;
  drivername = "";
  driverphone = "";
  driverdob = "";
  driveremail = "";
  drivergender = "";
  driverdp = "";
  driverid: any;
  intervalset01: any;
  backimage = "";
  drivertotaltrips: any;
  driverrate: any;
  isAndroid = false;

  backfile = "https://quickcabtaxiservice.com/storage/app/public/driver.png";

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
    private localpush: LocalNotifications,
    private bgmode: BackgroundMode,
    private activatedroute: ActivatedRoute,
  ) { }

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

  ionViewWillLeave(){
    if(this.intervalset01){
      clearInterval(this.intervalset01);
    }
  }

 
  async ngOnInit() {
    this.platform.ready().then(async () => {
      //this.bgmode.enable();

      if (this.platform.platforms().includes("android")){
        this.isAndroid = true
    }

      this.platform.backButton.subscribeWithPriority(9999, () => {
        document.addEventListener('backbutton', function (event) {
          event.preventDefault();
          event.stopPropagation();
        }, false);
      });
     
      let ld = this.loader.create({
        message: "Loading......",
      });
      (await ld).present().then(() => {
        let driverid = JSON.parse(localStorage.getItem('driver_data')).id;
        let dd_data = {
          driver_id: driverid
        }
        this.service.GetDriverDetailsService(dd_data).subscribe(
          async data => {
            if (!!data && data['success'] == true) {
              console.log("DDets:", data);
              if (data.driver_details.driver_name != "" && data.driver_details.dob != null && data.driver_details.gender != null && data.driver_details.image != null) {
                document.getElementById('driverimage').style.display = 'none';
                document.getElementById('driverimagepostservice').style.display = 'block';
                document.getElementById('cph').style.display = 'none';
                document.getElementById('phnnmb').style.display = 'block';
                document.getElementById('submitbtn').style.display = 'none';
                document.getElementById('dname').setAttribute('readonly', 'true');
                document.getElementById('ddob').style.display = 'none';
                document.getElementById('ddobr').style.display = 'block';
                document.getElementById('dgender').style.display = 'none';
                document.getElementById('rdgender').style.display = 'block';
                let ar = this.alert.create({
                  message: 'Please Contact Quick Cab Support To Update Profile Your Information.',
                  buttons: ['OK']
                });
                (await ar).present();
              }

              this.drivername = data['driver_details']['driver_name'];
              this.driverphone = data['driver_details']['driver_phone'];

              let getdob = data['driver_details']['dob'];
              console.log(getdob);

              if (!!getdob) {
                let splitdob = getdob.split('-');
                this.driverdob = splitdob[2] + "/" + splitdob[1] + "/" + splitdob[0];
              }


              this.driveremail = data['driver_details']['driver_email'];

              if (!!data['driver_details']['gender']) {
                this.drivergender = data['driver_details']['gender'];
              }

              this.driverid = data['driver_details']['id'];

              this.drivertotaltrips = data['total_trips'];
              let drate = data['ratings'];
              drate = drate.toFixed(2);
              this.driverrate = drate;

              if (!!data['driver_details']['image']) {
                this.backfile = "https://quickcabtaxiservice.com/storage/app/public/" + data['driver_details']['image'];
              }
              this.loader.dismiss();

            }
          }
        )
      })
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
  async opendatepicker() {
    this.datepicker.show({
      date: new Date(),
      mode: 'date',
      androidTheme: this.datepicker.ANDROID_THEMES.THEME_DEVICE_DEFAULT_LIGHT,
      maxDate: new Date()
    }).then(async (resp) => {
      let currentdate = new Date();
      // let eligibleyear = currentdate.setFullYear(currentdate.getFullYear() - 18);
      currentdate.setFullYear(currentdate.getFullYear() - 18);

      if (resp > currentdate) {
        let tm = this.toast.create({
          message: "Your Age is Below 18years. You are Not Eligible to drive!",
          duration: 1200,
          color: 'white'
        });
        (await tm).present().then(() => {
          this.opendatepicker();
        })
      }
      else {
        let setdate = resp.getDate() + "/" + (resp.getMonth() + 1) + "/" + resp.getFullYear();
        (<HTMLInputElement>document.getElementById('ddob')).value = setdate;
        document.getElementById('ddob').style.backgroundColor = '#ffffff';
      }

    })
  }

  async selectgender() {
    document.getElementById('genderbar').style.display = 'block';
    document.getElementById('editorial').style.filter = 'opacity(25%)';
    document.getElementById('containerdiv').style.filter = 'opacity(25%)';
  }

  closegenderbar() {
    document.getElementById('genderbar').style.display = 'none';
    document.getElementById('editorial').style.filter = 'opacity(100%)';
    document.getElementById('containerdiv').style.filter = 'opacity(100%)';
  }

  changegender(gender) {
    document.getElementById('genderbar').style.display = 'none';
    document.getElementById('editorial').style.filter = 'opacity(100%)';
    document.getElementById('containerdiv').style.filter = 'opacity(100%)';


    if (gender == 'male') {
      (<HTMLInputElement>document.getElementById('dgender')).value = 'MALE';
      document.getElementById('dgender').style.backgroundColor = '#ffffff';
    }
    if (gender == 'female') {
      (<HTMLInputElement>document.getElementById('dgender')).value = 'FEMALE';
      document.getElementById('dgender').style.backgroundColor = '#ffffff';
    }
  }

  async saveprofile() {
    let dateget = (<HTMLInputElement>document.getElementById('ddob')).value;
    let correcteddate = "";
    if (dateget.length > 1) {
      let splitdate = dateget.split('/');
      let reversedate = splitdate[2] + "-" + (splitdate[1]) + "-" + splitdate[0];
      correcteddate = reversedate;
    }
    let jsondata = {
      driver_id: this.driverid,
      driver_name: (<HTMLInputElement>document.getElementById('dname')).value,
      driver_phone: (<HTMLInputElement>document.getElementById('dphone')).value,
      dob: correcteddate,
      gender: (<HTMLInputElement>document.getElementById('dgender')).value.toLowerCase(),
      driver_image: this.backimage
    };
    // alert(JSON.stringify(jsondata));
    console.log(jsondata);

    this.validateall(jsondata);
    let validations = this.validatedata(jsondata);
    if (validations['success'] == false) {
      let tm = this.toast.create({
        message: validations['message'],
        duration: 2000
      });
      (await tm).present();
    }
    else {
      let ld = this.loader.create({
        message: 'Saving Data......'
      });
      (await ld).present().then(async () => {
        this.service.EditDriverProfileService(jsondata).subscribe(async (data) => {
          if (!!data && data['success'] == true) {
            let tm = this.toast.create({
              message: "Saved Profile Data Successfully.",
              duration: 2000,
              color: 'white'
            });
            (await tm).present();
            this.loader.dismiss();
            window.location.reload();
          }
          else {
            this.loader.dismiss();
            let tm = this.toast.create({
              message: "No changes found!",
              duration: 2000,
              color: 'white'
            });
            (await tm).present();
            this.loader.dismiss();
          }
        },
          async err => {
            this.loader.dismiss();
            let tm = this.toast.create({
              message: "Server connection failure. Please try again after sometime",
              duration: 2000,
              color: 'white'
            });
            (await tm).present();
          });
      });

    }
  }

  validateall(jd) {
    if (jd['driver_name'].length < 1) {
      document.getElementById('dname').style.backgroundColor = '#f9b6ac';
    }
    if (jd['driver_phone'].length < 10) {
      document.getElementById('dphone').style.backgroundColor = '#f9b6ac';
    }
    if (jd['dob'].length < 1) {
      document.getElementById('ddob').style.backgroundColor = '#f9b6ac';
    }
    if (jd['gender'].length < 1) {
      document.getElementById('dgender').style.backgroundColor = '#f9b6ac';
    }
  }

  validatedata(jd) {
    if (jd['driver_name'].length < 1) {
      let codes = {
        success: false,
        message: "Please Enter Your Name"
      }
      return codes;
    }
    else {
      if (jd['driver_phone'].length < 1) {
        let codes = {
          success: false,
          message: "Please Enter Your Phone Number"
        }
        return codes;
      }
      else {
        if (jd['driver_phone'].length < 10) {
          let codes = {
            success: false,
            message: "Please Enter A Valid Phone Number"
          }
          return codes;
        }
        else {
          if (jd['dob'].length < 1) {
            let codes = {
              success: false,
              message: "Please Enter Your Correct Date Of Birth"
            }
            return codes;
          }
          else {
            if (jd['gender'].length < 1) {
              let codes = {
                success: false,
                message: "Please Enter Your Gender"
              }
              return codes;
            }
            else {
              // alert(jd['driver_image'])
              if (jd['driver_image'] == undefined || jd['driver_image'] == null || jd['driver_image'] == "") {
                let codes = {
                  success: false,
                  message: "Please Provide Your Profile Picture"
                }
                return codes;
              }
              else {
                let codes = {
                  success: true,
                  message: "All Data Verified"
                }
                return codes;
              }
            }
          }
        }
      }
    }
  }

  openchooser() {
    document.getElementById('optionchooser').style.display = 'block';
    let point = -25;
    let maxpoint = 0;
    setInterval(() => {
      point = point + 5;
      if (point <= maxpoint) {
        document.getElementById('optionchooser').style.bottom = point + "%";
      }
    }, 100);
  }
  closechooser() {
    let point = 0;
    let maxpoint = -25;
    setInterval(() => {
      point = point - 5;
      if (point > maxpoint) {
        document.getElementById('optionchooser').style.bottom = point + "%";
      }
      if (point == maxpoint) {
        document.getElementById('optionchooser').style.display = 'none';
      }
    }, 100)
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
        let b64split = resp2.split(',');
        b64image = b64split[1];
        this.backimage = b64image;
        this.backfile = webpath;
        // alert("backimage = " + this.backimage);
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
        // alert("backimage = " + this.backimage);
      }
    })
  }

  checkdname() {
    let dn = (<HTMLInputElement>document.getElementById('dname')).value;
    if (dn.length < 1) {
      document.getElementById('dname').style.backgroundColor = '#f9b6ac';
    }
    else {
      document.getElementById('dname').style.backgroundColor = "#ffffff";
    }
  }

  checkdphone() {
    let dphn = (<HTMLInputElement>document.getElementById('dphone')).value;
    if (dphn.length < 10) {
      document.getElementById('dphone').style.backgroundColor = "#f9b6ac";
    }
    else {
      document.getElementById('dphone').style.backgroundColor = "#ffffff";
    }
  }

  changephone() {
    this.route.navigate(['/pages/profile/changephone/' + this.driverphone + '/' + this.driverid]);
  }

  viewbookings() {
    this.bgmode.disable();
    this.localpush.clearAll();
    clearInterval(this.intervalset01);
/*(<HTMLAudioElement>document.getElementById('bgalert')).pause();*/
    this.route.navigate(['/pages/viewbookings']);
  }

 

}

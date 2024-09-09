import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AlertController, LoadingController, ModalController, Platform, ToastController } from '@ionic/angular';
import { ServicesService } from '../services.service';
import { AppVersion } from '@awesome-cordova-plugins/app-version/ngx';
import { Network } from '@ionic-native/network/ngx';
import {
  GoogleMaps,
  GoogleMap,
  GoogleMapsEvent,
  GoogleMapOptions,
  CameraPosition,
  MarkerOptions,
  Marker,
  MarkerIcon,
  Environment
} from '@ionic-native/google-maps';
import { Geolocation } from '@ionic-native/geolocation/ngx';
import { TermsandconditionsPage } from './termsandconditions/termsandconditions.page';

@Component({
  selector: 'app-credentials',
  templateUrl: './credentials.page.html',
  styleUrls: ['./credentials.page.scss'],
})
export class CredentialsPage implements OnInit {
  latitude: number;
  longitude: number;
  map: GoogleMap;
  constructor(
    private route: Router,
    private toast: ToastController,
    private service: ServicesService,
    private loader: LoadingController,
    private alert: AlertController,
    private platform: Platform,
    private geolocation: Geolocation,
    private modal: ModalController,
    private appversion: AppVersion,
    private network: Network,
  ) { 
    //this.initializeApp();
    if (!!localStorage.getItem('driver_data') && JSON.parse(localStorage.getItem('driver_data')).id > 0) {
      this.route.navigate(['/pages/home']).then(() => {
        window.location.reload();
      })
    }
  }

  initializeApp() {
   
    this.network.onDisconnect().subscribe(() => {
      this.networkDisconectedAlert();
    });

    this.network.onConnect().subscribe(() => {
      /*setTimeout(() => {
         this.networkConectedAlert();
        
      }, 3000);*/
    });
}

async networkConectedAlert() {

  const alert = await this.alert.create({

    message: 'Network connected!',
    buttons: ['OK']
  });

  await alert.present();
}


async networkDisconectedAlert() {

  const alert = await this.alert.create({

   /* message: 'No Internet available on your device. Please check your Internet connection',
    buttons: [{
      text: 'Ok',
      handler: () => {
      //app is closing when user click on ok 
        navigator['app'].exitApp();  
      }
    }]*/
    message: 'No Internet available on your device. Please check your Internet connection',
    buttons: ['OK']
  });

  await alert.present();
}

  async ngOnInit() {
    this.platform.ready().then(async () => {

      this.platform.backButton.subscribeWithPriority(9999, () => {
        document.addEventListener('backbutton', function (event) {
          event.preventDefault();
          event.stopPropagation();
        }, false);
      });
      // map permission:
      this.geolocation.getCurrentPosition().then((resp) => {
        this.latitude = Number(resp.coords.latitude);
        this.longitude = Number(resp.coords.longitude);
      });

      Environment.setEnv({
        API_KEY_FOR_BROWSER_RELEASE: "AIzaSyDCPECNz5hz4jQ4fu7o6GJgCHeBrdgWu7c",
        API_KEY_FOR_BROWSER_DEBUG: "AIzaSyDCPECNz5hz4jQ4fu7o6GJgCHeBrdgWu7c"
      });

      let mapOptions: GoogleMapOptions = {

        camera: {
          target: {
            lat: this.latitude,
            lng: this.longitude
          },
          zoom: 18,
          tilt: 30
        },

      };

      this.map = GoogleMaps.create('map_canvas', mapOptions);
      //--------------------

      let ar1 = this.alert.create({
        message: 'Welcome......'
      });
      (await ar1).present().then(() => {
        setTimeout(() => {
          this.alert.dismiss();
                    
        }, 100);
      })

      this.appversion.getVersionCode().then((resp) => {
        let vcode = resp;           
                
        this.service.CheckDriverVersionService().subscribe(
          async data => { 

            /*const alert = await this.alert.create({
              header: 'Alert',
              subHeader: 'App Current Version',
              message: 'current v:' + vcode + " Driver v:" + data.driver_version_code,
              buttons: ['OK'],
            });
        
            await alert.present();*/
            
            if (!!data && data.success == true) {
              if (vcode != data.driver_version_code) {
                document.getElementById('backdrop').style.display = 'block';
                document.getElementById('updationdiv').style.display = 'block';
                return 0;
              }
              else {
                //console.log("app version code =", currentversion);
                if (!!localStorage.getItem('driver_data') && JSON.parse(localStorage.getItem('driver_data')).id > 0) {
                  let ld = this.loader.create({
                    message: "Signing in......",
                    // duration: 1200
                  });
                  (await ld).present();
                  let driverid = Number(JSON.parse(localStorage.getItem('driver_data')).id);
                  let jd = {
                    driver_id: driverid
                  }
                  this.service.DriverAutoLoginService(jd).subscribe(
                    async data => {
                      console.log("auto login data : ", data);

                      if (!!data && data.success == true) {
                        this.loader.dismiss();

                        localStorage.setItem('driver_data', JSON.stringify(data));
                        this.route.navigate(['/pages/home']).then(() => {
                          window.location.reload();
                        })
                        
                      }
                      else {
                        this.loader.dismiss();
                        let ar = this.alert.create({
                          message: 'Sorry! Please try Re-Login again OR Contact QuickCab Support for assistance.',
                          buttons: ['OK']
                        });
                        (await ar).present();
                      }
                    }
                  )
                }
              }
            }
          }
        )

      })

    });
  }

  opengplay() {
    window.open('https://play.google.com/store/apps/details?id=io.ionic.qcdriver', 'system', 'location=yes');
  }

  async gotosignin() {
    let ld = this.loader.create({
      message: "Loading......",
      duration: 1500
    });
    (await ld).present().then(() => {
     this.route.navigate(['/credentials/signin/']).then(() => {
        window.location.reload();
      })

    })

  }

  checkname() {
    let drivername = (<HTMLInputElement>document.getElementById('dname')).value;
    if (drivername.length < 1) {
      document.getElementById('dname').style.backgroundColor = '#f9b6ac';
    }
    else {
      document.getElementById('dname').style.backgroundColor = '#ffffff';
    }
  }

  checkemail() {
    let drivername = (<HTMLInputElement>document.getElementById('demail')).value.trim();
    var mail_format = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    if (drivername.length < 1 || !drivername.match(mail_format)) {
      document.getElementById('demail').style.backgroundColor = '#f9b6ac';
    }
    else {
      document.getElementById('demail').style.backgroundColor = '#ffffff';
    }
  }

  checkphone() {
    let drivername = (<HTMLInputElement>document.getElementById('dphone')).value;
    if (drivername.length < 10) {
      document.getElementById('dphone').style.backgroundColor = '#f9b6ac';
    }
    else {
      document.getElementById('dphone').style.backgroundColor = '#ffffff';
    }
  }

  checkpassword() {
    let drivername = (<HTMLInputElement>document.getElementById('dpassword')).value;
    if (drivername.length < 1) {
      document.getElementById('dpassword').style.backgroundColor = '#f9b6ac';
    }
    else {
      document.getElementById('dpassword').style.backgroundColor = '#ffffff';
    }
  }

  async submitSignup() {
    let ld = this.loader.create({
      message: "Please Wait......"
    });
    (await ld).present();
    let jsondata = {
      driver_name: (<HTMLInputElement>document.getElementById('dname')).value.trim(),
      driver_email: (<HTMLInputElement>document.getElementById('demail')).value.trim(),
      driver_phone: (<HTMLInputElement>document.getElementById('dphone')).value,
      driver_password: (<HTMLInputElement>document.getElementById('dpassword')).value,
    }
    console.log(jsondata);

    this.validateall(jsondata);
    let validations = this.validatedata(jsondata);
    if (validations['success'] == false) {
      this.loader.dismiss();
      let tm = this.toast.create({
        message: validations['message'],
        duration: 2000
      });
      (await tm).present();
    }
    else {
      this.service.DriverSignupService(jsondata).subscribe(async (data) => {
        if (!!data && data['success'] == true) {
       
          this.loader.dismiss();

          if(data.otp_option == false){
            let ar = this.alert.create({
              message: data.msg
            });
            (await ar).present();

            setTimeout(() => {
              this.alert.dismiss();
              this.route.navigate(['/credentials/signin/']).then(() => {
                window.location.reload();
              })
            }, 2000);
          }else{
            this.route.navigate(['/credentials/signupotp/' + data.driver_id]);
          }

        }
        else {
          this.loader.dismiss();
          let tm = this.toast.create({
            message: data['msg'],
            duration: 2500
          });
          (await tm).present();
        }
      })
    }
  }

  validateall(jsondata) {
    var mail_format = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    if (jsondata['driver_name'].length < 1 || jsondata['driver_name'] == null || jsondata['driver_name'] == undefined) {
      document.getElementById('dname').style.backgroundColor = '#f9b6ac';
    }
    if (jsondata['driver_email'].length < 1 || jsondata['driver_email'] == null || jsondata['driver_email'] == undefined || !jsondata['driver_email'].match(mail_format)) {
      document.getElementById('demail').style.backgroundColor = '#f9b6ac';
    }
    if (jsondata['driver_phone'].length < 10 || jsondata['driver_phone'] == null || jsondata['driver_phone'] == undefined) {
      document.getElementById('dphone').style.backgroundColor = '#f9b6ac';
    }
    if (jsondata['driver_password'] == null || jsondata['driver_password'] == undefined || jsondata['driver_password'].length < 6) {
      document.getElementById('dpassword').style.backgroundColor = '#f9b6ac';
    }
    if (!(<HTMLInputElement>document.getElementById('checkterms')).checked) {
      document.getElementById('tncbox').style.backgroundColor = '#f9b6ac';
    }
  }
  validatedata(jsondata) {
    var mail_format = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    if (jsondata['driver_name'].length < 1 || jsondata['driver_name'] == null || jsondata['driver_name'] == undefined) {
      let codes = {
        success: false,
        message: "Please Enter Your Name"
      }
      return codes;
    }
    else {
      if (jsondata['driver_email'].length < 1) {
        let codes = {
          success: false,
          message: "Please Enter Your Email"
        }
        return codes;
      }
      else {
        if (!jsondata['driver_email'].match(mail_format)) {
          let codes = {
            success: false,
            message: "Please Provide A Valid Email"
          }
          return codes;
        }
        else {
          if (jsondata['driver_phone'].length == 0 || jsondata['driver_phone'] == null || jsondata['driver_phone'] == undefined) {
            let codes = {
              success: false,
              message: "Please Enter Your Phone Number"
            }
            return codes;
          }
          else {
            if (jsondata['driver_phone'].length < 10) {
              let codes = {
                success: false,
                message: "Please Provide A Valid Phone Number"
              }
              return codes;
            }
            else {
              if (jsondata['driver_password'].length < 1) {
                let codes = {
                  success: false,
                  message: "Please Enter Your Password"
                }
                return codes;
              }
              else {
                if (jsondata['driver_password'].length < 6) {
                  let codes = {
                    success: false,
                    message: "Password Should Be Minimum Of 6 Characters!"
                  }
                  return codes;
                }
                else {
                  if (!(<HTMLInputElement>document.getElementById('checkterms')).checked) {
                    let codes = {
                      success: false,
                      message: "Please Accept Terms And Conditions"
                    }
                    return codes;
                  }
                  else {
                    let codes = {
                      success: true,
                      message: "All Data Validated"
                    }
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


  async opentc() {

    let md = this.modal.create({
      component: TermsandconditionsPage
    });
    (await md).present();
  }


}

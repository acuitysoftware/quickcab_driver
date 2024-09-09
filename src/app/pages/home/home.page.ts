import { Component, OnInit } from '@angular/core';
import { LoadingController, MenuController, Platform, ToastController, AlertController, ModalController} from '@ionic/angular';
import { Geolocation } from '@ionic-native/geolocation/ngx';
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
  Environment,
  LatLng,
  GoogleMapsMapTypeId
} from '@ionic-native/google-maps';

import { ServicesService } from 'src/app/services.service';
import { Router, NavigationEnd } from '@angular/router';
import { BackgroundMode } from '@awesome-cordova-plugins/background-mode/ngx';
import { ViewbookingsPage } from '../viewbookings/viewbookings.page';
import { Diagnostic } from '@ionic-native/diagnostic';
@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
})
export class HomePage implements OnInit {
 
  driverid = JSON.parse(localStorage.getItem('driver_data')).id;
  car_image = JSON.parse(localStorage.getItem('driver_data')).car_image;
  latitude: number;
  longitude: number;
  map: GoogleMap;
  linestate = 0;
  newreq = 0;
  onoffstate = "Offline";
  drivername = "";
  myintv: any;
  already_trip: any;
  isAndroid = false;
  constructor(
    private menu: MenuController,
    private geolocation: Geolocation,
    private platform: Platform,
    private loader: LoadingController,
    private service: ServicesService,
    private route: Router,
    private toast: ToastController,
    private backgroundmode: BackgroundMode,
    private network: Network,
    private alert: AlertController,
    public modalController: ModalController,
  ) { 
   // this.initializeApp();
    this.newreq = 0;

      platform.ready().then(() => {
        
       /*Diagnostic.isLocationEnabled().then((res) => {
          console.log(res);
          if(!res && this.platform.is('cordova')){
            //handle confirmation window code here and then call switchToLocationSettings
            Diagnostic.switchToLocationSettings();
          }
        }).catch((err) =>  {
          console.log('got an error using diagnostic');
          console.dir(err);
        });*/

      });
    
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

    /*message: 'No Internet available on your device. Please check your Internet connection',
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
    if(this.myintv){
      clearInterval(this.myintv);
    }
    if (this.already_trip) {
      clearInterval(this.already_trip);
    }
  }


  async ngOnInit() {
    this.platform.ready().then(async () => {
      this.newreq = 0;

      //this.backgroundmode.enable();

      if (this.platform.platforms().includes("android")){
          this.isAndroid = true
      }

      this.platform.backButton.subscribeWithPriority(9999, () => {
        document.addEventListener('backbutton', function (event) {
          event.preventDefault();
          event.stopPropagation();
        }, false);
      });      
     

      this.geolocation.getCurrentPosition().then((resp) => {
        this.latitude = Number(resp.coords.latitude);
        this.longitude = Number(resp.coords.longitude);
      });
      let flagstate = 0;
      if (this.onoffstate == "Online") {
        flagstate = 0
      }
      else {
        flagstate = 2
      }
      let servicedata = {
        driver_id: this.driverid,
        latitude: this.latitude,
        longitude: this.longitude,
        flag: flagstate
      };
      console.log("loc data inp first = ", servicedata);

      this.service.SendDriverLocationService(servicedata).subscribe(
        async data => {
          console.log("location data first = ", data);

          if (!!data && data.success == true) {
            if (data.flag == 1) {

              if(data.current_status_of_ride == 2){
                this.route.navigate(['/pages/ridedirection/'+ data.ride_id]);
              }else if(data.current_status_of_ride == 3){
                this.route.navigate(['/pages/ongoingtrip/' + data.ride_id]);
              }else{
                let tm = this.toast.create({
                  message: "You have confirmed a ride or already on a trip. Please Cancel any confirmed ride or complete the ongoing trip!",
                  duration: 3500
                });
                (await tm).present().then(() => {
                  /*this.route.navigate(['/pages/bookinghistory']).then(() => {
                    window.location.reload();
                  })*/
                  this.route.navigate(['/pages/bookinghistory']);
                })
              }
             
             
             /* let tm = this.toast.create({
                message: "You have confirmed a ride or already on a trip. Please Cancel any confirmed ride or complete the ongoing trip!",
                duration: 3500
              });
              (await tm).present().then(() => {
                this.route.navigate(['/pages/bookinghistory']).then(() => {
                  window.location.reload();
                })
                this.route.navigate(['/pages/bookinghistory']);
              })*/



            }
          }
        }
      );

      let servdata = {
        driver_id: this.driverid
      }
      this.service.GetDriverDetailsService(servdata).subscribe(
        data => {
          if (!!data && data.success == true) {
            this.drivername = data.driver_details.driver_name;
          }
        }
      )

      let ld = this.loader.create({
        message: "Loading Map",
        duration: 5000
      });
      (await ld).present().then(() => {
       

        this.already_trip = setInterval(() => {

          this.geolocation.getCurrentPosition().then((resp) => {
            this.latitude = Number(resp.coords.latitude);
            this.longitude = Number(resp.coords.longitude);
            console.log(resp);
            let flagstate = 0;
            if (this.onoffstate == "Online") {
              flagstate = 0
            }
            else {
              flagstate = 2
            }
            let servicedata = {
              driver_id: this.driverid,
              latitude: resp.coords.latitude,
              longitude: resp.coords.longitude,
              flag: flagstate
            };
            console.log("loc data ", servicedata);

            this.service.SendDriverLocationService(servicedata).subscribe(
              async data => {
                console.log("location data = ", data);

                if (!!data && data.success == true) {
                  
                  if (data.flag == 1) {

                    if(data.current_status_of_ride == 2){
                      this.route.navigate(['/pages/ridedirection/'+ data.ride_id]);
                    }else if(data.current_status_of_ride == 3){
                      this.route.navigate(['/pages/ongoingtrip/' + data.ride_id]);
                    }else{
                      let tm = this.toast.create({
                        message: "You have confirmed a ride or already on a trip. Please Cancel any confirmed ride or complete the ongoing trip!",
                        duration: 3500
                      });
                      (await tm).present().then(() => {
                        /*this.route.navigate(['/pages/bookinghistory']).then(() => {
                          window.location.reload();
                        })*/
                        if (this.already_trip) {
                          clearInterval(this.already_trip);
                        }
                        this.route.navigate(['/pages/bookinghistory']);
                      })
                    }
                    
                    /*let tm = this.toast.create({
                      message: "You have confirmed a ride or already on a trip. Please Cancel any confirmed ride or complete the ongoing trip!",
                      duration: 3500
                    });
                    (await tm).present().then(() => {
                      this.route.navigate(['/pages/bookinghistory']).then(() => {
                        window.location.reload();
                      })
                      if (this.already_trip) {
                        clearInterval(this.already_trip);
                      }
                      this.route.navigate(['/pages/bookinghistory']);
                    })*/


                  }
                }
              }
            );

          });

        }, 6000);

        this.geolocation.getCurrentPosition().then((resp) => {
          this.latitude = Number(resp.coords.latitude);
          this.longitude = Number(resp.coords.longitude);

          Environment.setEnv({
            API_KEY_FOR_BROWSER_RELEASE: "AIzaSyDCPECNz5hz4jQ4fu7o6GJgCHeBrdgWu7c",
            API_KEY_FOR_BROWSER_DEBUG: "AIzaSyDCPECNz5hz4jQ4fu7o6GJgCHeBrdgWu7c"
          });
      
          this.loadMap();
        });
      });

      let state = localStorage.getItem('line_status');
      if (state == "true") {
        this.linestate = 1;
        this.onoffstate = "Online";
        document.getElementById('offlinediv').style.display = 'none';
        (<HTMLInputElement>document.getElementById('onofftoggle')).checked = true;
        this.userbookings();
      }
      else {
        this.newreq = 0;
        this.linestate = 0;
        this.onoffstate = "Offline";
        document.getElementById('offlinediv').style.display = 'block';
      }
    });
  }

  

  async userbookings() {
    let servicedata = {
      driver_id: this.driverid
    };

    this.myintv = setInterval(async () => {
      this.service.GetUserBookingsService(servicedata).subscribe(
        async data => {
          if (!!data && data.success == true) {
            let requests = data.booked_users.length;
            if (requests > 0) {
              /*this.playAudio();
              this.newreq = requests;
              let tm = this.toast.create({
                message: "You have new Booking requests. Redirecting to Accept/Reject Bookings......",
                duration: 2000
              });
              (await tm).present().then(async () => {
                clearInterval(this.myintv);
                if (this.already_trip) {
                  clearInterval(this.already_trip);
                }
                this.route.navigate(['/pages/viewbookings']);
              })*/

              this.presentModal();  
            }
            else {
              this.newreq = 0;
            }
          }else{
            this.newreq = 0;
          }
        }
      );
    }, 6000);
  }

  async presentModal() {
    clearInterval(this.myintv);
    const modal = await this.modalController.create({
      component: ViewbookingsPage,
      cssClass: 'request-model-class',
      componentProps: {}
    });
    return await modal.present();
  }

  async loadMap() {
    /*if (document.URL.startsWith('http')){
      Environment.setEnv({
        API_KEY_FOR_BROWSER_RELEASE: "AIzaSyDCPECNz5hz4jQ4fu7o6GJgCHeBrdgWu7c",
        API_KEY_FOR_BROWSER_DEBUG: "AIzaSyDCPECNz5hz4jQ4fu7o6GJgCHeBrdgWu7c"
      });
    }*/

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
        zoom: 19,
        tilt: 60
      },
      mapType: GoogleMapsMapTypeId.ROADMAP
    };

    this.map = GoogleMaps.create('map_canvas', mapOptions);

    let icon: MarkerIcon = {
      url: this.car_image,
      size: {
        width: 45,
        height: 60
      }
    };

    setInterval(() => {
      this.map.clear();

      let marker: Marker = this.map.addMarkerSync({
        'title': 'You Are Here',
        'icon': icon,
        'animation': 'none',
        'position': {
          'lat': this.latitude,
          'lng': this.longitude
        }
      });

      this.map.animateCamera({
        target: {
          lat: this.latitude,
          lng: this.longitude
        },
        zoom: 19,
        tilt: 60
      }) 

    }, 20000);

  }


  menuon() {
    this.menu.open('menu')
  }

  toggleactive() {
    if (this.linestate == 0) {
      localStorage.setItem('line_status', 'true');
      this.linestate = 1;
      this.onoffstate = "Online";
      this.userbookings();
      document.getElementById('offlinediv').style.display = 'none';
      let jd = {
        driver_id: this.driverid,
        latitude: this.latitude,
        longitude: this.longitude,
        flag: 0
      }
      this.service.SendDriverLocationService(jd).subscribe(
        data => {
          console.log(data);
        }
      )
    }
    else {
      localStorage.setItem('line_status', 'false');
      this.linestate = 0;
      this.onoffstate = "Offline";
      document.getElementById('offlinediv').style.display = 'block';
      let jd = {
        driver_id: this.driverid,
        latitude: this.latitude,
        longitude: this.longitude,
        flag: 2
      }
      this.service.SendDriverLocationService(jd).subscribe(
        data => {
          console.log(data);
        }
      )
    }

  }

  gotobookings() {
    this.backgroundmode.disable();
    /*this.route.navigate(['/pages/viewbookings']).then(() => {
      window.location.reload();
    })*/
    if (this.already_trip) {
      clearInterval(this.already_trip);
    }

    this.route.navigate(['/pages/viewbookings']);
  }

  refreshpage() {
    window.location.reload();
  }

  


}

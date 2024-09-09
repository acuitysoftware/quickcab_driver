import { HttpClient } from '@angular/common/http';
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { BackgroundMode } from '@awesome-cordova-plugins/background-mode/ngx';
import { CallNumber } from '@awesome-cordova-plugins/call-number/ngx';
import { Geolocation } from '@ionic-native/geolocation/ngx';
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
  GoogleMapsMapTypeId
} from '@ionic-native/google-maps';
import { LoadingController, MenuController, Platform, ToastController } from '@ionic/angular';
import { ServicesService } from 'src/app/services.service';

declare var google;

@Component({
  selector: 'app-tripotp',
  templateUrl: './tripotp.page.html',
  styleUrls: ['./tripotp.page.scss'],
})
export class TripotpPage implements OnInit {
  @ViewChild('gmap', { static: false }) mapElement: ElementRef;
  gmap: any;
  driverid = JSON.parse(localStorage.getItem('driver_data')).id;
  car_image = JSON.parse(localStorage.getItem('driver_data')).car_image;
  latitude: number;
  longitude: number;
  map: GoogleMap;
  rideid;
  customername = "";
  startaddress = "";
  endaddress = "";
  rideinfo;
  customerid;
  profileimage = "https://quickcabtaxiservice.com/storage/app/public/customer.png";
  imagepath = "https://quickcabtaxiservice.com/storage/app/public/";
  estdprice = 0;
  customerphone = "";
  carrate: number;
  carname = "";
  tripType = 0;
  map_marker: any;
  myinterval: any;
  myinterval2: any;
  constructor(
    private menu: MenuController,
    private geolocation: Geolocation,
    private platform: Platform,
    private loader: LoadingController,
    private service: ServicesService,
    private route: Router,
    private activatedroute: ActivatedRoute,
    private http: HttpClient,
    private toast: ToastController,
    private call: CallNumber,
    private backgroundservice: BackgroundMode,
  ) { }

  async ionViewWillLeave(){
    if(this.myinterval){
      clearInterval(this.myinterval);
    }
    if(this.myinterval2){
      clearInterval(this.myinterval2);
    }
   
  }

  async ngOnInit() {
    this.platform.ready().then(async () => {
      this.backgroundservice.enable();
      this.platform.backButton.subscribeWithPriority(9999, () => {
        document.addEventListener('backbutton', function (event) {
          event.preventDefault();
          event.stopPropagation();
        }, false);
      });
      this.geolocation.getCurrentPosition().then(async (resp) => {
        let ld = this.loader.create({
          message: "Loading Map...",
        });
        (await ld).present();
        this.latitude = Number(resp.coords.latitude);
        this.longitude = Number(resp.coords.longitude);

        Environment.setEnv({
          API_KEY_FOR_BROWSER_RELEASE: "AIzaSyDCPECNz5hz4jQ4fu7o6GJgCHeBrdgWu7c",
          API_KEY_FOR_BROWSER_DEBUG: "AIzaSyDCPECNz5hz4jQ4fu7o6GJgCHeBrdgWu7c"
        });

        setTimeout(() => {
          this.loadMap();
        },500);

      });

      this.activatedroute.params.subscribe(async data => {
        let rideid = data.tripid;
        this.rideid = rideid;
        let servicedata = {
          ride_id: rideid
        }
        let ld = this.loader.create({
          message: 'Loading Data......'
        });
        //(await ld).present();
          this.service.GetRideDetailsService(servicedata).subscribe(
            async data => {
              console.log("rides dets : ", data);

              let ridedetails = data.ride_details;
              this.rideinfo = ridedetails[0];
              this.tripType = ridedetails[0].tripType;
              this.customername = ridedetails[0].customer_name;
              if (ridedetails[0].customer_image != null) {
                this.profileimage = this.imagepath + ridedetails[0].customer_image;
              }

              if(this.tripType == 2 && ridedetails[0].current_status == 4){
                this.carrate = data.price_value;
                this.estdprice = Math.round(data.totalprice);
                this.customerphone = ridedetails[0].customer_phone;
                this.startaddress = ridedetails[0].round_start_address;
                this.endaddress = ridedetails[0].round_end_address;
                this.customerid = ridedetails[0].user_id;
                let stloc = ridedetails[0].round_trip_start_location;
                let stlocsplit = stloc.split(",");
                let stloccoord = {
                  lat: stlocsplit[0],
                  lng: stlocsplit[1]
                };
                this.rideinfo.start_coords = stloccoord;
                let eloc = ridedetails[0].round_trip_end_location;
                let elocsplit = eloc.split(",");
                let eloccoord = {
                  lat: elocsplit[0],
                  lng: elocsplit[1]
                };
                this.rideinfo.end_coords = eloccoord;
                console.log(this.rideinfo);
                this.loader.dismiss();

              }else{
                this.carrate = data.price_value;
                this.estdprice = Math.round(data.totalprice);
                this.customerphone = ridedetails[0].customer_phone;
                this.startaddress = ridedetails[0].start_address;
                this.endaddress = ridedetails[0].end_address;
                this.customerid = ridedetails[0].user_id;
                let stloc = ridedetails[0].trip_start_location;
                let stlocsplit = stloc.split(",");
                let stloccoord = {
                  lat: stlocsplit[0],
                  lng: stlocsplit[1]
                };
                this.rideinfo.start_coords = stloccoord;
                let eloc = ridedetails[0].trip_end_location;
                let elocsplit = eloc.split(",");
                let eloccoord = {
                  lat: elocsplit[0],
                  lng: elocsplit[1]
                };
                this.rideinfo.end_coords = eloccoord;
                console.log(this.rideinfo);
                this.loader.dismiss();
              }
              this.loader.dismiss();

            }
          )
         
        })
    
      this.myinterval = setInterval(() => {
        this.geolocation.getCurrentPosition().then((resp) => {
          this.latitude = Number(resp.coords.latitude);
          this.longitude = Number(resp.coords.longitude);
          console.log(resp);
          let flagstate = 0;
          let flagval = localStorage.getItem('line_status');
          if (flagval == 'true') {
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
          this.service.SendDriverLocationService(servicedata).subscribe(
            data => {
              if (!!data && data.success == true) {
                console.log("data sent for driver location and flag");
              }
            }
          )
        });

        let servicedata = {
          ride_id: this.rideid
        }
        this.service.GetRideDetailsService(servicedata).subscribe(
          async data => {
            let ridedetails = data.ride_details[0];
            if (ridedetails.current_status == 5) {
                clearInterval(this.myinterval);
                let tm = this.toast.create({
                  message: 'Customer Cancelled This Ride',
                  duration: 3000,
                  color: 'white'
                });
                (await tm).present().then(async () => {
                  let ld = this.loader.create({
                    message: "Ride Cancelled. Redirecting......",
                    duration: 5000,
                  });
                  (await ld).present().then(() => {
                    this.route.navigate(['/pages/home']).then(() => {
                      window.location.reload();
                    })
                    //this.route.navigate(['/pages/home']);
                  })
                })
            }else if(ridedetails.round_current_status == 5){
              clearInterval(this.myinterval);
                let tm = this.toast.create({
                  message: 'Customer Cancelled This Ride',
                  duration: 3000,
                  color: 'white'
                });
                (await tm).present().then(async () => {
                  let ld = this.loader.create({
                    message: "Ride Cancelled. Redirecting......",
                    duration: 5000,
                  });
                  (await ld).present().then(() => {
                    this.route.navigate(['/pages/home']).then(() => {
                      window.location.reload();
                    })
                    //this.route.navigate(['/pages/home']);
                  })
                })
            }
          },
          err => {
            console.log("Error ! Trying next !");
          }
        );
      }, 20000);
    });
  }

  async loadMap() {
    this.loader.dismiss();

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
        tilt: 60
      },
      mapType: GoogleMapsMapTypeId.ROADMAP,
    };

    this.map = GoogleMaps.create('map_canvas', mapOptions);

    
    this.map.one(GoogleMapsEvent.MAP_READY).then((data: any) => {
      let icon: MarkerIcon = {
        url: this.car_image,
        size: {
          width: 45,
          height: 60
        }
      };
      
      this.map.addMarker({
        'title': 'You Are Here',
        'icon': icon,
        'animation': 'none',
        'position': {
          'lat': this.latitude,
          'lng': this.longitude
        }
      }).then((marker: Marker) => {
        this.map_marker = marker;
      });
    
    })

    
    this.myinterval2 = setTimeout(() => {
     
      let starticon: MarkerIcon = {
        url: 'https://quickcabtaxiservice.com/storage/app/public/pickupmarker.png',
        size: {
          width: 35,
          height: 40
        }
      };
  
      let endicon: MarkerIcon = {
         url: 'https://quickcabtaxiservice.com/storage/app/public/dropoffmarker.png',
         size: {
           width: 35,
           height: 40
         }
       };
     
      this.map.addMarker({
        'title': 'Pick Up Point',
        'icon': starticon,
        'animation': 'none',
        'position': this.rideinfo.start_coords
      }).then((marker_start: Marker) => {
        
      });

      this.map.addMarker({
        'title': 'Drop Off Point',
        'icon': endicon,
        'animation': 'none',
        'position': this.rideinfo.end_coords
      }).then((marker_end: Marker) => {
        
      });


      let dirservice_pre = new google.maps.DirectionsService;

      if(this.rideinfo.tripType == 2){
        if(this.rideinfo.current_status == 4){

          console.log(this.rideinfo.start_coords);
          console.log(this.rideinfo.end_coords);


            dirservice_pre.route({
              origin: this.rideinfo.start_coords,
              destination: this.rideinfo.end_coords,
              travelMode: 'DRIVING'
            }, (resp, status) => {
              let steps = resp.routes[0].legs[0].steps;
              let paths = [];
              for (let i = 0; i < steps.length; i++) {
                let pathlat = steps[i].path[0].lat();
                let pathlng = steps[i].path[0].lng();
                let pathcoord = { lat: pathlat, lng: pathlng };
                paths.push(pathcoord);
              }

              this.map.moveCamera({
                target: paths,
                zoom: 18,
                tilt: 30,
              }).then(() => {
                //alert("Camera target has been changed");
                console.log(resp.coords);
              });

              let polylineoptions = {
                points: paths,
                color: '#333',
                width: 6
              };
              this.map.addPolyline(polylineoptions);
            });
          }else{
            dirservice_pre.route({
              origin: this.rideinfo.start_coords,
              destination: this.rideinfo.end_coords,
              travelMode: 'DRIVING'
            }, (resp, status) => {
              let steps = resp.routes[0].legs[0].steps;
              let paths = [];
              for (let i = 0; i < steps.length; i++) {
                let pathlat = steps[i].path[0].lat();
                let pathlng = steps[i].path[0].lng();
                let pathcoord = { lat: pathlat, lng: pathlng };
                paths.push(pathcoord);
              }

              this.map.moveCamera({
                target: paths,
                zoom: 18,
                tilt: 30,
              }).then(() => {
                //alert("Camera target has been changed");
                console.log(resp.coords);
              });

              let polylineoptions = {
                points: paths,
                color: '#333',
                width: 6
              };
              this.map.addPolyline(polylineoptions);
            });
          }
  
      }else{
        dirservice_pre.route({
          origin: this.rideinfo.start_coords,
          destination: this.rideinfo.end_coords,
          travelMode: 'DRIVING'
        }, (resp, status) => {
          let steps = resp.routes[0].legs[0].steps;
          let paths = [];
          for (let i = 0; i < steps.length; i++) {
            let pathlat = steps[i].path[0].lat();
            let pathlng = steps[i].path[0].lng();
            let pathcoord = { lat: pathlat, lng: pathlng };
            paths.push(pathcoord);
          }

          this.map.moveCamera({
            target: paths,
            zoom: 18,
            tilt: 30,
          }).then(() => {
            //alert("Camera target has been changed");
            console.log(resp.coords);
          });

          let polylineoptions = {
            points: paths,
            color: '#333',
            width: 6
          };
          this.map.addPolyline(polylineoptions);
        });
      }
    },5000);

    /*setInterval(() => {
      this.map.clear();
     
      this.map.animateCamera({
        target: { lat: this.latitude, lng: this.longitude },
        zoom: 16,
        tilt: 60
      }).then(() => {
        this.loader.dismiss();
      })

     let dirservice2 = new google.maps.DirectionsService;
      dirservice2.route({
        origin: { lat: this.latitude, lng: this.longitude },
        destination: this.rideinfo.trip_start_location,
        travelMode: 'DRIVING'
      }, (resp, status) => {
        let steps = resp.routes[0].legs[0].steps;
        let paths = [];
        for (let i = 0; i < steps.length; i++) {
          let pathlat = steps[i].path[0].lat();
          let pathlng = steps[i].path[0].lng();
          let pathcoord = { lat: pathlat, lng: pathlng };
          paths.push(pathcoord);
        }
        let polylineoptions = {
          points: paths,
          color: '#333',
          width: 5
        };
        this.map.addPolyline(polylineoptions);
      });

    }, 10000);*/

  }
  checkotp() {
    let otpvalue = (<HTMLInputElement>document.getElementById('ride_otp')).value;
    if (otpvalue.length < 4 || otpvalue == "") {
      document.getElementById('ride_otp').style.backgroundColor = "#f9b6ac";
    }
    else {
      document.getElementById('ride_otp').style.backgroundColor = "#ffffff";
    }
  }


  async starttrip() {
    let servicedata = {
      driver_id: this.driverid,
      user_id: this.customerid,
      current_status: 3,
      otp: (<HTMLInputElement>document.getElementById('ride_otp')).value
    }
    this.validateall(servicedata);
    let validations = this.validatedata(servicedata);
    if (validations['success'] == false) {
      let tm = this.toast.create({
        message: validations['message'],
        duration: 2500
      });
      (await tm).present();
    }
    else {
      let ld = this.loader.create({
        message: 'Starting Trip.......'
      });
      (await ld).present().then(() => {
        this.service.StartTripService(servicedata).subscribe(
          async data => {
            if (!!data && data.success == true) {
              this.loader.dismiss();
              this.backgroundservice.disable();
             this.route.navigate(['/pages/ongoingtrip/' + this.rideid]).then(() => {
                window.location.reload();

              })

            }
            else {
              this.loader.dismiss();
             let tm = this.toast.create({
                message: "Sorry! Invalid OTP. Please try again.",
                duration: 2500,
              });
              (await tm).present();
              
            }
          }
        );
      });

    }
  }

  validateall(jd) {
    let otpvalue = jd['otp'];
    if (otpvalue.length < 4 || otpvalue == "") {
      document.getElementById('ride_otp').style.backgroundColor = "#f9b6ac";
    }
  }

  validatedata(jd) {
    if (jd['otp'] == "") {
      let codes = {
        success: false,
        message: "Please Enter The OTP To Proceed"
      };
      return codes;
    }
    else {
      if (jd['otp'].length < 4) {
        let codes = {
          success: false,
          message: "Please Enter A Valid OTP"
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


  callcustomer() {
    this.call.callNumber(this.customerphone, true);
  }

}

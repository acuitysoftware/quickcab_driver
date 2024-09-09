import { HttpClient } from '@angular/common/http';
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Geolocation } from '@ionic-native/geolocation/ngx';
import { LaunchNavigator, LaunchNavigatorOptions } from '@awesome-cordova-plugins/launch-navigator/ngx';
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
  GoogleMapsMapTypeId,
  
} from '@ionic-native/google-maps';
import { LoadingController, MenuController, Platform, ToastController } from '@ionic/angular';
import { ServicesService } from 'src/app/services.service';
import { CallNumber } from '@awesome-cordova-plugins/call-number/ngx';
import { BackgroundMode } from '@awesome-cordova-plugins/background-mode/ngx';

declare var google;
@Component({
  selector: 'app-ridedirection',
  templateUrl: './ridedirection.page.html',
  styleUrls: ['./ridedirection.page.scss'],
})
export class RidedirectionPage implements OnInit {
  @ViewChild('gmap', { static: false }) mapElement: ElementRef;
  gmap: any;
  driverid = JSON.parse(localStorage.getItem('driver_data')).id;
  car_image = JSON.parse(localStorage.getItem('driver_data')).car_image;
  latitude: number;
  longitude: number;
  map: GoogleMap;
  rideid;
  rideinfo;
  customerphone = "";
  map_marker: any;
  pre_latitude: number;
  pre_longitude: number;
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
    private call: CallNumber,
    private toast: ToastController,
    private navigator: LaunchNavigator,
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
     // this.backgroundservice.enable();

      this.platform.backButton.subscribeWithPriority(9999, () => {
        document.addEventListener('backbutton', function (event) {
          event.preventDefault();
          event.stopPropagation();
        }, false);
      });

      this.activatedroute.params.subscribe(data => {
        let rideid = data.rideid;
        this.rideid = rideid;
        let servicedata = {
          ride_id: rideid
        }
        this.service.GetRideDetailsService(servicedata).subscribe(
          data => {
            let ridedetails = data.ride_details;
            this.rideinfo = ridedetails[0];
            this.customerphone = ridedetails[0].customer_phone;

            if(ridedetails[0].tripType == 2){

              if(ridedetails[0].current_status == 4 && (ridedetails[0].round_current_status == 2 || ridedetails[0].round_current_status == 3)){
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

              }else{
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
              }

            }else{

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

            }
          }
        );
      })
      let ld = this.loader.create({
        message: "Loading Map",
        duration: 3000
      });
      (await ld).present().then(() => {

        this.geolocation.getCurrentPosition().then((resp) => {
          this.latitude = Number(resp.coords.latitude);
          this.longitude = Number(resp.coords.longitude);
          this.loadMap();
        });
      });

      this.myinterval = setInterval(async () => {
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
            if(ridedetails.tripType == 2){

              if (ridedetails.current_status == 5) {
                clearInterval(this.myinterval);
                let tm = this.toast.create({
                  message: 'Customer Cancelled This Ride',
                  duration: 3000
                });
                (await tm).present().then(async () => {
                  let ld = this.loader.create({
                    message: "Ride Cancelled. Redirecting......",
                    duration: 5000
                  });
                  (await ld).present().then(() => {
                    this.route.navigate(['/pages/home']).then(() => {
                      window.location.reload();
                    })
                  })
                })
              }else if(ridedetails.current_status == 4 && (ridedetails.round_current_status == 5 || ridedetails.round_current_status == 6)){
                clearInterval(this.myinterval);
                let tm = this.toast.create({
                  message: 'Customer Cancelled round trip',
                  duration: 3000
                });
                (await tm).present().then(async () => {
                  let ld = this.loader.create({
                    message: "Ride Cancelled. Redirecting......",
                    duration: 5000
                  });
                  (await ld).present().then(() => {
                    this.route.navigate(['/pages/tripsummary/' + ridedetails.id]).then(() => {
                      window.location.reload();
                    })
                  })
                })
              }

            }else{

              if (ridedetails.current_status == 5) {
                clearInterval(this.myinterval);
                let tm = this.toast.create({
                  message: 'Customer Cancelled This Ride',
                  duration: 3000
                });
                (await tm).present().then(async () => {
                  let ld = this.loader.create({
                    message: "Ride Cancelled. Redirecting......",
                    duration: 5000
                  });
                  (await ld).present().then(() => {
                    this.route.navigate(['/pages/home']).then(() => {
                      window.location.reload();
                    })
                  })
                })
              }
            }
          },
          err => {
            console.log("Error ! Trying next !");
          }
        );

      }, 3000);
    });
  }

async radiansToDegrees(x) {
    return x * 180.0 / Math.PI;
}

  async loadMap() {

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
        zoom: 14,
        tilt: 30
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


    this.myinterval2 = setInterval(() => {

      this.geolocation.getCurrentPosition().then((resp) => {
        this.latitude = Number(resp.coords.latitude);
        this.longitude = Number(resp.coords.longitude);

          this.map.clear();
      
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
              'lat': Number(resp.coords.latitude),
              'lng': Number(resp.coords.longitude)
            },
          }).then((marker: Marker) => {
            this.map_marker = marker;
          });

          let starticon: MarkerIcon = {
            url: 'https://quickcabtaxiservice.com/storage/app/public/pickupmarker.png',
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

          let dirservice1 = new google.maps.DirectionsService;

          if(this.rideinfo.tripType == 2){
            if(this.rideinfo.current_status == 4){
              let round_trip_start = this.rideinfo.round_trip_start_location.split(",");
                    let round_trip_start_coods = {
                      lat: Number(round_trip_start[0]),
                      lng: Number(round_trip_start[1])
                    };

                    /*this.map_marker.setPosition({
                      lat: this.latitude,
                        lng: this.longitude
                    });*/

                dirservice1.route({
                  origin: {
                    lat: Number(resp.coords.latitude),
                    lng: Number(resp.coords.longitude)
                  },
                  destination: round_trip_start_coods,
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
                    zoom: 14,
                    tilt: 30,
                  }).then(() => {
                    //alert("Camera target has been changed");
                  });


                  let polylineoptions = {
                    points: paths,
                    color: '#333',
                    width: 6
                  };
                  this.map.addPolyline(polylineoptions);

                });
              }else{

                let trip_start = this.rideinfo.trip_start_location.split(",");
                    let trip_start_coods = {
                      lat: Number(trip_start[0]),
                      lng: Number(trip_start[1])
                    };

                    /*this.map_marker.setPosition({
                      lat: this.latitude,
                        lng: this.longitude
                    });*/

                dirservice1.route({
                  origin: {
                    lat: Number(resp.coords.latitude),
                    lng: Number(resp.coords.longitude)
                  },
                  destination: trip_start_coods,
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
                    zoom: 14,
                    tilt: 30,
                  }).then(() => {
                    //alert("Camera target has been changed");
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

            let trip_start = this.rideinfo.trip_start_location.split(",");
            let trip_start_coods = {
              lat: Number(trip_start[0]),
              lng: Number(trip_start[1])
            };

            /*this.map_marker.setPosition({
              lat: this.latitude,
                lng: this.longitude
            });*/

            dirservice1.route({
              origin: {
                lat: Number(resp.coords.latitude),
                lng: Number(resp.coords.longitude)
              },
              destination: trip_start_coods,
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
                zoom: 14,
                tilt: 30,
              }).then(() => {
                //alert("Camera target has been changed");
              });
              let polylineoptions = {
                points: paths,
                color: '#333',
                width: 6
              };
              this.map.addPolyline(polylineoptions);
            });
          }
      });
    }, 5000);
  }

  async tripotp() {
    let jsondata = {
      ride_id: this.rideid
    }

    /*this.service.DriverLocationReachedService(jsondata).subscribe(
      data => {
        if (!!data && data.success == true) {
          this.backgroundservice.disable();
         this.route.navigate(['/pages/tripotp/' + this.rideid]).then(() => {
            window.location.reload();
          });
        }
      }
    )*/

    let ld = await this.loader.create({
      message: 'Loading ......'
    });
    await ld.present();
    
      this.service.DriverLocationReachedService(jsondata).subscribe(
        data => {
         
          ld.dismiss();

          console.log(data);
          
          if (data.success == true) {
            //this.backgroundservice.disable();
           /* this.route.navigate(['/pages/tripotp/' + this.rideid]).then(() => {
              window.location.reload();
            });*/

            this.route.navigate(['/pages/tripotp/' + this.rideid])

          }
        }
      )
  }

  callcustomer() {
    this.call.callNumber(this.customerphone, true);
  }

  navigatemap() {

    if(this.rideinfo.tripType == 2){

      if(this.rideinfo.current_status == 4){
        let startpoint = this.rideinfo.round_trip_start_location;
        let startpointsplit = startpoint.split(",");
        let startlat = startpointsplit[0];
        let startlng = startpointsplit[1];
    
        let endpoint = this.rideinfo.round_trip_end_location;
        let endpointsplit = endpoint.split(",");
        let endlat = endpointsplit[0];
        let endlng = endpointsplit[1];
        let options: LaunchNavigatorOptions = {
          start: [this.latitude, this.longitude],
          app: this.navigator.APP.GOOGLE_MAPS
        };
        this.navigator.navigate([startlat, startlng], options).then(success => {
          console.log("Successfully launched google navigator");
        },
          error => {
            console.log("Failed to launch Google navigator");
          }
        )

      }else{
        let startpoint = this.rideinfo.trip_start_location;
        let startpointsplit = startpoint.split(",");
        let startlat = startpointsplit[0];
        let startlng = startpointsplit[1];

        let endpoint = this.rideinfo.trip_end_location;
        let endpointsplit = endpoint.split(",");
        let endlat = endpointsplit[0];
        let endlng = endpointsplit[1];
        let options: LaunchNavigatorOptions = {
          start: [this.latitude, this.longitude],
          app: this.navigator.APP.GOOGLE_MAPS
        };
        this.navigator.navigate([startlat, startlng], options).then(success => {
          console.log("Successfully launched google navigator");
        },
          error => {
            console.log("Failed to launch Google navigator");
          }
        )
      }

    }else{
      let startpoint = this.rideinfo.trip_start_location;
      let startpointsplit = startpoint.split(",");
      let startlat = startpointsplit[0];
      let startlng = startpointsplit[1];
  
      let endpoint = this.rideinfo.trip_end_location;
      let endpointsplit = endpoint.split(",");
      let endlat = endpointsplit[0];
      let endlng = endpointsplit[1];
      let options: LaunchNavigatorOptions = {
        start: [this.latitude, this.longitude],
        app: this.navigator.APP.GOOGLE_MAPS
      };
      this.navigator.navigate([startlat, startlng], options).then(success => {
        console.log("Successfully launched google navigator");
      },
        error => {
          console.log("Failed to launch Google navigator");
        }
      )
    }

  }

}


import { HttpClient } from '@angular/common/http';
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Geolocation, Geoposition, PositionError} from '@ionic-native/geolocation/ngx';
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
  LatLng,
  LatLngBounds,
} from '@ionic-native/google-maps';
import { AlertController, LoadingController, MenuController, Platform, ToastController } from '@ionic/angular';
import { ServicesService } from 'src/app/services.service';
import { LaunchNavigator, LaunchNavigatorOptions } from '@awesome-cordova-plugins/launch-navigator/ngx';
import { BackgroundMode } from '@awesome-cordova-plugins/background-mode/ngx';
declare var google;

@Component({
  selector: 'app-ongoingtrip',
  templateUrl: './ongoingtrip.page.html',
  styleUrls: ['./ongoingtrip.page.scss'],
})
export class OngoingtripPage implements OnInit {
  @ViewChild('gmap', { static: false }) mapElement: ElementRef;
  gmap: any;
  driverid = JSON.parse(localStorage.getItem('driver_data')).id;
  car_image = JSON.parse(localStorage.getItem('driver_data')).car_image;
  latitude: number;
  longitude: number;
  destination_locatoin_str: any;
  trip_end_location_string: any;
  marker_data: any;
  map: GoogleMap;
  rideid;
  customername = "";
  startaddress = "";
  endaddress = "";
  rideinfo;
  customerid;
  carrate: number;
  totprice: number;
  estimated_distance = "";
  estimated_time = "";
  estimated_price = "";
  customerpic = "https://quickcabtaxiservice.com/storage/app/public/customer.png";
  imagepath = "https://quickcabtaxiservice.com/storage/app/public/";
  carname = "";
  tripstarttime;
  driverPositionWatch: any;
  pre_lat: number;
  pre_long: number;
  map_marker: any;
  intervalset01: any;
  intervalset02: any;
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
    private navigator: LaunchNavigator,
    private backgroundservice: BackgroundMode,
    private alert: AlertController,
  ) { }

  async ionViewWillLeave(){
    if(this.intervalset01){
      clearInterval(this.intervalset01);
    }
    if(this.intervalset02){
      clearInterval(this.intervalset02);
    }
  }

  async ngOnInit() {
    this.platform.ready().then(async () => {

       //this.backgroundservice.enable();

      this.platform.backButton.subscribeWithPriority(9999, () => {
        document.addEventListener('backbutton', function (event) {
          event.preventDefault();
          event.stopPropagation();
        }, false);
      });

      // let ls = this.alert.create({
      //   header: "You Resumed Your  Trip.",
      //   message: "Your Trip Resumed At 22-03-2022 04:39:00 AM",
      //   buttons: ['OK'],
      // });
      // (await ls).present();
    

     /* let subscription = this.geolocation.watchPosition().subscribe(position => {
          if ((position as Geoposition).coords != undefined) {
            var geoposition = (position as Geoposition);

            console.log(geoposition.coords);
           
            this.latitude = geoposition.coords.latitude;
            this.longitude = geoposition.coords.longitude;
            console.log('a Latitude: ' + geoposition.coords.latitude + ' - a Longitude: ' + geoposition.coords.longitude);

            this.loadMap();

          } else { 
            var positionError = (position as PositionError);
            console.log('Error ' + positionError.code + ': ' + positionError.message);
          }
      });*/

      this.geolocation.getCurrentPosition().then(async (resp) => {
        let ld = this.loader.create({
          message: 'Fetching Your Location......'
        });
        (await ld).present();
        this.latitude = Number(resp.coords.latitude);
        this.longitude = Number(resp.coords.longitude);
        console.log(resp.coords);
        console.log("starting with latlng: ", this.latitude, " - ", this.longitude);
        this.loadMap();
      });
      this.activatedroute.params.subscribe(async data => {
        let rideid = data.ontripid;
        this.rideid = rideid;
        let servicedata = {
          ride_id: rideid
        }
        let ld = this.loader.create({
          message: 'Loading Data......'
        });
        (await ld).present().then(() => {
          this.service.GetRideDetailsService(servicedata).subscribe(
            async data => {
              let ridedetails = data.ride_details;
              this.rideinfo = ridedetails[0];
              this.carname = ridedetails[0].car_name;
              if (ridedetails[0].customer_image != null) {
                this.customerpic = this.imagepath + ridedetails[0].customer_image;
              }
              if(ridedetails[0].tripType == 2 && ridedetails[0].current_status == 4){
                this.customername = ridedetails[0].customer_name;
                this.startaddress = ridedetails[0].round_start_address;
                this.endaddress = ridedetails[0].round_end_address;
                this.customerid = ridedetails[0].user_id;
                this.carrate = data.price_value;
                this.totprice = Math.round(data.totalprice);
  
                let minutesToAdd = 330;
                let starttime = new Date(ridedetails[0].round_trip_start_time);
                // let newstarttime = new Date(starttime.getTime() + minutesToAdd * 60000);
                this.tripstarttime = starttime;
  
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
                console.log("ride info : ", this.rideinfo);
                this.loader.dismiss();
  
                let startpoint = {
                  lat: Number(stlocsplit[0]),
                  lng: Number(stlocsplit[1])
                }
                let endpoint = {
                  lat: Number(elocsplit[0]),
                  lng: Number(elocsplit[1])
                }
                // this.estimated_distance = ridedetails[0].distance;
                this.estimated_price = ridedetails[0].estimated_price;
                let distanceservice = new google.maps.DistanceMatrixService();
                distanceservice.getDistanceMatrix({
                  origins: [startpoint],
                  destinations: [endpoint],
                  travelMode: 'DRIVING'
                }, (resp, status) => {
                  console.log("estimations:", resp);
                  this.estimated_distance = resp.rows[0].elements[0].distance.text;
                  let esttime = resp.rows[0].elements[0].duration.text;
                  esttime = esttime.replace('Days', 'D');
                  esttime = esttime.replace('Day', 'D');
                  esttime = esttime.replace('Hours', 'H');
                  esttime = esttime.replace('Hour', 'H');
                  esttime = esttime.replace('Mins', 'm');
                  esttime = esttime.replace('Min', 'm');
                  esttime = esttime.replace('days', 'D');
                  esttime = esttime.replace('day', 'D');
                  esttime = esttime.replace('hours', 'H');
                  esttime = esttime.replace('hour', 'H');
                  esttime = esttime.replace('mins', 'm');
                  esttime = esttime.replace('min', 'm');
                  this.estimated_time = esttime;
                });
              }else{

                this.customername = ridedetails[0].customer_name;
                this.startaddress = ridedetails[0].start_address;
                this.endaddress = ridedetails[0].end_address;
                this.customerid = ridedetails[0].user_id;
                this.carrate = data.price_value;
                this.totprice = Math.round(data.totalprice);
  
                let minutesToAdd = 330;
                let starttime = new Date(ridedetails[0].trip_start_time);
                // let newstarttime = new Date(starttime.getTime() + minutesToAdd * 60000);
                this.tripstarttime = starttime;
  
                let stloccoord = {
                  lat: this.latitude,
                  lng: this.longitude
                };

                this.rideinfo.start_coords = stloccoord;
                let eloc = ridedetails[0].trip_end_location;
                let elocsplit = eloc.split(",");
                let eloccoord = {
                  lat: elocsplit[0],
                  lng: elocsplit[1]
                };
                this.rideinfo.end_coords = eloccoord;
                console.log("ride info : ", this.rideinfo);
                this.loader.dismiss();
  
                let startpoint = {
                  lat: Number(this.latitude),
                  lng: Number(this.longitude)
                };

                let endpoint = {
                  lat: Number(elocsplit[0]),
                  lng: Number(elocsplit[1])
                }
                // this.estimated_distance = ridedetails[0].distance;
                this.estimated_price = ridedetails[0].estimated_price;
                let distanceservice = new google.maps.DistanceMatrixService();
                distanceservice.getDistanceMatrix({
                  origins: [startpoint],
                  destinations: [endpoint],
                  travelMode: 'DRIVING'
                }, (resp, status) => {
                  console.log("estimations:", resp);
                  this.estimated_distance = resp.rows[0].elements[0].distance.text;
                  let esttime = resp.rows[0].elements[0].duration.text;
                  esttime = esttime.replace('Days', 'D');
                  esttime = esttime.replace('Day', 'D');
                  esttime = esttime.replace('Hours', 'H');
                  esttime = esttime.replace('Hour', 'H');
                  esttime = esttime.replace('Mins', 'm');
                  esttime = esttime.replace('Min', 'm');
                  esttime = esttime.replace('days', 'D');
                  esttime = esttime.replace('day', 'D');
                  esttime = esttime.replace('hours', 'H');
                  esttime = esttime.replace('hour', 'H');
                  esttime = esttime.replace('mins', 'm');
                  esttime = esttime.replace('min', 'm');
                  this.estimated_time = esttime;
                });
              }
            }
          );
        })
      });

      this.intervalset01 = setInterval(() => {
        this.geolocation.getCurrentPosition().then((resp) => {
          this.latitude = Number(resp.coords.latitude);
          this.longitude = Number(resp.coords.longitude);
          //console.log(resp);
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
          );

          let jd = {
            ride_id: this.rideid
          }
          this.service.GetRideDetailsService(jd).subscribe(
            async data => {
              if (!!data && data.success == true) {

                if(data.ride_details[0].tripType == 2){

                  if(data.ride_details[0].current_status == 4){

                    let endaddressfetch = data.ride_details[0].round_end_address;
                    if (endaddressfetch != this.endaddress) {
                      
                      let al = this.alert.create({
                        message: "Drop Off Address Changed to  : <b> " + endaddressfetch + "</b>",
                        buttons: ['OK']
                      });
                      (await al).present();
                      this.endaddress = endaddressfetch;
                      let stloc = data.ride_details[0].round_trip_start_location;
                      let stlocsplit = stloc.split(",");
                      let stloccoord = {
                        lat: stlocsplit[0],
                        lng: stlocsplit[1]
                      };
                      this.rideinfo.start_coords = stloccoord;
                      let eloc = data.ride_details[0].round_trip_end_location;
                      let elocsplit = eloc.split(",");
                      let eloccoord = {
                        lat: elocsplit[0],
                        lng: elocsplit[1]
                      };
                      this.rideinfo.end_coords = eloccoord;
                      let startpoint = {
                        lat: Number(stlocsplit[0]),
                        lng: Number(stlocsplit[1])
                      }
                      let endpoint = {
                        lat: Number(elocsplit[0]),
                        lng: Number(elocsplit[1])
                      }
                      let distanceservice = new google.maps.DistanceMatrixService();
                      distanceservice.getDistanceMatrix({
                        origins: [startpoint],
                        destinations: [endpoint],
                        travelMode: 'DRIVING'
                      }, (resp, status) => {
                        this.estimated_distance = resp.rows[0].elements[0].distance.text;
                        let esttime = resp.rows[0].elements[0].duration.text;
                        esttime = esttime.replace('Days', 'D');
                        esttime = esttime.replace('Day', 'D');
                        esttime = esttime.replace('Hours', 'H');
                        esttime = esttime.replace('Hour', 'H');
                        esttime = esttime.replace('Mins', 'm');
                        esttime = esttime.replace('Min', 'm');
                        esttime = esttime.replace('days', 'D');
                        esttime = esttime.replace('day', 'D');
                        esttime = esttime.replace('hours', 'H');
                        esttime = esttime.replace('hour', 'H');
                        esttime = esttime.replace('mins', 'm');
                        esttime = esttime.replace('min', 'm');
                        this.estimated_time = esttime;
                      });
                      setTimeout(() => {
                        this.alert.dismiss();
                        window.location.reload();
                      }, 1500);
                    }

                  }else{
                    let endaddressfetch = data.ride_details[0].end_address;
                    if (endaddressfetch != this.endaddress) {
                      
                      let al = this.alert.create({
                        message: "Drop Off Address Changed to  : <b> " + endaddressfetch + "</b>",
                        buttons: ['OK']
                      });
                      (await al).present();
                      this.endaddress = endaddressfetch;
                      let stloc = data.ride_details[0].trip_start_location;
                      let stlocsplit = stloc.split(",");
                      let stloccoord = {
                        lat: stlocsplit[0],
                        lng: stlocsplit[1]
                      };
                      this.rideinfo.start_coords = stloccoord;
                      let eloc = data.ride_details[0].trip_end_location;
                      let elocsplit = eloc.split(",");
                      let eloccoord = {
                        lat: elocsplit[0],
                        lng: elocsplit[1]
                      };
                      this.rideinfo.end_coords = eloccoord;
                      let startpoint = {
                        lat: Number(stlocsplit[0]),
                        lng: Number(stlocsplit[1])
                      }
                      let endpoint = {
                        lat: Number(elocsplit[0]),
                        lng: Number(elocsplit[1])
                      }
                      let distanceservice = new google.maps.DistanceMatrixService();
                      distanceservice.getDistanceMatrix({
                        origins: [startpoint],
                        destinations: [endpoint],
                        travelMode: 'DRIVING'
                      }, (resp, status) => {
                        this.estimated_distance = resp.rows[0].elements[0].distance.text;
                        let esttime = resp.rows[0].elements[0].duration.text;
                        esttime = esttime.replace('Days', 'D');
                        esttime = esttime.replace('Day', 'D');
                        esttime = esttime.replace('Hours', 'H');
                        esttime = esttime.replace('Hour', 'H');
                        esttime = esttime.replace('Mins', 'm');
                        esttime = esttime.replace('Min', 'm');
                        esttime = esttime.replace('days', 'D');
                        esttime = esttime.replace('day', 'D');
                        esttime = esttime.replace('hours', 'H');
                        esttime = esttime.replace('hour', 'H');
                        esttime = esttime.replace('mins', 'm');
                        esttime = esttime.replace('min', 'm');
                        this.estimated_time = esttime;
                      });
                      setTimeout(() => {
                        this.alert.dismiss();
                        window.location.reload();
                      }, 1500);
                    }

                  }


                }else{

                  let endaddressfetch = data.ride_details[0].end_address;
                  if (endaddressfetch != this.endaddress) {
                    
                    let al = this.alert.create({
                      message: "Drop Off Address Changed to  : <b> " + endaddressfetch + "</b>",
                      buttons: ['OK']
                    });
                    (await al).present();
                    this.endaddress = endaddressfetch;
                 
                    let stloccoord = {
                      lat: resp.coords.latitude,
                      lng: resp.coords.longitude
                    };

                    this.rideinfo.start_coords = stloccoord;
                    let eloc = data.ride_details[0].trip_end_location;
                    let elocsplit = eloc.split(",");
                    let eloccoord = {
                      lat: elocsplit[0],
                      lng: elocsplit[1]
                    };
                    this.rideinfo.end_coords = eloccoord;
                  
                    let startpoint = {
                      lat: Number(resp.coords.latitude,),
                      lng: Number(resp.coords.longitude)
                    }


                    let endpoint = {
                      lat: Number(elocsplit[0]),
                      lng: Number(elocsplit[1])
                    }
                    let distanceservice = new google.maps.DistanceMatrixService();
                    distanceservice.getDistanceMatrix({
                      origins: [startpoint],
                      destinations: [endpoint],
                      travelMode: 'DRIVING'
                    }, (resp, status) => {
                      this.estimated_distance = resp.rows[0].elements[0].distance.text;
                      let esttime = resp.rows[0].elements[0].duration.text;
                      esttime = esttime.replace('Days', 'D');
                      esttime = esttime.replace('Day', 'D');
                      esttime = esttime.replace('Hours', 'H');
                      esttime = esttime.replace('Hour', 'H');
                      esttime = esttime.replace('Mins', 'm');
                      esttime = esttime.replace('Min', 'm');
                      esttime = esttime.replace('days', 'D');
                      esttime = esttime.replace('day', 'D');
                      esttime = esttime.replace('hours', 'H');
                      esttime = esttime.replace('hour', 'H');
                      esttime = esttime.replace('mins', 'm');
                      esttime = esttime.replace('min', 'm');
                      this.estimated_time = esttime;
                    });
                    setTimeout(() => {
                      this.alert.dismiss();
                      window.location.reload();
                    }, 1500);
                  }

                }
               
              }
            }
          )
        });
      }, 6000);
    });
  }

  addmarker() {
    let coordinates: LatLng = new LatLng(this.latitude, this.longitude);
    this.marker_data.setPosition(coordinates);

    let position = {
      target: coordinates,
      zoom: 16,
    };
    this.map.moveCamera(position);
  }

  async loadMap() {

    this.pre_lat = this.latitude;
    this.pre_long = this.longitude;

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
      mapType: GoogleMapsMapTypeId.ROADMAP,
    };

    this.map = GoogleMaps.create('map_canvas', mapOptions);

    this.loader.dismiss();

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

    this.intervalset02 = setInterval(async () => {
      this.geolocation.getCurrentPosition({
        enableHighAccuracy: true,
        timeout: 60000,
      }).then((resp) => {

        this.map.clear();

        this.latitude = Number(resp.coords.latitude);
        this.longitude = Number(resp.coords.longitude);

        

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
  
        let endicon: MarkerIcon = {
          url: 'https://quickcabtaxiservice.com/storage/app/public/dropoffmarker.png',
          size: {
            width: 35,
            height: 40
          }
        };
       
        this.map.addMarker({
          'title': 'Drop Off Point',
          'icon': endicon,
          'animation': 'none',
          'position': this.rideinfo.end_coords
        }).then((marker: Marker) => {
          
        });


              let dirservice = new google.maps.DirectionsService;
              dirservice.route({
                origin: {
                  'lat': this.latitude,
                  'lng': this.longitude
                },
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
                });
                
                let polylineoptions = {
                  points: paths,
                  color: '#333',
                  width: 6,
                  geodesic: true,
                };
                this.map.addPolyline(polylineoptions);
        
              });

        })

    }, 5000);
  
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

  async endtrip() {
    console.log("start")
    let first_load = this.loader.create({
      message: "Ending Trip......"
    });
    (await first_load).present();
    if(this.rideinfo.tripType == 2 && this.rideinfo.current_status == 4){
        let startpoint = this.rideinfo.round_trip_start_location;

        console.log('endTrip: Round' + startpoint);

        // let startpointsplit = startpoint.split(",");
        // let startlat = startpointsplit[0];
        // let startlng = startpointsplit[1];
        let endpoint = this.latitude.toString() + "," + this.longitude.toString()

        let dirserv = new google.maps.DirectionsService;

        this.geolocation.getCurrentPosition().then((resp) => {
              this.latitude = Number(resp.coords.latitude);
              this.longitude = Number(resp.coords.longitude);

                dirserv.route({
                  origin: startpoint,
                  destination: {
                    lat: Number(resp.coords.latitude),
                    lng: Number(resp.coords.longitude)
                  },
                  travelMode: 'DRIVING'
                }, async (resp, status) => {
                  this.loader.dismiss();
                  console.log("response : ", resp);

                  let distinkm = Number(resp.routes[0].legs[0].distance.value) / 1000;
                  distinkm = Number(distinkm.toFixed(2))
                  let servicedata = {
                    driver_id: this.driverid,
                    user_id: this.customerid,
                    current_status: 4,
                    end_location: this.latitude.toString() + "," + this.longitude.toString(),
                    distance_km: distinkm
                  }
                  console.log(servicedata);

                  let ld = this.loader.create({
                    message: 'Ending Trip......'
                  });
                  (await ld).present().then(() => {
                    this.service.EndTripService(servicedata).subscribe(
                      
                      async data => {
                        if (!!data && data.success == true) {
                          this.loader.dismiss();
                          this.backgroundservice.disable();

                          if(data.round_trip == true){
                            this.route.navigate(['/pages/bookinghistory']);
                          }else{
                            this.route.navigate(['/pages/tripsummary/' + this.rideid]);
                          }

                    
                        }
                        else {
                          this.loader.dismiss();
                          let tm = this.toast.create({
                            message: "Cannot End Trip. Server Error. Contact Admin!",
                            duration: 2500
                          });
                          (await tm).present();
                        }
                      }
                    )
                  });
                });
            });    


    }else{

     
      if(this.rideinfo.change_destination.length > 0)
      {
        let change_destination_list = this.rideinfo.change_destination;

        let dirserv_pre = new google.maps.DirectionsService;

        var total_km = 0;   
        
        for(let i=0; i < change_destination_list.length; i++){

          if(i == 0){
              let start_lat_long = this.rideinfo.trip_start_location;  
              let cur_lat_long = change_destination_list[i].old_location;

              dirserv_pre.route({
                origin: start_lat_long,
                destination: cur_lat_long,
                travelMode: 'DRIVING'
              }, async (resp, status) => {
                

                let distinkm_pre = Number(resp.routes[0].legs[0].distance.value) / 1000;
                total_km = total_km + Number(distinkm_pre.toFixed(2));

                //console.log(total_km);

                if(i == (change_destination_list.length - 1)){
                 
                  let start_lat_long_new = change_destination_list[i].old_location;  
                  //let end_lat_long_new = change_destination_list[i].new_location;

                  let end_lat_long_new = this.latitude.toString() + "," + this.longitude.toString();

                  dirserv_pre.route({
                    origin: start_lat_long_new,
                    destination: end_lat_long_new,
                    travelMode: 'DRIVING'
                  }, async (resp, status) => {

                    this.loader.dismiss();
    
                    let distinkm_pre = Number(resp.routes[0].legs[0].distance.value) / 1000;
                    total_km = total_km + Number(distinkm_pre.toFixed(2));
    
                    console.log(total_km);

                    this.endtrip_single(total_km);
        
                  });
                  
                }
    
              });

          }else{
            let pre_l = i - 1;
            let start_lat_long = change_destination_list[pre_l].old_location;;  
            let cur_lat_long = change_destination_list[i].old_location;

            dirserv_pre.route({
              origin: start_lat_long,
              destination: cur_lat_long,
              travelMode: 'DRIVING'
            }, async (resp, status) => {
              let distinkm_pre = Number(resp.routes[0].legs[0].distance.value) / 1000;
              total_km = total_km + Number(distinkm_pre.toFixed(2));

              console.log(total_km);
                             
              if(i == (change_destination_list.length - 1)){

                let start_lat_long_new = change_destination_list[i].old_location;  
                //let end_lat_long_new = change_destination_list[i].new_location;
                let end_lat_long_new = this.latitude.toString() + "," + this.longitude.toString();

                dirserv_pre.route({
                  origin: start_lat_long_new,
                  destination: end_lat_long_new,
                  travelMode: 'DRIVING'
                }, async (resp, status) => {

                  this.loader.dismiss();
  
                  let distinkm_pre = Number(resp.routes[0].legs[0].distance.value) / 1000;
                  total_km = total_km + Number(distinkm_pre.toFixed(2));
  
                  console.log(total_km);
                   this.endtrip_single(total_km);
      
                });
              }
            });
          }
        }

      }else{
        let startpoint = this.rideinfo.trip_start_location;

        let endpoint = this.latitude.toString() + "," + this.longitude.toString()

          let dirserv = new google.maps.DirectionsService;

          this.geolocation.getCurrentPosition().then((resp) => {
            this.latitude = Number(resp.coords.latitude);
            this.longitude = Number(resp.coords.longitude);

              dirserv.route({
                origin: startpoint,
                destination: {
                  lat: Number(resp.coords.latitude),
                  lng: Number(resp.coords.longitude)
                },
                travelMode: 'DRIVING'
              }, async (resp, status) => {
                this.loader.dismiss();
                console.log("response : ", resp);

                  let distinkm = Number(resp.routes[0].legs[0].distance.value) / 1000;
                  distinkm = Number(distinkm.toFixed(2))
              
                  let servicedata = {
                    driver_id: this.driverid,
                    user_id: this.customerid,
                    current_status: 4,
                    end_location: this.latitude.toString() + "," + this.longitude.toString(),
                    distance_km: distinkm
                  }
                  console.log(servicedata);

                  let ld = this.loader.create({
                    message: 'Ending Trip......'
                  });
                  (await ld).present().then(() => {
                    this.service.EndTripService(servicedata).subscribe(
                      
                      async data => {
                        if (!!data && data.success == true) {
                          this.loader.dismiss();
                          this.backgroundservice.disable();

                          if(data.round_trip == true){
                            this.route.navigate(['/pages/bookinghistory']);
                          }else{
                            this.route.navigate(['/pages/tripsummary/' + this.rideid]);
                          }
                        }
                        else {
                          this.loader.dismiss();
                          let tm = this.toast.create({
                            message: "Cannot End Trip. Server Error. Contact Admin!",
                            duration: 2500
                          });
                          (await tm).present();
                        }
                      }
                    )
                  });
              });
            });
      }

     
    }
  }

  async endtrip_single(total_km) {
    let servicedata = {
      driver_id: this.driverid,
      user_id: this.customerid,
      current_status: 4,
      end_location: this.latitude.toString() + "," + this.longitude.toString(),
      distance_km: total_km
    }
    console.log(servicedata);

    let ld = this.loader.create({
      message: 'Ending Trip......'
    });
    (await ld).present().then(() => {
      this.service.EndTripService(servicedata).subscribe(
        
        async data => {
          if (!!data && data.success == true) {
            
            this.loader.dismiss();
            this.backgroundservice.disable();

            if(data.round_trip == true){
              this.route.navigate(['/pages/bookinghistory']);
            }else{
              this.route.navigate(['/pages/tripsummary/' + this.rideid]);
            }
          }
          else {
            this.loader.dismiss();
            let tm = this.toast.create({
              message: "Cannot End Trip. Server Error. Contact Admin!",
              duration: 2500
            });
            (await tm).present();
          }
        }
      )
    });
  }

  async refreshpage() {
    let ld = this.loader.create({
      message: 'Refreshing......',
      duration: 2000
    });
    (await ld).present().then(() => {
      window.location.reload();
    })
  }

  navigatemap() {
    if(this.rideinfo.tripType == 2 && this.rideinfo.current_status == 4){
      let startpoint = this.rideinfo.round_trip_start_location;

      let startpointsplit = startpoint.split(",");
      let startlat = startpointsplit[0];
      let startlng = startpointsplit[1];
    }else{
      let startpoint = this.rideinfo.trip_start_location;
      let startpointsplit = startpoint.split(",");
      let startlat = startpointsplit[0];
      let startlng = startpointsplit[1];
    }

    if(this.rideinfo.tripType == 2 && this.rideinfo.current_status == 4){
      let endpoint = this.rideinfo.round_trip_end_location;
      let endaddress = this.rideinfo.round_end_address;

      let endpointsplit = endpoint.split(",");
      let endlat = Number(endpointsplit[0]);
      let endlng = Number(endpointsplit[1]);
    
      let options: LaunchNavigatorOptions = {
        start: [this.latitude, this.longitude],
        app: this.navigator.APP.GOOGLE_MAPS
      };
      this.navigator.navigate(endaddress, options).then(success => {
        console.log("Successfully launched google navigator");
      },
        error => {
          console.log("Failed to launch Google navigator");
        }
      )
    }else{
      let endpoint = this.rideinfo.trip_end_location;
      let endaddress = this.rideinfo.end_address;
      let endpointsplit = endpoint.split(",");
      let endlat = Number(endpointsplit[0]);
      let endlng = Number(endpointsplit[1]);
    
        let options: LaunchNavigatorOptions = {
          start: [this.latitude, this.longitude],
          app: this.navigator.APP.GOOGLE_MAPS
        };
        this.navigator.navigate(endaddress, options).then(success => {
          console.log("Successfully launched google navigator");
        },
          error => {
            console.log("Failed to launch Google navigator");
          }
        )
    }
  }
}



   /* setTimeout(async () =>{
      let endmarker: Marker = this.map.addMarkerSync({
        'title': 'Drop Off Point',
        'icon': endicon,
        'animation': 'none',
        'position': this.rideinfo.end_coords
      });
  
      let marker: Marker = this.map.addMarkerSync({
        'title': 'You Are Here',
        'icon': icon,
        'animation': 'none',
        'position': {
          'lat': this.latitude,
          'lng': this.longitude
        }
      });

    }, 1000);*/    
    
    /* setInterval(async () => {
      this.trip_end_location_string = this.rideinfo.trip_end_location;
      this.destination_locatoin_str = this.trip_end_location_string.split(',');

      this.geolocation.getCurrentPosition().then((resp) => {
        this.latitude = Number(resp.coords.latitude);
        this.longitude = Number(resp.coords.longitude);

          this.map.clear();
                 
         //this.map.animateCamera({
           // target: { lat: this.latitude, lng: this.longitude},
            //zoom: 16,
            //tilt: 30,
          //});


          let endmarker: Marker = this.map.addMarkerSync({
            'title': 'Drop Off Point',
            'icon': endicon,
            'animation': 'none',
            'position': this.rideinfo.end_coords
          });

          let marker: Marker = this.map.addMarkerSync({
            'title': 'You Are Here',
            'icon': icon,
            'animation': 'none',
            'position': {
              'lat': Number(resp.coords.latitude),
              'lng': Number(resp.coords.longitude)
            }
          });

          let currentlocation = this.latitude.toString() + "," + this.longitude.toString();
          let currentcoords = { lat: Number(resp.coords.latitude), lng: Number(resp.coords.longitude)};
          let dirservice2 = new google.maps.DirectionsService;
          let destination = {lat: Number(this.destination_locatoin_str[0]), lng: Number(this.destination_locatoin_str[1])}

          dirservice2.route({
            origin: currentcoords,
            //destination: this.rideinfo.trip_end_location,
            destination: destination,
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

            this.map.moveCamera({
              target: paths,
              //zoom: 14,
              //tilt: 30,
            }).then(() => {
              //alert("Camera target has been changed");
              this.map.addPolyline(polylineoptions);
            });
              
          });

        })

    }, 5000);*/

    //'#d79e1a'

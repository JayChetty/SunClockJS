/*
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */

var clockFactory = function(options){
  options = options || {};
  var canvas = options.canvas;
  var ctx = canvas.getContext("2d");
  var clock = {
    radius: options.radius,
    center: options.center,
    render: function(){
      this.drawOutline();
    },
    drawSweep: function(startTime, endTime, color){
      ctx.beginPath();
      ctx.fillStyle = "rgba(10, 255, 99, 0.2)";
      ctx.moveTo(this.center.x,this.center.y);
      ctx.arc( 
        this.center.x,
        this.center.y,
        this.radius, 
        this.angleForTime(startTime), 
        this.angleForTime(endTime)
      );
      ctx.moveTo(this.center.x,this.center.y);
      ctx.fill();
    },
    drawOutline: function(){     
      ctx.beginPath();
      ctx.arc(this.center.x,this.center.y,this.radius,0, 2*Math.PI);
      ctx.stroke();          
    },
    fractionOfDay:function(time){
      var minutesInDay = 24 * 60;
      var timeInMinutes = (time.getHours() * 60) + time.getMinutes();
      return(timeInMinutes / minutesInDay);
    },
    angleForTime:function(time){
      return this.angleForFraction( this.fractionOfDay(time) );
    },
    angleForFraction:function(fraction){
      return( Math.PI*2 * fraction - Math.PI/2 );
    },
    drawLineForTime:function(time){
      this.drawLineForFraction( this.fractionOfDay(time) );
    },
    drawLineForFraction:function(fraction){
      console.log("draw line for fraction", fraction)
      ctx.beginPath();
      ctx.moveTo(this.center.x,this.center.y);
      var endPoint = this.pointOnOutline(fraction);
      console.log('endpoint', endPoint);
      ctx.lineTo(endPoint.x, endPoint.y);
      ctx.stroke();
    },
    pointOnOutline:function(fraction){
      var angle = this.angleForFraction(fraction);
      var unadjustedCenterPoint = this.polarToCartesian(this.radius, angle);
      return {
        x: unadjustedCenterPoint.x + this.center.x,
        y: unadjustedCenterPoint.y + this.center.y
      }
    },
    polarToCartesian:function(radius, angle){
      return { 
        x:radius*Math.cos(angle),
        y:radius*Math.sin(angle)
      }
    }

  }
  return clock;
}

var app = {
  // Application Constructor
  initialize: function() {
    this.bindEvents();
  },
  // Bind Event Listeners
  //
  // Bind any events that are required on startup. Common events are:
  // 'load', 'deviceready', 'offline', and 'online'.
  bindEvents: function() {
    document.addEventListener('deviceready', this.onDeviceReady, false);
  },
  // deviceready Event Handler
  //
  // The scope of 'this' is the event. In order to call the 'receivedEvent'
  // function, we must explicitly call 'app.receivedEvent(...);'
  onDeviceReady: function() {
    app.receivedEvent('deviceready');
  },

  setupClock: function(){
    this.clock.drawOutline();
    this.clock.drawLineForTime(new Date());
  },

  noLocation: function(error){
    console.log('cannot get location', error);
    if(localStorage.getItem('latitude')){
      this.drawSunLines(localStorage.getItem('latitude'), localStorage.getItem('longitude'))
    }
    else{
      alert('Cannot Find Location, enable location on device or enter manually');
    }
  },

  gotLocation: function(location){
    var latitude = location.coords.latitude
    var longitude = location.coords.longitude
    window.localStorage.setItem('latitude', latitude);
    window.localStorage.setItem('longitude', longitude);
    this.drawSunLines(latitude, longitude);
  },

  drawSunLines: function(latitude, longitude){
    var sunTimes = SunCalc.getTimes(new Date(), latitude, longitude);
    this.clock.drawLineForTime(sunTimes.sunrise)
    this.clock.drawLineForTime(sunTimes.sunset)
    this.clock.drawSweep(sunTimes.sunrise, sunTimes.sunset)
  },
  // Update DOM on a Received Event

  receivedEvent: function(id) {
    console.log('Received Event: ' + id);
    this.clock = clockFactory({
      center: { x:100, y:75 },
      canvas: document.getElementById("canvas") ,
      radius:50
    });
    this.setupClock();
    console.log('nav', navigator)
    navigator.geolocation.getCurrentPosition( this.gotLocation.bind(this), this.noLocation.bind(this), 
      { timeout: 30000, enableHighAccuracy: true } );    
  }
};

app.initialize();
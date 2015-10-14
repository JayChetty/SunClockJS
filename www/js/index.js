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
    drawOutline: function(){     
      ctx.beginPath();
      ctx.arc(this.center.x,this.center.y,this.radius,0, 2*Math.PI);
      ctx.stroke();          
    },
    drawLineForTime:function(hours,minutes){
      minutesInDay = 24 * 60
      timeInMinutes = (hours * 60) + minutes
      this.drawLineForFraction( timeInMinutes / minutesInDay)
    },
    drawLineForFraction:function(fraction){
      ctx.beginPath();
      ctx.moveTo(this.center.x,this.center.y);
      var endPoint = this.pointOnOutline(fraction);
      console.log('endpoint', endPoint);
      ctx.lineTo(endPoint.x, endPoint.y);
      ctx.stroke();
    },
    pointOnOutline:function(fraction){
      var angle = Math.PI*2 * fraction - Math.PI/2
      var unadjustedCenterPoint = this.polarToCartesian(this.radius, angle)
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
  // Update DOM on a Received Event

  receivedEvent: function(id) {
    var parentElement = document.getElementById(id);
    var listeningElement = parentElement.querySelector('.listening');
    var receivedElement = parentElement.querySelector('.received');

    listeningElement.setAttribute('style', 'display:none;');
    receivedElement.setAttribute('style', 'display:block;');

    console.log('Received Event: ' + id);
    var clock = clockFactory({
      center: { x:100, y:75 },
      canvas: document.getElementById("canvas") ,
      radius:50
    });
    clock.drawOutline();
    var now = new Date()
    clock.drawLineForTime(now.getHours(), now.getMinutes())
    var sunTimes = SunCalc.getTimes(now, 51.5, -0.1);
    clock.drawLineForTime(sunTimes.sunrise.getHours(), sunTimes.sunrise.getMinutes())
    clock.drawLineForTime(sunTimes.sunset.getHours(), sunTimes.sunset.getMinutes())
    window.clock  = clock
  }
};

app.initialize();
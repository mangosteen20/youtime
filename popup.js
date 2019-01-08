// Copyright 2018 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a MIT-style license that can be
// found in the LICENSE file.

'use strict';

var totalTime = document.getElementById('totalTime');
var firstCat = document.getElementById("first_cat");
var secondCat = document.getElementById("second_cat");
var thirdCat = document.getElementById("third_cat");

function calculateTime(seconds) {
    var total_s = Math.floor(seconds);
    var round_m = Math.floor(total_s/60);
    var round_h = Math.floor(round_m/3600);
    var disp_h = round_h;
    var disp_m = round_m % 60;
    var disp_s = total_s % 60;
    return disp_h.toString()+" h "+disp_m.toString()+" m "+disp_s+" s";
}

chrome.storage.sync.get(['time'], function(data) {
    totalTime.textContent = calculateTime(data.time);
    console.log(data.time.toString());
});


var name_l = [];
var time_l = [];

chrome.storage.sync.get(['top3_cat_name'], function(data) {
    name_l = data.top3_cat_name;
});

chrome.storage.sync.get(['top3_cat_time'], function(data) {
    console.log(typeof data.top3_cat_time);
    console.log(data.top3_cat_time);
    data.top3_cat_time.forEach(function(key) {
        console.log("loop to ", key);
        if (key < 0) {
            time_l.push("N/A");
        } else {
            time_l.push(calculateTime(key));
        }
    });
});

console.log("setting timeout");

setTimeout(function() {
    console.log(name_l);
    console.log(time_l);

    if (name_l.length && time_l.length) {
        firstCat.textContent = name_l[0] + " " + time_l[0];
        secondCat.textContent = name_l[1] + " " + time_l[1];
        thirdCat.textContent = name_l[2] + " " + time_l[2];
    } else {
        firstCat.textContent = "Less than 3 to display";
        secondCat.textContent = "Less than 3 to display";
        thirdCat.textContent = "Less than 3 to display";
    }
}, 100);

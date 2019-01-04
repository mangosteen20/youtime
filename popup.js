// Copyright 2018 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

'use strict';

let totalTime = document.getElementById('totalTime');


chrome.storage.sync.get(['time'], function(data) {
    var total_s = Math.floor(data.time);
    var round_m = Math.floor(total_s/60);
    var round_h = Math.floor(round_m/3600);
    var disp_h = round_h;
    var disp_m = round_m % 60;
    var disp_s = total_s % 60;
    totalTime.textContent = disp_h.toString()+" h "+disp_m.toString()+" m "+disp_s+" s";
    console.log(data.time.toString());
});

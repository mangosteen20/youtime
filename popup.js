// Copyright 2018 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

'use strict';

let totalTime = document.getElementById('totalTime');


chrome.storage.sync.get(['time'], function(data) {
  totalTime.textContent = data.time.toString();
  console.log(data.time.toString());
});

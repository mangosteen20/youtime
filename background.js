"use strict";

chrome.runtime.onInstalled.addListener(function() {
    chrome.storage.sync.get(["time"], function(data) {
        if (Object.keys(data).length === 0) {
            chrome.storage.sync.set({"time": 0}, function() {
                console.log("Initialize time.");
            });
        }
    });
    chrome.storage.sync.get(["max_id"], function(data) {
        if (Object.keys(data).length === 0) {
            chrome.storage.sync.set({"max_id": 0}, function() {
                console.log("Initialize max_id.");
            });
        }
    });
    chrome.storage.sync.get(["top3_cat_name"], function(data) {
        chrome.storage.sync.set({"top3_cat_name": []}, function() {
            console.log("Initialize top3_cat_name.");
        });
    });

    chrome.storage.sync.get(["top3_cat_time"], function(data) {
        chrome.storage.sync.set({"top3_cat_time": []}, function() {
            console.log("Initialize top3_cat_time.");
        });
    });

});

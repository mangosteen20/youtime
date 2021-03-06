//initialize useful variables
var d = new Date();
var last_marked = d.getTime();
var title_hold = null;
var cat_hold = null;
var cat_id = null;
var period = 0;

var max_id = null;
chrome.storage.sync.get(['max_id'], function(data) {
    max_id = data.max_id;
});

/*
record the category of the video currently played.
*/
function record_category() {
    var show_button = null;
    var more_part = null;

    // if the category information is hidden on current page, unfold related block.
    var button_timeout = setTimeout(function() {
        show_button = document.querySelector("#more > yt-formatted-string");
        more_part = document.getElementById("more");

        if (show_button && !more_part.hasAttribute("hidden")) {
            console.log("ready to show more", show_button.textContent);
            show_button.click();
        }
    }, 1000);

    // record the category after unfolding. If the category is unseen before, assign a new id.
    var show_timeout = setTimeout(function() {
        if (more_part && more_part.hasAttribute("hidden")) {
            console.log("ready to update category");
            cat_hold = document.querySelector("#content > yt-formatted-string > a");
            if (!cat_hold) {
                return;
            }
            cat_hold = cat_hold.textContent;
            chrome.storage.sync.get([cat_hold], function(data) {
                console.log("Print id data: ", data);
                if(Object.keys(data).length === 0) {
                    console.log("Assign a new id to ", cat_hold);
                    cat_id = max_id + 1;
                    max_id = cat_id;
                    chrome.storage.sync.set({"max_id": max_id}, function() {
                        console.log("Reset max_id.");
                    });
                    chrome.storage.sync.set({[cat_hold]: cat_id}, function() {
                        console.log("Create id for ", cat_hold);
                    });
                } else {
                    cat_id = data[cat_hold];
                }
                console.log(cat_hold, "'s id is ", cat_id);
            });
            show_button = document.querySelector("#less > yt-formatted-string");
            console.log("ready to show less", show_button.textContent);
            show_button.click();
        }
    }, 2000);
}

/*
record the title of the video currently played.
*/
function record_title() {
    var title_timeout = setTimeout(function() {
        title_cur = document.querySelector("#container > h1 > yt-formatted-string");
        if (title_cur) {
            title_hold = title_cur.textContent;
        }
    }, 1000);
}

record_category();
record_title();


var accum = 0;  // total watch time for this video in miliseconds.

/*
retrieve the total watch time since the Extension's setup.
*/
chrome.storage.sync.get(['time'], function(data) {
    accum = data.time * 1000;
    console.log("accum is ", accum);

    /*
    update (in chrome storage) total watch time and category information upon closing the page.
    also send updated watch time for the category to backend by updateCatTime.
    */
    window.addEventListener("beforeunload", function(e) {
        var curD = new Date();
        if (prev_play) {
            accum += curD.getTime() - last_marked;
            period += curD.getTime() - last_marked;
        }
        chrome.storage.sync.set({"time": accum/1000}, function() {
            console.log("update.");
        });

        updateCatTime(cat_hold, cat_id, period/1000);

        updateTop3();

        clearInterval(accum_interv);
        clearInterval(check_state);
    });

    console.log("about to set interval.");
    var accum_interv = setInterval(accum_time, 1000);
    var check_interv = setInterval(check_state, 1000);
});


var prev_play = false;

/*
update accum variable whenever the video goes to paused mode.
*/
function accum_time() {
    var nD = new Date();
    var nT = nD.getTime();
    var ytplayer = document.getElementById("movie_player");
    var curD = new Date();
    console.log("accum_time called");

    if (!ytplayer || ytplayer.className.includes("ad-showing")) {
        return;
    } else if (ytplayer.className.includes("playing-mode")) {
        if (!prev_play) {
            last_marked = curD.getTime();
            prev_play = true;
            console.log("just played, marks time");
        }
    } else if (ytplayer.className.includes("paused-mode")) {
        if (prev_play) {
            accum += curD.getTime() - last_marked;
            period += curD.getTime() - last_marked;

            last_marked = curD.getTime();
            prev_play = false;
            console.log("just paused, marks time.")
        }
    } else {
        prev_play = false;
    }

    console.log("Total time is ", accum/1000);
    console.log("Watch time for this one: ", period/1000);
    console.log("Current title: ", title_hold);
    console.log("Current category: ", cat_hold);
}



/*
whenever the page displays another video, update relevant state variables
*/
function check_state() {
    var prev_title = title_hold;
    title_cur = document.querySelector("#container > h1 > yt-formatted-string");
    if (title_cur) {
        title_hold = title_cur.textContent;
    }
    if (prev_title !== title_hold) {  //Change to another video
        console.log("Video changed. From " + prev_title + " To " + title_hold);
        var curD = new Date();
        if (prev_play) {
            accum += curD.getTime() - last_marked;
            period += curD.getTime() - last_marked;
        }
        chrome.storage.sync.set({"time": accum/1000}, function() {
            console.log("update.");
        });

        updateCatTime(cat_hold, cat_id, period/1000);
        period = 0;

        updateTop3();

        d = new Date();
        last_marked = d.getTime();
        record_title();
        record_category();
        prev_play = false;
    }
}

/*
send updated category's watch time to backend
*/
function updateCatTime(the_name, the_id, watch_time) {
    var xhr = createCORSRequest("PUT", "http://localhost:8080/categories/"+the_id, true);

    xhr.onload = function() {
        console.log("response!!");
        console.log(typeof xhr.response);
        // process the response.
    };

    var cat_obj = {"name": the_name, "time": watch_time};
    var cat_jstr = JSON.stringify(cat_obj);
    xhr.setRequestHeader("Content-Type", "application/json");
    xhr.send(cat_jstr);
}

/*
get information of 3 categories watched most from backend
*/
function updateTop3() {
    var xhr = createCORSRequest("GET", "http://localhost:8080/top3", true);

    xhr.onload = function() {
        console.log("response!!");
        console.log(typeof xhr.response);
        // process the response.
        var cat_obj = JSON.parse(xhr.response);
        console.log(cat_obj);

        var update_name_l = [];
        var update_time_l = [];

        var cat_l = cat_obj._embedded.categoryList;
        cat_l.forEach(function(cat) {
            if (cat.name === null) {
                update_name_l.push("N/A");
                update_time_l.push(-1);
            } else {
                update_name_l.push(cat.name);
                update_time_l.push(cat.time);
            }
        });
        chrome.storage.sync.set({"top3_cat_name": update_name_l}, function() {
            console.log("update top3_cat_name to ", update_name_l);
        });
        chrome.storage.sync.set({"top3_cat_time": update_time_l}, function() {
            console.log("update top3_cat_time to ", update_time_l);
        });

    };

    xhr.send();
}



function createCORSRequest(method, url, sync) {
    var xhr = new XMLHttpRequest();
    if ("withCredentials" in xhr) {
        // since it's Chrome Extension, should get here;
        xhr.open(method, url, sync);
    } else {
        // otherwise, CORS is not supported by the browser.
        // if get here, something's wrong.
        xhr = null;
        alert("Doesn't support CORS");
    }
    return xhr;
}

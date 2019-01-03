var d = new Date();
var last_marked = d.getTime();

var accum = 0;
chrome.storage.sync.get(['time'], function(data) {
    accum = data.time * 1000;
    console.log("accum is ", accum);

    window.addEventListener("beforeunload", function(e) {
        var curD = new Date();
        if (prev_play) {
            accum += curD.getTime() - last_marked;
        }
        accum /= 1000;
        chrome.storage.sync.set({time: accum}, function() {
            console.log('update.');
        });
        clearInterval(interv);
    });

    console.log("about to set interval.");
    var interv = setInterval(accum_time, 1000);
});

var prev_play = false;

function accum_time() {
    var nD = new Date();
    var nT = nD.getTime();
    var ytplayer = document.getElementById("movie_player");
    var curD = new Date();
    console.log("accum_time called");


    if (ytplayer.className.includes("playing-mode") && !prev_play) {
        last_marked = curD.getTime();
        prev_play = true;
        console.log("just played, marks time");
    } else if (ytplayer.className.includes("paused-mode") && prev_play) {
        accum += curD.getTime() - last_marked;
        last_marked = curD.getTime();
        prev_play = false;
        console.log("just paused, marks time.")
    }

    nD = new Date();
    console.log("accum_time takes ", nD.getTime()-nT);
    console.log("Elapse time is ", accum/1000);

}

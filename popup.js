!function(){
  var STORE_NAME = 'browserTimes';

  function renderContent(html) {
    document.getElementById('content').innerHTML = html;
  }

  // formats milliseconds into a readable format e.g. 1h2m3s
  function msToTime(s) {
    var time = '';
    var ms = s % 1000;
    s = (s - ms) / 1000;
    var secs = s % 60;
    s = (s - secs) / 60;
    var mins = s % 60;
    var hrs = (s - mins) / 60;
    var time = secs + 's';
    if(mins) time = mins + 'm' + time;
    if(hrs) time = hrs + 'h' + time;
    return time;
  }

  document.addEventListener('DOMContentLoaded', function() {
    chrome.storage.local.get(STORE_NAME, function(times){
      var html;
      var sortable = [];
      var times = times['browserTimes'];

      // sort buy times, most time first
      for (var t in times) {
          sortable.push([t, times[t]]);
      }
      sortable.sort(function(a, b) {
          return  b[1] - a[1];
      });


      if(sortable.length > 0){
        html = '<ol style="padding-left: 0;list-style: none;">';
        for(var i=0; i < sortable.length; i++){
          html = html + '<li>' + sortable[i][0] + ': ' + msToTime(sortable[i][1]) + '</li>';
        }
        html = html + '</ol>';
        renderContent('<h4>Top Sites</h4>'+html);
      } else {
        renderContent('<h4>No History</h4>');
      }
    });

    var resetButton = document.getElementById('resetButton');
    resetButton.addEventListener('click', function(){
      console.log('hello simon');
        var store = {};
        store[STORE_NAME] = {};
        chrome.storage.local.set(store, function(){});
        renderContent('<h4>No History</h4>');
    });

  });
}();

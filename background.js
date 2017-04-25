!function(){
    var LIMIT = 10;
    var STORE_NAME = 'browserTimes';
    var inFocus = true;
    var previousHost,currentHost,time,count,t;


    var storage =  {
      save : function(data){
        var store = {};
        store[STORE_NAME] = data;
        chrome.storage.local.set(store, function(){});
      }
    };

    function startTimer(){
      if(count > 0){
        stopTimer();
      }
      count = 0;
      t = setInterval(function(){
        count += 1000;
      },1000);
    }

    function stopTimer(){
      clearInterval(t);
      if(count > 0){
        setStorage(currentHost, count);
      }
      count = 0;
    }


    function getHostname(url){
      var a = document.createElement('a');
      a.href = url;
      return a.hostname;
    }

    function clearStorage(){
      chrome.storage.local.remove(STORE_NAME);
    }

    function setStorage(host, count) {
      var browserTimes = {};

      chrome.storage.local.get(STORE_NAME, function(obj){
        if(Object.keys(obj).length !== 0) {
           browserTimes = obj[STORE_NAME];
           if(Object.keys(browserTimes).length < LIMIT){
              if(browserTimes[host]){
                browserTimes[host] = browserTimes[host] + count;
              } else {
                browserTimes[host] = count;
              }
              storage.save(browserTimes);
            } else {
              if(browserTimes[host]){
                browserTimes[host] = browserTimes[host]+count;
                storage.save(browserTimes);
              } else {
                //replace the lowest number if current number is higher
                chrome.storage.local.get(STORE_NAME, function(times){
                  var lowestCurrentTime;
                  var lowestTimeHost;
                  //get lowest number
                  for (var key in times) {
                      var tObj = times[key];
                      for (var prop in tObj) {
                          if(!lowestCurrentTime || tObj[prop] < lowestCurrentTime) {
                            lowestCurrentTime = tObj[prop];
                            lowestTimeHost = prop;
                          }
                      }
                  }
                  if(count > lowestCurrentTime) {
                    delete browserTimes[lowestTimeHost];
                    browserTimes[host] = count;
                    storage.save(browserTimes);
                  }
                });
              }
            }

        } else {
          browserTimes[host] = count;
          storage.save(browserTimes);
        }
      });

    }

    //listen for browser window to lose focus
    chrome.windows.onFocusChanged.addListener(function(window) {
        if (window == chrome.windows.WINDOW_ID_NONE) {
            inFocus = false;
            stopTimer();
            //stop times and update log
        } else {
            inFocus = true;
        }
    });

    //listen for new tab to be activated
    chrome.tabs.onActivated.addListener(function(activeInfo) {
        if(activeInfo && activeInfo.tabId){
          chrome.tabs.get(activeInfo.tabId,function(tab){
            previousHost = currentHost;
            currentHost = getHostname(tab.url);
            startTimer();
          })
        }
    });

    //listen for current tab to be changed
    chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
      previousHost = currentHost;
      currentHost = getHostname(tab.url);
      startTimer();
    });
}();

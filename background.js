!function(){
    var LIMIT = 10;
    var STORE_NAME = 'browserTimes';
    var inFocus = true;
    var previousHost,currentHost,time,count,t;

    var storage =  {
      save : function(data){
        var store = {};
        store[STORE_NAME] = data;
        console.log(data);
        chrome.storage.local.set(store, function(){});
        //console.log('saving time');
      }
    };

    function startTimer(){
      //console.log('starting timer');
      count = -1;
      t = setInterval(function(){
        if(count == -1) {
          count = 0;
        } else {
          count += 1000;
        }
      },1000);
    }

    function stopTimer(host){
      if( host && count) {
        //console.log(host +': ' +  count);
        clearInterval(t);
        if(count > 0){
          setStorage(host, count);
        }
        count = 0;
      }
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
      console.log(browserTimes);
    }

    //listen for browser window to lose focus
    chrome.windows.onFocusChanged.addListener(function(window) {
        if (window == chrome.windows.WINDOW_ID_NONE) {
            inFocus = false;
            stopTimer(currentHost);
            //stop times and update log
        } else {
            inFocus = true;
            startTimer();
        }
    });

    //listen for new tab to be activated
    chrome.tabs.onActivated.addListener(function(activeInfo) {
        if(activeInfo && activeInfo.tabId){
          chrome.tabs.get(activeInfo.tabId,function(tab){
            stopTimer(currentHost); // should be the value of tab host before change
            currentHost = getHostname(tab.url);
            startTimer();
          })
        }
    });

    //listen for current tab to be changed
    chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
      stopTimer(currentHost); // should be the value of tab host before change
      currentHost = getHostname(tab.url);
      startTimer();
    });

}();

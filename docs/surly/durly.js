(function(localTestingEnv) {
  var is_mobile =
    /ip(hone|od)|(android).+mobile|opera m(ob|in)i/i.test(
      navigator.userAgent
    ) ||
    /Android/.test(navigator.userAgent) ||
    /iPhone/.test(navigator.userAgent) ||
    /iPad/.test(navigator.userAgent);

  // moved this into it's own variable so it can be string-replaced easier
  var _durly_root, _durly_rev;

if (localTestingEnv) {
  _durly_root = "mconnor.github.io/notice-js-mike";
  _durly_rev = "rDEV";
} else {
  _durly_root = "c.evidon.com";
  _durly_rev = "r170209";
}


  var _bao = {},
    _durly_s = document.getElementsByTagName("SCRIPT"),
    protocol =
      window.location.href.indexOf("http://") === 0 ? "http://" : "https://",
    _durly_url = protocol + _durly_root;

  window.BAPStart = function(opts) {
    try {
      BAP.start(opts);
    } catch (e) {
      var _bab = window._bab || [];
      var ob = {};
      for (var p in opts) {
        if (opts.hasOwnProperty(p)) {
          ob[p] = opts[p];
        }
      }
      _bab.push(ob);
      window._bab = _bab;
    }
  };

  function isBetrad(url) {
    if (localTestingEnv) {
      return true;
    } else {
      return /(adsafeprotected.com\/(rjss|rjsi|rfw)\/c.evidon.com|(^https?:)?\/\/c.evidon.com|(^https?:)?\/\/c.betrad.com)/.test(
        url
      );
    }
  }

  /*  SURLY STUFF  */

  function supportsLocalStorage() {
    try {
      return window.localStorage && window.postMessage;
    } catch (e) {
      return false;
    }
  }

  function isInApp(adWidth, adHeight, vpaid) {
    if (is_mobile) {
      // see if the document url starts with http.  if not this is an app
      var app =
        document.URL.indexOf("http://") === -1 &&
        document.URL.indexOf("https://") === -1;

      if (app) {
        return 1;
      }

      // otherwise we will run some checks specific to either android or ios to see if we're in an app
      var userAgent = window.navigator.userAgent.toLowerCase();

      if (/android/.test(userAgent)) {
        // as a fallback, try to match by viewport size
        var doc = document.documentElement;
        var widthMatches =
          Math.abs(parseInt(adWidth, 10) - doc.clientWidth) < 10;
        var heightMatches =
          Math.abs(parseInt(adHeight, 10) - doc.clientHeight) < 5;

        return widthMatches && heightMatches && !vpaid ? 1 : 0;
      } else {
        // iphone
        var standalone = window.navigator.standalone;

        var safari = /safari/.test(userAgent);
        if (!standalone && !safari) {
          return 1;
        } else {
          return 0;
        }
      }
    } else {
      return 0;
    }
  }

  /**
   * Setup postMessage hook and backup timer
   */
  function useLocalStorage(durly_script, opts) {
    var loaded = false;

    // message listener which receives JS from our iframe cache
    function rcvMsg(event) {
      if (!isBetrad(event.origin)) {
        return;
      }

      // Copy passed JS into a script block
      // swiped from basket.js (MIT licensed)
      var script = document.createElement("script");
      // script.defer = true;
      // Have to use .text, since we support IE8,
      // which won't allow appending to a script
      script.text = event.data;
      durly_script.parentNode.insertBefore(script, durly_script);
      cleanup();
      window.BAPStart(opts);
    }

    if (window.addEventListener) {
      window.addEventListener("message", rcvMsg, false);
    } else {
      window.attachEvent("onmessage", rcvMsg);
    }

    function cleanup() {
      loaded = true;
      if (window.removeEventListener) {
        window.removeEventListener("message", rcvMsg, false);
      } else {
        window.detachEvent("onmessage", rcvMsg);
      }
    }

    // use a timer as a backup in case our iframe fails for whatever reason
    //
    // one possible scenario where this could happen is on sites which run
    // extra "security" scripts which remove "unauthorized" iframes upon
    // detection. this is to protect against malware attacks.
    //
    // so as a workaround we use a timer to fallback to a DOM insert load of
    // ba.js.
    //
    // FIXME: currently the timer doesn't work because when BAP.start() is called,
    //        it adds an window.load event. If this event has already fired then
    //        it will wait an additional 5 sec before firing..
    window.setTimeout(function() {
      if (loaded) {
        return;
      }
      cleanup();
      loadBaJsViaDom(durly_script, opts);
    }, 3000);
  }

  function loadBaJsViaDom(durly_script, opts) {
    var loaded = false,
      _scr = document.createElement("script");
    _scr.id = "ba.js";
    _scr.src = _durly_url + "/geo/ba.js?" + _durly_rev;
    console.log("loadBaJsViaDom");
    if (navigator.userAgent.indexOf("MSIE ") > -1) {
      _scr.onreadystatechange = function() {
        if (
          !loaded &&
          (this.readyState === "loaded" || this.readyState === "complete")
        ) {
          loaded = true;

          _scr.onload();
          _scr.onload = null;
        }
      };
    }

    function clone(obj) {
      if (!obj || "object" !== typeof obj) {
        return obj;
      }
      var copy = obj.constructor();
      for (var attr in obj) {
        if (obj.hasOwnProperty(attr)) {
          copy[attr] = obj[attr];
        }
      }
      return copy;
    }

    var _bao2 = clone(opts);
    _scr.onload = function() {
      window.BAPStart(_bao2);
    };

    durly_script.parentNode.insertBefore(_scr, durly_script);
  } // loadBaJsViaDom

  // isolating the call to drop the pixel
  function dropPixel(scriptEle, randomValue) {
    var px = document.createElement("IMG");
    px.src = _durly_url + "/a/4.gif";
    px.style.display = "none";
    px.id = "bap-pixel-" + randomValue;
    if (scriptEle) {
      scriptEle.parentNode.insertBefore(px, scriptEle.nextSibling);
    } else {
      document.body.appendChild(px);
    }
  }

  function execute() {
    //Let's find ourselves within the loaded scripts.
    for (var i = 0; i < _durly_s.length; i++) {
      var durly_script = _durly_s[i];
      // skip if no source exists
      if (!durly_script.src) {
        continue;
      }
      // skip when its already been processed
      if (durly_script._durly) {
        continue;
      }

      // an akamai url was previously used to serve https resources
      var _durly_src = durly_script.src,
        _durly_own =
          isBetrad(_durly_src) ||
          /^https?:\/\/a248.e.akamai.net/.test(_durly_src); //TODO: check this url...

      // check if the src is indeed ours
      if (_durly_src.match("durly.js") && _durly_own) {
        // mark this script object as processed
        durly_script._durly = 1;

        var _nw = false,
          _durly_rnd = Math.floor(Math.random() * 100000),
          _durly_ex = _durly_src.split(";");

        _bao.uqid = _durly_rnd;
        _durly_ex = _durly_ex.splice(1, _durly_ex.length);

        for (var j = 0; j < _durly_ex.length; j++) {
          if (_durly_ex[j] === "r=0") {
            return;
          }
          var _durly_arg = _durly_ex[j].split("=");
          _bao[_durly_arg[0]] = unescape(_durly_arg[1]);
          if (_durly_arg[0] === "nowrite") {
            _nw = true;
          }
        }
        _bao.icon_display = "expandable";
        // record the order in which the tag has shown up in the frame array
        _bao.order = i;
        // can get the height/width here.  _bao.ad_h and _bao.ad_w

        if (is_mobile && !_bao.in_app) {
          // see if we should be running in-app
          _bao.in_app = isInApp(_bao.ad_w, _bao.ad_h, _bao.vpaid);
        }

        this._bao = _bao;
        if (_nw && !is_mobile) {
          // writing out pixel for pixel locator
          dropPixel(durly_script, _durly_rnd);

          // write out tag calls in
          if (!document.getElementById("ba.js")) {
            if (supportsLocalStorage()) {
              useLocalStorage(durly_script, _bao);

              // insert iframe
              var _l = document.createElement("iframe");
              _l.style.display = "none";
              _l.id = "ba.html";
              _l.src = _durly_url + "/ba.html?" + _durly_rev;
              durly_script.parentNode.insertBefore(_l, durly_script);
            } else {
              loadBaJsViaDom(durly_script, _bao);
            }
          } else {
            // already have ba.js, call window.BAPStart
            window.BAPStart(_bao);
          }
        } else if (is_mobile) {
          dropPixel(durly_script, _durly_rnd);

          // MRAID - TODO jshint says: 	Functions declared within loops referencing an outer scoped variable may lead to confusing semantics.
          if (_bao.in_app === 1) {
            (function() {
              var scripts = document.getElementsByTagName("SCRIPT");
              for (var i = 0; i < scripts.length; i++) {
                if (!scripts[i].src) {
                  continue;
                }
                if (/mraid.js/.test(scripts[i].src)) {
                  return;
                }
              }
              var mraid_script = document.createElement("script");
              mraid_script.async = false;
              mraid_script.src = "mraid.js";
              document.body.appendChild(mraid_script);
            })();
          }

          if (document.getElementById("ba.js") === null) {
            var mobile_script = document.createElement("SCRIPT");
            mobile_script.setAttribute("id", "ba.js");
            mobile_script.async = !(_bao.in_app === 1);

            mobile_script.setAttribute(
              "src",
              _durly_url + "/mobile/mobile-64.js"
            );
            document.body.appendChild(mobile_script);
          }

          window.BAPStart(_bao);
        } else {
          dropPixel(null, _durly_rnd);
          var baScript = document.createElement("SCRIPT");
          baScript.setAttribute("id", "ba.js");
          baScript.setAttribute("src", _durly_url + "/js/ba.js?" + _durly_rev);
          document.body.appendChild(baScript);
          window.BAPStart(_bao);
        }
      }
    }
  }

  if (document.body) {
    execute();
  } else {
    window.onload = execute;
  }
})(true);

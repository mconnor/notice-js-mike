var BAP =
  (BAP && BAP.start ? BAP : false) ||
  (function() {
    var API = {},
      SCRIPT_VERSION = 1, // increment this on script changes so we can track through the sewer
      /* NON_PROD */
      logging = true,
      /* NON_PROD */
      detection = "on",
      skip = [],
      extra = false,
      processed = false,
      rendered = false,
      loaded = false,
      version = "2",
      treatment = "2",
      country = "us",
      cicon = "",
      micon = "ci",
      BAP = {
        CSS_COMMON: null,
        CSS_1: null,
        CSS_2: null,
        CSS_5: null,
        CSS_6: null,
        options: {}
      },
      // mass shorteners
      // 	this part is automated, see: cleaner.rb
      // _w = window,
      // _e = encodeURIComponent,
      // _o = BAP.options,
      // _n = null,
      // _st = setTimeout,
      // _pi = parseInt,
      // _pf = parseFloat,
      // _l = 'length'
      // _d = document
      // end shorteners
      protocol =
        window.location.href.indexOf("http://") === 0 ? "http://" : "https://",
      DOMAIN_ROOT = protocol + "dev.betrad.com",
      DOMAIN_CSS = DOMAIN_ROOT + "/a/",
      DOMAIN_JSON = DOMAIN_ROOT + "/a/",
      DOMAIN_INFO = "https://info.evidon.com/",
      body = document.getElementsByTagName("body")[0],
      // error pixels -- this array exists to record a sent error pixel / nid for the purposes of not logging the same error twice
      ep = {},
      // iframes on the page and their associated ids
      tangoPartners = {},
      // coveredNotices is taken out of BAP.options for the cases when BAP.options notices are removed (iframe and transiotion cases)
      coveredNotices = {},
      iX = 0,
      processTimeout,
      mq = [],
      frameNoticed = {},
      json = {},
      nids = {},
      log = {},
      loadQueue = 0,
      domain = document.domain,
      _gdn,
      browser = (function() {
        var ua = navigator.userAgent,
          isOpera =
            Object.prototype.toString.call(window.opera) === "[object Opera]",
          safv = ua.substring(ua.indexOf("Version") + "Version".length + 1),
          ie = !!window.attachEvent && !isOpera && document.createStyleSheet;
        try {
          safv = safv.substring(0, safv.indexOf(" "));
        } catch (e) {}
        return {
          IE: ie,
          IE6: ua.indexOf("MSIE 6") > -1,
          IE7: ua.indexOf("MSIE 7") > -1,
          IE8: ua.indexOf("MSIE 8") > -1,
          Opera: isOpera,
          Gecko: ua.indexOf("Gecko") > -1 && ua.indexOf("KHTML") === -1,
          Safari: ua.indexOf("Safari") > -1 && ua.indexOf("Chrome") <= -1,
          Chrome: !!ua.match("Chrome"),
          QuirksMode: ie && document.compatMode === "BackCompat",
          SafariVersion: safv
        };
      })(),
      ifr = top.location !== location,
      rh,
      getAdStandard;

    // process, inject, start, cleanup, testWhitelist, copyOptions,
    // scroll, setIntervalWithFalloff, testMs, testTruste;
    /*
    options: {
    	nid: 123,									// Evidon notice id
     	uqid:	123,								// Generated on page unique page id
     	icaid: 123,								// Evidon campaign id
     	ecaid: 123,								// Your own campaign id
     	coid: 123,								// Evidon company id
     	aid: 123,									// Evidon advertiser id
     	ad_h: 123,								// ad height in pixels
     	ad_w: 123,								// ad width in pixels
     	ad_wxh: 300x250						// ad width X height
     	ad_oas: 'WIDTH=160 HEIGHT=600'
     	position: 'top-left'			// position
     	ad_z: 2000								// z index to use
     	container: 'element id'		// will be used as the anchor elemetn for the notice
     	check_container: true			// if container is used, look into it and select best fitting element AND ad standard
     	delay_start: 1						// delay processing start by this many seconds
     	adi: dmd.ehow,dmd.poop		// dfa whitelist
    }
    */
    function start(options) {
      var v,
        i,
        o = {},
        bap_url,
        pageId;
      /**
       * Special case that occurs when BAP.start has been called, but BAP has
       * not loaded or unpacked yet. Specifically covers IE 6-9 for the cases
       * when loading is still going. In this case, we push into _bab array
       * every time that the error occurs during SURLY load. Afterwards, once
       * BAP.start() has been called, we first check if there were unsuccessful
       * previous attempts, and start them if there were.
       */
      try {
        if (!!window._bab) {
          v = window._bab;
          window._bab = null;
          for (i = 0; i < v.length; i++) {
            start(v[i]);
          }
        }
      } catch (e) {}
      if (options) {
        if (!options.uqid) {
          return;
        } else {
          pageId = options.uqid;
          if (BAP.options[pageId]) {
            return;
          }
        }
        // Convert properties to lower case since we have some odd clients...
        try {
          for (i in options) {
            if (options.hasOwnProperty(i)) {
              o[i.toLowerCase()] = options[i];
            }
          }
          options = o;
        } catch (e) {}
        if (options.ad_oas) {
          try {
            options.ad_oas = options.ad_oas.toLowerCase();
            options.ad_wxh = options.ad_oas
              .replace("width=", "")
              .replace("height=", "")
              .replace(" ", "x");
          } catch (e) {}
        }
        if (options.ad_wxh) {
          try {
            options.ad_wxh = options.ad_wxh.toLowerCase();
            options.ad_w = options.ad_w || options.ad_wxh.split("x")[0];
            options.ad_h = options.ad_h || options.ad_wxh.split("x")[1];
          } catch (e) {}
        }
        if (!options.ad_w || !options.ad_h) {
          error(options, 13);
          return;
        }
        if (!parseInt(options.ad_w) || !parseInt(options.ad_h)) {
          error(options, 15);
          return;
        }
        if (options.ad_h < 15 && options.ad_w < 20) {
          error(options, 14);
          return;
        }
        if (!options.coid) {
          error(options, 9);
          return;
        }
        options.pixel_ad_w = options.ad_w;
        options.pixel_ad_h = options.ad_h;
        // removing everything but the numbers.
        options.nid = options.nid
          .toString()
          .match(/\d/g)
          .join("");
        // clean up campaign id
        options.ecaid && (options.ecaid = options.ecaid.split("%")[0]);
        nids[pageId] = options.nid;
        bap_url = "n/" + options.coid + "/" + options.nid;
        BAP.options[pageId] = options;
        if (
          !extra &&
          ((options.check_container && options.check_container === "true") ||
            /^(1525|4501|7420|8573)$/.test(options.nid))
        ) {
          i = document.createElement("script");
          i.src = DOMAIN_ROOT + "/a/e.js";
          body.appendChild(i);
        }
        if (bap_url) {
          if (!json[options.nid]) {
            loadQueue++;
            i = document.createElement("script");
            //i.src = DOMAIN_JSON + bap_url + ".js";
            // LOCAL TESTING
            BAP.options[pageId].new_l2 = (BAP.options[pageId].new_l2 == 'true');
            if (BAP.options[pageId].new_l2) {
                i.src = '//mconnor.github.io/testVast/data/140413.js';
            //   i.src = '//mconnor.github.io/testVast/data/64564.js';
            } else {
                
              i.src = '//mconnor.github.io/testVast/data/140413.js';
            }
            // END LOCAL TESTING
            body.appendChild(i);
          }
        } else {
          // remove whatever we pushed in
          delete BAP.options[pageId];
          error(options, 11);
        }
        // hide the pixel until needed.
        try {
          $("bap-pixel-" + pageId).style.display = "none";
        } catch (e) {}
      } else {
        error(null, 10);
      }
      // Helping Collective help us!
      if (options.nid === 546) {
        options.delay_start = 1;
      }
      if (!loaded) {
        var delayStart = function() {
          loaded = true;
          if (options.delay_start) {
            setTimeout(process, options.delay_start * 1000);
          } else {
            process();
          }
        };
        if (document.readyState === "complete") {
          delayStart();
        } else {
          addEvent(window, "load", delayStart);
        }
        // trap when the onload doesn't fire. set to fire 5 seconds after.
        if (processTimeout) {
          clearTimeout(processTimeout);
        }
        processTimeout = setTimeout(process, 5000);
      } else if (loaded && processed) {
        processed = false;
        process();
      }
    }
    //var rh, sizes, getAdStandard;

    function inject(o) {
      extra = true;
      rh = o.rh;
      checkChildren = o.checkChildren;
      getAdStandard = o.getAdStandard;
      //sizes = o.sizes;
      o.inject({
        isValidElement: isValidElement,
        getDims: getDims,
        checkElement: checkElement,
        getObjectEmbed: getObjectEmbed
      });
    }
    /**
     * Used in cleaning up notices that became outdated or otherwise not needed.
     */
    function cleanup(pageId) {
      // if (window.removeEventListener) {
      //   	window.removeEventListener("load", delayStart);
      //   	window.removeEventListener("message", handleMessage);
      //   	window.removeEventListener("resize", resize);
      //   	window.removeEventListener("scroll", scroll);
      // } else {
      // 	window.detachEvent("on" + "load", delayStart);
      //     window.detachEvent("on" + "message", handleMessage);
      //   	window.detachEvent("on" + "resize", resize);
      //   	window.detachEvent("on" + "scroll", scroll);
      // }
      try {
        delete BAP.options[pageId];
        var px = $("bap-pixel-" + pageId);
        px && px.parentNode.removeChild(px);
        px = $("trigger-container-" + pageId);
        px && px.parentNode.removeChild(px);
      } catch (e) {}
    }

    function process() {


      BAP.CSS_COMMON =
      "html {\
        -webkit-box-sizing: border-box;\
        -moz-box-sizing: border-box;\
        box-sizing: border-box;\
      }\
      *, *:before, *:after {\
        -webkit-box-sizing: inherit;\
        -moz-box-sizing: inherit;\
        box-sizing: inherit;\
      }\
      .bap-img-container { \
        height: 42px;\
        max-height: 46px; \
        max-width: 118px; \
        padding: 3px 10px 3px 10px;\
      } \
      .bap-img-container img { \
        max-height: 34px; \
      } \
      .center-horiz { \
        margin: 0 auto 0 auto; \
        text-align:center; \
      } \
      .center-vert { \
        margin: 0; \
        top: 50%; \
        -webkit-transform: translateY(-50%); \
        -ms-transform: translateY(-50%); \
        transform: translateY(-50%); \
        position: absolute; \
      } \
      .inline-block { \
        display:inline-block; \
      } \
      .height-33 { \
        height: 33%; \
      } \
      .padding-top-5percent { \
        padding-top: 5%; \
      } \
      .border-gray { \
        border: 1px gray solid; \
      } \
      .width100p { \
        width: 100%; \
      } \
      .height100p { \
        height: 100%; \
      } \
      .bap-links { \
        font-size: .9em; \
        font-weight: bold; \
        bottom: 0; \
        width: 100%; \
        line-height: 1.3em; \
      } \
      .position-relative { \
        position: relative; \
      } \
      .position-absolute { \
        position: absolute; \
      } \
      .bap-links-new-l2 { \
        text-align: center; \
        font-size: .8em; \
        margin-top: 4px; \
      } \
      .bap-links-new-l2 div { \
        margin: 6px 0 6px 0;\
      } \
      .bap-links a { \
        color: #2b2f98; \
        text-decoration: none; \
      } \
      .bap-links-new-l2 a { \
        color: #58a0cb; \
        text-decoration: none; \
      } \
      .bap-close { \
        z-index: 2; \
        position: absolute; \
        font-size: 1em; \
        -webkit-user-select: none; \
        -moz-user-select: none; \
        -ms-user-select: none; \
        user-select: none; \
        cursor: pointer; \
        user-select: none; \
      } \
      .bap-close-old-l2 { \
        top: 3px; \
        right: 10px; \
      }\
      .bap-close-new-l2 { \
        top: -1px; \
        right: 5px; \
      }\
      .font-100 { \
        font-weight: 100; \
      } \
      .font-bold { \
        font-weight: 500; \
      } \
      .gray-light {color: #707070;} \
      .border-top { \
        border-top: 1px #ababab solid; \
      } \
      .border-bottom {\
        border-bottom: 1px #ababab solid;\
      }\
      .border-right {\
        border-right: 1px #ababab solid;\
      }\
      .padding2_10_2_10 { \
        padding: 2px 10px 2px 10px; \
      }\
      .paddingLinksReg6 { \
        padding: 3px 4px 3px 10px; \
      }\
      .paddingLinksReg5 { \
        padding: 0 0 3px 10px; \
      }\
      .font-8 { \
        font-size: .8em; \
      } \
      .font-7 { \
        font-size: .7em; \
      } \
      .dimensions-reg1 { \
        width: 299px; \
      } \
      .dimensions-reg2-newl2 { \
        width: 159px; height: 342px; \
      } \
      .dimensions-reg2 { \
        width: 159px; height: 292px; \
      } \
      .dimensions-reg5-newl2 { \
        height: 199px; \
      } \
      .dimensions-reg5 { \
        width: 190px; \
        max-height: 249px;\
      } \
      .dimensions-reg6 { \
        min-width: 688px; height: 84px; \
      } \
      .dimensions-reg6-newl2 { \
        width: 726px;  \
      } \
      .heightReg6 { \
        height: 84px; \
      } \
      .bap-notice { \
        background-color: #FFFFFF; \
        position: absolute; \
        font-size: 12px; \
        z-index: 9991; \
        display:none; \
        font-family: -apple-system, BlinkMacSystemFont, Helvetica, sans-serif; \
      } \
      .bap-notice-old-l2 { \
        border: 2px white solid; \
      } \
      .bap-notice-new-l2 { \
        -webkit-box-shadow: 2px 2px 4px rgb(187, 185, 185); \
        box-shadow: 2px 2px 4px rgb(187, 185, 185); \
      } \
      .bap-blue,.bap-blue:link,.bap-blue:visited { \
        color: #2b2f98; \
      } \
      .bap-gray, .bap-gray:visited { \
        color: #444; \
      } \
      #BAP-holder img { \
        margin: 0; \
        padding: 0; \
        border: 0; \
        font-size: 100%; \
        font: inherit; \
        vertical-align: baseline; \
        max-width: 100%; \
        box-shadow: 0 0 !important; \
        -moz-box-shadow:0 0 !important; \
        -webkit-box-shadow: 0 0 !important; \
        background: none !important; \
      } \
      #BAP-holder { \
        position: static !important; \
      } \
      #BAP-holder .bap-trigger { \
        z-index: 9990; \
      } \
      .main-copy { \
        line-height: 13px; \
        color: rgb(0, 0, 0); \
        margin: 0 0 0 0; \
        padding: 5px 10px 4px 10px; \
      } \
      .main-copy-new-l2 { \
        color: rgb(138, 135, 135); \
        margin: 0 0 0 0; \
        line-height: 1.2em; \
      } \
      .bap-trigger { \
        cursor: pointer; \
      } \
      .bap-trigger img { \
        width: auto; \
        height: auto; \
      } \
      .evidon-logo { \
        position: absolute; \
        bottom: 5px; \
        left: 10px; \
      }";
      BAP.CSS_1 = ".bap1 { \
        width: 299px; \
        height: 232px; \
      }";

      /**
       * The order of processing might get called before json gets pulled in IE.
       * Adding slight delay to compensate.
       */
      if (loadQueue !== 0) {
        setTimeout(function() {
          loadQueue = 0;
          process();
        }, 500);
        return;
      }

      function copyOverrides(pageId, key, j) {
        for (j in window.bap_overrides[key]) {
          // if this is a known option, override
          if (BAP.options[pageId].hasOwnProperty(j)) {
            BAP.options[pageId][j] = window.bap_overrides[key][j];
          }
        }
      }
      if (processed) {
        return;
      }
      processed = true;
      if (window.bap_skip) {
        skip = skip.concat(window.bap_skip);
      }
      var i = [],
        j,
        k,
        pageId,
        s = false;
      _gdn = !!($("abgc") && window.abgp);
      try {
        // Invite partners for a dance!
        tango();
        css("COMMON");
        // enforcing order based on the reading order from surly.js
        for (pageId in BAP.options) {
          if (BAP.options.hasOwnProperty(pageId)) {
            i.push([pageId, BAP.options[pageId].order]);
          }
        }
        i.sort(function(a, b) {
          return a[1] - b[1];
        });
        for (k = 0; k < i.length; k++) {
          pageId = i[k][0];
          // skip if already processed
          if (BAP.options[pageId].processed) {
            continue;
          }
          // error check so see if this pageId's json is loaded
          if (!json[BAP.options[pageId].nid]) {
            error(BAP.options[pageId], 12);
            cleanup(pageId);
            continue;
          } else {
            // copy json into options
            copyOptions(pageId, BAP.options[pageId].nid);
          }
          // check the skip list, and pass if its in there
          for (j = 0; j < skip.length; j++) {
            if (
              skip[j] === BAP.options[pageId].nid ||
              skip[j] === BAP.options[pageId].nid + "|" + pageId ||
              skip[j] ===
                "size|" +
                  BAP.options[pageId].ad_w +
                  "x" +
                  BAP.options[pageId].ad_h
            ) {
              BAPUtil.trace("[process() cleanup trigger] cleaning based on the skip list [" +BAP.options[pageId].nid +"]");
              cleanup(pageId);
              s = true;
              break;
            }
            s = false;
          }
          if (s) {
            continue;
          }
          // Collective off param
          if (window.bap_546_h && BAP.options[pageId].nid === 546) {
            BAPUtil.trace("[process() cleanup trigger] cleaning based on Collective off parameter");
            cleanup(pageId);
            continue;
          }
          // enable amazon L2 when overwritten
          if (window.bap_amzn) {
            BAP.options[pageId].amzn = 1;
          }
          // if we have a global overrides object for notice options
          if (
            window.bap_overrides &&
            window.bap_overrides.hasOwnProperty(BAP.options[pageId].nid)
          ) {
            copyOverrides(pageId, BAP.options[pageId].nid);
          }
          // but sometimes, when a very special client shows up, this becomes a local overrider...
          if (
            window.bap_overrides &&
            window.bap_overrides.hasOwnProperty(
              BAP.options[pageId].nid + "|" + pageId
            )
          ) {
            copyOverrides(pageId, BAP.options[pageId].nid + "|" + pageId);
          }
          if (_gdn) {
            // overwrite defaults.
            BAP.options[pageId].position = "top-right";
            BAP.options[pageId].icon_display = "expandable";
            BAP.options[pageId].server = {
              name: "Google"
            };
            BAP.options[pageId].ad_z = 9011;
            $("abgc").style.display = "none";
          }
          // Determine notice detection mode
          noticeMode(pageId);
          // recheck the size skip here because the actual sizes may have changed for the cases such as
          // container recheck, or Colelctives force checks
          for (j = 0; j < skip.length; j++) {
            if (
              skip[j] ===
              "size|" +
                BAP.options[pageId].ad_w +
                "x" +
                BAP.options[pageId].ad_h
            ) {
              BAPUtil.trace("[process() cleanup trigger] cleaning based on the skip list after noticeMode detection [" +BAP.options[pageId].nid +"]");
              cleanup(pageId);
              s = true;
              break;
            }
            s = false;
          }
          if (s) {
            continue;
          }
          BAP.options[pageId].mini = isMini(
            BAP.options[pageId].ad_w,
            BAP.options[pageId].ad_h
          );
          // icon display reset for the cases when the ad size is shorter than L1 ison.
          if (BAP.options[pageId].ad_w < 90) {
            BAP.options[pageId].icon_display = "icon";
          }
          // Exit conditions START
          // TODO: wrap into a single method?
          if (BAP.options[pageId].adi && !testWhitelist(pageId)) {
            BAPUtil.trace("[process() cleanup trigger] cleaning based on doubleclick whitelist");
            cleanup(pageId);
            continue;
          }
          if (
            BAP.options[pageId].ad &&
            BAP.options[pageId].ad.style.display === "none"
          ) {
            // OHMIGODNO, its hidden!
            BAPUtil.trace("[process() cleanup trigger] cleaning because ad appears to be hidden");
            cleanup(pageId);
            continue;
          }
          // Exit if provided container did not have a known ad standard applied to it
          if (BAP.options[pageId].dm === 8 && !BAP.options[pageId].ad.ds) {
            BAPUtil.trace("[process() cleanup trigger] cleaning because notice standard is missing");
            cleanup(pageId);
            continue;
          }
          // Exit conditions END
          showNoticeHelper(pageId);
          // cleanup if there is a local notice that its part of.
          if (BAP.options[pageId].noticeExists) {
            BAPUtil.trace("[process() cleanup trigger] cleaning because notice already exists inthe same page / ad element");
            cleanup(pageId);
            continue;
          }
          createPopupLayer(pageId);
          BAP.options[pageId].processed = true;
        }
      } catch (e) {
        BAPUtil.trace("[process() error]", e);
      }
      // attaching resize event
      BAP.vs = frameSize()[0] < body.scrollHeight;
      iX = frameSize()[1];
      addEvent(window, "resize", resize);
      // movement detection
      setIntervalWithFalloff(function() {
        testTruste();
        testMs();
        testResize();
        testMovement();
      });
      // scroll detection
      addEvent(window, "scroll", scroll);
      rendered = true;
    }
    /**
     * DFA Whitelist tester
     */
    function testWhitelist(pageId) {
      var f,
        c,
        i,
        j,
        el,
        v = BAP.options[pageId].adi.split(",");
      // DFA whitelist
      try {
        // if adi is passed, check if the doc location has it and stop processing for it, if it doesn't.
        // iframe base: http://ad.doubleclick.net/adj/dmd.ehow/
        if (BAP.options[pageId].dm === 5) {
          for (i in v) {
            if (document.location.href.indexOf("/" + v[i] + "/") > 0) {
              c = true;
              break;
            }
          }
        } else {
          // a different detection method is used, attempt DOM traversal.
          f = BAP.options[pageId].ad.parentNode;
          while (true) {
            for (j = 0; j < f.children.length; j++) {
              el = f.children[j];
              if (el.src) {
                for (i in v) {
                  if (el.src.indexOf("/" + v[i] + "/") > 0) {
                    c = true;
                    break;
                  }
                }
              }
            }
            if (c) {
              break;
            }
            f = f.parentNode;
            if (!f || !f.children) {
              break;
            }
          }
        }
      } catch (e) {}
      return c;
    }

    function copyOptions(pageId, nid) {
      try {
        var cud = json[nid].data;
        BAP.options[pageId].advName = cud.adv_name || null;
        BAP.options[pageId].advMessage = cud.adv_msg || null;
        BAP.options[pageId].advLogo =
          cud.adv_logo.replace("http:", "https:") || null;
        BAP.options[pageId].advLink = cud.adv_link || null;
        BAP.options[pageId].rev = cud.revision || 0;
        BAP.options[pageId].behavioral = cud.behavioral || "definitive";
        BAP.options[pageId].behavioralCustomMessage = cud.generic_text || "";
        if(cud.hide_wi ) {
            BAP.options[pageId].hideWhatIs = true;
        }
        if(cud.hide_cl ) {
            BAP.options[pageId].hideCustom = true;
        }
        // default translation
        BAP.options[pageId].defTrans = {};


        if (cud.default_generic1) {
            BAP.options[pageId].defTrans.generic1 = cud.default_generic1;
        }
        if (cud.default_generic2) {
            BAP.options[pageId].defTrans.generic2 = cud.default_generic2;
        }
        if (cud.default_generic3) {
            BAP.options[pageId].defTrans.generic3 = cud.default_generic3;
        }
        if (cud.default_generic4) {
            BAP.options[pageId].defTrans.generic4 = cud.default_generic4;
        }
        if (cud.default_generic5) {
            BAP.options[pageId].defTrans.generic5 = cud.default_generic5;
        }
        if (cud.default_generic6) {
            BAP.options[pageId].defTrans.generic6 = cud.default_generic6;
        }
        if (cud.default_link1) {
          BAP.options[pageId].defTrans.link1 = cud.default_link1;
        }
        if (cud.default_link2) {
          BAP.options[pageId].defTrans.link2 = cud.default_link2;
        }
        if (cud.default_link3) {
          BAP.options[pageId].defTrans.link3 = cud.default_link3;
        } 
        if (cud.default_footer) {
          BAP.options[pageId].defTrans.footer = cud.default_footer;
        }
        // reusing skip flag if the L1 has no appropriate L2, but is not a mini.
        BAP.options[pageId].skipL2 =
          cud.skip_L2 ||
          isSkipper(BAP.options[pageId].ad_w, BAP.options[pageId].ad_h) || BAP.options[pageId].vast;
        // overwrite with localized version if available
        var mp = cud.message_properties || "";
        if (mp["behavioral_" + country]) {
          BAP.options[pageId].behavioral = mp["behavioral_" + country];
        }
        if (mp["behavioral_" + country]) {
           BAP.options[pageId].noDefault = true;
        }
        // default icon
        if(cud.default_icon && !BAP.options[pageId].noDefault) {
            BAP.options[pageId].cicon = cud.default_icon;
        }

        if (mp["generic_text_" + country]) {
         BAP.options[pageId].behavioralCustomMessage = mp["generic_text_" + country];
        }
        if (mp["adv_name_" + country]) {
         BAP.options[pageId].advName = mp["adv_name_" + country];
        }
        if (mp["adv_msg_" + country]) {
         BAP.options[pageId].advMessage = mp["adv_msg_" + country];
        }
        if (mp["adv_logo_" + country]) {
          BAP.options[pageId].advLogo = mp["adv_logo_" + country].replace(
            "http:",
            "https:"
          );
        }
        if (mp["adv_link_" + country]) {
          BAP.options[pageId].advLink = mp["adv_link_" + country];
        }
        if (mp["translation_" + country]) {
          BAP.options[pageId].translation = mp["translation_" + country];
        }
        if (mp["translation_" + country]) {
          BAP.options[pageId].cicon = mp["translation_" + country].icon;
        }
        if (mp.hasOwnProperty("skip_L2_" + country)) {
          BAP.options[pageId].skipL2 = mp["skip_L2_" + country];
        }

        /// L3
        var a7 = mp.hasOwnProperty("custom_optout_" + country) ? mp["custom_optout_" + country] : (cud.hasOwnProperty("custom_optout") ? cud.custom_optout : null);
        if (a7) {
          BAP.options[pageId].customL3 = a7.desktop;
        } else {
          BAP.options[pageId].customL3 = null;
        }
        
        BAP.options[pageId].icon_delay = cud.icon_delay || 0;
        BAP.options[pageId].icon_display = cud.icon_display || "normal";
        BAP.options[pageId].icon_display = cud.icon_expandable
          ? "expandable"
          : BAP.options[pageId].icon_display;
        BAP.options[pageId].icon_grayscale = cud.icon_grayscale || 100;
        BAP.options[pageId].container_opacity = cud.container_opacity || 100;
        // offsets
        BAP.options[pageId].offsetTop = cud.offset_y
          ? !isNaN(parseInt(cud.offset_y)) ? parseInt(cud.offset_y) : 0
          : 0;
        BAP.options[pageId].offsetLeft = cud.offset_x
          ? !isNaN(parseInt(cud.offset_x)) ? parseInt(cud.offset_x) : 0
          : 0;
        try {
          BAP.options[pageId].server = cud.server[0];
        } catch (e) {
          BAP.options[pageId].server = {
            id: 0,
            name: "Evidon"
          };
        }
        // Could have been passed in initial options array, if so, ignore JSON setting.
        if (!BAP.options[pageId].position) {
          BAP.options[pageId].position = cud.icon_position || "top-right";
        }
        // custom vs. daa icon - used to change directory where icons are pulled from
        if (!BAP.options[pageId].icon) {
          BAP.options[pageId].icon = cud.generic_icon ? "g" : "d";
        }
        BAP.options[pageId].positionVertical = function() {
          return this.position.indexOf("top") >= 0 ? "top" : "bottom";
        };
        BAP.options[pageId].positionHorizontal = function() {
          return this.position.indexOf("left") >= 0 ? "left" : "right";
        };
        // TODO: mayhaps remove this crap?
        if (!nids[pageId]) {
          nids[pageId] = BAP.options[pageId].nid = cud.nid || null;
        }
        BAP.options[pageId].ad_h = parseInt(BAP.options[pageId].ad_h);
        BAP.options[pageId].ad_w = parseInt(BAP.options[pageId].ad_w);
        BAP.options[pageId].vast = (BAP.options[pageId].vast == 'true');
        BAP.options[pageId].vpaid = (BAP.options[pageId].vpaid == 'true');

        // reset detection mode
        BAP.options[pageId].dm = -1;
        // setting additional notice layer to empty
        coveredNotices[pageId] = {};
        // default icon size
        BAP.options[pageId].ciconWidth = 77;
        BAP.options[pageId].miconWidth = 19;
        // if short length notice, overwrite length.
        if (
          BAP.options[pageId].cicon === "_nl" ||
          (!BAP.options[pageId].cicon && country === "nl")
        ) {
          BAP.options[pageId].ciconWidth = 47;
        }
        // if extended length notice, overwrite length and set to be expandable.
        if (
          /_(de|es|nl_be|si|mt|lt|gr|ee|is|bg|tr|il|ar|ar_eg|hr|rs)$/.test(
            BAP.options[pageId].cicon
          ) ||
          (!BAP.options[pageId].cicon &&
            /de|es|be|si|mt|lt|gr|cy|ee|is|bg|tr|il|sa|eg|hr|rs/.test(country))
        ) {
          //BAP.options[pageId].icon_display = 'expandable';
          BAP.options[pageId].ciconWidth = 107;
        }
        // vendor specific icon display cases
        // Invite Media
        if (
          BAP.options[pageId].coid === 322 &&
          /row|ru|cn|il|mx|tr|eg|sa|br|ar|tw|kr|jp/.test(country)
        ) {
          BAP.options[pageId].icon_display = "expandable";
          BAP.options[pageId].icon_grayscale = "";
          BAP.options[pageId].ciconWidth = 107;
          BAP.options[pageId].cicon = "g";
          micon = "gi";
        }
      } catch (e) {
        BAPUtil.trace("[copyOptions() error]", e);
      }
    }

    function copyJSON(cud) {
      try {
        json[cud.data.nid] = cud;
        loadQueue--;
      } catch (e) {
        BAPUtil.trace("[copyJSON() error]", e);
      }
    }

    function scroll() {
      try {
        testMovement();
        // Fire again 100ms later; this fixes an issue where when you scroll back to the top of
        // the page, the actual adunit doesn't finish moving right away so we end up with an
        // incorrectly positioned notice. By firing again after a short delay, we should fix this.
        setTimeout(testMovement, 100);
      } catch (e) {
        BAPUtil.trace("[scroll() error]", e);
      }
    }
    /**
     * Periodically calls function func.
     * Calls it once after an initial delay (200 ms),
     * then calls it every 100 ms for 10 seconds,
     * then calls it every 5000 ms for 60 seconds.
     */
    function setIntervalWithFalloff(func) {
      var i = 0,
        repeater = function() {
          try {
            if (i === 0) {
              i++;
              setTimeout(repeater, 200);
            } else {
              func();
              if (i < 100) {
                // reset timer @ 100 ms for the next 10 sec
                i++;
                setTimeout(repeater, 100);
              } else if (i < 115) {
                // 5 sec timer for the next 60 sec
                i++;
                if (i === 101) {
                  /* NON_PROD */
                  BAPUtil.trace("[setIntervalWithFalloff] dropping timer to 5 sec");
                } /* NON_PROD */
                setTimeout(repeater, 5000);
              } else {
                BAPUtil.trace("[setIntervalWithFalloff] killing timer completely");
              }
            }
          } catch (e) {
            BAPUtil.trace("[setIntervalWithFalloff error]", e);
          }
        };
      return repeater();
    }
    /**
     * Hides Microsoft Advertising / Atlas.
     */
    function testMs() {
      var ms = window.__MicrosoftAdvertising,
        msAd,
        pageId;
      if (ms && ms.Ad) {
        for (pageId in BAP.options) {
          if (BAP.options.hasOwnProperty(pageId) && !BAP.options[pageId]._ms) {
            msAd =
              ms.Ad.getByPlacementId(BAP.options[pageId].atl_id) ||
              ms.Ad.get(BAP.options[pageId].ad);
            if (msAd) {
              msAd.removePlugin("AdChoices");
              BAP.options[pageId]._ms = true;
            }
          }
        }
      }
    }

    function testTruste() {
      function l(o) {
        for (var i in o) {
          if (o.hasOwnProperty(i)) {
            for (var pageId in BAP.options) {
              if (BAP.options[pageId].ad === o[i]) {
                BAPUtil.trace("[testTruste()] Matched Truste covered creative, cleaning up.");
                cleanup(pageId);
                return;
              }
            }
          }
        }
      }
      var t = window.truste;
      // cheaper to fail quickly rather than try to validate if all the sub stuff is present
      try {
        l(t.ca.contMap);
      } catch (err) {
        //console.log(err.messsage)
      }
      try {
        l(t.ca2.contMap);
      } catch (err) {}
    }
    /**
     * Look for movement, of either the ad or pixel elements, after we've already
     * rendered the notice.
     *
     * Dynamic content/AJAX widgets (like facebook connect) can fire several seconds after
     * our notice has loaded, causing elements to shift position. This is meant to detect
     * those movements.
     *
     * This function is triggered via setTimeout() and will slow down after 10sec and kill
     * itself after about a minute.
     */

    function testResize() {
      var pageId;
      for (pageId in BAP.options) {
        if (!isNonTimerDm(BAP.options[pageId].dm)) {
          noticePositionCalculate(pageId);
          noticePosition(pageId);
          repositionL2(pageId);
        }
      }
    }
    function testMovement() {
      var b, pEl, el, pageId;
      for (pageId in BAP.options) {
        if (BAP.options[pageId].dm !== 3) {
          b = BAP.options[pageId];
          if (b.dm === 5) {
            // skip iframes
            return;
          } else if (b.dm === 6) {
            // use pixel element
            el = b.px;
          } else {
            // use ad element
            el = b.ad;
          }
          // Occurs when the notice becomes detached, example: DV or TRUSTe or iVillage via MediaMind
          pEl = el;
          if (
            !BAP.options[pageId].hidden &&
            !BAP.options[pageId].detached &&
            pEl
          ) {
            while (true) {
              pEl = pEl.parentNode;
              if (pEl === body) {
                break;
              }
              if (pEl) {
                continue;
              } else {
                BAPUtil.trace("[testMovement()] Found a detached element");
                BAP.options[pageId].detached = true;
                break;
              }
            }
          } else {
            // TODO: this is a part of noticeMode.  Maybe move it out?
            pEl = proximityDetection(
              BAP.options[pageId].proximityId,
              BAP.options[pageId].ad_w,
              BAP.options[pageId].ad_h
            );
            pEl = pickChildLevel(
              pEl,
              BAP.options[pageId].ad_h,
              BAP.options[pageId].ad_w
            );
            if (pEl) {
              BAP.options[pageId].ad = pEl;
            }
            BAP.options[pageId].detached = false;
            BAPUtil.trace("[testMovement()] Detached element re-anchored");
          }
          // determine current visibility
          if (
            b.dm !== 6 &&
            ((el.offsetWidth === 0 && el.offsetHeight === 0) ||
              getStyle(el, "display") === "none")
          ) {
            BAP.options[pageId].hidden = true;
          } else {
            BAP.options[pageId].hidden = false;
          }
          if (BAP.options[pageId].detached || BAP.options[pageId].hidden) {
            BAPUtil.trace( "[testMovement()] Hiding notice due to the loss of anchor element");
            hidePopup(pageId);
            $("trigger-container-" + pageId).style.display = "none";
            continue;
          } else {
            $("trigger-container-" + pageId).style.display = "";
          }
          try {
            var p = _offset(el);
            if (p.top !== b.pxt || p.left !== b.pxl) {
              // check current offset against stored values. if either differ, redraw!
              hidePopup(pageId);
              
              noticePositionCalculate(pageId);
              noticePosition(pageId);
            }
          } catch (e) {
          }
        }
      }
    }
    function resize() {
      try {
        var pageId,
          dX = frameSize()[1] - iX,
          vs = frameSize()[0] < body.scrollHeight,
          vsToggle = BAP.vs !== vs;
        if (dX !== 0 || vsToggle) {
          for (pageId in BAP.options) {
            if (BAP.options[pageId].ad) {
              BAP.options[pageId].ad_w = parseInt(
                BAP.options[pageId].ad.style.width ||
                  BAP.options[pageId].ad.width ||
                  BAP.options[pageId].ad.offsetWidth
              );
              BAP.options[pageId].ad_h = parseInt(
                BAP.options[pageId].ad.style.height ||
                  BAP.options[pageId].ad.height ||
                  BAP.options[pageId].ad.offsetHeight
              );
            }
            noticePositionCalculate(pageId);
            noticePosition(pageId);
            if ($("bap-notice-" + pageId)) {
              hidePopup(pageId);
              // update L2 position
              updateL2(pageId);
            }
          }
          iX = frameSize()[1];
          BAPUtil.trace("Resize event: X? " + (dX !== 0) + "|VS? " + vsToggle);
        }
        BAP.vs = vs;
      } catch (e) {
        BAPUtil.trace("[resize() error]", e);
      }
    }

    function logIdString(options) {
      return (
        [
          encodeURIComponent(options.aid || 0),
          encodeURIComponent(options.icaid || 0),
          encodeURIComponent(options.ecaid || 0)
            .replace(/_/g, "$underscore$")
            .replace(/%2F/g, "$fs$"),
          encodeURIComponent(options.nid || 0)
        ].join("_") + "/"
      );
    }

    function actionWrite(options, l, ow) {
      dropPixel(
        protocol +
          "l.betrad.com/ct/" +
          logIdString(options) +
          [
            country,
            l,
            options.pixel_ad_w,
            options.pixel_ad_h,
            242,
            options.coid,
            options.rev
          ].join("/") +
          "/" +
          "pixel.gif?v=" +
          version +
          "_" +
          SCRIPT_VERSION +
          "&ttid=" +
          treatment +
          "&d=" +
          domain +
          ow +
          "&r=" +
          Math.random()
      );
    }

    function dropPixel(u) {
      var img = new Image(0, 0);
      img.src = u;
      img.style.display = "none";
      body.appendChild(img);
    }

    function action(pageId, state) {
      /* NON_PROD */
      if (!logging) {
        return;
      }
      var l,
        key,
        ow = "",
        lo = log[pageId],
        sw = false;
      /*
        	T -- tag loaded; (this setting is no longer called)
        	I -- icon (L1) shown;
        	S -- notice (L2) shown;
        	A -- advertiser clicked;
        	B -- IAB clicked;
        	M -- more info;
        	O -- dynamic inclusion overwrite;
        */
      BAPUtil.trace("Logging action: " + state + " for " + pageId);
      if (!lo) {
        // DEPRECATED: 'T':[0,'1/0/0/0/0/0'],
        lo = {
          I: [0, "0/1/0/0/0/0"],
          S: [0, "0/0/1/0/0/0"],
          A: [0, "0/0/0/1/0/0"],
          B: [0, "0/0/0/0/1/0"],
          M: [0, "0/0/0/0/0/1"],
          O: [0, "0/1/0/0/0/0"]
        };
      }
      if (lo[state][0] === 0) {
        lo[state][0] = 1;
        l = lo[state][1];
        sw = true;
      }
      // shortcutting overwrite stateflag
      state === "O" && (ow = "&o=1");
      log[pageId] = lo;
      if (!sw) {
        return;
      }
      actionWrite(BAP.options[pageId], l, ow);
      // check if this notice overwrites others, and in the case of M and B, fire a logging pixel as well
      if (
        !BAP.options[pageId].noticeExists &&
        coveredNotices[pageId] &&
        (state === "B" || state === "M")
      ) {
        ow = "&o=1";
        for (key in coveredNotices[pageId]) {
          actionWrite(coveredNotices[pageId][key], l, ow);
        }
      }
    }

    function error(options, ec) {
      /* NON_PROD */
      if (detection === "tagui") {
        return;
      }
      /*
        	Error Codes:
        	- 9  -- coid missing
        	- 10 -- options missing
        	- 11 -- invalid options (pre json load)
        	- 12 -- json is not loaded
        	- 13 -- ad height or ad width is missing
        	- 14 -- height and width map to an invalid ad standard
        	- 15 -- ad height or ad width are invalid, most likely not a number
        	- 100 -- noscript served
        */
      BAPUtil.trace("Logging an error for: " + options.nid + " error code: " + ec);
      var pixel = logIdString(options);
      if (ep[pixel] !== ec) {
        ep[pixel] = ec;
        if (pixel) {
          dropPixel(
            protocol +
              "l.betrad.com/ct/" +
              pixel +
              "pixel.gif?e=" +
              ec +
              "&v=" +
              version +
              "_" +
              SCRIPT_VERSION +
              "&d=" +
              domain +
              "&r=" +
              Math.random()
          );
        }
      }
    }

    function expandIcon(pageId) {
      if (BAP.options[pageId].expanded) {
        return;
      }
      var iconWidth = 19,
        iconDir = BAP.options[pageId].icon === "g" ? "/icong" : "/icon",
        icon = DOMAIN_ROOT + iconDir + "/c_" + BAP.options[pageId].icon_grayscale + (BAP.options[pageId].cicon ? BAP.options[pageId].cicon : cicon) + ".png",
        trigger = $("trigger-" + pageId),
        triggerBox = $("trigger-box-" + pageId),
        currLeft = _offset(trigger).left;
      if (BAP.options[pageId].positionHorizontal() === "right") {
        currLeft = currLeft + iconWidth - BAP.options[pageId].ciconWidth;
      }
      trigger.style.left = currLeft + "px";
      trigger.innerHTML = '<img src="' + icon + '">';
      triggerBox.style.left = currLeft + "px";
      triggerBox.style.width =
        BAP.options[pageId].ciconWidth + "px";
      $("trigger-box-image-" + pageId).src = DOMAIN_ROOT + iconDir + "/box_" + BAP.options[pageId].ciconWidth + "_" + BAP.options[pageId].position + ".png";
      BAP.options[pageId].expanded = true;
      setTimeout(function() {
        trigger.onmouseover = null;
        trigger.onmouseout = function() {
          collapseIcon(pageId);
        };
      }, 1);
    }

    function collapseIcon(pageId) {
      if (!BAP.options[pageId].expanded) {
        return;
      }
      var iconWidth = 19,
        iconDir = BAP.options[pageId].icon === "g" ? "/icong" : "/icon",
        icon = DOMAIN_ROOT + iconDir + "/" + micon + ".png",
        trigger = $("trigger-" + pageId),
        currLeft = _offset(trigger).left;
      if (BAP.options[pageId].positionHorizontal() === "right") {
        currLeft = currLeft + BAP.options[pageId].ciconWidth - iconWidth;
      }
      trigger.style.left = currLeft + "px";
      trigger.innerHTML = '<img src="' + icon + '">';
      $("trigger-box-" + pageId).style.left = currLeft + "px";
      $("trigger-box-" + pageId).style.width = iconWidth + "px";
      $("trigger-box-image-" + pageId).src = DOMAIN_ROOT + iconDir + "/box_19_" + BAP.options[pageId].position + ".png";
      BAP.options[pageId].expanded = false;
      setTimeout(function() {
        trigger.onmouseover = function() {
          expandIcon(pageId);
        };
        trigger.onmouseout = null;
      }, 1);
    }

    function getDims(el) {
      try {
        var eh = el.height,
          ew = el.width;
        if (!eh) {
          eh = parseInt(getStyle(el, "height"));
        }
        if (!ew) {
          ew = parseInt(getStyle(el, "width"));
        }
        if (!eh) {
          eh = el.offsetHeight;
        }
        if (!ew) {
          ew = el.offsetWidth;
        }
        return [ew, eh];
      } catch (e) {}
      return false;
    }

    function checkElement(el, height, width) {
      try {
        var eh = getDims(el)[1],
          ew = getDims(el)[0];
        if (eh === height && ew === width) {
          return true;
        }
        // adding 10 pixel margin autoadjust
        if (
          eh <= height + 5 &&
          eh >= height - 5 &&
          ew >= width - 5 &&
          ew <= width + 5
        ) {
          return true;
        }
      } catch (e) {}
      return false;
    }

    function getObjectEmbed(ad) {
      // Short circuit for Safari since it never used <embed>
      if (browser.Safari && browser.SafariVersion.indexOf("5.1") < 0) {
        return ad;
      }
      var em, io, elx, embed;
      try {
        if (ad.nodeName.toLowerCase() === "object") {
          for (elx = ad.childNodes.length - 1; elx > 0; elx--) {
            embed = ad.childNodes[elx];
            if (embed.nodeName.toLowerCase() === "embed") {
              em = embed;
              break;
            }
            if (
              embed.nodeName.toLowerCase() === "object" &&
              embed.type === "application/x-shockwave-flash"
            ) {
              io = embed;
            }
          }
        }
        if (!em && io) {
          em = io;
        }
        if (browser.Gecko && em) {
          return em;
        }
        // Embed happens to be preferred but if dims are 0s, reuse original ad.
        if (em.offsetHeight === 0 && em.offsetWidth === 0) {
          return ad;
        }
        if ((browser.Chrome && em) || _offset(em).top !== 0) {
          ad = em;
        }
      } catch (e) {}
      return ad;
    }

    function checkSiblings(ob, spotHeight, spotWidth, level) {
      try {
        if (level === 15 || !ob) {
          return false;
        } else {
          if (nodeAcceptCheck(ob) && checkElement(ob, spotHeight, spotWidth)) {
            return ob;
          } else {
            /*jsl:ignore*/
            return checkSiblings(
              ob.previousSibling,
              spotHeight,
              spotWidth,
              ++level
            );
            /*jsl:end*/
          }
        }
      } catch (e) {
        return false;
      }
    }

    function nodeAcceptCheck(el) {
      return /DIV|IMG|EMBED|OBJECT|IFRAME|CANVAS|VIDEO|svg|ARTICLE|MAIN|ASIDE|FIGURE|NAV|SECTION/.test(
        el.nodeName
      );
    }
    function nodeIsContainer(el) {
      return /DIV|ARTICLE|MAIN|ASIDE|FIGURE|NAV|SECTION/.test(
        el.nodeName
      );
    }

    function checkChildren(ob, spotHeight, spotWidth) {
      try {
        if (!ob) {
          return false;
        } else {
          var _ = ob.children || ob.childNodes,
            q,
            o;
          if (_.length === 0) {
            return false;
          }
          for (o = 0; o < _.length; o++) {
            // validate the element
            if (!isValidElement(_[o])) {
              continue;
            }
            if (checkElement(_[o], spotHeight, spotWidth) && nodeIsContainer(_[o])) {
              return _[o];
              /*jsl:ignore*/
            } else if ((q = checkChildren(_[o], spotHeight, spotWidth)) && nodeIsContainer(_[o]) ) {
              /*jsl:end*/
              return q;
            }
          }
        }
      } catch (e) {
        return false;
      }
    }

    function pickChildLevel(el, h, w) {
      var a = el;
      while (true) {
        a = checkChildren(a, h, w);
        if (!a) {
          break;
        } else if (a.nodeName === "EMBED") {
          if (a.parentNode.nodeName === "OBJECT") {
            el = getObjectEmbed(a.parentNode);
            break;
          } else {
            el = a;
          }
        } else {
          if (a.nodeName === "OBJECT") {
            ad2 = getObjectEmbed(a);
          }
          el = a;
        }
      }
      return el;
    }

    function hidePopup(pageId) {
      try {
        var popup = $("bap-notice-" + pageId);
        if (popup) {
          popup.style.display = "none";
        }
      } catch (e) {}
    }

    function toggle(el) {
      if (!el.id) {
        el = $("bap-notice-" + el);
      }
      if (getStyle(el, "display") !== "none") {
        el.style.display = "none";
      } else {
        el.style.display = "block";
      }
    }
    /**
     * This method has been added to aggregate and append all vendor passed variables
     * to the more info link.
     */
    function vendor(pageId, v) {
      var p = [],
        key;
      if (BAP.options[pageId][v]) {
        p.push(
          v +
            "[" +
            nids[pageId] +
            "]=" +
            encodeURIComponent(BAP.options[pageId][v])
        );
      }
      if (coveredNotices[pageId]) {
        for (key in coveredNotices[pageId]) {
          var options = coveredNotices[pageId][key];
          if (options[v]) {
            p.push(v + "[" + key + "]=" + encodeURIComponent(options[v]));
          }
        }
      }
      return p.join("&");
    }
    /**
     * This method generates the more info link.
     */
    function moreInfoHref(pageId) {
      var vi,
        key,
        p = [],
        mi = DOMAIN_INFO + "more_info/" + nids[pageId];
      if (BAP.options[pageId].coid === "321") {
        // custom ownerIQ opt-out page.
        mi = "https://owneriq.evidon.com";
      } else {
       if (BAP.options[pageId].hasOwnProperty("customL3") && BAP.options[pageId].customL3) {
           mi = BAP.options[pageId].customL3;
       } else {
        for (key in coveredNotices[pageId]) {
            mi += "," + key;
          }
          // Add vendor links
          (vi = vendor(pageId, "cps")) && p.push(vi);
          (vi = vendor(pageId, "seg")) && p.push(vi);
          (vi = vendor(pageId, "ecaid")) && p.push(vi);
          if (_gdn) {
            p.push("gdn=1");
          }
          if (p.length > 0) {
            mi += "?" + p.join("&");
          }
       }
      }
      return mi;
    }
    /**
     * This method was created to resolve and limit the DNS queries per notice display.
     * This particular method only handles MORE INFO link since this link might need to
     * contain several notice ids.
     */
    function moreInfoLink(pageId) {
      link("bap-link-1-" + pageId, moreInfoHref(pageId));
    }

    function iabLink(pageId) {
      var key,
        mi =
          DOMAIN_INFO +
          "about_behavioral_advertising/section1?n=" +
          nids[pageId];
      for (key in coveredNotices[pageId]) {
        mi += "," + key;
      }
      link("bap-link-2-" + pageId, mi);
    }
    /**
     * This method was created to resolve and limit the DNS queries per notice display.
     * Its triggered on mouse over, and once executed, sets the correct href destination
     * for all of the links on the L2.
     */
    function link(tag, dest) {
      // NOTE: reattached every time more info link is hovered over in case a new notice
      // has been appended to the coveredNotices. Might be an overkill?
      $(tag).href = dest;
    }
    /**
     * This method injects the proper CSS into the usher page either via a new link element
     * or a direct style injection.  Direct injection is the proper production mode, external
     * include is only used in the development and staging modes.  This method relies on
     * BAPUtil.css that is removed for production deployment.
     */
    function css(reg) {
      var ss;
      if (reg && !$("bass-" + reg)) {
        if (BAP["CSS_" + reg]) {
          if (!browser.IE) {
            ss = document.createElement("style");
            ss.setAttribute("id", "bass-" + reg);
            ss.setAttribute("type", "text/css");
            ss.innerHTML = BAP["CSS_" + reg];
            body.appendChild(ss);
          } else {
            ss = document.createStyleSheet("");
            ss.cssText = BAP["CSS_" + reg];
          }
        } else {
          try { 
            BAPUtil.css(reg);
          } catch (err) {
            BAPUtil.trace("BAPUtil.css(reg) " + err.message);
          }
          
        }
      }
    }

    function $() {
      var i,
        elements = [];
      for (i = 0; i < arguments.length; i++) {
        var element = arguments[i];
        if (typeof element === "string") {
          element = document.getElementById(element);
        }
        if (arguments.length === 1) {
          //	console.log(element);
          return element;
        }
        elements.push(element);
      }
      return elements;
    }

    function addEvent(elm, evType, fn) {
      if (elm.addEventListener) {
        elm.addEventListener(evType, fn, false);
      } else {
        evType = "on" + evType;
        if (elm.attachEvent) {
          elm.attachEvent(evType, fn);
        } else {
          elm[evType] = fn;
        }
      }
    }

    function frameSize() {
      var width = -1,
        height = -1,
        iw = window.innerWidth,
        de = document.documentElement;
      try {
        if (typeof iw === "number") {
          width = iw;
          height = window.innerHeight;
        } else if (de && de.clientWidth) {
          width = de.clientWidth;
          height = de.clientHeight;
        } else if (body && body.clientWidth) {
          width = body.clientWidth;
          height = body.clientHeight;
        }
      } catch (e) {}
      return [height, width];
    }

    function getStyle(el, styleProp) {
      try {
        var y;
        if (el.currentStyle) {
          y = el.currentStyle[styleProp];
        } else if (window.getComputedStyle) {
          y = document.defaultView
            .getComputedStyle(el, null)
            .getPropertyValue(styleProp);
        }
        if (!y && styleProp === "text-align") {
          try {
            y = el.currentStyle.textAlign;
          } catch (e) {}
        }
        return y;
      } catch (e) {
        return null;
      }
    }

    function getDepth(el) {
      var z = browser.IE ? "zIndex" : "z-index",
        zi = null;
      if (!el) {
        return;
      }
      if (getStyle(el, z) === "auto") {
        zi = getDepth(el.parentNode);
      } else if (parseInt(getStyle(el, z)) > 0) {
        zi = getStyle(el, z);
      }
      return parseInt(zi) + 10;
    }

    function isMini(w, h) {
      if (w >= 728 && w <= 990 && (h >= 90 && h <= 125)) {
        return false;
      }
      if (w === 160 && h === 600) {
        return false;
      }
      return w < 190 || h < 145;
    }
    /**
     * This helper function identifies if an ad size is L2 skippable
     */
    function isSkipper(w, h) {
      return w === 970 && h === 66;
    }

    function sizeMatch(adw, adh) {
      var i,
        lastMatch = null,
        imgs = document.getElementsByTagName("img");
      for (i = 0; i < imgs.length; i++) {
        if (!imgs[i].height && !imgs[i].getAttribute("height")) {
          continue;
        }
        if (!imgs[i].width && !imgs[i].getAttribute("width")) {
          continue;
        }
        if (imgs[i].height === adh && imgs[i].width === adw) {
          lastMatch = imgs[i];
        } else if (
          parseInt(imgs[i].getAttribute("height")) === adh &&
          parseInt(imgs[i].getAttribute("width")) === adw
        ) {
          lastMatch = imgs[i];
        }
      }
      return lastMatch;
    }

    function isValidElement(el) {
      // skip if its already hidden
      if (
        (el.offsetWidth === 0 && el.offsetHeight === 0) ||
        getStyle(el, "display") === "none"
      ) {
        return false;
      }
      // skip if undefined dimensions
      if (!el.height && !el.getAttribute("height") && !getStyle(el, "height")) {
        return false;
      }
      if (!el.width && !el.getAttribute("width") && !getStyle(el, "width")) {
        return false;
      }
      return true;
    }

    function proximityDetection(pxId, spotWidth, spotHeight, px) {
      var i,
        d,
        w,
        h,
        img,
        key,
        rent,
        cm = null,
        matches = {},
        dist,
        everything = document.getElementsByTagName("*");
      for (i = 0; i < everything.length; i++) {
        if (nodeAcceptCheck(everything[i])) {
          img = everything[i];
          // skip EMBED if its parent is a proper OBJECT.
          if (
            img.nodeName === "EMBED" &&
            img.parentNode.nodeName === "OBJECT"
          ) {
            continue;
          }
          // validate the element
          if (!isValidElement(img)) {
            continue;
          }
          if (
            (img.height === spotHeight && img.width === spotWidth) ||
            (parseInt(img.getAttribute("height")) === spotHeight &&
              parseInt(img.getAttribute("width")) === spotWidth)
          ) {
            matches[i] = img;
          } else {
            // CSS reparsing.
            try {
              w = parseInt(getStyle(img, "width").replace("px", ""));
              h = parseInt(getStyle(img, "height").replace("px", ""));
              if (h === spotHeight && w === spotWidth) {
                matches[i] = img;
              }
            } catch (e) {}
          }
        }
      }
      for (key in matches) {
        d = Math.abs(pxId - key);
        //if (d > 50) { continue; }
        if (!dist || d < dist) {
          dist = d;
          cm = matches[key];
        }
        if (px && px.parentNode === matches[key].parentNode) {
          rent = {
            d: d,
            cm: matches[key]
          };
        }
      }
      // compare same daddy match.
      if (rent && Math.abs(dist - rent.d) < 5) {
        // preferring same daddy!
        cm = rent.cm;
      }
      matches = null;
      try {
        if (cm && cm.nodeName === "OBJECT") {
          cm = getObjectEmbed(cm);
        }
      } catch (e) {}
      return cm;
    }

    function addNoticeDelay(pageId) {
      action(pageId, "I");
      if (BAP.options[pageId].icon_delay > 0) {
        var trigger = $("trigger-container-" + pageId);
        trigger.style.display = "none";
        // Error in this function would occur because of the out of sync requests from other dancers around
        setTimeout(function() {
          try {
            $("trigger-container-" + pageId).style.display = "block";
          } catch (e) {}
        }, parseInt(BAP.options[pageId].icon_delay) * 1000);
        BAPUtil.trace("Adding notice delay to the following notice: " + pageId + " delay:" + BAP.options[pageId].icon_delay + " seconds");
      }
    }
    /**
     * This method positions the notice.
     */
    function noticePosition(pageId) {
      if (!isNonTimerDm(BAP.options[pageId].dm)) {
        var t = $("trigger-" + pageId),
        tc = $("trigger-box-" + pageId);
        t.style.top = BAP.options[pageId].posTop + "px";
        t.style.left = BAP.options[pageId].posLeft + "px";
        tc.style.top = BAP.options[pageId].posTop + "px";
        tc.style.left = BAP.options[pageId].posLeft + "px";
     }
     
    }

    function isNonTimerDm(_dm){
      if (_dm === 3 || _dm === 9 || _dm === 5){
        return true;
      } else {
        return false;
      }
    }

    /**
     * This method calculates new notice location points based on the mode
     * that the notice is in.
     */
    function noticePositionCalculate(pageId) {
      // pixXXX  stores original location for positioning anchor's top X left
      // posXXX  stores locations where the icon's top X left are
      // spotXXX stores location where the base of notice should be placed
      /*
      posLeft =  x postion of the icon
      posTop =  y postion of the icon
      spotWidth = width of ad
      spotHeight = height of ad
      spotLeft  =  x postion of the ad
      spotTop  =  y postion of the ad
      pixelLeft =  x postion of the pixel dropped by durly (4.gif)
      pixelTop  =  y postion of the pixel dropped by durly (4.gif)
      */
      var posTop,
        posLeft,
        pixLeft,
        pixTop,
        spotLeft,
        spotTop,
        ad = BAP.options[pageId].ad,
        spotHeight,
        spotWidth, px;
      if (BAP.options[pageId].dm === 5) {
        spotHeight = BAP.options[pageId].ad_h;
        spotWidth = BAP.options[pageId].ad_w;
        pixLeft = spotLeft = spotTop = pixTop = 0;
      } else if (BAP.options[pageId].dm === 3) {
        spotWidth = BAP.options[pageId].ad.clientWidth;
        spotHeight = BAP.options[pageId].ad.clientHeight;
        pixLeft = _offset(ad).left;
        pixTop = _offset(ad).top;
        spotLeft = pixLeft;
        spotTop = pixTop;
      } else if (/^(1|2|4|4.1|4.2|7|8|9)$/.test(BAP.options[pageId].dm)) {
        spotWidth = BAP.options[pageId].ad.clientWidth;
        spotHeight = BAP.options[pageId].ad.clientHeight;
        pixLeft = _offset(ad).left;
        pixTop = _offset(ad).top;
        spotLeft = pixLeft;
        spotTop = pixTop;
      } else if (BAP.options[pageId].dm === 6) {
        px = BAP.options[pageId].px;
        pixLeft = _offset(px).left;
        pixTop = _offset(px).top;
        if (browser.Opera) {
          // Opera styling bug?  Top/Bottom is set to 0 when element height and width is 0
          // resize the pixel to be visible, measure top and hide it again
          px.width = px.height = "1";
          pixTop = _offset(px).top;
          px.width = px.height = "0";
        }
        spotWidth = BAP.options[pageId].ad_w;
        spotHeight = BAP.options[pageId].ad_h;

        spotLeft = pixLeft - spotWidth;
        spotTop = pixTop;
        var bumpDown = 4;
        // adjust when pixel is not in the required position
        try {
          var ew = px.parentNode.width;
          if (!ew) {
            ew = parseInt(getStyle(px.parentNode, "width"));
          }
          if (ew === spotWidth || ew <= spotWidth) {
            spotLeft = spotLeft + spotWidth;
            if (
              getStyle(px, "text-align")
                .toLowerCase()
                .indexOf("center") >= 0
            ) {
              spotLeft = spotLeft - spotWidth / 2;
              if (browser.IE) {
                spotTop -= bumpDown;
              }
            } else if (
              getStyle(px, "text-align")
                .toLowerCase()
                .indexOf("right") >= 0
            ) {
              spotLeft = spotLeft - spotWidth;
              if (browser.IE) {
                spotTop -= bumpDown;
              }
            }
          }
        } catch (e) {}
      }
      // if body is relative or has some padding / margin limits, adjust left position for them.
      try {
        if (getStyle(body, "position") === "relative") {
          var box = body.getBoundingClientRect();
          spotLeft = spotLeft - box.left;
        }
      } catch (e) {}
      // calculating icon position within the located object according to the selected notice corner
      posTop = spotTop;
      posLeft = spotLeft;
      var iconH = 14;
      if (BAP.options[pageId].position === "top-right") {
        posLeft += spotWidth;
        // } else if (BAP.options[pageId].position === 'top-left') {
      } else if (BAP.options[pageId].position === "bottom-right") {
        posTop += spotHeight - iconH;
        
        posLeft += spotWidth;
      } else if (BAP.options[pageId].position === "bottom-left") {
        posTop += spotHeight - iconH;
      }
      // adjust with offsets
      posTop += BAP.options[pageId].offsetTop;
      posLeft += BAP.options[pageId].offsetLeft;
      // final adjusting using specification in use
      posTop += BAP.options[pageId].positionVertical() === "top" ? 0 : -1;
      if (
        BAP.options[pageId].icon_display === "expandable" ||
        ((BAP.options[pageId].icon_display === "icon") && BAP.options[pageId].mini) 
      ) {
        if (BAP.options[pageId].positionHorizontal() === "right") {
          if (BAP.options[pageId].expanded) {
            posLeft -= BAP.options[pageId].ciconWidth;
          } else {
            posLeft -= BAP.options[pageId].miconWidth;
          }
          
        }
      } else {
        if (BAP.options[pageId].positionHorizontal() === "right") {
          posLeft -= BAP.options[pageId].ciconWidth;
        }
      }
      BAP.options[pageId].pxl = pixLeft;
      BAP.options[pageId].pxt = pixTop;
      BAP.options[pageId].posTop = posTop;
      BAP.options[pageId].posLeft = posLeft;
      BAP.options[pageId].spotTop = spotTop;
      BAP.options[pageId].spotLeft = spotLeft;
    }
    /**
     * This method figures out the case of the notice display.
     */
    function noticeMode(pageId) {
      var ad,
        ad2,
        dm,
        spotHeight = BAP.options[pageId].ad_h,
        spotWidth = BAP.options[pageId].ad_w,
        px = $("bap-pixel-" + pageId),
        everything = document.getElementsByTagName("*");
      // find proximityId
      for (dm = 0; dm < everything.length; dm++) {
        if (px === everything[dm]) {
          BAP.options[pageId].proximityId = dm;
        }
      }
      if (
         ifr && (frameSize()[0] === spotHeight && frameSize()[1] === spotWidth)
         ||  BAP.options[pageId].vast
      ) {
        // iframe case - easiest one!
        dm = 5;
      } else if (
        checkElement($("flash_creative"), spotHeight, spotWidth) &&
        detection === "tagui"
      ) {
        /* NON_PROD */
        // special case for TAG UI
        /* NON_PROD */
        ad = $("flash_creative");
        /* NON_PROD */
        dm = 4;
      } else if (
        domain.indexOf("mail.yahoo.com") > 0 &&
        document.getElementsByTagName("object").length === 1 &&
        browser.IE
      ) {
        // special case for Yahoo Mail
        ad = document.getElementsByTagName("object")[0];
        dm = 4.1;
      } else if (
        (BAP.options[pageId].container &&
          (ad = $(BAP.options[pageId].container))) ||
        (BAP.options[pageId].check_container === "true" && (ad = px.parentNode))
      ) {
        // native container
        dm = 8;
        if (BAP.options[pageId].check_container === "true") {
          /*jsl:ignore*/
          if (
            ifr &&
            (ad2 = getAdStandard(frameSize()[0], frameSize()[1])) !== 0
          ) {
            /*jsl:end*/
            // checking if the contaier is a known size frame.
            BAP.options[pageId].ad_h = frameSize()[0];
            BAP.options[pageId].ad_w = frameSize()[1];
            BAP.options[pageId].pixel_ad_w = BAP.options[pageId].ad_w;
            BAP.options[pageId].pixel_ad_h = BAP.options[pageId].ad_h;
            BAP.options[pageId].ns = ad2;
            ad = null;
            dm = 5;
          } else {
            ad = checkChildren(ad, spotHeight, spotWidth) || ad;
            ad = rh(ad, pageId);
          }
        } else {
          dm = 9;
          // check the passed in container to see what fits into this ad
          ad = getObjectEmbed(checkChildren(ad, spotHeight, spotWidth)) || ad;
        }
      } else {
        // check previous siblings
        ad = checkSiblings(px.previousSibling, spotHeight, spotWidth, 1);
        if (ad) {
          // detected previous sibling that qualifies as ad
          dm = 3;
        } else if (
          domain.indexOf("yahoo.com") > 0 &&
          (ad = sizeMatch(spotWidth, spotHeight))
        ) {
          // Size Matcher for VENDOR CASE (yahoo)
          dm = 4.2;
          /*jsl:ignore*/
        } else if (
          (ad = proximityDetection(
            BAP.options[pageId].proximityId,
            spotWidth,
            spotHeight,
            px
          ))
        ) {
          /*jsl:end*/
          // proximity detector
          dm = 7;
        } else {
          // pixel aft based detection, unhide the pixel
          dm = 6;
          try {
            $("bap-pixel-" + pageId).style.display = "";
          } catch (e) {}
        }
      }
      // AMP clusterfuck size recheck. Current clients: Everyday Health, AARP, Quadrantone, Meredith. Burn in hell!
      if (dm !== 5 && /^(1525|4501|7420|8573)$/.test(BAP.options[pageId].nid)) {
        // read the size of the parent.
        try {
          ad = checkChildren(px.parentNode, spotHeight, spotWidth) || ad;
          ad = rh(ad, pageId);
          if (dm !== 3) {
            dm = 4;
          }
        } catch (e) {}
      }
      if (dm === 3) {
        // validate if the level of notice is correct by looking into children
        ad = pickChildLevel(ad, spotHeight, spotWidth);
      }
      /**
         * NEW YAHOO MAIL BETA OVERWRITE for CHROME.
         * Chrome is throwing a weird error upon attempting to retrieve internal
         * embed of a given object: ReferenceError: NPObject deleted
         * Overwriting the detection method to use pixel instead
         */
      if (domain.indexOf("l.yimg.com") >= 0 && browser.Chrome) {
        dm = 6;
      }
      BAP.options[pageId].dm = dm;
      BAP.options[pageId].ad = ad;
      BAP.options[pageId].px = px;

      function find_child_src(elm) {
        if (elm) {
          if (elm.src) {
            return elm.src;
          } else {
            var _ = elm.children || elm.childNodes,
              o;
            if (_.length === 0) {
              return false;
            }
            for (o = 0; o < _.length; o++) {
              var src = find_child_src(_[o]);
              if (src) {
                return src;
              }
            }
          }
        }
        return false;
      }
      var ad_src = find_child_src(ad);
      BAP.options[pageId].ad_src = !ad_src
        ? "undefined"
        : /^(?:https?:\/\/)?(?:www\.)?([^\/]+)/i.exec(ad_src)[1];
      /**
         * Added in response to eyeWonder dynamic ads that keep setting higher depth setting
         * then our default 10k. Or default is currently set at 9990 for L1 an 9991 for L2.
         * It will be overwritten by this setting if there is a need to set it.
         */
      try {
        BAP.options[pageId].ad_z = BAP.options[pageId].ad_z || getDepth(ad);
      } catch (e) {}
      /**
         * Added for the case when detection is not executed within an iframe,
         * but the frame contents are also set pretty high up in the depth index
         */
      if (dm === 5 || dm === 3) {
        BAP.options[pageId].ad_z = 9990;
      }
      /**
         * Adding removal of anchor pixel.  If the mode is not pixel based, pixel
         * may break the layout, especially if it has been injected prior to the ad.
         */
      if (dm !== 6) {
        px.parentNode.removeChild(px);
      }
    }
    /**
     * This method checks if the notice has been given already.
     */
    function noticeVerification(pageId) {
      var ad = BAP.options[pageId].ad;
      // check if notice already given for the ad in question
      if (ad && !ad.notice) {
        ad.notice = pageId;
      } else if (ad && ad.notice !== pageId) {
        // notice already given for this element
        BAP.options[pageId].noticeExists = true;
        if (nids[ad.notice] !== nids[pageId]) {
          coverNotice(ad.notice, pageId);
        }
      } else if (BAP.options[pageId].dm === 5) {
        if (window.notice) {
          // notice already given for this frame (case of 2+ script notices within a frame)
          BAP.options[pageId].noticeExists = true;
          if (nids[window.notice] !== nids[pageId]) {
            coverNotice(window.notice, pageId);
          }
        } else {
          // iframe case with exact match
          try {
            // marking the frame as covered by first notice
            window.notice = pageId;
            BAP.options[pageId].ad = {
              nodeName: "EXACT-FRAME"
            };
            // already received a ping, send the BAPFRAME.
            if (window.bap_frameid) {
              postNoticeMessage(
                "BAPFRAME|" + nids[pageId] + "|" + window.bap_frameid
              );
              BAPUtil.trace("Posted frame coverage message: " + pageId + " (" + nids[pageId] + ")");
            } else {
              // check if the iframe and top are the same.  If not, broadcast to the top.
              if (window.parent !== window.top) {
                BAPUtil.trace("Broadcasting frame coverage message: " + pageId + " (" + nids[pageId] + ")");
                window.top.postMessage(
                  "BAPFRAMEBROADCAST|" +
                    nids[pageId] +
                    "|" +
                    (document.referrer ? document.referrer : "") +
                    "|" +
                    BAP.options[pageId].ad_w +
                    "|" +
                    BAP.options[pageId].ad_h,
                  "*"
                );
              } else {
                BAPUtil.trace("Ohh no, all by myself! Anyone up there wonna Rhumba?!?");
                window.top.postMessage("BAPFRAMEID|" + nids[pageId] + "|" + document.location.href, "*");
              }
            }
          } catch (e) {
            BAPUtil.trace(["[noticeVerification() iframe section: postMessage missing?]",e]);
          }
        }
      }
      if (BAP.options[pageId].ad && !BAP.options[pageId].noticeExists) {
        if (
          (BAP.options[pageId].ad.nodeName === "IFRAME" &&
            BAP.options[pageId].ad.src in frameNoticed) ||
          // notice already given for this element
          (BAP.options[pageId].ad.nodeName === "EXACT-FRAME" &&
            frameNoticed.contents)
        ) {
          // notice already given for this element: CASE FRAME-PASS
          BAP.options[pageId].noticeExists = true;
        }
      }
    }
    /**
     * This method places the actual <div> and other visual elements on the page.
     */
    function noticeCreate(pageId) {
      var icon,
        iconWidth,
        opacity,
        z = "",
        expansion = "",
        div = $("BAP-holder"),
        click =
          "BAP.action('" + pageId + "', 'S'); BAP.createL2('" + pageId + "');",
        iconDir = BAP.options[pageId].icon === "g" ? "/icong" : "/icon";
      if (!div) {
        div = document.createElement("div");
        div.setAttribute("id", "BAP-holder");
        body.appendChild(div);
      }
      try {
        opacity = parseInt(BAP.options[pageId].container_opacity) / 100;
      } catch (e) {
        opacity = 1;
      }
      opacity =
        opacity < 1
          ? "opacity:" +
            opacity +
            ";-moz-opacity:" +
            opacity +
            ";-ms-filter:DXImageTransform.Microsoft.Alpha(Opacity=" +
            opacity * 100 +
            ");filter:alpha(opacity=" +
            opacity * 100 +
            ");"
          : "";
      if (BAP.options[pageId].icon_display === "expandable") {
        icon = '<img src="' + DOMAIN_ROOT + iconDir + "/" + micon + '.png">';
        iconWidth = 19;
        expansion = ' onmouseover="BAP.expandIcon(' + pageId + ')" ';
      } else if (
        BAP.options[pageId].icon_display === "icon" &&
        BAP.options[pageId].mini
      ) {
        icon = '<img src="' + DOMAIN_ROOT + iconDir + "/" + micon + '.png">';
        iconWidth = 19;
      } else {
        iconWidth = BAP.options[pageId].ciconWidth;
        icon = '<img src="' + DOMAIN_ROOT + iconDir + "/c_" + BAP.options[pageId].icon_grayscale + (BAP.options[pageId].cicon ? BAP.options[pageId].cicon : cicon) + '.png">';
      }
      if (BAP.options[pageId].mini || BAP.options[pageId].skipL2) {
        click =
          "BAP.action('" +
          pageId +
          "', 'S'); BAP.action('" +
          pageId +
          "', 'M'); window.open(BAP.moreInfoHref(" +
          pageId +
          "), '_newtab');";
      }
      if (BAP.options[pageId].ad_z) {
        z = "z-index:" + parseInt(BAP.options[pageId].ad_z) + ";";
      }
      if (BAP.options[pageId].amzn) {
        // amazon L2
        click =
          "BAP.action('" +
          pageId +
          "', 'S'); window.open('http://www.amazon.com/gp/dra/info/?pn=1&pg=daaedisc&pp=1,e," +
          BAP.options[pageId].coid +
          "," +
          BAP.options[pageId].nid +
          "', '_newtab');";
      }
      icon =
        '<span id="trigger-' +
        pageId +
        '" style="' +
        z +
        'position:absolute;height:15px;" class="bap-trigger" onclick="' +
        click +
        '"' +
        expansion +
        ">" +
        icon +
        "</span>";
      icon = '<div id="trigger-container-' + pageId + 
      '" style="position: static !important;"><span id="trigger-box-' + 
      pageId + 
      '" class="bap-trigger" style="' + z + "position:absolute;" + opacity + 
      "width:" + iconWidth + 'px;height:15px;"><img id="trigger-box-image-' + 
      pageId + '" src="' + DOMAIN_ROOT + iconDir + "/box_" + iconWidth + "_" + 
      BAP.options[pageId].position + '.png"></span>' + icon + "</div>";

      if (BAP.options[pageId].dm === 5) { 
        // iframe containing durly
        div.innerHTML = div.innerHTML + icon;
        setTimeout(positionDM3(pageId),1000);
      } else  {
        try {
          var ad_css_position = getComputedStyle(BAP.options[pageId].ad).position;
          if (isNonTimerDm(BAP.options[pageId].dm) && (ad_css_position === 'relative' || ad_css_position === 'absolute')) {
            appendIconToAd(pageId, icon);
          } else {
            div.innerHTML = div.innerHTML + icon;
          }
        } catch (e) {
          div.innerHTML = div.innerHTML + icon;
        }
      }
    }

    function appendIconToAd(pageId, icon){
      var _iconDomElement =  $("BAP-icon-"+ BAP.options[pageId].ad.notice);
      if (!_iconDomElement) {
        _iconDomElement = document.createElement('div');
        _iconDomElement.innerHTML += icon;
        try {
          _iconDomElement.setAttribute("id", "BAP-icon-"+ BAP.options[pageId].ad.notice);
        } catch(e) {
          console.warn(e.message)
        }
      }
      BAP.options[pageId].ad.appendChild(_iconDomElement);
      setTimeout(positionDM3(pageId),1000);
    }

    function positionDM3(pageId){
      $("trigger-box-" + pageId).style.top = 'unset';
      $("trigger-" + pageId).style.top = 'unset';
      $("trigger-box-" + pageId).style.left = 'unset';
      $("trigger-" + pageId).style.left = 'unset';

      $("trigger-box-" + pageId).style.right = 'unset';
      $("trigger-" + pageId).style.right = 'unset';
      $("trigger-box-" + pageId).style.bottom = 'unset';
      $("trigger-" + pageId).style.bottom = 'unset';
      
      $("trigger-box-" + pageId).style.position = 'absolute';
      $("trigger-" + pageId).style.position = 'absolute';

      var _nudgeY = BAP.options[pageId].offsetTop + 'px';
      var _nudgeX = BAP.options[pageId].offsetLeft + 'px';

      if (BAP.options[pageId].position === 'top-left') {
        $("trigger-box-" + pageId).style.top = _nudgeY;
        $("trigger-box-" + pageId).style.left = _nudgeX;
        $("trigger-" + pageId).style.top = _nudgeY;
        $("trigger-" + pageId).style.left = _nudgeX;
      } else if (BAP.options[pageId].position === 'top-right') {
        $("trigger-box-" + pageId).style.top = _nudgeY;
        $("trigger-box-" + pageId).style.right = _nudgeX;
        $("trigger-" + pageId).style.top = _nudgeY;
        $("trigger-" + pageId).style.right = _nudgeX;
      } else if (BAP.options[pageId].position === 'bottom-left') {
        $("trigger-box-" + pageId).style.bottom = _nudgeY;
        $("trigger-box-" + pageId).style.left = _nudgeX;
        $("trigger-" + pageId).style.bottom = _nudgeY;
        $("trigger-" + pageId).style.left = _nudgeX;
      } else if (BAP.options[pageId].position === 'bottom-right') {
        $("trigger-box-" + pageId).style.bottom = _nudgeY;
        $("trigger-box-" + pageId).style.right = _nudgeX;
        $("trigger-" + pageId).style.bottom = _nudgeY;
        $("trigger-" + pageId).style.right = _nudgeX;
      }
    }



    function showNoticeHelper(pageId) {
      // noticeMode is moved into process.
      noticeVerification(pageId);
      if (!BAP.options[pageId].noticeExists) {
        noticePositionCalculate(pageId);
        noticeCreate(pageId);
        noticePosition(pageId);
        BAPUtil.trace("Generated the following notice: " + pageId + " (" + nids[pageId] + ") h:" + BAP.options[pageId].ad_h + " w:" + BAP.options[pageId].ad_w + " t:" + BAP.options[pageId].spotTop + " l:" + BAP.options[pageId].spotLeft + " pt:" + BAP.options[pageId].pxt + " pl:" + BAP.options[pageId].pxl + " mode:" + BAP.options[pageId].dm);
        addNoticeDelay(pageId);
      } else {
        BAPUtil.trace("Notice already exists for: " + pageId);
        // log L1 shown for same page overwrite
        action(pageId, "I");
        // log overwrite
        action(pageId, "O");
      }
    }
    /**
     * This method figures out if a covering notice needs to accept the incoming notice
     * and add it into coverage stack for itself.
     */
    function coverNotice(coverBy, covered, o) {
      var c = o ? covered : nids[covered];
      // if covering notice is the same nid, do not add into the coveredNotice stack
      if (nids[coverBy] === c) {
        return;
      }
      // now check if the same notice is in the covered stack already
      if (coveredNotices[coverBy]) {
        for (var key in coveredNotices[coverBy]) {
          if (key === c) {
            return;
          }
        }
      }
      // made it through, so this is a new notice, add into coverage
      coveredNotices[coverBy][c] = o || BAP.options[covered];
    }
    /**
     * Helper for string creation used in compose messages
     */
    function acceptMessageString(options, nid) {
      return (
        "BAPACCEPT|" +
        nid +
        "|" +
        options.nid +
        "|" +
        (options.aid || 0) +
        "|" +
        (options.icaid || 0) +
        "|" +
        (options.ecaid || 0) +
        "|" +
        options.coid +
        "|" +
        options.ad_w +
        "|" +
        options.ad_h +
        "|" +
        options.rev +
        "|" +
        (options.cps || "-") +
        "|" +
        (options.seg || "-")
      );
    }
    /**
     * Helper method to shorten BAPACCEPT message execution
     */
    function composeAcceptMessage(options, nid, w) {
      postNoticeMessage(acceptMessageString(options, nid), w);
    }

    function postNoticeMessage(m, d) {
      var win;
      if (d) {
        if (!!d.postMessage) {
          win = d;
        } else {
          win = d.contentWindow;
        }
      } else {
        win = window.parent;
      }
      if (win.postMessage) {
        win.postMessage(m, "*");
      }
    }

    function flashPostMessage(m) {
      handleMessage({
        data: m
      });
    }
    /**
     * This function grabs all iframes on the page and sends a dance
     * request to them.  Each frame is also marked with the id (loop)
     * for unique identification.
     */
    function tango() {
      var frames = document.getElementsByTagName("iframe");
      for (var i = 0; i < frames.length; i++) {
        tangoPartners[i] = frames[i];
        postNoticeMessage("BAPTANGO?|" + i, frames[i]);
      }
    }
    /**
     * Queue support for messaging since its possible to receive a message prior to tag processing.
     * When this occurs, message is queued in BAP.mq and processed when the current payload is complete.
     * TODO: potentially might execute several times for multiple messages received -- maintain order
     * of received messages?
     */
    function handleMessageQueue() {
      if (rendered && mq.length > 0) {
        var i,
          rev = [];
        // Pulling broadcasts and adding as last message.
        for (i = 0; i < mq.length; i++) {
          if (mq[i].indexOf("BAPFRAMEBROADCAST") >= 0) {
            rev.push(mq[i]);
          }
        }
        while (mq.length > 0) {
          i = mq.pop();
          if (i.indexOf("BAPFRAMEBROADCAST") >= 0) {
            continue;
          }
          rev.push(i);
        }
        while (mq.length > 0) {
          rev.push(mq.pop());
        }
        while (rev.length > 0) {
          handleMessage(rev.pop());
        }
      } else if (!rendered && mq.length > 0) {
        setTimeout(handleMessageQueue, 1000);
      }
    }

    function handleMessage(e) {
      try {
        var f,
          i,
          r,
          nid,
          key,
          ad,
          pageId,
          frames,
          data = e;
        if (e.data) {
          data = e.data;
        }
        // Quit if message is unrelated to BAP.
        if (data.indexOf("BAP") !== 0) {
          return;
        }
        /* Race condition: its possible to receive message before tag is processed on the parent page. */
        if (!rendered) {
          BAPUtil.trace("Message queued: " + data);
          mq.push(data);
          setTimeout(handleMessageQueue, 1000);
          return;
        }
        BAPUtil.trace("Message received: " + data + " at " + document.location);
        var message = data.substring(0, data.indexOf("|") || data.length);
        if (message === "BAPFRAMEBROADCAST") {
          // Handling of the notice at the actual page.
          if (window.top === window) {
            r = data.split("|");
            nid = r[1];
            var ref = r[2],
              w = r[3],
              h = r[4];
            for (pageId in BAP.options) {
              ad = BAP.options[pageId].ad;
              if (
                ad &&
                ad.nodeName === "IFRAME" &&
                BAP.options[pageId].ad_h === h &&
                BAP.options[pageId].ad_w === w
              ) {
                /**
                             * Special referrer match.  Only happens if iframe and inner frame are separated by a single frame.
                             * More accuratte then other assumption.
                             */
                if (ref === ad.src || (browser.IE && ref.indexOf(ad.src) > 0)) {
                  composeAcceptMessage(BAP.options[pageId], nid, e.source);
                  // log overwrite
                  // logging overwrite for everything but IE.
                  if (!browser.IE) {
                    action(pageId, "O");
                  }
                  // remove trigger
                  if ($("trigger-" + pageId)) {
                    $("BAP-holder").removeChild(
                      $("trigger-container-" + pageId)
                    );
                  }
                  // remove from options
                  delete BAP.options[pageId];
                  break;
                }
              }
            }
          }
        } else if (message === "BAPFRAMEID") {
          // Rhumba case! (attempting a reverse tango) -- this case occurs when the frame has loaded after parent requested tango partners.
          r = data.split("|");
          nid = r[1];
          var frameUrl = r[2];
          frames = document.getElementsByTagName("iframe");
          for (i = 0; i < frames.length; i++) {
            if (frames[i].src && frames[i].src === frameUrl) {
              tangoPartners[i] = frames[i];
              postNoticeMessage("BAPTANGO?|" + i, frames[i]);
            }
          }
        } else if (message === "BAPTANGO?") {
          // Dance request!
          var id = data.substring(data.indexOf("|") + 1);
          window.bap_frameid = id;
          postNoticeMessage("BAPLETSDANCE|" + id);
          if (window.notice) {
            postNoticeMessage("BAPFRAME|" + nids[window.notice] + "|" + id);
          }
        } else if (message === "BAPLETSDANCE") {
          // Dance accepted!
          f = data.substring(data.indexOf("|") + 1);
          tangoPartners[f].tango = f;
        } else if (message === "BAPFRAME") {
          /**
           * Bubbling up the frame stack receiver.  When message arrives, checks if this (current)
           * level contains the notice, and then removes if from the displaying if it exist in
           * this level.
           */
          r = data.split("|");
          nid = r[1];
          var frameId = r[2];
          frameNoticed[url] = nid;
          frameNoticed.contents = true;
          for (pageId in BAP.options) {
            ad = BAP.options[pageId].ad;
            if (
              (ad &&
                (ad.nodeName === "IFRAME" &&
                  ad.tango === frameId &&
                  !BAP.options[pageId].noticeExists)) ||
              ad.nodeName === "EXACT-FRAME"
            ) {
              // notify that there is a match in the stack and alert for the covered nid
              var pass = "";
              if (ad.nodeName === "EXACT-FRAME") {
                // the notice is an exact frame, but appears to be a pass through frame itself.
                // in this case, find and notify the deeper frame of itself
                // NOTE: perphaps just assume that in a pass-through scenario there will be a single iframe to post to?
                frames = document.getElementsByTagName("iframe");
                for (i = 0; i < frames.length; i++) {
                  composeAcceptMessage(BAP.options[pageId], nid, frames[i]);
                  // anchor the slave frame
                  window.passFrame = frames[i];
                }
              } else {
                composeAcceptMessage(BAP.options[pageId], nid, ad);
                // anchor the slave frame
                pass = ad;
              }
              window.passNid = nid;
              // if current notice covers any other notices, pass them as well
              for (key in coveredNotices[pageId]) {
                composeAcceptMessage(
                  coveredNotices[pageId][key],
                  nid,
                  pass || window.passFrame
                );
              }
              // log overwrite
              action(pageId, "O");
              // remove trigger
              if ($("trigger-" + pageId)) {
                $("BAP-holder").removeChild($("trigger-container-" + pageId));
              }
              // remove from options
              delete BAP.options[pageId];
              // no need to continue iterating, dance partners are unique
              break;
            }
          }
        } else if (message === "BAPFLASH") {
          /**
           * Bubbling up the frame stack receiver.  When message arrives, checks if this (current)
           * level contains the notice, and then removes if from the displaying if it exist in
           * this level.
           */
          r = data.substring(data.indexOf("|") + 1);
          nid = r.substring(0, r.indexOf("|"));
          var url = r.substring(r.indexOf("|") + 1);
          for (pageId in BAP.options) {
            ad = BAP.options[pageId].ad;
            f = ad.src || ad.data || ad.movie || "";
            if (
              (ad &&
                ((ad.nodeName === "OBJECT" || ad.nodeName === "EMBED") &&
                  f === url &&
                  !BAP.options[pageId].noticeExists)) ||
              ad.nodeName === "EXACT-FRAME"
            ) {
              // notify that there is a match in the stack and alert for the covered nid
              try {
                ad.flashGetMessage(
                  acceptMessageString(BAP.options[pageId], nid)
                );
              } catch (e) {}
              // anchor the slave frame
              window.passFrame = ad;
              window.passNid = nid;
              // if current notice covers any other notices, pass them as well
              for (key in coveredNotices[pageId]) {
                try {
                  ad.flashGetMessage(
                    acceptMessageString(BAP.options[pageId], nid)
                  );
                } catch (e) {}
              }
              // log overwrite
              action(pageId, "O");
              // remove trigger
              if ($("trigger-" + pageId)) {
                $("BAP-holder").removeChild($("trigger-container-" + pageId));
              }
              // remove from options
              delete BAP.options[pageId];
            }
          }
        } else if (message === "BAPACCEPT") {
          /**
           * Bubbling down the frame stack receiver when a match occurs in higher frames to append
           * the notice id to the appropriate display level.
           */
          r = data.split("|");
          var op = {},
            enid = r[1];
          op.nid = r[2];
          op.aid = r[3];
          op.icaid = r[4];
          op.ecaid = r[5];
          op.coid = r[6];
          op.ad_w = r[7];
          op.ad_h = r[8];
          op.rev = r[9];
          if (r[10] && r[10] !== "-") {
            op.cps = r[10];
          }
          if (r[12] && r[11] !== "-") {
            op.seg = r[11];
          }
          if (op.ecaid === 0) {
            delete op.ecaid;
          }
          if (window.passFrame) {
            BAPUtil.trace("Pass-through frame in the stack. Executing pass: " + op.nid + " to " + window.passNid);
            composeAcceptMessage(op, window.passNid, window.passFrame);
          } else {
            for (pageId in BAP.options) {
              nid = nids[pageId];
              if (enid === nid) {
                BAPUtil.trace("Coverage accepted by: " + enid + " covering: " + op.nid);
                coverNotice(pageId, op.nid, op);
              }
            }
          }
        } else if (message === "BAPPING") {
          /**
           * This is a generic heartbeat and message transfer API.
           */
          r = "";
          if (window.notice) {
            r = "BAPPONG|" + BAP.options[window.notice].position;
            postNoticeMessage(r);
          } else if (window.passFrame) {
            postNoticeMessage("BAPPING|", window.passFrame);
          }
        } else if (message === "BAPPONG") {
          /**
           * Would only ever receive this when acting as a pass-through frame, so just bubble further up.
           */
          postNoticeMessage(data);
        } else if (message === "BAPAMZN") {
          /**
           * Custom Amazon.com notification that were in a frame on amazon.com
           * Presuming that notice is already rendered, redo the link.
           */
          window.bap_amzn = true;
          for (pageId in BAP.options) {
            $("trigger-" + pageId).onclick = function() {
              action(pageId, "S");
              window.open(
                "http://www.amazon.com/gp/dra/info/?pn=1&pg=daaedisc&pp=1,e," +
                  BAP.options[pageId].coid +
                  "," +
                  BAP.options[pageId].nid,
                "_newtab"
              );
            };
          }
        }
      } catch (er) {
        BAPUtil.trace("[handleMessage() error]", er.message);
      }
    }
    function repositionL2(pageId) {
      if (!BAP.options[pageId].isSkipper) {
        var el = $("bap-notice-" + pageId);
        if (getStyle(el, "display") === "block") {
          updateL2(pageId);
        }
      }
    }
    function updateL2(pageId) {
      var popup = $("bap-notice-" + pageId),
        l;
      if (BAP.options[pageId].positionHorizontal() === "right") {
          if (BAP.options[pageId].dm !== 5) {
            BAP.options[pageId].ad_w = BAP.options[pageId].ad.clientWidth;
          }
          l =
            BAP.options[pageId].spotLeft +
            BAP.options[pageId].ad_w -
            BAP.options[pageId].popupWidth;
          popup.style.left = (l || 0) + "px";
       
      } else {
        popup.style.left = (BAP.options[pageId].spotLeft || 0) + "px";
      }
      if (BAP.options[pageId].positionVertical() === "top") {
        popup.style.top = BAP.options[pageId].posTop + "px";
      } else {
        l = parseInt(popup.style.height) || BAP.options[pageId].popupHeight;
        // or test for dm=5?
        if (BAP.options[pageId].dm !== 5) {
          BAP.options[pageId].ad_h = BAP.options[pageId].ad.clientHeight;
        }
        popup.style.top =
          (BAP.options[pageId].spotTop + BAP.options[pageId].ad_h - l > 0
            ? BAP.options[pageId].spotTop + BAP.options[pageId].ad_h - l
            : 0) + "px";
      }
      if (
        browser.QuirksMode &&
        BAP.options[pageId].popupWidth &&
        popup.style.display !== "none"
      ) {
        popup.style.display = "block";
        var add = BAP.options[pageId].popupWidth === 728 ? 4 : 0;
        popup.style.width = BAP.options[pageId].popupWidth + add + "px";
        popup.style.margin = "0 0";
      }
      // adding on-demand logo load.
      l = BAP.options[pageId].advLogo;
      if (
        $("bap-logo-" + pageId) &&
        l &&
        popup.style.display !== "none" &&
        !$("bap-logo-" + pageId).src
      ) {
        $("bap-logo-" + pageId).src = l;
        BAPUtil.trace("[updateL2] loaded logo");
      }
    }

    function createL2(pageId) {
      var popup = $("bap-notice-" + pageId);
      popup.style.position = "absolute";
      toggle(popup);
      BAP.options[pageId].popupHeight = popup.offsetHeight;
      BAP.options[pageId].popupWidth = popup.offsetWidth;
      updateL2(pageId);
    }

    function createPopupLayer(pageId) {
      if (BAP.options[pageId].skipL2) {
        return;
      }
      var noticeHTML = "",
        reg = null,
        width = BAP.options[pageId].ad_w,
        height = BAP.options[pageId].ad_h,
        generic_msg = "",
        z = "",
        div = $("BAP-holder"),
        BAP_LINKS, BAP_EVIDON_LOGO, CLOSE_BTN, BAP_ADVERTISER_LOGO, MAIN_COPY;
      /* translation scaffold */
      var rigthArrow = " &#187",
        sm,
        sw = "What is internet based advertising?",
        sl = "Learn about your choices",
        se = "Privacy controls by Evidon&#153;",
        sg1 =
          "This ad has been matched to your interests. It was selected for you based on your browsing activity.",
        sg2 =
          "This ad may have been matched to your interests based on your browsing activity.",
        sg3 = "helped",
        sg4 = "determine that you might be interested in an ad like this.",
        sg5 = "select this ad for you.",
        sg6 = "selected this ad for you.";
        if (BAP.options[pageId].new_l2) {
          sm = "Opt Out & More Info";
        } else {
          sm = "More information & opt-out options";
        }
        if (!!BAP.options[pageId].advMessage) sl = BAP.options[pageId].advMessage;
      function trans(z) {
        try {
          if (!z.generic1) {
            return;
          }
          sg1 = z.generic1;
          sg2 = z.generic2;
          sg3 = z.generic3;
          sg4 = z.generic4;
          sg5 = z.generic5;
          sg6 = z.generic6;
          sm = z.link1; //"Opt Out & More Info"
          sw = z.link2; // what is IAB
          sl = z.link3; //"Learn about your choices"
          se = z.footer;
          se = se.replace("Ghostery", "Evidon"); 
          BAP.options[pageId].advName = BAP.options[pageId].advName.replace("Ghostery", "Evidon");
        } catch (err) {}
      }
      
      
      if (BAP.options[pageId].behavioral === "definitive") {
        generic_msg = sg1;
        if (BAP.options[pageId].advName) {
          generic_msg +=
            "<br><br>" +
            " " +
            BAP.options[pageId].server.name +
            " " +
            sg3 +
            " " +
            BAP.options[pageId].advName +
            " " +
            sg4;
        }
      } else if (BAP.options[pageId].behavioral === "single") {
        generic_msg = sg2;
        if (BAP.options[pageId].advName) {
          generic_msg += "<br><br>" + BAP.options[pageId].advName + " " + sg6;
        }
      } else if (BAP.options[pageId].behavioral === "uncertain") {
        generic_msg = sg2;
        if (BAP.options[pageId].advName) {
          generic_msg +=
          "<br><br>" +
            BAP.options[pageId].server.name +
            " " +
            sg3 +
            " " +
            BAP.options[pageId].advName +
            " " +
            sg5;
        }
      } else if (BAP.options[pageId].behavioral === "custom") {
        generic_msg = BAP.options[pageId].behavioralCustomMessage;
      }
      if (BAP.options[pageId].ad_z) {
        z = "z-index:" + (parseInt(BAP.options[pageId].ad_z) + 1) + ";";
      }
      /*
         * Styling note: moved display:none; back into createPopupLayer since the CSS might
         * or might not be loaded at the time of execution (network delay if css is remotely
         * pulled).  If the CSS happens not to be loaded, then there is a brief display
         * artifact when the popup is added.
         */
      if (width >= 190 && width < 300 && height >= 145 && height <= 250) {
        // Small L2 - l2-300x200-inline.html
        reg = 5;
      } else if (width >= 300 && height >= 250) {
        // Regular L2
        reg = 1;
      } else if (width === 160 && height === 600) {
        // wide skyscraper [160x600]
        reg = 2;
      } else if (width >= 728 && width <= 990 && (height >= 90 && height <= 125)) {
        // banner ad
        reg = 6;
      }

      var logoCssClasses = BAP.options[pageId].new_l2 ? "bap-img-container center-horiz" : "bap-img-container";
      var bapLinkDivClassList, bapLinkClassList,
        bapLinkDivClassList01;
      BAP_ADVERTISER_LOGO = '<div class="' + logoCssClasses +'">' +
          (BAP.options[pageId].advLogo
            ? BAP.options[pageId].advLink && !BAP.options[pageId].hideCustom
              ? '<a target="_blank" href="' +
                BAP.options[pageId].advLink +
                '" onclick="BAP.action(\'' +
                pageId +
                "', 'A');\"><img id=\"bap-logo-" +
                pageId +
                '" border="0"></a>'
              : '<img id="bap-logo-' + pageId + '" border="0">'
            : "") +
          '</div>';

      if (BAP.options[pageId].new_l2) {
        BAP_LINKS = '<div class="bap-links-new-l2"> \
                    <div>\
                      <a href="about:blank" id="bap-link-1-' +
                        pageId +
                        '" target="_blank" onclick="BAP.action(\'' +
                        pageId +
                        "', 'M');\" onmouseover=\"BAP.moreInfoLink('" +
                        pageId +
                        "')\">" +
                        sm + //opt out and more info
                      "</a> \
                    </div>" +
                    // *** end link - opt out
                    '<div>' + 
                    // ** start WHAT IS IAB
                      (BAP.options[pageId].hideWhatIs
                        ? ""
                        : '<div> \
                            <a href="about:blank" id="bap-link-2-' +
                              pageId +
                              '" target="_blank" onclick="BAP.action(\'' +
                              pageId +
                              "', 'B');\" onmouseover=\"BAP.iabLink('" +
                              pageId +
                              "')\">" +
                              sw +
                        "</a> \
                      </div>") + 
                  // ** end WHAT IS IAB
                  ((!BAP.options[pageId].advLink) ? "" :
                  '<div><a href=' + BAP.options[pageId].advLink + ' target="_blank">' + sl + '</a></div>') + //privacy policy
             '</div>';
      } else {
        if (reg === 6) { // banner
          bapLinkClassList = "bap-links position-relative border-right heightReg6";
          bapLinkDivClassList =  "border-top paddingLinksReg6";
          bapLinkDivClassList01 = "paddingLinksReg6";
        } else if (reg ===5) {
          bapLinkDivClassList01 = "paddingLinksReg5 font-7";
          bapLinkDivClassList =  "border-top padding2_10_2_10";
          bapLinkClassList = "bap-links position-relative";
        } else {
          bapLinkClassList = "bap-links position-relative";
          bapLinkDivClassList =  "border-top padding2_10_2_10";
          bapLinkDivClassList01 = bapLinkDivClassList;
        }
        //nested ternary logic is ugly. Pull this out. 
        var whatisLink = (BAP.options[pageId].hideWhatIs
          ? ""
          : '<div class="' + bapLinkDivClassList + '">\
              <a href="about:blank" id="bap-link-2-' +
                pageId +
                '" target="_blank" onclick="BAP.action(\'' +
                pageId +
                "', 'B');\" onmouseover=\"BAP.iabLink('" +
                pageId +
                "')\">" +
                sw  + rigthArrow +
              '</a>\
            </div>');

        BAP_LINKS = 
          '<div class="' + bapLinkClassList + '">\
              <div class="' + bapLinkDivClassList01 + '">\
                <a href="about:blank" id="bap-link-1-' +
                  pageId +
                  '" target="_blank" onclick="BAP.action(\'' +
                  pageId +
                  "', 'M');\" onmouseover=\"BAP.moreInfoLink('" +
                  pageId +
                  "')\">" +
                  sm + rigthArrow + //opt out and more info
                "</a>\
              </div>" +
              // *** end link - opt out
              ((reg === 5) 
                ? "" 
                : whatisLink +
                ((!BAP.options[pageId].advLink) ? "" :
                '<div class="' + bapLinkDivClassList + '"> \
                    <a href=' + BAP.options[pageId].advLink + ' target="_blank">' + sl + rigthArrow + '</a>\
                </div>') + 
                '<div class="bap-gray ' + bapLinkDivClassList + 
                (reg === 2 ? '" style="font-size:.7em"' : '"') +
                '">' + se + '</div>' //privacy policy
              ) +
          '</div>';
      }

      if (BAP.options[pageId].new_l2) {
        BAP_EVIDON_LOGO = '<div class="evidon-logo"> \
                          <div style="font-size:.5em;">powered by</div>\
                          <a href="https://www.evidon.com/solutions/ad-notice/" target="_blank"> \
                              <img style="\
                                width:50px; height:15px;" \
                                src="https://s3.amazonaws.com/component-library-files/Production/images/evidon.color@2x.png" \
                                alt="evidon logo"> \
                          </a> \
                        </div>';
        
        MAIN_COPY = 
          "<p class='main-copy-new-l2'" +
              ((reg ===2) ? " style='line-height:1.6em;'>" : ">") +
          generic_msg + '</p>';

        CLOSE_BTN = '<div class="bap-close bap-close-new-l2 font-100" onclick="BAP.toggle(' + pageId + ');return false;">&times</div>';
      } else {
        var _inlineStyle;
        if (reg === 2) { 
          _inlineStyle = 'font-size:.85em;';
        } else if (reg === 5) {
          _inlineStyle = 'font-size:.8em;line-height:11px;margin-top:12px;'
        } else {
          _inlineStyle = 'font-size:.9em;'
        }
        MAIN_COPY = "<p class='main-copy' style='" + _inlineStyle + "'>" + generic_msg + '</p>';
        CLOSE_BTN = '<div class="bap-close bap-close-old-l2 font-bold gray-light" onclick="BAP.toggle(' + pageId + ');return false;">[ x ]</div>';
      }
 
      if (reg === 1) {
        if (BAP.options[pageId].new_l2) {
          noticeHTML =
            '<div id="bap-notice-' + pageId +
              '" class="bap-notice bap-notice-new-l2 dimensions-reg1">' +
              CLOSE_BTN +
            '<div style="padding: 3px 25px 3px 25px;">' + 
              BAP_ADVERTISER_LOGO + 
              MAIN_COPY + 
              BAP_LINKS + 
            '</div>' + //close center-vert
            BAP_EVIDON_LOGO +
          '</div>';
        } else {
          noticeHTML =
              '<div id="bap-notice-' + pageId +
                '" class="bap-notice bap-notice-old-l2 dimensions-reg1">' +
                CLOSE_BTN +
              '<div class="border-gray">' + 
                BAP_ADVERTISER_LOGO + 
                MAIN_COPY + 
                BAP_LINKS + 
              '</div>' + //close center-vert
            '</div>';
        }
      } else if (reg === 2) { //skyscraper
        if (BAP.options[pageId].new_l2) { 
          noticeHTML =
          '<div id="bap-notice-' + pageId +
            '" class="bap-notice bap-notice-new-l2 dimensions-reg2-newl2">' +
            CLOSE_BTN +
          '<div class="center-vert" \
                style="padding: 0 8px 0 8px;">' +
            BAP_ADVERTISER_LOGO +  
            MAIN_COPY +
            BAP_LINKS + 
          '</div>' + //close center-vert
          BAP_EVIDON_LOGO +
          '</div>';
        } else {
          noticeHTML =
          '<div id="bap-notice-' + pageId +
            '" class="bap-notice bap-notice-old-l2 dimensions-reg2">' +
            CLOSE_BTN +
            '<div class="center-vert border-gray height100p">' +
              BAP_ADVERTISER_LOGO +  
              MAIN_COPY +
              BAP_LINKS + 
            '</div>' + //close center-vert
          '</div>';
        }
        
      } else if (reg === 5) {
        if (BAP.options[pageId].new_l2) { 
          noticeHTML =
          '<div id="bap-notice-' + pageId + '" \
            style="width:' + BAP.options[pageId].ad_w + 'px;" \
            class="bap-notice bap-notice-new-l2 dimensions-reg5-newl2">' +
            CLOSE_BTN +
              '<div class="center-vert" \
                    style="width:' + BAP.options[pageId].ad_w + 'px;" \
                          padding: 3px 25px 3px 25px;"> \
                  <div class="bap-img-container center-horiz">' + 
                    BAP_ADVERTISER_LOGO + 
                  '</div>' + 
                  BAP_LINKS + 
              '</div>' + //close center-vert
              BAP_EVIDON_LOGO +
          '</div>'; //close L2
        } else {
          noticeHTML =
              '<div id="bap-notice-' + pageId +
                '" class="bap-notice bap-notice-old-l2 dimensions-reg5">' +
                CLOSE_BTN +
                '<div class="border-gray">' + 
                    MAIN_COPY + 
                    BAP_LINKS +
                    '<div class="font-bold border-top" \
                          style="font-size:.67em; \
                                background:#dcdcdc;\
                                padding:4px 0 4px 8px;">' +
                      se + 
                    '</div>' +
                '</div>' +
              '</div>';
        }
        
      } else if (reg === 6) {
        if (BAP.options[pageId].new_l2) { 
          noticeHTML = 
          '<div id="bap-notice-' + pageId + 
                  '" class="bap-notice bap-notice-new-l2 dimensions-reg6-newl2" \
                        style="left: 274px;height:' + BAP.options[pageId].ad_h + 'px' + '">'  +
                      CLOSE_BTN +
              '<div> \
                  <div class="center-vert inline-block" style="left: 20px; width:118px">' +
                      BAP_ADVERTISER_LOGO +  
                  '</div> \
                  <div class="center-vert inline-block" style="left: 25%; width:50%;">' + 
                     MAIN_COPY +
                  '</div> \
                  <div class="center-vert inline-block" style="right: 20px;">' +
                      BAP_LINKS +
                  '</div> \
              </div>' +
              BAP_EVIDON_LOGO +
          '</div>';
        } else {
          noticeHTML = 
          '<div id="bap-notice-' + pageId + 
                  '" class="bap-notice bap-notice-old-l2"\
                             style="left: 274px;">' +
                      CLOSE_BTN +
              '<div class="border-gray dimensions-reg6">\
                  <div class="center-vert inline-block" style="max-width:280px; min-width: 230px;">' +
                    BAP_LINKS +
                  '</div>\
                  <div class="center-vert inline-block" style="left:34%; width:326px;">' + 
                     MAIN_COPY +
                  '</div>\
                  <div class="center-vert inline-block" style="right:0;">' +
                      BAP_ADVERTISER_LOGO +  
                  '</div>\
              </div>\
          </div>';
        }
          


      } else {
        console.warn("Reg values indicate ad size. Valid reg values - which are 1,2,5, or 6")
      }
      if (!div) {
        div = document.createElement("div");
        div.setAttribute("id", "BAP-holder");
        body.appendChild(div);
        div = $("BAP-holder");
      }
      div.innerHTML = div.innerHTML + noticeHTML;
      //css(reg);
    }
    /* Offset copy. */
    var _boxModel = null;
    (function() {
      var div = document.createElement("div");
      div.style.width = div.style.paddingLeft = "1px";
      body.appendChild(div);
      _boxModel = div.offsetWidth === 2;
      body.removeChild(div).style.display = "none";
    })();


    function _bodyOffset() {
      var top = body.offsetTop,
        left = body.offsetLeft;
      var container = document.createElement("div"),
        innerDiv,
        checkDiv,
        bodyMarginTop = parseFloat(getStyle(body, "marginTop")) || 0,
        html =
          '<div style="position:absolute;top:0;left:0;margin:0;border:5px solid #000;padding:0;width:1px;height:1px;"><div></div></div><table style="position:absolute;top:0;left:0;margin:0;border:5px solid #000;padding:0;width:1px;height:1px;" cellpadding="0" cellspacing="0"><tr><td></td></tr></table>';
      container.style.position = "absolute";
      container.style.top = 0;
      container.style.left = 0;
      container.style.margin = 0;
      container.style.border = 0;
      container.style.width = "1px";
      container.style.height = "1px";
      container.style.visibility = "hidden";
      container.innerHTML = html;
      body.insertBefore(container, body.firstChild);
      innerDiv = container.firstChild;
      checkDiv = innerDiv.firstChild;
      checkDiv.style.position = "fixed";
      checkDiv.style.top = "20px";
      // safari subtracts parent border width here which is 5px
      checkDiv.style.position = checkDiv.style.top = "";
      innerDiv.style.overflow = "hidden";
      innerDiv.style.position = "relative";
      body.removeChild(container);
      container = innerDiv = checkDiv = null;
      if (body.offsetTop !== bodyMarginTop) {
        top += parseFloat(getStyle(body, "marginTop")) || 0;
        left += parseFloat(getStyle(body, "marginLeft")) || 0;
      }
      return {
        top: top,
        left: left
      };
    }

    function _offset(elem) {
      var box;
      if (!elem || !elem.ownerDocument) {
        return null;
      }
      if (elem === elem.ownerDocument.body) {
        return _bodyOffset(elem);
      }
      try {
        box = elem.getBoundingClientRect();
      } catch (e) {}
      var doc = elem.ownerDocument,
        docElem = doc.documentElement;
      // Make sure we're not dealing with a disconnected DOM node
      if (!box) {
        return box
          ? {
            top: box.top,
            left: box.left
          }
          : {
            top: 0,
            left: 0
          };
      }
      var body = doc.body,
        win;
      //, win = ((elem && typeof elem === "object" && "setInterval" in elem) ? elem : elem.nodeType === 9 ? elem.defaultView || elem.parentWindow : false)
      if (elem && typeof elem === "object" && "setInterval" in elem) {
        win = elem;
      } else if (elem.nodeType === 9) {
        win = elem.defaultView || elem.parentWindow;
      } else {
        win = false;
      }
      var clientTop = docElem.clientTop || (browser.QuirksMode ? body.clientTop : 0) || 0,
        clientLeft = docElem.clientLeft || (browser.QuirksMode ? body.clientLeft : 0) || 0,
        scrollTop = win.pageYOffset || (_boxModel && docElem.scrollTop) || window.scrollY || 0,
        scrollLeft = win.pageXOffset || (_boxModel && docElem.scrollLeft) || window.scrollX || 0,
        top = box.top + scrollTop - clientTop,
        left = box.left + scrollLeft - clientLeft;
      return {
        top: top,
        left: left
      };
    } 

    BAP.changePosition = function(arg1, position, offsetObj){
      var ad, pageId,
        _x, _y,
        _changeFlag = false;
      if (isElement(arg1)){
        el = arg1;
      } else if (typeof arg1 === 'string') {
        el = document.querySelector(arg1);
      } else {
        console.warn('invalid dom argument. Send dom element or string')
        return;
      }

      for (var key in BAP.options){
          if (BAP.options[key].ad === el) {
            pageId = key;
          }
      }


      if (position === 'top-left' || position === 'top-right' || position === 'bottom-left' || position === 'bottom-right' || _x) {
        if (BAP.options[pageId].position !== position) {
          // new position
          BAP.options[pageId].position = position;
          //swap out background art of icon
          $("trigger-box-" + pageId).querySelector('img').src="http://dev.betrad.com/icon/box_77_" + position + ".png";
          _changeFlag = true;
        }
      } else {
        console.warn('invalid icon position request');
      }

      if (offsetObj.x) { 
        _x = parseInt(offsetObj.x, 10);
        if (BAP.options[pageId].offsetLeft !== _x  )  {
          BAP.options[pageId].offsetLeft = _x;
          _changeFlag = true;
        }
      }
      if (offsetObj.y) { 
        _y = parseInt(offsetObj.y, 10);
        if (BAP.options[pageId].offsetTop !== _y  )  {
          BAP.options[pageId].offsetTop = _y;
          _changeFlag = true;
        }
      }
      if (_changeFlag) positionDM3(pageId);
      noticePositionCalculate(pageId);
    };

    function isElement(obj) {
      try {
        //Using W3 DOM2 (works for FF, Opera and Chrome)
        return obj instanceof HTMLElement;
      }
      catch(e){
        //Browsers not supporting W3 DOM2 don't have HTMLElement and
        //an exception is thrown and we end up here. Testing some
        //properties that all elements have (works on IE7)
        return (typeof obj==="object") &&
          (obj.nodeType===1) && (typeof obj.style === "object") &&
          (typeof obj.ownerDocument ==="object");
      }
    }
    
    try {
      addEvent(window, "message", handleMessage);
    } catch (e) {}
    // BAP utilities class
    var BAPUtil = {
      /* NON_PROD */
      trace: function() {
        /* NON_PROD */
        try {
          /* NON_PROD */
          if (arguments.length >= 1 || arguments.length <= 3) {
            /* NON_PROD */
            var format =
              "-- BAP" +
              (window === window.top
                ? ""
                : " [" + document.location.href + "]") +
              ":  " +
              arguments[0]; /* NON_PROD */
            if (arguments.length === 1) console.log(format);
            else if (arguments.length === 2)
              /* NON_PROD */
              console.log(format, arguments[1]);
            else if (arguments.length === 3)
              /* NON_PROD */
              console.log(format, arguments[1], arguments[2]); /* NON_PROD */
          } else {
            /* NON_PROD */
            alert(
              "Improper use of trace(): " + arguments.length + " arguments"
            ); /* NON_PROD */
          } /* NON_PROD */
        } catch (e) {} /* NON_PROD */
      } /* NON_PROD */,
      css: function(reg) {
        /* NON_PROD */
        if (reg && !$("bass-" + reg)) {
          /* NON_PROD */
          //console.log(DOMAIN_CSS + reg + ".css?r=" + Math.random());
          var ss = document.createElement("link"); /* NON_PROD */
          ss.setAttribute("id", "bass-" + reg); /* NON_PROD */
          ss.setAttribute("rel", "stylesheet"); /* NON_PROD */
          ss.setAttribute("type", "text/css"); /* NON_PROD */
          ss.setAttribute(
            "href",
            DOMAIN_CSS + reg + ".css?r=" + Math.random()
          ); /* NON_PROD */
          body.appendChild(ss); /* NON_PROD */
        } /* NON_PROD */
      } /* NON_PROD */
    }; /* NON_PROD */
    // _bao options loaded for DFA.
    if (window._bao) {
      start(window._bao);
    }
    API.changePosition = BAP.changePosition;
    API.options = BAP.options;
    API.flashPostMessage = flashPostMessage;
    API.createL2 = createL2;
    API.link = link;
    API.iabLink = iabLink;
    API.moreInfoLink = moreInfoLink;
    API.moreInfoHref = moreInfoHref;
    API.toggle = toggle;
    API.expandIcon = expandIcon;
    API.collapseIcon = collapseIcon;
    API.action = action;
    API.start = start;
    if (window.BAP && BAP.copyJSON) {
      var old_copyJSON = BAP.copyJSON;
      API.copyJSON = function(obj) {
        old_copyJSON(obj);
        copyJSON(obj);
      };
    } else {
      API.copyJSON = copyJSON;
    }
    API.$ = $;
    API.inject = inject;
    return API;
  })();

var BAP = { DOMAIN_PROTOCOL: (("https:" == document.location.protocol) ? "https://" : "http://") };
var BAP = {
	DOMAIN_ROOT: BAP.DOMAIN_PROTOCOL + "c.betrad.com/",
	DOMAIN_CSS: BAP.DOMAIN_PROTOCOL + "c.betrad.com/a/",
	DOMAIN_JSON: BAP.DOMAIN_PROTOCOL + "c.betrad.com/a/",
	DOMAIN_INFO: "http://info.evidon.com/",
	DOMAIN_PROTOCOL: BAP.DOMAIN_PROTOCOL,
	CSS_COMMON:null,
	CSS_1:null,
	CSS_2:null,
	CSS_5:null,
	CSS_6:null,
	sizes:[{i:2,w:250,h:250,m:0},{i:3,w:240,h:400,m:0},{i:4,w:336,h:280,m:0},{i:5,w:180,h:150,m:1},{i:6,w:300,h:100,m:1},{i:7,w:720,h:300,m:0},{i:8,w:468,h:60,m:1},{i:9,w:234,h:60,m:1},{i:10,w:88,h:31,m:1},{i:11,w:120,h:90,m:1},{i:12,w:120,h:60,m:1},{i:13,w:120,h:240,m:1},{i:14,w:125,h:125,m:1},{i:15,w:728,h:90,m:0},{i:16,w:160,h:600,m:0},{i:17,w:120,h:600,m:1},{i:18,w:300,h:600,m:0},{i:19,w:640,h:480,m:0},{i:20,w:200,h:200,m:0},{i:21,w:410,h:200,m:0},{i:22,w:425,h:600,m:0},{i:23,w:300,h:125,m:1},{i:1,w:300,h:250,m:0},{i:24,w:300,h:60,m:1},{i:25,w:990,h:90,m:0},{i:26,w:300,h:310,m:0},{i:27,w:336,h:850,m:0},{i:28,w:970,h:66,m:0},{i:29,w:640,h:360,m:0}],
	logging: true,
	detection: 'on',
	processed:false,
	rendered:false,
	processTimeout: null,
	ni:[],nip:[],uniqueids:[],mq:[],frameNoticed:{},v:{},nids:{},creativeids:{},campaignids:{},advertiserids:{},networkids:{},options:{},log:{},
	// error pixels -- this array exists to record a sent error pixel / nid for the purposes of not logging the same error twice
	ep:{},
	// iframes on the page and their associated ids
	tangoPartners:{},
	// coveredNotices is taken out of BAP.options for the cases when BAP.options notices are removed (iframe and transiotion cases)
	coveredNotices:{},iX:0,md:0,
	version: '2',
	treatment: '2',
	country:'us',
	domain: function() {
		var d = document.domain;

		try {
			if (BAP.browser.Gecko) {
				try {
					d = top.document.location;
				} catch (e) {
					// invented by fixanoid! =)
					var w = e.message;
					wha = wha.substring(wha.lastIndexOf('<') + 1, wha.length - 2);
					d = w;
				}
			}
		}	catch (f) { }

		return d;
	}(),

	browser: function() {
    var ua = navigator.userAgent;
    var isOpera = Object.prototype.toString.call(window.opera) == '[object Opera]';
    return {
			IE:             !!window.attachEvent && !isOpera,
			IE6:            ua.indexOf('MSIE 6') > -1,
			IE7:            ua.indexOf('MSIE 7') > -1,
			IE8:            ua.indexOf('MSIE 8') > -1,
			Opera:          isOpera,
			Gecko:          ua.indexOf('Gecko') > -1 && ua.indexOf('KHTML') === -1,
			Safari:   			( (ua.indexOf('Safari') > -1) && (ua.indexOf('Chrome') <= -1) ),
			Chrome:					!!navigator.userAgent.match('Chrome'),
			QuirksMode:     document.compatMode == 'BackCompat'
    };
  }(),

	ifr: function() {
		if (top.location != location) {
			return true;
		}

		return false;
	}(),

	/**
	 * SWFObject inspired flash detection
	 */
	flash: function() {
		var U = 'undefined',
				SF = 'Shockwave Flash',
				FMT = 'application/x-shockwave-flash',
				playerVersion = [0,0,0],
				d = null,
				nav = navigator,
				plugin = false;

		if (typeof nav.plugins != U && typeof nav.plugins[SF] == 'object') {
			d = nav.plugins[SF].description;
			if (d && !(typeof nav.mimeTypes != U && nav.mimeTypes[FMT] && !nav.mimeTypes[FMT].enabledPlugin)) {
				plugin = true;
				d = d.replace(/^.*\s+(\S+\s+\S+$)/, "$1");
				playerVersion[0] = parseInt(d.replace(/^(.*)\..*$/, "$1"), 10);
				playerVersion[1] = parseInt(d.replace(/^.*\.(.*)\s.*$/, "$1"), 10);
				playerVersion[2] = /[a-zA-Z]/.test(d) ? parseInt(d.replace(/^.*[a-zA-Z]+(.*)$/, "$1"), 10) : 0;
			}
		} else if (typeof window.ActiveXObject != U) {
			try {
				var a = new ActiveXObject('ShockwaveFlash.ShockwaveFlash');
				if (a) {
					d = a.GetVariable("$version");
					if (d) {
						d = d.split(" ")[1].split(",");
						plugin = true;
						playerVersion = [parseInt(d[0], 10), parseInt(d[1], 10), parseInt(d[2], 10)];
					}
				}
			} catch(e) {}
		}
		return {x:plugin, v:playerVersion};
	}(),

/*
options: {
	nid: 123,							// Evidon notice id
 	uqid:	123,						// Generated on page unique page id
 	crid: 123,						// Evidon creative id
 	icaid: 123,						// Evidon campaign id
 	ecaid: 123,						// Your own campaign id
 	coid: 123,						// Evidon company id
 	aid: 123,							// Evidon advertiser id
 	nwid: 123,						// Evidon network id
 	ad_h: 123,						// ad height in pixels
 	ad_w: 123,						// ad width in pixels
 	ad_wxh: 300x250				// ad width X height
 	ad_oas: 'WIDTH=160 HEIGHT=600'
 	position: 'top-left'	// position
 	ad_z: 2000						// z index to use
}
*/
	start: function(options) {
		/**
		 * special case that occurs when BAP.start has been called, but BAP has 
		 * not loaded or unpacked yet. Specifically covers IE 6-9 for the cases
		 * when loading is still going. In this case, we push into _bab array
		 * every time that the error occurs during SURLY load. Afterwards, once
		 * BAP.start() has been called, we first check if there were unsuccessful
		 * previous attempts, and start them if there were.
		 */
		try {
			if (!!window._bab) {
				var v = window._bab;
				window._bab = null;
				for (var i = v.length - 1; i >= 0 ; i--) {
					BAP.start(v[i]);
				}
			}
		} catch (e) {}

		if (options) {
			var bap_url;
			var pageId;

			if (!options.uqid) { return; } else {
				pageId = options.uqid;
				if (BAP.options[pageId]) {return;}
			}

			// Convert properties to lower case since we have some odd clients...
			try {
				var o = {};
				for (var prop in options) {
					if (options.hasOwnProperty(prop)) {
						o[prop.toLowerCase()] = options[prop];
					}
				}
				options = o;
			} catch (e) {}

			if ( options.ad_oas ) {
				try {
					options.ad_oas = options.ad_oas.toLowerCase();
					options.ad_wxh = options.ad_oas.replace('width=', '').replace('height=', '').replace(' ', 'x');
				} catch (e) {}
			}

			if ( options.ad_wxh ) {
				try {
					options.ad_wxh = options.ad_wxh.toLowerCase();
					options.ad_w = !options.ad_w ? options.ad_wxh.split('x')[0] : options.ad_w;
					options.ad_h = !options.ad_h ? options.ad_wxh.split('x')[1] : options.ad_h;
				} catch (e) {}
			}

			if ( (!options.ad_w) || (!options.ad_h) ) {
				BAP.error(options, 13);
				return;
			}

			options.ns = BAP.getAdStandard(options.ad_h, options.ad_w);
			if (options.ns == 0) {
				BAP.error(options, 14);
				return;
			}

			// Point of no errors, add into the processing queue
			BAP.uniqueids.push(pageId);

			if (options.ecaid) {
				BAP.campaignids[pageId] = null;
				bap_url = 'c/e/' + options.coid + '/' + options.ecaid;
			}

			if (options.icaid) {
				BAP.campaignids[pageId] = options.icaid;
				bap_url = 'c/i/' + options.coid + '/' + options.icaid;
			} else { BAP.campaignids[pageId] = null; }

			if (options.nid) {
				BAP.nids[pageId] = options.nid;
				bap_url = 'n/' + options.coid + '/' + options.nid;
			}

			if (options.crid) { BAP.creativeids[pageId] = options.crid; } else { BAP.creativeids[pageId] = '0'; }
			if (options.aid) { BAP.advertiserids[pageId] = options.aid; } else { BAP.advertiserids[pageId] = '0'; }
			if (options.nwid) { BAP.networkids[pageId] = options.nwid; } else { BAP.networkids[pageId] = '0'; }

			BAP.options[pageId] = options;

			if (bap_url) {
				if (!BAP.v[options.nid]) {
					document.write('<sc'+'ript type="text/javascript" src="' + BAP.DOMAIN_JSON + bap_url + '.js?r=' + Math.random() + '"></scr'+'ipt>');
				}
			} else {
				// remove whatever we pushed in
				BAP.uniqueids.pop();
				BAP.error(options, 11);
			}
		} else {
			BAP.error(null, 10);
		}

		BAP.addLoadEvent(function() {
			BAP.process();
		});

		// trap when the onload doesn't fire. set to fire 5 seconds after.
		if (BAP.processTimeout) { clearTimeout(BAP.processTimeout); }
		BAP.processTimeout = setTimeout(BAP.process, 5000);
	},

	process: function() {
		if (BAP.processed) {return;}
		BAP.processed = true;

		try {
			// Invite partners for a dance!
			BAP.tango();

			BAP.css('COMMON');

			for (var i = 0; i < BAP.uniqueids.length; i++) {
				var pageId = BAP.uniqueids[i];

				// error check so see if this pageId's json is loaded
				if (!BAP.v[BAP.options[pageId].nid]) {
					BAP.error(BAP.options[pageId], 12);
					continue;
				} else {
					// copy json into options
					BAP.copyOptions(pageId, BAP.options[pageId].nid);
				}

				BAP.showNoticeHelper(pageId);
				BAP.createPopupLayer(pageId, BAP.options[pageId].advName, BAP.options[pageId].advMessage, BAP.options[pageId].advLogo, BAP.options[pageId].advLink, BAP.options[pageId].server);
			}

			// attaching resize event
			BAP.vs = (BAP.frameSize()[0] < document.body.scrollHeight);
			BAP.iX = BAP.frameSize()[1];

			// YAHOO WORKAROUND
			if (location.href.indexOf('tech-ticker') < 0) {
				BAP.addEvent(window, 'resize', BAP.resize);

				// movement detection
				setTimeout(BAP.movement, 200);

				// scroll detection
				BAP.addEvent(window, 'scroll', BAP.scroll);
			}
		} catch (e) {
			BAPUtil.trace('[BAP.process() error]', e);
		}

		BAP.rendered = true;
	},

	copyOptions: function(pageId, nid) {
		try {
			var cud = BAP.v[nid];

			BAP.options[pageId].advName = (cud.data.adv_name ? cud.data.adv_name : null);
			BAP.options[pageId].advMessage = (cud.data.adv_msg ? cud.data.adv_msg : null);
			BAP.options[pageId].advLogo = (cud.data.adv_logo ? cud.data.adv_logo : null);
			BAP.options[pageId].advLink = (cud.data.adv_link ? cud.data.adv_link : null);

			BAP.options[pageId].rev = (cud.data.revision ? cud.data.revision : 0);
			BAP.options[pageId].behavioral = (cud.data.behavioral ? cud.data.behavioral : 'definitive');
			BAP.options[pageId].behavioralCustomMessage = (cud.data.generic_text ? cud.data.generic_text : '');

			BAP.options[pageId].icon_delay = (cud.data.icon_delay ? cud.data.icon_delay : 0);
			BAP.options[pageId].icon_display = (cud.data.icon_display ? cud.data.icon_display : 'normal');
			BAP.options[pageId].icon_display = (cud.data.icon_expandable ? 'expandable' : BAP.options[pageId].icon_display);

			BAP.options[pageId].icon_grayscale = (cud.data.icon_grayscale ? cud.data.icon_grayscale : 100);
			BAP.options[pageId].container_opacity = (cud.data.container_opacity ? cud.data.container_opacity : 100);

			// offsets
			BAP.options[pageId].offsetTop = (cud.data.offset_y ? (!isNaN(parseInt(cud.data.offset_y)) ? parseInt(cud.data.offset_y) : 0) : 0);
			BAP.options[pageId].offsetLeft = (cud.data.offset_x ? (!isNaN(parseInt(cud.data.offset_x)) ? parseInt(cud.data.offset_x) : 0) : 0);

			try {
				BAP.options[pageId].server = (cud.data.server[0]);
			} catch (e) {
				BAP.options[pageId].server = ({"id" : 0, "name" : "Evidon"});
			}

			// Could have been passed in initial options array, if so, ignore JSON setting.
			if (!BAP.options[pageId].position) {
				BAP.options[pageId].position = (cud.data.icon_position ? cud.data.icon_position : 'top-right');
			}

			BAP.options[pageId].positionVertical = BAP.options[pageId].position.indexOf('top') >= 0 ? 'top' : 'bottom';
			BAP.options[pageId].positionHorizontal = BAP.options[pageId].position.indexOf('left') >= 0 ? 'left' : 'right';

			if (!BAP.campaignids[pageId]) { BAP.options[pageId].icaid = (cud.data.icid ? cud.data.icid : null); }
			if (!BAP.nids[pageId]) { BAP.nids[pageId] = BAP.options[pageId].nid = (cud.data.nid ? cud.data.nid : null); }
			if (!BAP.advertiserids[pageId]) { BAP.options[pageId].aid = (cud.data.aid ? cud.data.aid : null); }
			if (!BAP.networkids[pageId]) { BAP.options[pageId].nwid = (cud.data.nwid ? cud.data.nwid : null); }

			BAP.options[pageId].spotHeight = parseInt(BAP.options[pageId].ad_h);
			BAP.options[pageId].spotWidth = parseInt(BAP.options[pageId].ad_w);

			// reusing skip flag if the L1 has no appropriate L2, but is not a mini.
			BAP.options[pageId].skipL2 = (cud.data.skip_L2 ? cud.data.skip_L2 : BAP.isSkipper(BAP.options[pageId].ns));

			// reset detection mode
			BAP.options[pageId].dm = -1;

			// setting additional notice layer to empty
			BAP.coveredNotices[pageId] = {};
		} catch (e) {
			BAPUtil.trace('[BAP.copyOptions() error]', e);	
		}
	},

	copyJSON: function(cud) {
		try {
			BAP.v[cud.data.nid] = cud;
		} catch (e) {
			BAPUtil.trace('[BAP.copyJSON() error]', e);
		}
	},

	scroll: function(event) {
		try {
			BAP.testMovement();
			// Fire again 100ms later; this fixes an issue where when you scroll back to the top of
			// the page, the actual adunit doesn't finish moving right away so we end up with an
			// incorrectly positioned notice. By firing again after a short delay, we should fix this.
			if (location.href.indexOf('tech-ticker') >= 0) {
				//finance.yahoo.com/tech-ticker/
				setTimeout(BAP.testMovement, 1);
			} else {
				setTimeout(BAP.testMovement, 100);
			}
		} catch (e) {
			BAPUtil.trace('[BAP.scroll() error]', e);
		}
	},

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
	movement: function(event) {
		try {
			BAP.testMovement();

			if (BAP.md < 100) {
				// reset timer @ 100ms for the next 10sec
				BAP.md++;
				setTimeout(BAP.movement, 100);
			} else if (BAP.md < 112) {
				// 5sec timer for the next 60sec
				BAP.md++;
				if (BAP.md == 101) {
					BAPUtil.trace("[movement] dropping timer to 5sec");
				}
				setTimeout(BAP.movement, 5000);
			} else {
				BAPUtil.trace("[movement] killing timer completely")
			}
		} catch (e) {
			BAPUtil.trace('[BAP.movement() error]', e);	
		}
	},

	testMovement: function() {
		for(var pageId in BAP.options) {
			var b = BAP.options[pageId];
			if (BAP.options[pageId].uqid) {
				var el;
				if (b.dm == 5) {
					// skip iframes
					return;
				} else if (b.dm == 6) {
					// use pixel element
					el = b.px;
				} else {
					// use ad element
					el = b.ad;
				}

				try {
					var p = _offset.get(el);
					if (p.top != b.pxt || p.left != b.pxl) {
						// check current offset against stored values. if either differ, redraw!
						BAP.hidePopup(pageId);
						BAP.noticePositionCalculate(pageId);
						BAP.noticePosition(pageId);
					}
				} catch (e) {}
			}
		}
	},

	resize: function(event) {
		try {
			var dX = (BAP.frameSize()[1] - BAP.iX);
			var vs = (BAP.frameSize()[0] < document.body.scrollHeight);
			var vsToggle = (BAP.vs != vs);

			if ( (dX !== 0) || (vsToggle) ) {
				for(var pageId in BAP.options) {
					if (BAP.options[pageId].uqid) {
						BAP.noticePositionCalculate(pageId);
						BAP.noticePosition(pageId);

						if (BAP.$('bap-notice-' + pageId)) {
							BAP.hidePopup(pageId);

							// update L2 position
							BAP.updateL2(pageId);
						}
					}
				}

				BAP.iX = BAP.frameSize()[1];
				BAPUtil.trace('Resize event: X? ' + (dX !== 0) + '|VS? ' + vsToggle);
			}

			BAP.vs = vs;
		} catch (e) {
			BAPUtil.trace('[BAP.resize() error]', e);
		}
	},

	pixel: function(u) {
		var body = document.getElementsByTagName('body')[0];
		var img = document.createElement('img');
		img.setAttribute('src', u);
		img.setAttribute('height', '1');
		img.setAttribute('width', '1');
		body.appendChild(img);
	},

	action: function(pageId, state) {
		if (!BAP.logging) { return; }

		/*
			T -- tag loaded; (this setting is no longer called)
			I -- icon (L1) shown;
			S -- notice (L2) shown;
			A -- advertiser clicked;
			B -- IAB clicked;
			M -- more info;
			O -- dynamic inclusion overwrite;
		*/

		BAPUtil.trace('Logging action: ' + state + ' for ' + pageId);

		var ow = '';
		var log = BAP.log[pageId];

		if (!log) { log = {t:0,n:0,i:0,a:0,b:0,m:0}; }

		var sw = false; var l;
		if ( (state == 'T') && (log.t == 0) ) { log.t = 1;sw=true;l='1/0/0/0/0/0'; }
		if ( (state == 'I') && (log.n == 0) ) { log.n = 1;sw=true;l='0/1/0/0/0/0'; }
		if ( (state == 'S') && (log.i == 0) ) { log.i = 1;sw=true;l='0/0/1/0/0/0'; }
		if ( (state == 'A') && (log.a == 0) ) { log.a = 1;sw=true;l='0/0/0/1/0/0'; }
		if ( (state == 'B') && (log.b == 0) ) { log.b = 1;sw=true;l='0/0/0/0/1/0'; }
		if ( (state == 'M') && (log.m == 0) ) { log.m = 1;sw=true;l='0/0/0/0/0/1'; }

		if (state == 'O') { sw=true;l='0/1/0/0/0/0';ow='&o=1'; }

		BAP.log[pageId] = log;

		if (!sw) { return; }

		var pixel = '';
		var options = BAP.options[pageId];

		pixel += encodeURIComponent(options.nwid ? options.nwid : '0') + '_' + encodeURIComponent(options.aid ? options.aid : '0') + '_' + encodeURIComponent(options.icaid ? options.icaid : '0') + '_';
		pixel += encodeURIComponent(options.ecaid ? options.ecaid : '0').replace(/_/g, '$underscore$') + '_' + encodeURIComponent(options.crid ? options.crid : '0') + '_' + encodeURIComponent(options.nid ? options.nid : '0') + '/';
		pixel += BAP.country + '/';
		pixel += l + '/' + BAP.getAdStandard(options.ad_h, options.ad_w) + '/';
		pixel += '242/'; // served by
		pixel += options.coid + '/'; // owner
		pixel += options.rev + '/'; // revision

		var lomain = 'http://l2';
/*
		var seed = Math.floor(Math.random() * (10) + 1);
		if (seed == 1) { lomain = 'http://l2.betrad.com'; }
*/
		pixel = lomain + '.betrad.com/ct/' + pixel + 'pixel.gif?v=' + BAP.version + '&ttid=' + BAP.treatment + '&d=' + BAP.domain + '&m=' + BAP.options[pageId].dm + ow + '&r=' + Math.random();

		BAP.pixel(pixel);

		// check if this notice overwrites others, and in the case of M and B, fire a logging pixel as well
		if ( (!options.noticeExists) && (BAP.coveredNotices[pageId]) && ( (state == 'B') || (state == 'M') ) ) {
			ow = '&o=1';

			for (var key in BAP.coveredNotices[pageId]) {
				pixel = '';
				options = BAP.coveredNotices[pageId][key];

				pixel += encodeURIComponent(options.nwid ? options.nwid : '0') + '_' + encodeURIComponent(options.aid ? options.aid : '0') + '_' + encodeURIComponent(options.icaid ? options.icaid : '0') + '_';
				pixel += encodeURIComponent(options.ecaid ? options.ecaid : '0').replace(/_/g, '$underscore$') + '_' + encodeURIComponent(options.crid ? options.crid : '0') + '_' + encodeURIComponent(options.nid ? options.nid : '0') + '/';
				pixel += BAP.country + '/';
				pixel += l + '/' + BAP.getAdStandard(BAP.options[pageId].ad_h, BAP.options[pageId].ad_w) + '/';
				pixel += '242/'; // served by
				pixel += options.coid + '/'; // owner
				pixel += options.rev + '/'; // revision

				pixel = 'http://l.betrad.com/ct/' + pixel + 'pixel.gif?v=' + BAP.version + '&ttid=' + BAP.treatment + '&d=' + BAP.domain + '&m=' + BAP.options[pageId].dm + ow + '&r=' + Math.random();
				BAP.pixel(pixel);
			}
		}
	},

	error: function(options, ec) {
		if (BAP.detection == 'tagui') { return; }

		/*
			Error Codes:
			- 10 -- options missing
			- 11 -- invalid options (pre json load)
			- 12 -- json is not loaded
			- 13 -- ad height or ad width is missing
			- 14 -- height and width map to an invalid ad standard
			- 100 -- noscript served
		*/

		var pixel =  encodeURIComponent(options.nwid ? options.nwid : '0') + '_' +  encodeURIComponent(options.aid ? options.aid : '0') + '_' + encodeURIComponent(options.icaid ? options.icaid : '0') + '_';
		pixel += encodeURIComponent((options.ecaid ? options.ecaid : '0')).replace(/_/g, '$underscore$') + '_' + encodeURIComponent(options.crid ? options.crid : '0') + '_' + encodeURIComponent(options.nid ? options.nid : '0') + '/';

		if (BAP.ep[pixel] == ec) { return; }

		BAP.ep[pixel] = ec;

		if (pixel) {
			pixel = 'http://l.betrad.com/ct/' + pixel + 'pixel.gif?e=' + ec + '&v=' + BAP.version + '&d=' + BAP.domain + '&r=' + Math.random();

			BAP.pixel(pixel);
		}
	},

	expandIcon: function(pageId) {
		if (BAP.options[pageId].expanded) { return; }

		var iconWidth = 19;
		var icon = BAP.DOMAIN_ROOT + 'icon/c_' + BAP.options[pageId].icon_grayscale + '.png';

		var trigger = BAP.$('trigger-' + pageId);
		var currLeft = _offset.get(trigger).left;

		if (BAP.options[pageId].positionHorizontal == 'right') {
			currLeft = currLeft + iconWidth - 77;
		}

		trigger.style.left = currLeft + 'px';
		trigger.innerHTML = '<img src="' + icon + '">';

		BAP.$('trigger-box-' + pageId).style.left = currLeft + 'px';
		BAP.$('trigger-box-' + pageId).style.width = '77px';
		BAP.$('trigger-box-image-' + pageId).src = BAP.DOMAIN_ROOT + 'icon/box_77_' + BAP.options[pageId].position + '.png';

		BAP.options[pageId].expanded = true;
	},

	collapseIcon: function(pageId) {
		if (!BAP.options[pageId].expanded) { return; }

		var iconWidth = 19;
		var icon = BAP.DOMAIN_ROOT + 'icon/ci.png';

		var trigger = BAP.$('trigger-' + pageId);
		var currLeft = _offset.get(trigger).left;

		if (BAP.options[pageId].positionHorizontal == 'right') {
			currLeft = currLeft + 77 - iconWidth;
		}

		trigger.style.left = currLeft + 'px';
		trigger.innerHTML = '<img src="' + icon + '">';

		BAP.$('trigger-box-' + pageId).style.left = currLeft + 'px';
		BAP.$('trigger-box-' + pageId).style.width = iconWidth + 'px';
		BAP.$('trigger-box-image-' + pageId).src = BAP.DOMAIN_ROOT + 'icon/box_19_' + BAP.options[pageId].position + '.png';

		BAP.options[pageId].expanded = false;
	},

	checkElement: function(el, height, width) {
		try {
			var eh = el.height;
			var ew = el.width;

			if (!eh) { eh = parseInt(BAP.getStyle(el, 'height')); }
			if (!ew) { ew = parseInt(BAP.getStyle(el, 'width')); }

			if (!eh) { eh = el.offsetHeight; }
			if (!ew) { ew = el.offsetWidth; }

			if ( (eh === height) && (ew === width) ) { return true; }

			// adding 10 pixel margin autoadjust
			if ( (eh <= height + 5) && (eh >= height - 5) && (ew >= width - 5) && (ew <= width + 5) ) { return true; }
		} catch (e) {}

		return false;
	},

	getObjectEmbed: function(ad) {
		// Short circuit for Safari since it never used <embed>
		if (BAP.browser.Safari) { return ad; }

		var em, io;
		try {
			if (ad.nodeName.toLowerCase() === 'object') {
				for (var elx = ad.childNodes.length - 1; elx > 0; elx--) {
					var embed = ad.childNodes[elx];

					if (embed.nodeName.toLowerCase() === 'embed') {
						em = embed;
						break;
					}

					if ( (embed.nodeName.toLowerCase() === 'object') && (embed.type === 'application/x-shockwave-flash') ) {
						io = embed;
					}
				}
			}

			if ( (!em) && (io) ) { em = io; }

			if ( (BAP.browser.Gecko) && (em) ) {
				ad = em;
			} else if ( (BAP.browser.Chrome) && (em) ) {
				ad = em;
			} else if (_offset.get(em).top != 0) {
				ad = em;
			}
		} catch (e) {}

		return ad;
	},

	checkSiblings: function(ob, spotHeight, spotWidth, level) {
		try {
			if (level == 15) {
				return false;
			} else {
				if ( BAP.checkElement(ob, spotHeight, spotWidth) ) {
					return ob;
				} else {
					//if (ob.previousSibling)
					return BAP.checkSiblings(ob.previousSibling, spotHeight, spotWidth, ++level);
				}
			}
		} catch (e) {
			return false;
		}
	},

	addLoadEvent: function(func) {
		if (window.addEventListener) {
		  window.addEventListener('load', func, false);
		} else if (window.attachEvent) {
		  window.attachEvent('onload', func);
		}
	},

	hidePopup: function(pageId) {
		try {
			var popup = BAP.$('bap-notice-' + pageId);
			if ( (popup) && ( BAP.getStyle(popup, 'display') != 'none' ) ) {
				popup.style.display = 'none';
			}
		} catch (e) {}
	},

	toggle: function(el) {
		if ( BAP.getStyle(el, 'display') != 'none' ) {
			el.style.display = 'none';
		} else {
			el.style.display = 'block';
		}
	},

	/**
	 * This method has been added to aggregate and append all vendor passed variables
	 * to the more info link.
	 */
	vendor: function(pageId, v) {
		var p = '',c,vi = '';

		if (BAP.options[pageId][v]) {
			p = '&' + v + '[' + BAP.nids[pageId] + ']=' + encodeURIComponent(BAP.options[pageId][v]);
		}

		if (BAP.coveredNotices[pageId]) {
			for (var key in BAP.coveredNotices[pageId]) {
				var options = BAP.coveredNotices[pageId][key];
				if (options[v]) {
					p += '&' + v + '[' + key + ']=' + encodeURIComponent(options[v]);
				}
			}
		}

		return p;
	},

	/**
	 * This method generates the more info link.
	 */
	moreInfoHref: function(pageId) {
		var mi = BAP.DOMAIN_INFO + 'more_info/' + BAP.nids[pageId];
		for (var key in BAP.coveredNotices[pageId]) {
			mi += ',' + key;
		}

		// Add vendor links
		var vi = BAP.vendor(pageId, 'cps');
		vi += BAP.vendor(pageId, 'seg');
		if (vi) { mi += '?' + vi; }

		return mi;
	},

	/**
	 * This method was created to resolve and limit the DNS queries per notice display.
	 * This particular method only handles MORE INFO link since this link might need to 
	 * contain several notice ids.
	 */
	moreInfoLink: function (pageId) {
		BAP.link('bap-link-1-' + pageId, BAP.moreInfoHref(pageId));
	},

	iabLink: function (pageId, n) {
		var mi = BAP.DOMAIN_INFO + 'about_behavioral_advertising/section1?n=' + BAP.nids[pageId];
		for (var key in BAP.coveredNotices[pageId]) {
			mi += ',' + key;
		}

		BAP.link('bap-link-2-' + pageId, mi);
	},

	/**
	 * This method was created to resolve and limit the DNS queries per notice display.
	 * Its triggered on mouse over, and once executed, sets the correct href destination
	 * for all of the links on the L2.
	 */
	link: function(tag, dest) {
		// NOTE: reattached every time more info link is hovered over in case a new notice
		// has been appended to the coveredNotices. Might be an overkill?
		BAP.$(tag).href = dest;
	},

	/**
	 * This method injects the proper CSS into the usher page either via a new link element
	 * or a direct style injection.  Direct injection is the proper production mode, external
	 * include is only used in the development and staging modes.  This method relies on 
	 * BAPUtil.css that is removed for production deployment.
	 */
	css: function(reg) {
		if ( (reg) && (!BAP.$('bass-' + reg)) ) {
			var body = document.getElementsByTagName('body')[0];

			if (BAP['CSS_' + reg]) {
				if (!BAP.browser.IE) {
					var ss = document.createElement('style');
					ss.setAttribute('id', 'bass-' + reg);
					ss.setAttribute('type', 'text/css');
					ss.innerHTML = BAP['CSS_' + reg];
					body.appendChild(ss);
				} else {
					var ss = document.createStyleSheet("");
					ss.cssText = BAP['CSS_' + reg];
				}
			} else { BAPUtil.css(reg); }
		}
	},

	$: function() {
		var elements = [];
		for (var i = 0; i < arguments.length; i++) {
			var element = arguments[i];
			if (typeof element == 'string') {
				element = document.getElementById(element);
			}
			if (arguments.length == 1) {
				return element;
			}
			elements.push(element);
		}
		return elements;
	},

	addEvent: function(elm, evType, fn, useCapture) {
		if (elm.addEventListener) {
			elm.addEventListener(evType, fn, useCapture);
			return true;
		} else if (elm.attachEvent) {
			var r = elm.attachEvent('on' + evType, fn);
			return r;
		} else {
			elm['on' + evType] = fn;
		}
	},

	frameSize: function() {
		var w = window;

		var width = -1;
		try {
			if (typeof (w.innerWidth) == "number") {
				width = w.innerWidth;
			} else {
				if (w.document.documentElement && w.document.documentElement.clientWidth) {
					width = w.document.documentElement.clientWidth;
				} else {
					if (w.document.body && w.document.body.clientWidth) {
						width = w.document.body.clientWidth;
					}
				}
			}
		} catch (err) {}

		var height = -1;
		try {
			if (typeof (w.innerWidth) == "number") {
				height = w.innerHeight;
			} else {
				if (w.document.documentElement && w.document.documentElement.clientHeight) {
					height = w.document.documentElement.clientHeight;
				} else {
					if (w.document.body && w.document.body.clientHeight) {
						height = w.document.body.clientHeight;
					}
				}
			}
		} catch (err) {}

		return [height, width];
	},

	getStyle: function(el, styleProp) {
		try {
			var y;
			if (el.currentStyle) {
				y = el.currentStyle[styleProp];
			} else if (window.getComputedStyle) {
				y = document.defaultView.getComputedStyle(el, null).getPropertyValue(styleProp);
			}
			if ( (!y) && (styleProp === 'text-align') ) { try { y = el.currentStyle.textAlign; } catch (e) {} }

			return y;
		} catch (e) {
			return null;
		}
	},

	getDepth: function(el) {
		var z = ( BAP.browser.IE ? 'zIndex' : 'z-index');
		var zi = null;

		if (el == null) {return;}
		if ( BAP.getStyle(el, z) == 'auto' ) {
			zi =  BAP.getDepth(el.parentNode);
		} else if ( parseInt(BAP.getStyle(el, z)) > 0) {
			zi = BAP.getStyle(el, z);
		}

		return (parseInt(zi) + 10);
	},

	/**
	 * This identifies supported ad standards. When addint entry here, make sure that cratePopup
	 * is updated.
	 */
	getAdStandard: function (height, width) {
		var s = BAP.sizes;
		for (var i = 0; i < s.length; i++) {
			if ( (s[i].w == width) && (s[i].h == height) ) {
				return s[i].i;
			}
		}

		return 0;
	},

	/**
	 * This helper function identifies if an ad size is a mini standard:
	 * - may show just the icon if expandable is selected (Ad Choices Icon is 30% or more of the ad)
	 * - will not display L2
	 */
	isMini: function (noticeStandard) {
		var s = BAP.sizes;
		for (var i = 0; i < s.length; i++) {
			if ( (s[i].m == 1) && (s[i].i == noticeStandard) ) {
				return true;
			}
		}

		return false;
	},

	/**
	 * This helper function identifies if an ad size is L2 skippable
	 */
	isSkipper: function (noticeStandard) {
		if ( noticeStandard in {28:0} ) {
			return true;
		}

		return false;
	},

	sizeMatch: function(adw, adh) {
		var lastMatch = null;

		var imgs = document.getElementsByTagName("img");
		for (var i = 0; i < imgs.length; i++) {
			if ( (!imgs[i].height) && (!imgs[i].getAttribute('height')) ) { continue; }
			if ( (!imgs[i].width) && (!imgs[i].getAttribute('width')) ) { continue; }

			if ( (imgs[i].height == adh) && (imgs[i].width == adw) ) {
				lastMatch = imgs[i];
			} else if ( (parseInt(imgs[i].getAttribute('height')) == adh) && (parseInt(imgs[i].getAttribute('width')) == adw) ) {
				lastMatch = imgs[i];
			}
		}

		return lastMatch;
	},

	proximityDetection: function(px, spotWidth, spotHeight) {
		var cm = null;

		var counter = 0;
		var pxId = 0;
		var matches = {};
		var everything = document.getElementsByTagName("*");

		for (var i = 0; i < everything.length; i++) {
			counter++;
			if (px == everything[i]) {
				pxId = counter;
			}

			if ( (everything[i].nodeName == 'DIV') || (everything[i].nodeName == 'IMG') || (everything[i].nodeName == 'OBJECT') || (everything[i].nodeName == 'IFRAME') ) {
				var img = everything[i];

				if ( (!img.height) && (!img.getAttribute('height')) && (!BAP.getStyle(img, 'height')) ) { break; }
				if ( (!img.width) && (!img.getAttribute('width')) && (!BAP.getStyle(img, 'width'))  ) { break; }

				if ( (img.height == spotHeight) && (img.width == spotWidth) ) {
					matches[counter] = img;
				} else if ( (parseInt(img.getAttribute('height')) == spotHeight) && (parseInt(img.getAttribute('width')) == spotWidth) ) {
					matches[counter] = img;
				} else {
					// CSS reparsing.
					try {
						var w = parseInt(BAP.getStyle(img, 'width').replace('px', ''));
						var h = parseInt(BAP.getStyle(img, 'height').replace('px', ''));
						if ( (h == spotHeight) && (w == spotWidth) ) {
							matches[counter] = img;
						}
					} catch (e) {}
				}
			}
		}

		var dist = null;
		for (key in matches) {
			var d = Math.abs(pxId - key);

			if (d > 50) { continue; }

			if (dist == null || (d < dist)) {
				dist = d;
				cm = matches[key];
			}
		}

		matches = null;

		try { if ( (cm) && (cm.nodeName == 'OBJECT') ) { cm = BAP.getObjectEmbed(cm); } } catch (e) {}

		return cm;
	},

	addNoticeDelay: function(pageId) {
		BAP.action(pageId, 'I');

		if (BAP.options[pageId].icon_delay > 0) {
			var trigger = BAP.$('trigger-container-' + pageId);
			trigger.style.display = 'none';

			// Error in this function would occur because of the out of sync requests from other dancers around
			setTimeout(function() { try{ BAP.$('trigger-container-' + pageId).style.display = 'block'; } catch (e) {} }, parseInt(BAP.options[pageId].icon_delay) * 1000);
			BAPUtil.trace('Adding notice delay to the following notice: ' + pageId + ' delay:' + BAP.options[pageId].icon_delay + ' seconds');
		}
	},

	/**
	* This method positions the notice.
	*/
	noticePosition: function(pageId) {
		var t = BAP.$('trigger-' + pageId);
		var tc = BAP.$('trigger-box-' + pageId);

		/* YAHOO START */
		if (location.href.indexOf('tech-ticker') >= 0) {
			t.style['bottom'] = BAP.options[pageId].posTop + 'px';
			t.style['right'] = BAP.options[pageId].posLeft + 2 + 'px';

			tc.style['bottom'] = ( BAP.options[pageId].posTop + ( (!BAP.browser.IE6) && (!BAP.browser.IE7) ? 3 : 0) ) + 'px';
			tc.style['right'] = ( BAP.options[pageId].posLeft + 2 ) + 'px';

			return;
		}
		/* YAHOO END */

		t.style.top = BAP.options[pageId].posTop + 'px';
		t.style.left = BAP.options[pageId].posLeft + 'px';

		tc.style.top = BAP.options[pageId].posTop + 'px';
		tc.style.left = BAP.options[pageId].posLeft + 'px';
	},

	/**
	* This method calculates new notice location points based on the mode
	* that the notice is in.
	*/
	noticePositionCalculate: function(pageId) {
		var posTop; var posLeft; var pixLeft; var pixTop;
		var spotHeight = BAP.options[pageId].spotHeight, spotWidth = BAP.options[pageId].spotWidth, spotLeft, spotTop;

		var ad = BAP.options[pageId].ad;

		/* YAHOO START */
		var lof = 2;
		if (location.href.indexOf('tech-ticker') >= 0) {
			// CALC FROM BOTTOM & LEFT
			if (BAP.options[pageId].position == 'top-right') {
				posTop = spotHeight - 14; posLeft = 0 + lof;
			} else if (BAP.options[pageId].position == 'top-left') {
				posTop = spotHeight - 14; posLeft = 300 - 77 + lof;
			} else if (BAP.options[pageId].position == 'bottom-right') {
				posTop = 0; posLeft = 0 + lof;
			} else if (BAP.options[pageId].position == 'bottom-left') {
				posTop = 0; posLeft = 300 - 77 + lof;
			}

			if ( (BAP.browser.IE) && (!BAP.browser.IE6) && (!BAP.browser.IE7) ) { posTop += 15; posLeft -= 3;}
			if ( (!BAP.flash.x) && (BAP.browser.IE) && ( (BAP.browser.IE6) || (BAP.browser.IE7) ) ) { posTop += 17; posLeft -= 3;}

			BAP.options[pageId].pxl = pixLeft;
			BAP.options[pageId].pxt = pixTop;
			BAP.options[pageId].posTop = posTop;
			BAP.options[pageId].posLeft = posLeft;
			BAP.options[pageId].spotHeight = spotHeight;
			BAP.options[pageId].spotTop = spotTop;
			BAP.options[pageId].spotLeft = spotLeft;
			BAP.options[pageId].spotWidth = spotWidth;

			return;
		}
		/* YAHOO END */

		if (BAP.options[pageId].dm == 5) {
			pixLeft = spotWidth;
			spotTop = pixTop = 0;
			spotLeft = pixLeft - spotWidth;
		} else if ( (BAP.options[pageId].dm == 1)
						 || (BAP.options[pageId].dm == 2)
						 || (BAP.options[pageId].dm == 3)
						 || (BAP.options[pageId].dm == 4)
						 || (BAP.options[pageId].dm == 4.1)
						 || (BAP.options[pageId].dm == 4.2)
						 || (BAP.options[pageId].dm == 5)
						 || (BAP.options[pageId].dm == 7) ) {
			pixLeft = _offset.get(ad).left;
			pixTop = _offset.get(ad).top;
			spotLeft = pixLeft;
			spotTop = pixTop;
		} else if (BAP.options[pageId].dm == 6) {
			var px = BAP.options[pageId].px;
			pixLeft = _offset.get(px).left;
			pixTop = _offset.get(px).top;

			if (BAP.browser.Opera) {
				// Opera styling bug?  Top/Bottom is set to 0 when element height and width is 0
				// resize the pixel to be visible, measure top and hide it again
				px.width = px.height = '1';
				pixTop = _offset.get(px).top;
				px.width = px.height = '0';
			}

			spotLeft = pixLeft - spotWidth - 4; spotTop = pixTop - spotHeight;

			// adjust when pixel is not in the required position
			try {
				var ew = px.parentNode.width;

				if (!ew) { ew = parseInt(BAP.getStyle(px.parentNode, 'width')); }
				if ( (ew === spotWidth) || (ew <= spotWidth) ) {
					spotLeft = spotLeft + spotWidth;
					if (BAP.getStyle(px, 'text-align').toLowerCase().indexOf('center') >= 0 ) { spotLeft = spotLeft - (spotWidth / 2); if (BAP.browser.IE) { spotTop -= 4; } }
					else if (BAP.getStyle(px, 'text-align').toLowerCase().indexOf('right') >= 0) { spotLeft = spotLeft - spotWidth; if (BAP.browser.IE) { spotTop -= 4; } }
				}
			} catch (e) { }
		}

		// calculating icon position within the located object according to the selected notice corner
		if (BAP.options[pageId].position == 'top-right') {
			posTop = spotTop;	posLeft = spotLeft + spotWidth;
		} else if (BAP.options[pageId].position == 'top-left') {
			posTop = spotTop;	posLeft = spotLeft;
		} else if (BAP.options[pageId].position == 'bottom-right') {
			posTop = spotTop + spotHeight - 14;	posLeft = spotLeft + spotWidth;
		} else if (BAP.options[pageId].position == 'bottom-left') {
			posTop = spotTop + spotHeight - 14;	posLeft = spotLeft;
		}

		// adjust with offsets
		posTop += BAP.options[pageId].offsetTop;
		posLeft += BAP.options[pageId].offsetLeft;

		// final adjusting using specification in use
		posTop = posTop + ((BAP.options[pageId].positionVertical == 'top') ? 0 : -1);

		if ( (BAP.options[pageId].icon_display == 'expandable') || ( (BAP.options[pageId].icon_display == 'icon') && (BAP.isMini(BAP.options[pageId].ns)) ) ) {
			if (BAP.options[pageId].positionHorizontal == 'right') { posLeft -= 19; }
		} else {
			if (BAP.options[pageId].positionHorizontal == 'right') { posLeft -= 77; }
		}

		BAP.options[pageId].pxl = pixLeft;
		BAP.options[pageId].pxt = pixTop;
		BAP.options[pageId].posTop = posTop;
		BAP.options[pageId].posLeft = posLeft;
		BAP.options[pageId].spotHeight = spotHeight;
		BAP.options[pageId].spotTop = spotTop;
		BAP.options[pageId].spotLeft = spotLeft;
		BAP.options[pageId].spotWidth = spotWidth;
	},

	/**
	* This method figures out the case of the notice display.
	*/
	noticeMode: function(pageId) {
		var spotHeight = BAP.options[pageId].spotHeight;
		var spotWidth = BAP.options[pageId].spotWidth;

		var px = BAP.$('bap-pixel-' + pageId);
		var ad;

		if ( (BAP.ifr) && ( (BAP.frameSize()[0] == spotHeight) && (BAP.frameSize()[1] == spotWidth) ) ) {
			// iframe case - easiest one!
			dm = 5;
		} else if ( (BAP.checkElement(BAP.$('flash_creative'), spotHeight, spotWidth)) && (BAP.detection == 'tagui') ) {
			// special case for TAG UI
			ad = BAP.$('flash_creative');
			dm = 4;
		} else if ( (BAP.domain.indexOf('mail.yahoo.com') > 0) && (document.getElementsByTagName('object').length == 1) && (BAP.browser.IE) ) {
			// special case for Yahoo Mail
			ad = document.getElementsByTagName('object')[0];
			dm = 4.1;
		} else {
			// check previous siblings
			ad = BAP.checkSiblings(px.previousSibling, spotHeight, spotWidth, 1);
			if (ad) {
				// detected previous sibling that qualifies as ad
				if (ad.nodeName == 'OBJECT') { ad = BAP.getObjectEmbed(ad); }
				dm = 3;
			} else if ( (BAP.domain.indexOf('yahoo.com') > 0) && ( ad = BAP.sizeMatch(spotWidth, spotHeight) ) ) {
				// Size Matcher for VENDOR CASE (yahoo)
				dm = 4.2;
			} else if ( ad = BAP.proximityDetection(px, spotWidth, spotHeight) ) {
				// proximity detector
				dm = 7;
			} else {
				// pixel aft based detection
				dm = 6;
			}
		}

		/**
		* NEW YAHOO MAIL BETA OVERWRITE for CHROME.
		* Chrome is throwing a weird error upon attempting to retrieve internal
		* embed of a given object: ReferenceError: NPObject deleted
		* Overwriting the detection method to use pixel instead
		*/
		if ( (BAP.domain.indexOf('l.yimg.com') >= 0) && (BAP.browser.Chrome) ) { dm = 6; }

		BAP.options[pageId].dm = dm;
		BAP.options[pageId].ad = ad;
		BAP.options[pageId].px = px;

		/**
		 * Added in response to eyeWonder dynamic ads that keep setting higher depth setting
		 * then our default 10k. Or default is currently set at 9990 for L1 an 9991 for L2.
		 * It will be overwritten by this setting if there is a need to set it.
		 */
		try { BAP.options[pageId].ad_z = ( BAP.options[pageId].ad_z ? BAP.options[pageId].ad_z : BAP.getDepth(ad) ); } catch (e) {}

		/**
		 * Added for the case when detection is not executed within an iframe,
		 * but the frame contents are also set pretty high up in the depth index
		 */
		if (dm === 5) { BAP.options[pageId].ad_z = 100000; }

		/**
		 * Adding removal of anchor pixel.  If the mode is not pixel based, pixel 
		 * may break the layout, especially if it has been injected prior to the ad.
		 */
		if (dm != 6) { px.parentNode.removeChild(px); }
	},

	/**
	* This method checks if the notice has been given already.
	*/
	noticeVerification: function(pageId) {
		var ad = BAP.options[pageId].ad;

		// check if notice already given for the ad in question
		if ( (ad) && (!ad.notice) ) {
			ad.notice = pageId;
		} else if ( (ad) && (ad.notice != pageId) ) {
			// notice already given for this element
			BAP.options[pageId].noticeExists = true;

			if (BAP.nids[ad.notice] != BAP.nids[pageId]) { BAP.coverNotice(ad.notice, pageId); }
		} else if (BAP.options[pageId].dm == 5) {
			if (window.notice) {
				// notice already given for this frame (case of 2+ script notices within a frame)
				BAP.options[pageId].noticeExists = true;
				if (BAP.nids[window.notice] != BAP.nids[pageId]) { BAP.coverNotice(window.notice, pageId); }
			} else {
				// iframe case with exact match

				// marking the frame as covered by first notice
				window.notice = pageId;
				BAP.options[pageId].ad = { 'nodeName':'EXACT-FRAME' };

				// already received a ping, send the BAPFRAME.
				if (window.bap_frameid) {
					BAP.postMessage('BAPFRAME|' + BAP.nids[pageId] + '|' + window.bap_frameid);
				}

				BAPUtil.trace('Posted frame coverage message: ' + BAP.nids[pageId] + " with pageId " + pageId);
			}
		}

		if ( (BAP.options[pageId].ad) && (!BAP.options[pageId].noticeExists) ) {
			if ( (BAP.options[pageId].ad.nodeName == 'IFRAME') && (BAP.options[pageId].ad.src in BAP.frameNoticed) ) {
				// notice already given for this element
				BAP.options[pageId].noticeExists = true;
			} else if ( ( BAP.options[pageId].ad.nodeName == 'EXACT-FRAME' ) && (BAP.frameNoticed.contents) ) {
				// notice already given for this element: CASE FRAME-PASS
				BAP.options[pageId].noticeExists = true;
			}
		}
	},

	/**
	* This method places the actual <div> and other visual elements on the page.
	*/
	noticeCreate: function(pageId) {
		/* YAHOO */
		var yh = '';if (location.href.indexOf('tech-ticker') >= 0) {yh = 'bottom:0px;right:0px;';}

		var div = BAP.$('BAP-holder');

		if (!div) {
			var body = document.getElementsByTagName('body')[0];
			div = document.createElement('div');
			div.setAttribute('id', 'BAP-holder');
			body.appendChild(div);
		}

		var icon, iconWidth, opacity;
		var click = 'BAP.action(\'' + pageId + '\', \'S\'); BAP.createL2(\'' + pageId + '\');';
		var expansion = '';

		try { opacity = parseInt( ( BAP.options[pageId].container_opacity ) ) / 100; } catch (e) { opacity = 1; }
		opacity = (opacity < 1 ? 'opacity:' + opacity + ';-moz-opacity:' + opacity + ';-ms-filter:DXImageTransform.Microsoft.Alpha(Opacity=' + (opacity * 100) + ');filter:alpha(opacity=' + (opacity * 100) + ');' : '');

		if (BAP.options[pageId].icon_display == 'expandable') {
			icon = '<img src="' + BAP.DOMAIN_ROOT + 'icon/ci.png">';
			iconWidth = 19;
			expansion = ' onmouseover="BAP.expandIcon(' + pageId + ')" onmouseout="BAP.collapseIcon(' + pageId + ')" ';
		} else if ( (BAP.options[pageId].icon_display == 'icon') && (BAP.isMini(BAP.options[pageId].ns)) ) {
			icon = '<img src="' + BAP.DOMAIN_ROOT + 'icon/ci.png">';
			iconWidth = 19;
		} else {
			iconWidth = 77;
			icon = '<img src="' + BAP.DOMAIN_ROOT + 'icon/c_' + BAP.options[pageId].icon_grayscale + '.png">';
		}

		if ( BAP.isMini(BAP.options[pageId].ns) || BAP.options[pageId].skipL2 ) { click = 'BAP.action(\'' + pageId + '\', \'S\'); BAP.action(\'' + pageId + '\', \'M\'); window.open(BAP.moreInfoHref(' + pageId + '), \'_newtab\');'; }

		var z = '';
		if (BAP.options[pageId].ad_z) { z = 'z-index:' + (parseInt(BAP.options[pageId].ad_z)) + ';'; }

		icon = '<span id="trigger-' + pageId + '" style="'+yh+z+'position:absolute;" class="bap-trigger" onclick="' + click + '"' + expansion + '>' + icon + '</span>';

		icon = '<div id="trigger-container-' + pageId +'" style="position: static !important;"><span id="trigger-box-' + pageId + '" class="bap-trigger" ' +
						'style="'+yh+z+'position:absolute;' + opacity + 'width:' + iconWidth + 'px;height:15px;"'+
						'><img id="trigger-box-image-' + pageId + '" src="' + BAP.DOMAIN_ROOT + 'icon/box_' + iconWidth + '_' + BAP.options[pageId].position + '.png"></span>' + icon + '</div>';

		div.innerHTML = div.innerHTML + icon;
	},

	showNoticeHelper: function(pageId) {
		BAP.noticeMode(pageId);
		BAP.noticePositionCalculate(pageId);
		BAP.noticeVerification(pageId);
		if (!BAP.options[pageId].noticeExists) {
			BAP.noticeCreate(pageId);
			BAP.noticePosition(pageId);

			BAPUtil.trace('Generated the following notice: ' + pageId + ' (' + BAP.nids[pageId] + ') h:' + BAP.options[pageId].spotHeight + ' w:' + BAP.options[pageId].spotWidth + ' t:' + BAP.options[pageId].spotTop + ' l:' + BAP.options[pageId].spotLeft + ' pt:' + BAP.options[pageId].pxt + ' pl:' + BAP.options[pageId].pxl + ' mode:' + BAP.options[pageId].dm);

			BAP.addNoticeDelay(pageId);
		} else {
			BAPUtil.trace('Notice already exists for: ' + pageId);

			// log L1 shown for same page overwrite
			BAP.action(pageId, 'I');

			// log overwrite
			BAP.action(pageId, 'O');
		}
	},

	/**
	 * This method figures out if a covering notice needs to accept the incoming notice
	 * and add it into coverage stack for itself.
	 */
	coverNotice: function(coverBy, covered, o) {
		var c = (o ? covered : BAP.nids[covered]);

		// if covering notice is the same nid, do not add into the coveredNotice stack
		if ( BAP.nids[coverBy] == c ) { return; }

		// now check if the same notice is in the covered stack already
		if (BAP.coveredNotices[coverBy]) {
			for (var key in BAP.coveredNotices[coverBy]) {
				if ( key == c ) { return; }
			}
		}

		// made it through, so this is a new notice, add into coverage
		BAP.coveredNotices[coverBy][c] = (o ? o : BAP.options[covered]);
	},

	/**
	 * Helper for string creation used in compose messages
	 */
	acceptMessageString: function(options, nid) {
		var m = 'BAPACCEPT|' + nid + '|' + options.nid + '|' + (options.nwid ? options.nwid : '0') + '|' + (options.aid ? options.aid : '0') + '|' + (options.icaid ? options.icaid : '0') + '|' + (options.ecaid ? options.ecaid : '0') + '|' + (options.crid ? options.crid : '0') + '|' + options.coid + '|' + options.rev + '|' + (options.cps ? options.cps : '-') + '|' + (options.seg ? options.seg : '-');

		return m;
	},

	/**
	 * Helper method to shorten BAPACCEPT message execution
	 */
	composeAcceptMessage: function(options, nid, w) {
		BAP.postMessage(BAP.acceptMessageString(options, nid), w);
	},

	postMessage: function(m, d) {
		var win = (d ? d.contentWindow : window.parent);

		if (win.postMessage) {
			win.postMessage(m, '*');
		}
	},

	flashPostMessage: function(m) {
		var d = {data:m};
		BAP.handleMessage(d);
	},

	/**
	 * This function grabs all iframes on the page and sends a dance
	 * request to them.  Each frame is also marked with the id (loop)
	 * for unique identification.
	 */
	tango: function() {
		var frames = document.getElementsByTagName('iframe');
		for (var i = 0; i < frames.length; i++ ) {
			BAP.tangoPartners[i] = frames[i];
			BAP.postMessage('BAPTANGO?|' + i, frames[i]);
		}
	},

	/**
	 * Queue support for messaging since its possible to receive a message prior to tag processing.
	 * When this occurs, message is queued in BAP.mq and processed when the current payload is complete.
	 * TODO: potentially might execute several times for multiple messages received -- maintain order
	 * of received messages?
	 */
	handleMessageQueue: function() {
		if ( (BAP.rendered) && (BAP.mq.length > 0) ) {
			var rev = [];
			while(BAP.mq.length > 0) { rev.push(BAP.mq.pop()); }
			while(rev.length > 0) { BAP.handleMessage(rev.pop()); }
		} else if ( (!BAP.rendered) && (BAP.mq.length > 0) ) {
			setTimeout(BAP.handleMessageQueue, 1000);
		}
	},

	handleMessage: function(e) {
		try {
			var data = e;
			if (e.data) { data = e.data; }

			/* Race condition: its possible to receive message before tag is processed on the parent page. */
			if (!BAP.rendered) {
				BAPUtil.trace('Message queued: ' + data);
				BAP.mq.push(data);
				setTimeout(BAP.handleMessageQueue, 1000);
				return;
			}

			BAPUtil.trace('Message received: ' + data + ' at ' + document.location);

			var message = data.substring(0, ( data.indexOf("|") > 0 ? data.indexOf("|") : data.length ) );

			if (message == 'BAPTANGO?') {
				// Dance request!
				var id = data.substring(data.indexOf('|') + 1);
				window.bap_frameid = id;
				BAP.postMessage('BAPLETSDANCE|' + id);

				if (window.notice) {
					BAP.postMessage('BAPFRAME|' + BAP.nids[window.notice] + '|' + id);
				}
			} else if (message == 'BAPLETSDANCE') {
				// Dance accepted!
				var frameId = data.substring(data.indexOf('|') + 1);
				BAP.tangoPartners[frameId].tango = frameId;
			} else if (message == 'BAPFRAME') {
				/**
				 * Bubbling up the frame stack receiver.  When message arrives, checks if this (current)
				 * level contains the notice, and then removes if from the displaying if it exist in 
				 * this level.
				 */

				var r = data.split('|');

				var nid = r[1];
				var frameId = r[2];

				BAP.frameNoticed[url] = nid;
				BAP.frameNoticed.contents = true;

				for (var pageId in BAP.options) {
					var ad = BAP.options[pageId].ad;

					if ( (ad) && ( (ad.nodeName == 'IFRAME') && (ad.tango == frameId) && (!BAP.options[pageId].noticeExists) ) || ( (ad.nodeName == 'EXACT-FRAME') ) ) {
						// notify that there is a match in the stack and alert for the covered nid

						var pass = '';

						if (ad.nodeName == 'EXACT-FRAME') {
							// the notice is an exact frame, but appears to be a pass through frame itself.
							// in this case, find and notify the deeper frame of itself
							// NOTE: perphaps just assume that in a pass-through scenario there will be a single iframe to post to?
							var frames = document.getElementsByTagName('iframe');
							for (var i = 0; i < frames.length; i++ ) {
								BAP.composeAcceptMessage(BAP.options[pageId], nid, frames[i]);

								// anchor the slave frame
								window.passFrame = frames[i];
							}
						} else {
							BAP.composeAcceptMessage(BAP.options[pageId], nid, ad);

							// anchor the slave frame
							pass = ad;
						}

						window.passNid = nid;

						// if current notice covers any other notices, pass them as well
						for (var key in BAP.coveredNotices[pageId]) {
							BAP.composeAcceptMessage(BAP.coveredNotices[pageId][key], nid, pass || window.passFrame);
						}

						// log overwrite
						BAP.action(pageId, 'O');

						// remove trigger
						var div = BAP.$('BAP-holder');
						var trigger = BAP.$('trigger-' + pageId);
						if (trigger) { div.removeChild(BAP.$('trigger-container-' + pageId)); }

						// remove from options
						delete BAP.options[pageId];

						// no need to continue iterating, dance partners are unique
						break;
					}
				}
			} else if (message == 'BAPFLASH') {
				/**
				 * Bubbling up the frame stack receiver.  When message arrives, checks if this (current)
				 * level contains the notice, and then removes if from the displaying if it exist in 
				 * this level.
				 */
				var r = data.substring(data.indexOf('|') + 1);
				var nid = r.substring(0, r.indexOf('|'));
				var url = r.substring(r.indexOf('|') + 1);

				for (var pageId in BAP.options) {
					var ad = BAP.options[pageId].ad;

					if ( (ad) && ( ( (ad.nodeName == 'OBJECT') || (ad.nodeName == 'EMBED') ) && (ad.data == url) && (!BAP.options[pageId].noticeExists) ) || ( (ad.nodeName == 'EXACT-FRAME') ) ) {
						// notify that there is a match in the stack and alert for the covered nid

						try { ad.flashGetMessage(BAP.acceptMessageString(BAP.options[pageId], nid)); } catch (e) { }

						// anchor the slave frame
						window.passFrame = ad;
						window.passNid = nid;

						// if current notice covers any other notices, pass them as well
						for (var key in BAP.coveredNotices[pageId]) {
							try { ad.flashGetMessage(BAP.acceptMessageString(BAP.options[pageId], nid)); } catch (e) { }
						}

						// log overwrite
						BAP.action(pageId, 'O');

						// remove trigger
						var div = BAP.$('BAP-holder');
						var trigger = BAP.$('trigger-' + pageId);
						if (trigger) { div.removeChild(BAP.$('trigger-container-' + pageId)); }

						// remove from options
						delete BAP.options[pageId];
					}
				}
			} else if (message == 'BAPACCEPT') {
				/**
				 * Bubbling down the frame stack receiver when a match occurs in higher frames to append 
				 * the notice id to the appropriate display level.
				 */
				var r = data.split('|');
				var op = {}; op.nid = r[2]; op.nwid = r[3]; op.aid = r[4]; op.icaid = r[5]; op.ecaid = r[6]; op.crid = r[7]; op.coid = r[8]; op.rev = r[9];
				if ( (r[10]) && (r[10] !== '-') ) { op.cps = r[10]; } if ( (r[11]) && (r[11] !== '-') ) { op.seg = r[11]; }
				var enid = r[1];

				if (window.passFrame) {
					BAPUtil.trace('Pass-through frame in the stack. Executing pass: ' + op.nid + ' to ' + window.passNid);
					BAP.composeAcceptMessage(op, window.passNid, window.passFrame);
				} else {
					for (pageId in BAP.options) {
						var nid = BAP.nids[pageId];
						if (enid == nid) {
							BAPUtil.trace('Coverage accepted by: ' + enid + ' covering: ' + op.nid);
							BAP.coverNotice(pageId, op.nid, op);
						}
					}
				}
			} else if (message == 'BAPPING') {
				/**
				 * This is a generic heartbeat and message transfer API.
				 */

				var r = '';

				if (window.notice) {
					r = 'BAPPONG|' + BAP.options[window.notice].position;
					BAP.postMessage(r);
				} else if (window.passFrame) {
					BAP.postMessage('BAPPING|', window.passFrame);
				}
			} else if (message == 'BAPPONG') {
				/**
				 * Would only ever receive this when acting as a pass-through frame, so just bubble further up.
				 */
				 BAP.postMessage(data);
			}
		} catch (er) {
			BAPUtil.trace('[BAP.handleMessage() error]', er.message);	
		}
	},

	updateL2: function (pageId) {
		var popup = BAP.$('bap-notice-' + pageId);

		/* YAHOO START */
		if (location.href.indexOf('tech-ticker') >= 0) {
			if (BAP.options[pageId].positionHorizontal == 'right') {
				popup.style.left = '25px';
			} else {
				popup.style.left = '0px';
			}

			if (BAP.options[pageId].positionVertical == 'top') {
				popup.style.top = '260px';
			} else {
				popup.style.top = '290px';
			}

			// adding on-demand logo load.
			if ( (BAP.$('bap-logo-' + pageId)) && (BAP.options[pageId].advLogo) && (popup.style.display != 'none') && (!BAP.$('bap-logo-' + pageId).src) ) {
				BAP.$('bap-logo-' + pageId).src = BAP.options[pageId].advLogo;
				BAPUtil.trace("[updateL2] loaded logo");
			}

			return;
		}
		/* YAHOO END */

		if (BAP.options[pageId].positionHorizontal == 'right') {
			try {
				var l = (BAP.options[pageId].spotLeft + BAP.options[pageId].spotWidth - BAP.options[pageId].popupWidth);
				popup.style.left = ( l < 0 ? 0 : l ) + 'px';
			} catch (e) {}
		} else {
			popup.style.left = ( (BAP.options[pageId].spotLeft) < 0 ? 0 : (BAP.options[pageId].spotLeft) ) + 'px';
		}

		if (BAP.options[pageId].positionVertical == 'top') {
			popup.style.top = BAP.options[pageId].posTop + 'px';
		} else {
			var off = parseInt(popup.style['height']) ? parseInt(popup.style['height']) : BAP.options[pageId].popupHeight;
			popup.style.top = ( (BAP.options[pageId].spotTop + BAP.options[pageId].spotHeight - off) > 0 ? (BAP.options[pageId].spotTop + BAP.options[pageId].spotHeight - off) : 0 ) + 'px';
		}

    if (BAP.browser.IE && BAP.browser.QuirksMode && BAP.options[pageId].popupWidth && (popup.style.display != 'none')) {
      popup.style.display = 'block';
      popup.style.width = ( BAP.options[pageId].popupWidth + 4 ) + 'px';
      popup.style.margin = '-3px -4px';
    }

		// adding on-demand logo load.
		if ( (BAP.$('bap-logo-' + pageId)) && (BAP.options[pageId].advLogo) && (popup.style.display != 'none') && (!BAP.$('bap-logo-' + pageId).src) ) {
			BAP.$('bap-logo-' + pageId).src = BAP.options[pageId].advLogo;
			BAPUtil.trace("[updateL2] loaded logo");
		}
	},

	createL2: function (pageId) {
		var popup = BAP.$('bap-notice-' + pageId);
		popup.style.position = 'absolute';
		BAP.toggle(popup);
		BAP.options[pageId].popupHeight = popup.offsetHeight;
		BAP.options[pageId].popupWidth = popup.offsetWidth;
		BAP.updateL2(pageId);
	},

	createPopupLayer: function(pageId, adv_name, adv_msg, adv_logo, adv_link, server) {
		if (BAP.options[pageId].skipL2) { return; }

		var noticeHTML = '', reg = null, width = BAP.options[pageId].ad_w, height = BAP.options[pageId].ad_h;

		var generic_msg = '';

		if (BAP.options[pageId].behavioral == 'definitive') {
			generic_msg = 'This ad has been matched to your interests. It was selected for you based on your browsing activity.<br><br>';
			if (adv_name) {
				generic_msg += server.name + ' helped ' + adv_name + ' determine that you might be interested in an ad like this.';
			}
		} else if (BAP.options[pageId].behavioral == 'uncertain') {
			generic_msg = 'This ad may have been matched to your interests based on your browsing activity.<br><br>';

			if (adv_name) {
				generic_msg += server.name + ' helped ' + adv_name + ' select this ad for you.';
			}
		} else if (BAP.options[pageId].behavioral == 'custom') {
			generic_msg = BAP.options[pageId].behavioralCustomMessage;
		}

		var z = '';
		if (BAP.options[pageId].ad_z) {
			z = 'z-index:' + (parseInt(BAP.options[pageId].ad_z) + 1) + ';';
		}

		/*
		 * Styling note: moved display:none; back into createPopupLayer since the CSS might 
		 * or might not be loaded at the time of execution (network delay if css is remotely 
		 * pulled).  If the CSS happens not to be loaded, then there is a brief display 
		 * artifact when the popup is added.
		 */

		if ( (width < 190) && (height < 145) ) {
			// No L2
		} else if ( (width >= 190) && (width < 300) && (height >= 145) && (height < 250) ) {
			// Small L2
			reg = 5;
		} else if ( (width >= 300) && (height >= 250) ) {
			// Regular L2
			reg = 1;
		} else {
			reg = 5;
		}
	
		if ( (width == 160) && (height == 600) ) {
			// wide skyscraper [160x600]
			reg = 2;
		}
	
		if ( ( (width == 728) || (width == 990) ) && (height == 90) ) {
				// wide skyscraper [160x600]
				reg = 6;
		}

		switch (reg) {
			case 1:
				noticeHTML = '<div id="bap-notice-' + pageId + '" class="bap1 bap-notice" style="width:276px;display:none;'+z+'"><div class="bap-div"><div class="bap-gradient"><div class="bap-close" onclick="BAP.toggle(BAP.$(\'bap-notice-' + pageId + '\'));return false;">Close</div><div class="bap-img-container">' + (adv_logo ? (adv_link ? '<a class="bap-blue" target="_blank" href="' + adv_link + '" onclick="BAP.action(\'' + pageId + '\', \'A\');"><img id="bap-logo-' + pageId + '" border="0"></a>' : '<img id="bap-logo-' + pageId + '" border="0">' ) : '')  + '</div><p>' + generic_msg + '</p></div><div class="bap-gradient"><div class="bap-link-div"><a class="bap-blue" href="about:blank" id="bap-link-1-' + pageId + '" target="_blank" onclick="BAP.action(\'' + pageId + '\', \'M\');" onmouseover="BAP.moreInfoLink(\'' + pageId + '\')">More information &amp; opt-out options &raquo;</a></div><div class="bap-link-div"><a class="bap-blue" href="about:blank" id="bap-link-2-' + pageId + '" target="_blank" onclick="BAP.action(\'' + pageId + '\', \'B\');" onmouseover="BAP.iabLink(\'' + pageId + '\')">What is interest-based advertising? &raquo;</a></div>';

				if (adv_link && adv_msg) {
					noticeHTML += '<div class="bap-link-div"><a class="bap-blue" target="_blank" href="' + adv_link + '" onclick="BAP.action(\'' + pageId + '\', \'A\');">' + adv_msg + ' &raquo;</a></div>';
				} else if (adv_msg) {
					noticeHTML += '<div class="bap-link-div">' + adv_msg + '</div>';
				}

				noticeHTML += '<div class="bap-link-div"><a class="bap-gray" target="_blank" href="about:blank" id="bap-link-3-' + pageId + '" " onmouseover="BAP.link(\'bap-link-3-' + pageId + '\', \'http://evidon.com/consumers/privacy-center\')">Powered by Evidon&#153;</a></div></div></div></div>';
				break;
			case 2:
				noticeHTML = '<div id="bap-notice-' + pageId + '" class="bap2 bap-notice" style="width:156px;display:none;'+z+'"><div class="bap-div"><div class="bap-gradient"><div class="bap-close" onclick="BAP.toggle(BAP.$(\'bap-notice-' + pageId + '\'));return false;">Close</div><div class="bap-img-container">' + (adv_logo ? (adv_link ? '<a class="bap-blue" target="_blank" href="' + adv_link + '" onclick="BAP.action(\'' + pageId + '\', \'A\');"><img src="' + adv_logo + '" border="0"></a>' : '<img src="' + adv_logo + '" border="0">' ) : '') + '</div><p>' + generic_msg + '</p></div><div class="bap-gradient"><div class="bap-link-div"><a class="bap-blue" href="about:blank" id="bap-link-1-' + pageId + '" target="_blank" onclick="BAP.action(\'' + pageId + '\', \'M\');" onmouseover="BAP.moreInfoLink(\'' + pageId + '\')">More information &amp; opt-out options &raquo;</a></div><div class="bap-link-div"><a class="bap-blue" href="about:blank" id="bap-link-2-' + pageId + '" target="_blank" onclick="BAP.action(\'' + pageId + '\', \'B\');" onmouseover="BAP.iabLink(\'' + pageId + '\')">What is interest-based advertising? &raquo;</a></div>';

				if (adv_link && adv_msg) {
					noticeHTML += '<div class="bap-link-div"><a class="bap-blue" target="_blank" href="' + adv_link + '" onclick="BAP.action(\'' + pageId + '\', \'A\');">' + adv_msg + '&nbsp;&raquo;</a></div>';
				} else if (adv_msg) {
					noticeHTML += '<div class="bap-link-div">' + adv_msg + '</div>';
				}

				noticeHTML += '<div class="bap-link-div bap-gray"><a class="bap-gray" target="_blank" href="about:blank" id="bap-link-3-' + pageId + '" " onmouseover="BAP.link(\'bap-link-3-' + pageId + '\', \'http://evidon.com/consumers/privacy-center\');">Powered by Evidon&#153;</a></div></div></div></div>';
				break;
			case 5:
				noticeHTML += '<div id="bap-notice-' + pageId + '" class="bap5 bap-notice" style="display:none;'+z+'"><div class="bap-div"><div class="bap-gradient"><div class="bap-close" onclick="BAP.toggle(BAP.$(\'bap-notice-' + pageId + '\'));return false;">Close</div><p>' + generic_msg + '<a class="bap-blue-link" href="about:blank" id="bap-link-1-' + pageId + '" target="_blank" onclick="BAP.action(\'' + pageId + '\', \'M\');" onmouseover="BAP.link(\'bap-link-1-' + pageId + '\', \'' + BAP.DOMAIN_INFO + 'more_info/' + BAP.nids[pageId] + '\')">Learn about your choices</a></p></div><div class="bap-link-div"><a class="bap-gray" target="_blank" href="about:blank" id="bap-link-3-' + pageId + '" " onmouseover="BAP.link(\'bap-link-3-' + pageId + '\', \'http://evidon.com/consumers/privacy-center\');">Powered by Evidon&#153;</a></div></div></div>';
				break;
			case 6:
				noticeHTML += '<div id="bap-notice-' + pageId + '" class="bap6 bap-notice" style="display:none;' + (BAP.browser.IE ? 'width:675px !important;' : '') + z + '"><div class="bap-div"><div id="bap-gradient-1" class="bap-gradient"><div id="bap-first-link-div" class="bap-link-div"><a class="bap-blue" href="about:blank" id="bap-link-1-' + pageId + '" target="_blank" onclick="BAP.action(\'' + pageId + '\', \'M\');" onmouseover="BAP.moreInfoLink(\'' + pageId + '\')">More information &amp; opt-out options &raquo;</a></div><div class="bap-link-div"><a class="bap-blue" href="about:blank" id="bap-link-2-' + pageId + '" target="_blank" onclick="BAP.action(\'' + pageId + '\', \'B\');" onmouseover="BAP.iabLink(\'' + pageId + '\')">What is interest-based advertising? &raquo;</a></div><div class="bap-link-div">';

				if (adv_link && adv_msg) {
					noticeHTML += '<a class="bap-blue" target="_blank" href="' + adv_link + '" onclick="BAP.action(\'' + pageId + '\', \'A\');">' + adv_msg + ' &raquo;</a>';
				} else if (adv_msg) {
					noticeHTML += adv_msg;
				} else {
					noticeHTML += '&nbsp;';
				}

				noticeHTML += '</div><div class="bap-link-div"><a class="bap-gray" target="_blank" href="about:blank" id="bap-link-3-' + pageId + '" " onmouseover="BAP.link(\'bap-link-3-' + pageId + '\', \'http://evidon.com/consumers/privacy-center\');">Powered by Evidon&#153;</a></div></div><div id="bap-gradient-2" class="bap-gradient"><div class="bap-close" onclick="BAP.toggle(BAP.$(\'bap-notice-' + pageId + '\'));return false;">Close</div><div class="bap-img-container">' + (adv_logo ? (adv_link ? '<a class="bap-blue" target="_blank" href="' + adv_link + '" onclick="BAP.action(\'' + pageId + '\', \'A\');"><img src="' + adv_logo + '" border="0"></a>' : '<img src="' + adv_logo + '" border="0">' ) : '') + '</div><p>' + generic_msg + '</p></div></div></div>';
				break;
		}

		var div = BAP.$('BAP-holder');
		var body = document.getElementsByTagName('body')[0];

		if (!div) {
			div = document.createElement('div');
			div.setAttribute('id', 'BAP-holder');

			if (location.href.indexOf('tech-ticker') >= 0) {
				body = document.getElementById('yfi_left');
			}

			body.appendChild(div);
			div = BAP.$('BAP-holder');
		}

		div.innerHTML = div.innerHTML + noticeHTML;

		BAP.css(reg);
	}
};

/* Offset copy. */

var _offset = null;
var _boxModel = null;

function runModel() {
	var div = document.createElement("div");
	div.style.width = div.style.paddingLeft = "1px";

	document.body.appendChild( div );
	_boxModel = div.offsetWidth === 2;
	document.body.removeChild( div ).style.display = 'none';

	div = null;
}
runModel();

var _curCSS = function( elem, name ) {
	var ret, style = elem.style;
	var getComputedStyle = document.defaultView && document.defaultView.getComputedStyle;

	if ( getComputedStyle ) {
		name = name.replace( /([A-Z])/g, "-$1" ).toLowerCase();

		var defaultView = elem.ownerDocument.defaultView;

		if ( !defaultView ) {
			return null;
		}

		var computedStyle = defaultView.getComputedStyle( elem, null );

		if ( computedStyle ) {
			ret = computedStyle.getPropertyValue( name );
		}
	} else if ( elem.currentStyle ) {
		var camelCase = name.replace(/-([a-z])/ig, function( all, letter ) {return letter.toUpperCase();});

		ret = elem.currentStyle[ name ] || elem.currentStyle[ camelCase ];

		if ( !(/^-?\d+(?:px)?$/i.test( ret )) && (/^-?\d/.test( ret )) ) {
			// Remember the original values
			var left = style.left, rsLeft = elem.runtimeStyle.left;

			// Put in the new values to get a computed value out
			elem.runtimeStyle.left = elem.currentStyle.left;
			style.left = camelCase === "fontSize" ? "1em" : (ret || 0);
			ret = style.pixelLeft + "px";

			// Revert the changed values
			style.left = left;
			elem.runtimeStyle.left = rsLeft;
		}
	}

	return ret;
};

_offset = {
	initialize: function() {
		var body = document.body, container = document.createElement('div'), innerDiv, checkDiv, table, td, bodyMarginTop = parseFloat( _curCSS(body, 'marginTop') ) || 0,
			html = '<div style="position:absolute;top:0;left:0;margin:0;border:5px solid #000;padding:0;width:1px;height:1px;"><div></div></div><table style="position:absolute;top:0;left:0;margin:0;border:5px solid #000;padding:0;width:1px;height:1px;" cellpadding="0" cellspacing="0"><tr><td></td></tr></table>';

		container.style.position = 'absolute';
		container.style.top = 0;
		container.style.left = 0;
		container.style.margin = 0;
		container.style.border = 0;
		container.style.width = '1px';
		container.style.height = '1px';
		container.style.visibility = 'hidden';

		container.innerHTML = html;
		body.insertBefore( container, body.firstChild );
		innerDiv = container.firstChild;
		checkDiv = innerDiv.firstChild;
		td = innerDiv.nextSibling.firstChild.firstChild;

		this.doesNotAddBorder = (checkDiv.offsetTop !== 5);
		this.doesAddBorderForTableAndCells = (td.offsetTop === 5);

		checkDiv.style.position = 'fixed'; checkDiv.style.top = '20px';
		// safari subtracts parent border width here which is 5px
		this.supportsFixedPosition = (checkDiv.offsetTop === 20 || checkDiv.offsetTop === 15);
		checkDiv.style.position = checkDiv.style.top = '';

		innerDiv.style.overflow = 'hidden'; innerDiv.style.position = 'relative';
		this.subtractsBorderForOverflowNotVisible = (checkDiv.offsetTop === -5);

		this.doesNotIncludeMarginInBodyOffset = (body.offsetTop !== bodyMarginTop);

		body.removeChild( container );
		body = container = innerDiv = checkDiv = table = td = null;
		_offset.initialize = function(){};
	},

	_bodyOffset: function( body ) {
		var top = body.offsetTop, left = body.offsetLeft;

		_offset.initialize();

		if ( _offset.doesNotIncludeMarginInBodyOffset ) {
			top  += parseFloat( _curCSS(body, 'marginTop',  true) ) || 0;
			left += parseFloat( _curCSS(body, 'marginLeft', true) ) || 0;
		}

		return { top: top, left: left };
	},

	get: function(elem) {
		if ( ( "getBoundingClientRect" in document.documentElement ) ) {
			if ( !elem || !elem.ownerDocument ) { return null; }

			if ( elem === elem.ownerDocument.body ) {
				return _offset._bodyOffset( elem );
			}

			var box = elem.getBoundingClientRect(), doc = elem.ownerDocument, body = doc.body, docElem = doc.documentElement,
				clientTop = docElem.clientTop || body.clientTop || 0, clientLeft = docElem.clientLeft || body.clientLeft || 0,
				top  = box.top  + (self.pageYOffset || _boxModel && docElem.scrollTop  || body.scrollTop ) - clientTop,
				left = box.left + (self.pageXOffset || _boxModel && docElem.scrollLeft || body.scrollLeft) - clientLeft;
			if (!BAP.browser.IE7) {
				top += (parseFloat( _curCSS(body, 'border-top-width',  true) ) || 0);
				left += (parseFloat( _curCSS(body, 'border-left-width', true) ) || 0);
			}
			return { top: top, left: left };
		} else {
			if ( !elem || !elem.ownerDocument ) { return null; }

			if ( elem === elem.ownerDocument.body ) {
				return _offset._bodyOffset( elem );
			}

			_offset.initialize();

			var offsetParent = elem.offsetParent;
			var prevOffsetParent = elem;
			var doc = elem.ownerDocument;
			var computedStyle;
			var docElem = doc.documentElement;
			var body = doc.body;
			var defaultView = doc.defaultView;
			var prevComputedStyle =  defaultView.getComputedStyle( elem, null );
			var top = elem.offsetTop;
			var left = elem.offsetLeft;

			while ( (elem = elem.parentNode) && elem !== body && elem !== docElem ) {
				if ( _offset.supportsFixedPosition && prevComputedStyle.position === "fixed" ) { break; }

				computedStyle = defaultView.getComputedStyle(elem, null);
				top  -= elem.scrollTop;
				left -= elem.scrollLeft;

				if ( elem === offsetParent ) {
					top  += elem.offsetTop;
					left += elem.offsetLeft;

					if ( _offset.doesNotAddBorder && !(_offset.doesAddBorderForTableAndCells && (/^t(able|d|h)$/i.test(elem.nodeName))) ) {
						top  += parseFloat( computedStyle.borderTopWidth  ) || 0;
						left += parseFloat( computedStyle.borderLeftWidth ) || 0;
					}

					prevOffsetParent = offsetParent; offsetParent = elem.offsetParent;
				}

				if ( _offset.subtractsBorderForOverflowNotVisible && computedStyle.overflow !== "visible" ) {
					top  += parseFloat( computedStyle.borderTopWidth  ) || 0;
					left += parseFloat( computedStyle.borderLeftWidth ) || 0;
				}

				prevComputedStyle = computedStyle;
			}

			if ( prevComputedStyle.position === "relative" || prevComputedStyle.position === "static" ) {
				top  += body.offsetTop;
				left += body.offsetLeft;
			}

			if ( _offset.supportsFixedPosition && prevComputedStyle.position === "fixed" ) {
				top  += Math.max( docElem.scrollTop, body.scrollTop );
				left += Math.max( docElem.scrollLeft, body.scrollLeft );
			}

			return { top: top, left: left };
		}
	}
};

try { BAP.addEvent(window, 'message', BAP.handleMessage); } catch (e) {}

// _bao options loaded for DFA.
try {if (_bao) { BAP.start(_bao); }} catch (e) {}

// BAP utilities class
var BAPUtil = {
	trace: function() {
		try {
			if (arguments.length >= 1 || arguments.length <= 3) {
				var format = "-- BAP:  " + arguments[0];
				if (arguments.length == 1) console.log(format);
				else if (arguments.length == 2) console.log(format, arguments[1]);
				else if (arguments.length == 3) console.log(format, arguments[1], arguments[2]);
			} else {
				alert("Improper use of trace(): " + arguments.length + " arguments");
			}
		} catch (e) { }
	},

	css: function(reg) {
		if ( (reg) && (!BAP.$('bass-' + reg)) ) {
			var body = document.getElementsByTagName('body')[0];

			var ss = document.createElement('link');
			ss.setAttribute('id', 'bass-' + reg);
			ss.setAttribute('rel', 'stylesheet');
			ss.setAttribute('type', 'text/css');
			ss.setAttribute('href', BAP.DOMAIN_CSS + reg + '.css?r=' + Math.random());
			body.appendChild(ss);
		}
	}
};
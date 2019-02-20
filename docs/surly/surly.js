/**
 * ESURLY -- Evidon's Single URL Loader.
 * This script is designed to create a single URL call for writing out Evidon Ad Notice Tag.
 * Calling format sample
 * <script type="text/javascript" src="js/surly.js?;ad_w=300;ad_h=250;coid=22;nid=321;r=[INSERT CACHE BUSTING HERE]"></script>
 * Everything after ?; will be processed into the BAO starter, so additional parameters could be
 * passed in. Script uses document.write, and so must be executed before the document is loaded.
 */

(function() {
	// this validator is used to ensure that the script matched is indeed our tag
	var i, j, _bao = {}, _surly_s = document.getElementsByTagName('SCRIPT'),
		_surly_url = "https://c.betrad.com";

	var _surly_rev = "rDEV";

	window.BAPStart = function(opts) {
		try {
			BAP.start(opts);
		} catch(e) {
			var _bab = window._bab||[];
			var ob = {};
			for (var p in opts) {
				ob[p]=opts[p];
			}
			_bab.push(ob);
			window._bab = _bab;
		}
	};

	function isBetrad(url) {
		// remove adsafe after 6/2/13
		// This is added because adsafe redirects to surly rather than dropping our script.
		return /(adsafeprotected.com\/(rjss|rjsi|rfw)\/c.betrad.com|(^https?:)?\/\/c.betrad.com)/.test(url);
	}

	/**
	 * When cookies are disabled completely in Firefox, any call/reference to
	 * window.localStorage will throw an exception.
	 */
	function supportsLocalStorage() {
		try {
			return window.localStorage && window.postMessage;
		} catch (e) {
			return false;
		}
	}

	/**
	 * Setup postMessage hook and backup timer
	 */
	function useLocalStorage(surly_script, opts) {
		var loaded = false;

		// message listener which receives JS from our iframe cache
		function rcvMsg(event) {
			if (!isBetrad(event.origin)) {
				return;
			}

			// Copy passed JS into a script block
			// swiped from basket.js (MIT licensed)
			var script = document.createElement('script');
			// script.defer = true;
			// Have to use .text, since we support IE8,
			// which won't allow appending to a script
			script.text = event.data;
			surly_script.parentNode.insertBefore(script, surly_script);
			cleanup();
			BAPStart(opts);
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
			loadBaJsViaDom(surly_script, opts);
		}, 3000);
	}

	function loadBaJsViaDom(surly_script, opts) {
		var loaded = false, _scr = document.createElement('script');
		_scr.id = 'ba.js';
		_scr.src = _surly_url + '/geo/ba.js?' + _surly_rev;

		if ( navigator.userAgent.indexOf('MSIE ') > -1) {
			_scr.onreadystatechange = function () {
				if (!loaded && (this.readyState == 'loaded' || this.readyState == 'complete')) {
					loaded = true;

					_scr.onload();
					_scr.onload = null;
				}
			};
		}

		function clone(obj) {
			if (!obj || "object" != typeof obj) {return obj;}
			var copy = obj.constructor();
			for (var attr in obj) {
				if (obj.hasOwnProperty(attr)) { copy[attr] = obj[attr]; }
			}
			return copy;
		}

		var _bao2 = clone(opts);
		_scr.onload = function() { BAPStart(_bao2); };

		surly_script.parentNode.insertBefore(_scr, surly_script);
	} // loadBaJsViaDom


	// i've been called, so lets find myself.
	for (i = 0; i < _surly_s.length; i++) {
		var surly_script = _surly_s[i];
		// skip if no source exists
		if (!surly_script.src) { continue; }
		// skip when its already been processed
		if (surly_script._surly) { continue; }

		// an akamai url was previously used to serve https resources
		var _surly_src = surly_script.src,
		 _surly_own = (isBetrad(_surly_src) || /^https?:\/\/a248.e.akamai.net/.test(_surly_src));

		// check if the src is indeed ours
		if (_surly_src.match('surly.js') && _surly_own) {
			// mark this script object as processed
			surly_script._surly = 1;

			var _nw = false, _surly_rnd = Math.floor(Math.random()*100000), _surly_ex = _surly_src.split(';');

			_bao['uqid'] = _surly_rnd;
			_surly_ex = _surly_ex.splice(1, _surly_ex.length);

			for (j = 0; j < _surly_ex.length; j++) {
				if (_surly_ex[j] == 'r=0') { return; }
				var _surly_arg = _surly_ex[j].split('=');
				_bao[_surly_arg[0]] = unescape(_surly_arg[1]);
				if (_surly_arg[0] == 'nowrite') { _nw = true; }
			}

			// record the order in which the tag has shown up in the frame array 
			_bao.order = i;

			this._bao = _bao;

			if (_nw) {
				// _nw == nowrite = don't use document.write
				// writing out pixel for pixel locator

				// drop pixel locator
				var _px = document.createElement('img');
				_px.style.margin = '0px';
				_px.style.padding = '0px';
				_px.border = _px.width = _px.height = '0';
				_px.src = _surly_url + '/a/4.gif';
				_px.id = 'bap-pixel-' + _surly_rnd;

				surly_script.parentNode.insertBefore(_px, surly_script);

				// write out tag calls in
				if (!document.getElementById('ba.js')) {
					if (supportsLocalStorage()) {
						useLocalStorage(surly_script, _bao);

						// insert iframe
						var _l = document.createElement("iframe");
						_l.style.display = "none";
						_l.id = "ba.html";
						_l.src = _surly_url + "/ba.html?" + _surly_rev;
						surly_script.parentNode.insertBefore(_l, surly_script);

					} else {
						loadBaJsViaDom(surly_script, _bao);
					}

				} else {
					// already have ba.js, call bapstart
					BAPStart(_bao);
				}

				return;
			}

			// writing out pixel for pixel locator
			document.write('<img style="margin:0;padding:0;" border="0" width="0" height="0" src="' + _surly_url + '/a/4.gif" id="bap-pixel-' + _surly_rnd + '"/>');

			// write out tag calls in
			if (supportsLocalStorage()) {
				if (!document.getElementById('ba.js') && !document.getElementById('ba.html')) {
					useLocalStorage(surly_script, _bao);
					// write iframe
					document.write("<iframe id='ba.html' style='display: none;' width='0' height='0' frameborder='0' scrolling='no' src='" + _surly_url + "/ba.html?" + _surly_rev + "'></iframe>");
				} else {
					BAPStart(_bao);
				}
			} else {
				// use standard docwrite of script tag
				document.write('<script>(function(){if(document.getElementById(\'ba.js\'))return;document.write(\'<sc\'+\'ript id="ba.js" type="text/javascript" src="' + _surly_url + '/geo/ba.js?'+_surly_rev+'"></scr\'+\'ipt>\');})();</script><script>document.write(\'<sc\'+\'ript>BAPStart(_bao);</sc\'+\'ript>\');</script>');
			}

		}
	}
})();

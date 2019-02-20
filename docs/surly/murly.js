/**
 * GMURLY -- Ghostery's Mobile URL Loader.
 * This script is designed to create a single URL call for writing out Ghostery's Mobile Ad Notice Tag (mobile-64).
 * Calling format:
 * <script type="text/javascript" src="js/murly.js?;ad_w=300;ad_h=250;coid=22;nid=321;r=[INSERT CACHE BUSTING HERE]"></script>
 * Everything after ?; will be processed into the BAO starter, so additional parameters could be
 * passed in. Script uses document.write, and so must be executed before the document is loaded.
 */

(function() {

	var i, j, _bao = {}, _murly_s = document.getElementsByTagName('SCRIPT'),
		_murly_url = "https://c.betrad.com"; 

	var _murly_rev = "rDEV";

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
		return /((^https?:)?\/\/c.betrad.com)/.test(url);
	}

	//Let's find ourselves within the loaded scripts.
	for (i = 0; i < _murly_s.length; i++) {
		var murly_script = _murly_s[i];
		// skip if no source exists
		if (!murly_script.src) { continue; }
		// skip when its already been processed
		if (murly_script._murly) { continue; }

		// an akamai url was previously used to serve https resources
		var _murly_src = murly_script.src,
		 _murly_own = (isBetrad(_murly_src) || /^https?:\/\/a248.e.akamai.net/.test(_murly_src)); //TODO: check this url...

		// check if the src is indeed ours
		if (_murly_src.match('murly.js') && _murly_own) {
			// mark this script object as processed
			murly_script._murly = 1;

			var _murly_rnd = Math.floor(Math.random()*100000), _murly_ex = _murly_src.split(';');
			_bao['uqid'] = _murly_rnd;
			_murly_ex = _murly_ex.splice(1, _murly_ex.length);

			for (j = 0; j < _murly_ex.length; j++) {
				if (_murly_ex[j] == 'r=0') { return; }
				var _murly_arg = _murly_ex[j].split('=');
				_bao[_murly_arg[0]] = unescape(_murly_arg[1]);
				//if (_murly_arg[0] == 'nowrite') { _nw = true; } //noop for mobile...
			}
			_bao.icon_display = 'expandable';
			// record the order in which the tag has shown up in the frame array 
			_bao.order = i;

			this._bao = _bao;

			// writing out pixel for pixel locator
			// document.write('<img style="margin:0;padding:0;" border="0" width="0" height="0" src="' + _murly_url + '/a/4.gif" id="bap-pixel-' + _murly_rnd + '"/>');
			var px = document.createElement('IMG');
			px.src = _murly_url + '/a/4.gif';
			px.style.display = 'none';
			px.id = 'bap-pixel-' + _murly_rnd;
			murly_script.parentNode.insertBefore(px, murly_script.nextSibling);
			
			// MRAID
      		if (_bao['in_app'] == 1){
      			(function(){
					var scripts = document.getElementsByTagName('SCRIPT');
					for (var i = 0; i < scripts.length; i++){
					  if (!scripts[i].src) {continue;}
					  if (/mraid.js/.test(scripts[i].src)){return;}
					}
					var mraid_script = document.createElement("script");
					mraid_script.async = false;
					mraid_script.src = 'mraid.js';
					document.body.appendChild(mraid_script);
				})();
      		}
      		if (document.getElementById('ba.js') == null) {
      			// document.write('<script id="ba.js" src="'+_murly_url+'/mobile-64.js'+_murly_rev+'"></script');
				var mobile_script = document.createElement('SCRIPT');
				mobile_script.setAttribute('id','ba.js');
				mobile_script.async = !(_bao['in_app'] == 1);
				mobile_script.setAttribute('src',_murly_url+'/mobile-64.js');
				document.body.appendChild(mobile_script);
			}
			BAPStart(_bao);
		}
	}
})();

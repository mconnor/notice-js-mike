(function () {
	/**
	 * This identifies supported ad standards. When addint entry here, make sure that cratePopup
	 * is updated.
	 */
	function getAdStandard(height, width) {
		var i, s = sizes;
		for (i = 0; i < s.length; i++) {
			if ( (s[i].w == width) && (s[i].h == height) ) {
				return s[i].i;
			}
		}

		return 0;
	}

	// Reassignment helper
	function rh(ad, pageId) {
		var temp;
		if (ad.nodeName == 'OBJECT') {
			temp = ad.ds;
			ad = getObjectEmbed(ad);
			ad.ds = temp;
			//BAP.options[pageId].ad = ad;
		}

		if ( ad.ds ) {
			BAP.options[pageId].ad_h = ad.offsetHeight;
			BAP.options[pageId].ad_w = ad.offsetWidth;
			// BAP.options[pageId].ns = ad.ds;
		}

		return ad;
	}

	function checkChildren(ob, spotHeight, spotWidth) {
		try {
			if (!ob) {
				return false;
			} else {
				var _ = ob.children || ob.childNodes, q, o, a;
				if (_.length === 0) {
					return false;
				}

				for (o = 0; o < _.length; o++) {
					// validate the element
					if (!isValidElement(_[o])) { continue; }

					q = getDims(_[o]);
					a = getAdStandard(q[1], q[0]);
					if ( checkElement(_[o], spotHeight, spotWidth) ) {
						_[o].ds = a;
						return _[o];
					} else if ( (q) && (a !== 0) ) {
						_[o].ds = a;

						// Looks like this could lead to another set of issues, like a double nested ad standard
/*jsl:ignore*/
						if (q = checkChildren(_[o], spotHeight, spotWidth)) {
/*jsl:end*/
							return q;
						} else {
							return _[o];
						}
/*jsl:ignore*/
					} else if ( q = checkChildren(_[o], spotHeight, spotWidth) ) {
/*jsl:end*/
						return q;
					}
				}
			}
		} catch (e) {
			return false;
		}
	}

	function inject(o) {
		isValidElement = o.isValidElement;
		getDims = o.getDims;
		checkElement = o.checkElement;
		getObjectEmbed = o.getObjectEmbed;
	}

	var isValidElement, 
		sizes = [{i:2,w:250,h:250,m:0},{i:3,w:240,h:400,m:0},{i:4,w:336,h:280,m:0},{i:5,w:180,h:150,m:1},{i:6,w:300,h:100,m:1},{i:7,w:720,h:300,m:0},{i:8,w:468,h:60,m:1},{i:9,w:234,h:60,m:1},{i:10,w:88,h:31,m:1},{i:11,w:120,h:90,m:1},{i:12,w:120,h:60,m:1},{i:13,w:120,h:240,m:1},{i:14,w:125,h:125,m:1},{i:15,w:728,h:90,m:0},{i:16,w:160,h:600,m:0},{i:17,w:120,h:600,m:1},{i:18,w:300,h:600,m:0},{i:19,w:640,h:480,m:0},{i:20,w:200,h:200,m:0},{i:21,w:410,h:200,m:0},{i:22,w:425,h:600,m:0},{i:23,w:300,h:125,m:1},{i:1,w:300,h:250,m:0},{i:24,w:300,h:60,m:1},{i:25,w:990,h:90,m:0},{i:26,w:300,h:310,m:0},{i:27,w:336,h:850,m:0},{i:28,w:970,h:66,m:0},{i:29,w:640,h:360,m:0}];

	BAP.inject({sizes: sizes, rh: rh, getAdStandard: getAdStandard, checkChildren: checkChildren, inject: inject});
}());
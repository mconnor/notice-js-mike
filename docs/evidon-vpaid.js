(function() {
    var _scripts = document.getElementsByTagName("SCRIPT");
    for (var i = 0; i < _scripts.length; i++) {
        var _script = _scripts[i],
            _src;
        // skip if no source exists
        if (!_script.src) {
            continue;
        }
        _src = _script.src;

        if (_src.match("evidon-vpaid.js")) {
            var durlyParmaString = document
                .getElementById("evidon-vpaid")
                .src.split("?")[1];
            var adIFrame = window.frameElement;
            var durlyScript = document.createElement("SCRIPT");
            durlyScript.setAttribute("type", "text/javascript");
            durlyScript.setAttribute("data-name", "durly");
            if (adIFrame.clientWidth) {
                durlyParmaString = durlyParmaString.concat(
                    ";ad_w=" + adIFrame.clientWidth
                );
            }
            if (adIFrame.clientHeight) {
                durlyParmaString = durlyParmaString.concat(
                    ";ad_h=" + adIFrame.clientHeight
                );
            }
            durlyParmaString = durlyParmaString.concat(";vpaid=true");
            durlyScript.setAttribute(
                "src",
                "./surly/durly.js?" + durlyParmaString
            );
            adIFrame.contentWindow.document.body.appendChild(durlyScript);

        }
    }
})();
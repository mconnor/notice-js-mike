(function() {
  if (document.getElementById("evidon-vpaid")) {
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
  } else {
    console.warn("No script element found with ‘evidon-vpaid’ identifier");
  }
})();

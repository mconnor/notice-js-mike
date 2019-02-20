$(function() {
  var parmaString = getParamsFromMyScript("resizeDemo");

  var paramArr = parmaString.split("&");

  var w = parseInt(pullValue("ad_w", paramArr, "="));
  var h = parseInt(pullValue("ad_h", paramArr, "="));
  var canvas = document.getElementById("mycanvas");
  var $container = $("#container");

  var maxW = w * 2;
  var maxH = h * 2;
  $container.css("width", w + "px");
  $container.css("height", h + "px");

  makeSlider(w, h);
  draw(w, h);
  //draw();
  function makeSlider(w, h) {
    var $val = $("#val");
    var $slider = $("#slider");

    $slider.slider({ max: 100 });
    $slider.on("slidechange", function(event, ui) {
      var _w = maxW * ui.value / 100;
      var _h = maxH * ui.value / 100;
      //$val.text("width = " + _w + "px, h= " + _h );
      $container.css("width", _w + "px");
      $container.css("height", _h + "px");
      canvas.width = _w;
      canvas.height = _h;
      draw(_w, _h);

      //console.log(" $container " + ui.value * w / 1000 + "%");
    });
  }

  function draw(w, h) {
    if (canvas.getContext) {
      var ctx = canvas.getContext("2d");
      ctx.font = "40px serif";
      ctx.strokeText(`${w} x ${h}`, 20, 50);
    }
  }

  function printSize(w, h) {}

  function getParamsFromMyScript(idname) {
    var _scriptSrc = document.getElementById(idname).src;
    var arr = _scriptSrc.split("?");
    return arr[1];
  }
  function pullValue(key, arr, delim) {
    for (var i = 0; i < arr.length; i++) {
      if (arr[i].indexOf(key) !== -1) {
        return arr[i].split(delim)[1];
      }
    }
  }
});

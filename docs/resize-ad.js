(function() {
    var ad = document.querySelector("#ad");

    ad.addEventListener('mouseover', function(e) {
        ad.style.width = '400px';
    });
    ad.addEventListener('mouseout', function(e) {
        ad.style.width = '300px';
    });

})();
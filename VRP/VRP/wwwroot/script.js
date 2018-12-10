$().ready(function() {
    var mymap = L.map('map').setView([51.505, -0.09], 13);
    L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token=pk.eyJ1IjoiY29kZWVyIiwiYSI6ImNqcGlycjB1bzAwbm4zd29mMno0czg0N3MifQ.ZifVMuFBcLAPG_lkpy7Keg', {
        attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
        maxZoom: 18,
        id: 'mapbox.streets',
        accessToken: 'pk.eyJ1IjoiY29kZWVyIiwiYSI6ImNqcGlycjB1bzAwbm4zd29mMno0czg0N3MifQ.ZifVMuFBcLAPG_lkpy7Keg'
    }).addTo(mymap);
});
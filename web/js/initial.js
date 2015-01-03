hero.geo.init(
     function(data) {
    $('#city').html(data.location.locality);
    $('#country').html(hero.geo.countryLookUp(data.location.country));
    $('#status').html(data.weather.status);


    var kelvin = data.weather.measured.temperature, celsius;
    celsius = (kelvin - 273.15).toFixed(2);
    $('#degrees').html(celsius);
});

// Center logo vertically on viewport
$(function(){
  height = $(window).innerHeight();
  offset = 15; //For the fixed positioned header
  computedHeight = Math.floor(height - 256);
  computedHeight = Math.floor(computedHeight/2);

  if (navigator.userAgent.indexOf('Chrome') != -1)
    margin = 'margin: ' + (computedHeight + offset) + 'px 0 '+ (computedHeight + 60)+'px 0;';
  else  
    margin = 'margin: ' + (computedHeight + offset) + 'px 0 '+ computedHeight +'px 0;';

  $("#logo").attr("style", margin); 
}) 

// Create the logo image transition effect
img = document.getElementById('logoImg');
img.src = 'img/logo.png';
count = 0;

function slideLogo(delay) {
    i = 3; //Start form 3rd image, not from first
    
    count++;//Only execute this method twice. Workaround

    if (count < 3) {
        id = setInterval(function() {
            i++;
            if (i == 7) 
                i = 1;

            // Only loops through all the images once
            if (i == 3) {
                clearInterval(id);
                slideLogo(Math.floor(delay/2));
            }
                

            img.src = 'img/hero' + i + '.png';
        },delay);
    }                
}

slideLogo(350);
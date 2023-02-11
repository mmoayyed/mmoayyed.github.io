/*********************************************************
Change the total number of images to load images
for the website background. Image are expected to be found
inside the img/hanna directory using the filename format bg-{number}.jpg
/**********************************************************/

var imageNumbers = Array(1,2,3,5,6,8,9,10,11,12);
var imageNumber = imageNumbers[Math.floor(Math.random() * imageNumbers.length)];

$('#main-banner-slider').css("background-image", "url(images/home/slide-" + imageNumber + ".jpg)");

switch (imageNumber) {
    case 4:
        $('.hero__title').css('padding-top', '300px');
        break;
    case 7:
        $('.hero').css('height', '1100px');
        $('.hero__title').css('padding-top', '450px');
        break;
}
/*********************************************************
The logic below is used to apply shade and filters animations
as the background picture loads. Do not modify!
/**********************************************************/

// var changeBgFunc = setInterval(changeBackgroundFilter, 80);
// function changeBackgroundFilter() {
//     var filter = $('#main-banner-slider').css("filter");
//     var first = filter.indexOf('(');
//     var second = filter.indexOf(')');
//     var value = filter.substring(first + 1, second);
//     value -= .1
//     var newFilter = filter.substring(0, first + 1) + value + filter.substring(second);
//     $('#main-banner-slider').css("filter", newFilter);
//     if (value <= 0.38) {
//         clearInterval(changeBgFunc)
//     }
// }


window.onload = function() { 
    var el = document.getElementById('g-recaptcha-response'); 
    if (el) { 
      el.setAttribute('required', 'required'); 
    } 
}
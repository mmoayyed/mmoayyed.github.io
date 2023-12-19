$(function () {
  $('[data-toggle="tooltip"]').tooltip();
})


function switchMode() {
  $('body')
    .css("background-color", "#030a0d")
    // .css("background-image", "linear-gradient(to right, #020001, #030a0d)")
    .css("color", "#d6d6d6");
  $('code.highlighter-rouge').css("color", "#dfcb66");
  $('blockquote,h1,h2,h3,h4,h5,h6,h5>a').css("color", "ghostwhite");
  $('#contact-section h6').css("color", "lightyellow");

  $('div.card').css('background-image', 'linear-gradient(to right, rgb(21 32 40), rgb(29 61 76))');
}

let codes = document.querySelectorAll('.highlight > pre > code');
let countID = 0;
codes.forEach((code) => {
  code.setAttribute("id", "code" + countID);
  let btn = document.createElement('button');
  btn.innerHTML = "Copy";
  btn.className = "btn-sm btn-copy-code";
  btn.setAttribute("data-clipboard-action", "copy");
  btn.setAttribute("data-clipboard-target", "#code" + countID);
  
  let div = document.createElement('div');
  div.className = "div-code-button";
  div.appendChild(btn);
  
  code.before(div);
  countID++;
}); 
new ClipboardJS('.btn-copy-code');
switchMode();

setTimeout(function () {
  $(".masthead").css("filter", "grayscale(0)")
}, 1000);

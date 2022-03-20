$(function () {
  $('[data-toggle="tooltip"]').tooltip();
})


function switchMode() {
  $('body,div.card')
    .css("background-color", "#020001")
    .css("background-image", "linear-gradient(to right, #020001, #1a1618)")
    .css("color", "#d6d6d6")
  $('code.highlighter-rouge').css("color", "#dfcb66");
  $('blockquote').css("color", "ghostwhite");
  $('#contact-section h6').css("color", "lightyellow");
}

let codes = document.querySelectorAll('.highlight > pre > code');
let countID = 0;
codes.forEach((code) => {
  code.setAttribute("id", "code" + countID);
  let btn = document.createElement('button');
  btn.innerHTML = "Copy";
  btn.className = "btn-copy-code";
  btn.setAttribute("data-clipboard-action", "copy");
  btn.setAttribute("data-clipboard-target", "#code" + countID);
  
  let div = document.createElement('div');
  div.className = "div-code-button";
  div.appendChild(btn);
  
  code.before(div);
  countID++;
}); 
new ClipboardJS('.btn-copy-code');
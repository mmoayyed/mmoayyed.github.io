$(function () {
  $('[data-toggle="tooltip"]').tooltip();
})

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
setTimeout(function () {
  $(".masthead").css("filter", "grayscale(0)")
}, 900);

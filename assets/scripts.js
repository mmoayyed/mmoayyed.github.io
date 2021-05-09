$(function () {
  $('[data-toggle="tooltip"]').tooltip();
})


function switchMode() {
  $('body,div.card')
    .css("background-color", "#020001")
    .css("background-image", "linear-gradient(to right, #020001, #1a1618)")
    .css("color", "#d6d6d6")
  $('code.highlighter-rouge').css("color", "#dfcb66");
}

let hour = new Date().getHours();
if (hour > 18) {
  switchMode();
}
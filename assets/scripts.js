$(function () {
  $('[data-toggle="tooltip"]').tooltip();
})


function switchMode() {
  $('body,div.card')
    .css("background-color", "#141414")
    .css("color", "#d6d6d6")
  $('code.highlighter-rouge').css("color", "#dfcb66");
}
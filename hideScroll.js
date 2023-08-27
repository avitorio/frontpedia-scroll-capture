chrome.storage.local.get(["noScrollbar"], function (result) {
  if (result.noScrollbar) {
    // Hide scrollbar
    var style = document.createElement("style");
    style.type = "text/css";
    style.innerHTML = `html::-webkit-scrollbar { width: 0px; }`;
    document.getElementsByTagName("head")[0].appendChild(style);
  }
});

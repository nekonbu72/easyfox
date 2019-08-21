"use strict";

browser.browserAction.onClicked.addListener(() => {
  const createData = {
    url: "dist/index.html",
    type: "detached_panel"
  };
  browser.windows.create(createData);
});

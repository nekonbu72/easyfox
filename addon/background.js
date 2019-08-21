"use strict";

const CreateType = {
  NORMAL: "normal",
  POPUP: "popup",
  PANEL: "panel",
  DETACHED_PANEL: "detached_panel",
}

browser.browserAction.onClicked.addListener(() => {
  const createData = {
    url: "dist/index.html",
    type: CreateType.DETACHED_PANEL,
    // titlePreface : browser.runtime.getManifest().name
  };
  // 開発中は tab で立ち上げる
  // browser.windows.create(createData)

  const createProperties = {
    url: "dist/index.html"
  }
  browser.tabs.create(createProperties)
});

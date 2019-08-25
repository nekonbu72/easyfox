//@ts-check
"use strict";

import Path from "path";

// https://stackoverflow.com/questions/42108782/firefox-webextensions-get-local-files-content-by-path
// https://codepen.io/Anveio/pen/XzYBzX

/**
 * @param   {string} url
 * @param   {string[]} extFilter
 * @param   {number} limit
 * @param   {number} depth
 * @returns {Promise<DirNode[]>}
 */
export const walkDir = async (url, extFilter, limit = 3, depth = 0) => {
  if (depth > limit) {
    // throw new Error("OverLimitError");
    return [newErrorDirNode("OverLimitDepthError")];
  }

  let blob;
  try {
    // manifest.json に "permissions": ["<all_urls>"] 必要
    const res = await fetch(url, { mode: "same-origin" });
    blob = await res.blob();
  } catch (e) {
    // throw e;
    return [newErrorDirNode(e)];
  }

  if (blob.type !== "application/http-index-format") {
    // throw new Error("NotDirectoryError");
    return [newErrorDirNode("NotDirectoryError")];
  }

  const reader = new FileReader();

  return new Promise(resolve => {
    reader.onload = async () => {
      /**
       * @type {string[]}
       */
      const readerResultArr = reader.result.split("\n").slice(2, -1);
      const nodes = await Promise.all(
        readerResultArr
          .map(info => info.split(" ").map(data => decodeURIComponent(data)))
          .map(infoArr => new DirNode(...infoArr.slice(0, -1), depth, url))
          .filter(createExtFilter(extFilter))
          .map(async node => {
            // require-atomic-updates 回避
            const tmpNode = node;
            if (tmpNode.isDirectory) {
              tmpNode.children = await walkDir(
                tmpNode.url,
                extFilter,
                limit,
                depth + 1
              );
            }
            return tmpNode;
          })
      );

      if (nodes.length == 0) {
        resolve([newErrorDirNode("NoAvailableFilesExistError")]);
      }

      resolve(nodes);
    };

    reader.readAsText(blob);
  });
};

export class DirNode {
  /**
   * @param  {string} status
   * @param  {string} filename
   * @param  {string} contentLength
   * @param  {string} lastModified
   * @param  {string} fileType
   * @param  {number} depth
   * @param  {string} parentURL
   */
  constructor(
    status,
    filename,
    contentLength,
    lastModified,
    fileType,
    depth,
    parentURL
  ) {
    this.status = status;
    this.filename = filename;
    this.contentLength = contentLength;
    this.lastModified = lastModified;
    this.fileType = fileType;
    this.depth = depth;
    this.parentURL = parentURL;

    /**
     * @type {DirNode[]}
     */
    this.children = [];

    /**
     * @type {boolean}
     */
    this.isDirectory = null;
    if (this.fileType) {
      this.isDirectory = this.fileType === "DIRECTORY";
    }

    /**
     * @type {string}
     */
    this.url = null;
    if (this.filename && this.parentURL) {
      this.url = Path.join(parentURL, filename);
    }

    /**
     * @type {string}
     */
    this.localPath = null;
    if (this.url) {
      this.localPath = this.url.replace("file:/", "");
    }
  }
}

/**
 *
 * @param {string} message
 * @returns {DirNode}
 */
const newErrorDirNode = message => {
  return new DirNode(null, message, null, null, null, null, null);
};

/**
 * @param {string[]} exts
 * @returns {function(DirNode):boolean}
 */
const createExtFilter = exts => {
  /**
   * @param {DirNode} node
   * @returns {boolean}
   */
  const innerFunc = node => {
    if (node.isDirectory) {
      // フォルダの場合は通す
      return true;
    }

    if (node.filename.indexOf(".") === -1) {
      // 拡張子無し
      return false;
    }

    // 拡張子を抽出
    const ext = node.filename
      .split(".")
      .slice(-1)[0]
      .toLowerCase();

    return exts.indexOf(ext) >= 0;
  };
  return innerFunc;
};

/**
 *
 * @param {string} url
 * @return {Promise<string>}
 */
export const readFile = async url => {
  let blob;
  try {
    const res = await fetch(url, { mode: "same-origin" });
    blob = await res.blob();
  } catch (e) {
    return String(e);
  }

  if (blob.type === "application/http-index-format") {
    return "NotTextFileError";
  }

  const reader = new FileReader();

  return new Promise(resolve => {
    reader.onload = async () => {
      resolve(decodeURIComponent(String(reader.result)));
    };
    reader.readAsText(blob);
  });
};

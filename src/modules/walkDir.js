//@ts-check
"use strict";

// https://stackoverflow.com/questions/42108782/firefox-webextensions-get-local-files-content-by-path
// https://codepen.io/Anveio/pen/XzYBzX

/**
 * @param  {string} path
 * @param  {string[]} extFilter
 * @param  {number} limit
 * @param  {number} depth
 * @returns {Promise<DirNode[]>}
 */
export const walkDir = async (path, extFilter, limit = 3, depth = 0) => {
  if (depth > limit) {
    // throw new Error("OverLimitError");
    return [new DirNode(null, "OverLimitDepthError", null, null, null, null)];
  }

  let blob;
  try {
    // manifest.json に "permissions": ["<all_urls>"] 必要
    const res = await fetch(path, { mode: "same-origin" });
    blob = await res.blob();
  } catch (e) {
    // throw e;
    return [new DirNode(null, e, null, null, null, null)];
  }

  if (blob.type !== "application/http-index-format") {
    // throw new Error("NotDirectoryError");
    return [new DirNode(null, "NotDirectoryError", null, null, null, null)];
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
          .map(infoArr => new DirNode(...infoArr.slice(0, -1), depth))
          .filter(createExtFilter(extFilter))
          .map(async node => {
            // require-atomic-updates 回避
            const tmpNode = node;
            if (tmpNode.isDirectory) {
              tmpNode.children = await walkDir(
                `${path}\\${tmpNode.filename}`,
                extFilter,
                limit,
                depth + 1
              );
            }
            return tmpNode;
          })
      );

      if (nodes.length == 0) {
        resolve([new DirNode(null, "NoFileError", null, null, null, null)]);
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
   */
  constructor(status, filename, contentLength, lastModified, fileType, depth) {
    this.status = status;
    this.filename = filename;
    this.contentLength = contentLength;
    this.lastModified = lastModified;
    this.fileType = fileType;
    this.depth = depth;

    /**
     * @type {DirNode[]}
     */
    this.children = [];

    /**
     * @type {boolean}
     */
    this.isDirectory = null;
    if (this.fileType !== null) {
      this.isDirectory = this.fileType === "DIRECTORY";
    }
  }
}

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
 * @param {HTMLDivElement} div
 * @param {DirNode[]} dirNodes
 * @returns {void}
 */
export const createTreeView = (div, dirNodes) => {
  // 子要素を全削除
  while (div.firstChild) div.removeChild(div.firstChild);

  // トグルをすべて閉じるボタンを作成
  const closer = document.createElement("span");
  closer.onclick = () => {
    const detailses = div.querySelectorAll("details");
    detailses.forEach(details => (details.open = false));
  };
  // enter 入力で閉じられるように
  closer.onkeyup = e => {
    if (e.keyCode === 13) {
      closer.click();
    }
  };
  closer.setAttribute("class", "closer");
  closer.setAttribute("tabindex", "0");
  closer.textContent = "  [-] ";
  div.append(closer);

  div.append(createUl(dirNodes));
};

/**
 * @param {DirNode[]} dirNodes
 * @returns {HTMLUListElement}
 */
const createUl = dirNodes => {
  const ul = document.createElement("ul");

  dirNodes.forEach(node => {
    const li = document.createElement("li");
    if (node.isDirectory) {
      appendDirectory(li, node);
    } else {
      li.textContent = node.filename;
      li.setAttribute("class", "file");
      li.setAttribute("tabindex", "0");
    }
    ul.append(li);
  });
  return ul;
};

/**
 * @param {HTMLLIElement} li
 * @param {DirNode} dir
 * @returns {void}
 */
const appendDirectory = (li, dir) => {
  const details = document.createElement("details");

  const summary = document.createElement("summary");
  summary.textContent = dir.filename;
  summary.setAttribute("tabindex", "0");

  details.append(summary, createUl(dir.children));
  li.append(details);
};

/**
 *
 * @param {string} path
 * @return {Promise<string>}
 */
const readFile = async path => {
  let blob;
  try {
    const res = await fetch(path, { mode: "same-origin" });
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

/**
 *
 * @param {HTMLDivElement} div
 * @param {HTMLTextAreaElement} resultTextarea
 * @param {string} rootPath
 * @returns {void}
 */
export const addFileOpener = (div, resultTextarea, rootPath) => {
  div.querySelectorAll("li.file").forEach(li => {
    if (!(li instanceof HTMLLIElement)) return;

    if (li.textContent === "") return;

    li.onclick = async () => {
      const path = `${rootPath}\\${li.textContent}`;
      const result = await readFile(path);
      resultTextarea.value = result;
    };
  });
};

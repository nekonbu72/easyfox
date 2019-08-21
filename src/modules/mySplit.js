import Split from "split.js";

/**
 *
 * @param {HTMLElement} root
 * @param {string} leftSelector
 * @param {string} rightSelector
 */
export const mySplit = (root, leftSelector, rightSelector) => {
  /**
   * @type {HTMLDivElement}
   */
  const left = root.querySelector(leftSelector);

  /**
   * @type {HTMLDivElement}
   */
  const right = root.querySelector(rightSelector);

  const split = Split([left, right], {
    sizes: [25, 75],
    minSize: [100, 300],
    gutterSize: 3,
    onDragEnd: () => {
      leftWidth = left.clientWidth;
    }
  });

  let leftWidth = left.clientWidth;
  window.onresize = () => {
    const leftRatio = Math.round(
      (leftWidth / (left.clientWidth + right.clientWidth)) * 100
    );
    split.setSizes([leftRatio, 100 - leftRatio]);
    leftWidth = left.clientWidth;
  };
};

import Split from "split.js";

/**
 *
 * @param {Element} root
 * @param {string} leftSelector
 * @param {string} rightSelector
 * @returns {Split.Instance}
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
      const event = new Event("gutterMoved");
      root.dispatchEvent(event);
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

  return split;
};

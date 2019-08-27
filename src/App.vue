<template>
  <div>
    <form v-on:submit.prevent="updateDirTree">
      <label>file:/</label>
      <input class="path" type="text" v-model="path" required />
      <input type="submit" value="->" />
      <label>{{status}}</label>
      <button @click="download">download</button>
    </form>

    <p></p>
    <div class="wrapper">
      <div class="split" id="left">
        <span class="closer" tabindex="0" @click="closeAllDetails" @keyup="closeAllDetails">[-]</span>
        <DirTree @updatePath="updatePath" class="tree" :nodes="nodes" :editor="editor" />
      </div>
      <div class="split" id="right">
        <div id="container"></div>
      </div>
    </div>
  </div>
</template>

<script>
//@ts-check

import DirTree from "./components/DirTree.vue";
import { walkDir, DirNode } from "./modules/walkDir";
import Split from "split.js";
import * as monaco from "monaco-editor";
import Path from "path";

export default {
  name: "app",
  components: {
    DirTree
  },
  data() {
    return {
      path: "C:\\easyfox_test",
      status: "Waiting...",
      nodes: [new DirNode()],
      /**
       * @type {monaco.editor.IStandaloneCodeEditor}
       */
      editor: {}
    };
  },
  computed: {
    ext() {
      return ["js", "txt", "iim"];
    },
    url() {
      return Path.join("file:", this.path);
    },
    gutterMovedEventType() {
      return "gutterMoved";
    }
  },
  mounted() {
    this.initSplitter();

    this.initEditor();

    this.updateDirTree();
  },
  methods: {
    initSplitter() {
      const left = this.$el.querySelector("div#left"),
        right = this.$el.querySelector("div#right");

      const split = Split([left, right], {
        sizes: [25, 75],
        minSize: [100, 300],
        gutterSize: 3,
        onDragEnd: () => {
          leftWidth = left.clientWidth;
          this.$el.dispatchEvent(new Event(this.gutterMovedEventType));
        }
      });

      let leftWidth = left.clientWidth;
      window.addEventListener("resize", () => {
        const leftRatio = Math.round(
          (leftWidth / (left.clientWidth + right.clientWidth)) * 100
        );
        split.setSizes([leftRatio, 100 - leftRatio]);
        leftWidth = left.clientWidth;
      });
    },
    initEditor() {
      this.editor = monaco.editor.create(document.getElementById("container"), {
        language: "javascript",
        minimap: { enabled: false }
      });
      window.addEventListener("resize", () => {
        this.editor.layout();
      });
      this.$el.addEventListener(this.gutterMovedEventType, () => {
        this.editor.layout();
      });
    },
    updateDirTree() {
      // タイマーをスタート
      const timer1 = new Date();
      this.status = "Loading...";

      walkDir(this.url, this.ext).then(nodes => {
        this.nodes = nodes;

        // タイマーストップ
        const timer2 = new Date();
        this.status = `Done(${(timer2.getTime() - timer1.getTime()) / 1000}s).`;
      });
    },
    closeAllDetails() {
      const tree = this.$el.querySelector(".tree");
      tree
        .querySelectorAll("details")
        .forEach(details => (details.open = false));
    },
    /**
     * @param{string}newPath
     */
    updatePath(newPath) {
      this.path = newPath;
    },
    download() {
      var csv = "foo,bar,baz";
      var blob = new Blob([csv], { type: "text/csv;charset=utf-8" });

      browser.downloads.download({
        url: URL.createObjectURL(blob),
        filename: "file.csv",
        saveAs: false
      });
    }
  }
};
</script>

<style>
.path {
  width: 60%;
}

div#left {
  overflow-x: scroll;
  overflow-y: scroll;
  height: 90vh;
}

span.closer {
  cursor: pointer;
  background-color: lightgray;
}

#container {
  width: 100%;
  height: 90vh;
  border: 1px solid #ccc;
}

.split,
.gutter.gutter-horizontal {
  float: left;
  height: 100vh;
}

.gutter.gutter-horizontal {
  cursor: col-resize;
  background-color: gray;
  width: 5px;
}
</style>

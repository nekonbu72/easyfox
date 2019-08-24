<template>
  <form v-on:submit.prevent="updateDirTree">
    <label>file:/</label>
    <input class="dir" type="text" v-model="dir" required />
    <input type="submit" value="->" />
    <label>{{status}}</label>
    <p></p>
    <div class="wrapper">
      <div class="split" id="left">
        <span class="closer" tabindex="0" @click="closeAllDetails" @keyup="closeAllDetails">[-]</span>
        <DirTree class="tree" :nodes="nodes" :editor="editor" />
      </div>
      <div class="split" id="right">
        <div id="container"></div>
      </div>
    </div>
  </form>
</template>

<script>
//@ts-check

import DirTree from "./components/DirTree.vue";
import { mySplit } from "./modules/mySplit";
import { walkDir, DirNode } from "./modules/walkDir";
import Path from "path";
import * as monaco from "monaco-editor";

export default {
  name: "app",
  components: {
    DirTree
  },
  data() {
    return {
      dir: "C:\\easyfox_test",
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
      return Path.join("file:", this.dir);
    }
  },
  mounted() {
    const split = mySplit(this.$el, "div#left", "div#right");

    this.editor = monaco.editor.create(document.getElementById("container"), {
      language: "javascript",
      minimap: { enabled: false }
    });
    window.onresize = () => {
      this.editor.layout();
    };

    this.updateDirTree();
  },
  methods: {
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
    }
  }
};
</script>

<style>
.dir {
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

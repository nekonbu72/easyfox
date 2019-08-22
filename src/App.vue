<template>
  <form v-on:submit.prevent="updateDirTree">
    <label>file:/</label>
    <input class="dir" type="text" v-model="dir" required />
    <input type="submit" value="->" />
    <label>{{status}}</label>
    <p></p>
    <div class="wrapper">
      <div class="split" id="left">
        <DirTree class="tree" :nodes="nodes" />
      </div>
      <div class="split" id="right">
        <textarea></textarea>
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

export default {
  name: "app",
  components: {
    DirTree
  },
  data() {
    return {
      dir: "C:\\easyfox_test",
      status: "Waiting...",
      nodes: [new DirNode()]
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
    mySplit(this.$el, "div#left", "div#right");
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
    }
  }
};
</script>

<style>
.dir {
  width: 60%;
}

.tree {
  overflow-x: scroll;
  overflow-y: scroll;
  height: 90vh;
}

textarea {
  width: 100%;
  overflow-y: scroll;
  height: 90vh;
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

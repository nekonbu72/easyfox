<template>
  <form v-on:submit.prevent="updateDirTree">
    <label>file:///</label>
    <input class="dir" type="text" v-model="dir" required />
    <input type="submit" value="->" />
    <label>{{status}}</label>
    <p></p>
    <div class="wrapper">
      <div class="split" id="left">
        <div class="tree"></div>
      </div>
      <div class="split" id="right">
        <textarea></textarea>
      </div>
    </div>
  </form>
</template>

<script>
import { mySplit } from "./modules/mySplit";
import { walkDir } from "./modules/walkDir";

export default {
  name: "app",
  data() {
    return {
      dir: "C:\\Users\\Tomoyuki Nakamura\\developer\\javascript\\easyfox",
      status: "Waiting..."
    };
  },
  computed: {
    ext() {
      return ["js", "txt", "iim"];
    },
    url() {
      return `file:///${this.dir}`;
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

      console.log(this.url);
      walkDir(this.url, this.ext).then(nodes => console.log(nodes));

      // タイマーストップ
      const timer2 = new Date();
      this.status = `Done(${(timer2.getTime() - timer1.getTime()) / 1000}s).`;
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

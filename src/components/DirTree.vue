<template>
  <ul>
    <li v-for="(dir, index) in directories" :key="`first-${index}`">
      <details>
        <summary tabindex="0">{{ dir.filename }}</summary>
        <DirTree :nodes="dir.children" :editor="editor" />
      </details>
    </li>
    <li
      tabindex="0"
      v-for="(file, index) in files"
      :key="`second-${index}`"
      @click="opneFile(file.path)"
    >{{ file.filename }}</li>
  </ul>
</template>

<script>
import { readFile } from "../modules/walkDir";

export default {
  name: "DirTree",
  props: {
    nodes: Array,
    editor: Object
  },
  computed: {
    directories() {
      return this.nodes.filter(node => {
        return node.isDirectory;
      });
    },
    files() {
      return this.nodes.filter(node => {
        return !node.isDirectory;
      });
    }
  },
  methods: {
    /**
     * @param{string}path
     */
    opneFile(path) {
      readFile(path).then(result => {
        this.editor.setValue(result);
      });
    }
  }
};
</script>

<style scoped>
summary {
  font-weight: bolder;
}

ul {
  list-style-type: none;
  padding-left: 10px;
}

li {
  white-space: nowrap;
}

li:focus,
summary:focus {
  background-color: lightcyan;
}
</style>

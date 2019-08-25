<template>
  <ul>
    <li v-for="(directory, index) in directories" :key="`first-${index}`">
      <details>
        <summary @click="updatePath(directory.localPath)" tabindex="0">{{ directory.filename }}</summary>
        <DirTree @updatePath="updatePath" :nodes="directory.children" :editor="editor" />
      </details>
    </li>
    <li
      tabindex="0"
      v-for="(file, index) in files"
      :key="`second-${index}`"
      @click="openFile(file)"
    >{{ file.filename }}</li>
  </ul>
</template>

<script>
import { readFile, DirNode } from "../modules/walkDir";

export default {
  name: "DirTree",
  props: {
    nodes: Array,
    editor: Object,
    pathInputEl: HTMLInputElement
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
     * @param{DirNode}fileNode
     */
    openFile(fileNode) {
      readFile(fileNode.url).then(result => {
        this.editor.setValue(result);
        this.$emit("updatePath", fileNode.localPath);
      });
    },
    /**
     * @param{string}newPath
     */
    updatePath(newPath) {
      this.$emit("updatePath", newPath);
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

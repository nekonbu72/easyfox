<template>
  <ul>
    <li v-for="(child, index) in directries" :key="index">{{ child.filename }}</li>
    <li v-for="(child, index) in files" :key="index">{{ child.filename }}</li>
  </ul>
</template>

<script>
import { DirNode } from "../modules/walkDir";

export default {
  name: "DirTree",
  props: {
    node: DirNode
  },
  computed: {
    /**
     * @returns {DirNode[]}
     */
    files() {
      return this.node.children.filter(childNode => {
        return !childNode.isDirectory;
      });
    },
    /**
     * @returns {DirNode[]}
     */

    directries() {
      return this.node.children.filter(childNode => {
        return childNode.isDirectory;
      });
    }
  }
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
</style>

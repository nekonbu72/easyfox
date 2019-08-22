<template>
  <ul>
    <li v-for="(dir, index) in directories" :key="`first-${index}`">
      <details>
        <summary tabindex="0">{{ dir.filename }}</summary>
        <DirTree :nodes="dir.children" />
      </details>
    </li>
    <li tabindex="0" v-for="(file, index) in files" :key="`second-${index}`">{{ file.filename }}</li>
  </ul>
</template>

<script>
export default {
  name: "DirTree",
  props: {
    nodes: Array
  },
  computed: {
    files() {
      return this.nodes.filter(node => {
        return !node.isDirectory;
      });
    },
    directories() {
      return this.nodes.filter(node => {
        return node.isDirectory;
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

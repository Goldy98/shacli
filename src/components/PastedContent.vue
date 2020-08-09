<template>
  <div class="pasted-content m-2">
    <!-- If content is Text -->
    <div class="row p-0 m-2" v-if="content.contentType === 'Text'">
      <b class="content-text">{{ content.contentText }}</b>
    </div>

    <!-- If content is Url -->
    <div class="row p-0 m-2" v-if="content.contentType === 'Url'">
      <b class="content-text"
        ><a
          :href="content.contentText"
          @click.prevent="openUrl(content.contentText)"
          >{{ content.contentText }}</a
        ></b
      >
    </div>

    <!-- If content is Image -->
    <div
      class="row p-0 m-2 justify-content-center"
      v-if="content.contentType === 'Image'"
    >
      <img :src="content.contentUrl" class="content-image" />
    </div>

    <!-- If content is Files -->
    <div class="row p-0 m-2" v-if="content.contentType === 'Others'">
      <div class="col-2 p-0">
        <img src="@/assets/files-icon.png" width="50" />
      </div>
      <div class="col-10 content-other-text-container">
        <b class="content-others-text">{{ content.contentText }}</b>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "PastedContent",
  props: {
    content: Object
  },
  methods: {
    openUrl(url) {
      this.$emit("urlClick", url);
    }
  }
};
</script>

<style>
.pasted-content {
  border: solid 1px rgba(0, 0, 0, 0.349);
  background-color: white;
  border-radius: 10px;
  box-shadow: 0px 0px 26px -16px rgba(0, 0, 0, 0.75);
}

.content-text {
  width: 100%;
  overflow-wrap: break-word;
  text-align: center;
}

.content-image-container {
  border: solid 1px rgba(0, 0, 0, 0.349);
  background-color: white;
  border-radius: 10px;
  box-shadow: 0px 0px 26px -16px rgba(0, 0, 0, 0.75);
  padding: 10px;
}

.content-image {
  max-width: 100%;
}

.content-other-text-container {
  display: flex;
  justify-content: center;
  align-items: center;
}

.content-others-text {
  font-size: 15px;
  overflow-wrap: break-word;
  text-align: left;
  width: 100%;
}
</style>

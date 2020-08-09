<template>
  <div class="home">
    <!-- Header -->
    <h4 id="app-header" class="pl-3 pb-4">
      <img src="@/assets/monitor.svg" alt="" srcset="" />
      <b class="px-1" v-if="serverInfo.serverName !== null">{{
        serverInfo.serverName
      }}</b>
    </h4>

    <div id="transfer-history" class="p-3">
      <p class="m-2 text-left" id="history-section-title">
        <b>Transfer history</b>
      </p>

      <div id="scrollable-container">
        <div class="row m-2">
          <div
            class="col-sm-12 col-lg-4 p-0"
            v-for="content in pastedContents"
            :key="content.contentId"
          >
            <PastedContent :content="content" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
// @ is an alias to /src
import { initWebsocket } from "@/services/websocket";
import { bus } from "../event-bus";
import PastedContent from "../components/PastedContent";

export default {
  name: "Home",
  components: {
    PastedContent,
  },
  data() {
    return {
      serverInfo: {
        serverAddress: null,
        serverName: null,
      },
      pastedContents: [],
    };
  },
  methods: {},
  async mounted() {
    const serverInfo = await fetch(
      `http://${window.location.hostname}:${window.location.port}/server-info`
    );

    if (serverInfo && serverInfo.ok) {
      this.serverInfo = await serverInfo.json();
      initWebsocket(this.serverInfo.serverAddress);
    }

    bus.$on("newContent", async (content) => {
      // Add the new content to the the transfer
      this.pastedContents.unshift(content);
    });
  },
};
</script>

<style>
.home {
  font-family: "Lato", Arial, sans-serif;
  color: white;
}

#transfer-history {
  position: fixed;
  top: 75px;
  background-color: white;
  z-index: 100000;
  border-top-left-radius: 30px;
  border-top-right-radius: 30px;
  width: 100%;
  height: 100%;
}

#history-section-title {
  color: rgba(0, 0, 0, 0.815);
  border-bottom: solid 1px rgba(0, 0, 0, 0.349);
}

#scrollable-container {
  height: 80%;
  overflow: scroll;
}

#scrollable-container::-webkit-scrollbar {
  display: none;
}

/* Hide scrollbar for IE, Edge and Firefox */
#scrollable-container {
  -ms-overflow-style: none; /* IE and Edge */
  scrollbar-width: none; /* Firefox */
}
</style>

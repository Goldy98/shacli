import Vue from "vue";
import Vuex from "vuex";
import { createDirectStore, defineActions, defineMutations } from "direct-vuex";

Vue.use(Vuex);

export interface State {
  clientDevicename: string | undefined;
  webServerAddress: string | undefined;
}

const {
  store,
  rootActionContext,
  moduleActionContext,
  rootGetterContext,
  moduleGetterContext
} = createDirectStore({
  state: {
    clientDevicename: undefined
  } as State,
  actions: defineActions({
    async setClientDevice(context, clientDevicename): Promise<void> {
      const { commit } = rootActionContext(context);
      commit.SET_CLIENT_DEVICE(clientDevicename);
    },
    async setWebServerAddress(context, webServerAddress): Promise<void> {
      const { commit } = rootActionContext(context);
      commit.SET_WEB_SERVER_ADDRESS(webServerAddress);
    }
  }),
  mutations: defineMutations<State>()({
    SET_CLIENT_DEVICE(state: State, clientDevicename: string) {
      state.clientDevicename = clientDevicename;
    },
    SET_WEB_SERVER_ADDRESS(state: State, webServerAddress: string) {
      state.webServerAddress = webServerAddress;
    }
  })
});

// Export the direct-store instead of the classic Vuex store.
export default store;

// The following exports will be used to enable types in the
// implementation of actions and getters.
export {
  rootActionContext,
  moduleActionContext,
  rootGetterContext,
  moduleGetterContext
};

// The following lines enable types in the injected store '$store'.
export type AppStore = typeof store;
declare module "vuex" {
  interface Store<S> {
    direct: AppStore;
  }
}

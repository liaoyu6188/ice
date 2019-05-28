import Vuex from "vuex";
import actions from "./actions";
import mutations from "./mutations";
import getters from "./getters";
const createStore = () => {
  return new Vuex.Store({
    state: {
      imageCDN: 'http://ps24qmft6.bkt.clouddn.com/',
      currentCharacter: {},
      currentHouse: {},
      houses: [],
      products: [],
      currentProduct: [],
      user: null,
      authUser: null,
      characters: [],
      payInfo: {}
    },
    getters,
    actions,
    mutations
  });
};

export default createStore;

export default {
  SET_USER: (state, user) => {
    state.user = user;
  },

  SET_AUTHUSER: (state, authUser) => {
    state.authUser = authUser;
  },

  UPDATED_INFO: (state, info) => {
    state.payInfo = info;
  },

  UPDATED_PAYMENT: (state, order) => {
    state.orders.push(order);
  }
};

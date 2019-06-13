import axios from "axios";
// import api from "../server/api";

const baseUrl = "";
// const baseUrl = "http://rap2api.taobao.org/app/mock/7796/";

class Services {
  getWechatSignature(url) {
    return axios.get(`${baseUrl}/wechat-signature?url=${url}`);
  }

  getUserByOAuth(url) {
    return axios.get(`${baseUrl}/wechat-oauth?url=${url}`);
  }

  getWechatOAuth(url) {
    return axios.get(`${baseUrl}/wechat-oauth?url=${encodeURIComponent(url)}`);
  }

  createOrder({ productId, name, address, phoneNumber }) {
    // const product = api.product.findProduct(productId);
    // if (!product) {
    //   return (ctx.body = {
    //     success: false,
    //     err: "这个宝贝不在了"
    //   })
    // }
    // console.log(this.$store)
    // this.$store.commit('UPDATED_PAYMENT', productId, name, address, phoneNumber);
  }

  getPayments () {
    return axios.get(`${baseUrl}/admin/payments`)
  }

  fetchHouses() {
    return axios.get(`${baseUrl}/wiki/houses`);
  }

  fetchHouse(id) {
    return axios.get(`${baseUrl}/wiki/houses/${id}`);
  }

  fetchCharacters() {
    return axios.get(`${baseUrl}/wiki/characters`);
  }

  fetchCharacter(id) {
    return axios.get(`${baseUrl}/wiki/characters/${id}`);
  }

  fetchProducts() {
    return axios.get(`${baseUrl}/api/products`);
  }

  fetchProduct(id) {
    return axios.get(`${baseUrl}/api/products/${id}`);
  }

  fetchUserAndOrders() {
    return axios.get(`${baseUrl}/api/user`);
  }
}

export default new Services();

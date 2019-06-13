<template lang="pug">
.container
  .user
    .user-header
      .text L.y
      img(:src='imageCDN + "avatar.jpg" + "?imageView2/1/format/jpg/q/75/imageslim"')
    .user-address
      cell(title='收货地址')
      .user-content {{payInfo.address}}
    .user-phone
      cell(title='电话')
      .user-content {{payInfo.phoneNumber}}
    .user-name
      cell(title='姓名')
      .user-content {{payInfo.name}}

    .user-order
      cell(title='我的订单')
      .user-order-items(v-for='item in orders')
        img(:src='imageCDN + item.images[0] + "?imageView2/1/format/jpg/q/75/imageslim"')
        .user-order-intro
          .title {{item.title}}
          .content {{item.intro}}
        .user-order-price
          span ￥{{item.price}}
</template>

<script>
import cell from "~/components/cell.vue";
import { mapState } from "vuex";

export default {
  head() {
    return {
      title: "个人中心"
    };
  },

  computed: {
    ...mapState({
      user: "user",
      imageCDN: "imageCDN",
      payInfo: 'payInfo',
      orders: 'orders'
    })
  },

  methods: {},
  beforeCreate() {
    // this.$store.dispatch("fetchUserAndOrders");
  },

  components: {
    cell
  }
};
</script>

<style scoped lang='sass' src='~/static/sass/user.sass'></style>

import api from "../api";
import config from "../config";
import { parse as urlParse } from "url";
import { parse as queryParse } from "querystring";
import { getParamsAsync } from '../wechat-lib/pay'

export async function signature(ctx, next) {
  let url = ctx.query.url;
  console.log(ctx);
  if (!url) ctx.throw(404);

  url = decodeURIComponent(url);
  let params = await api.wechat.getSignatureAsync(url);

  ctx.body = {
    success: 1,
    data: params
  };
}

// 网页上点某按钮，直接跳转到 http://x.o/wechat-redirect?visit=a&id=b
// 用户被重定向到 Wechat Redirect URL 授权验证
// 验证后，自动二跳进入 http://x.o/oauth?code=xxxxxx&state=a_b
export async function redirect(ctx, next) {
  let target = config.SITE_ROOT_URL + "/oauth";
  let scope = "snsapi_userinfo";
  const { visit, id } = ctx.query;
  const params = id ? `${visit}_${id}` : visit;
  const url = api.wechat.getAuthorizeURL(scope, target, params);

  ctx.redirect(url);
}

export async function oauth(ctx, next) {
  let url = ctx.query.url;

  url = decodeURIComponent(url);

  const urlObj = urlParse(url);
  const params = queryParse(urlObj.query);
  const code = params.code;
  const user = await api.wechat.getUserByCode(code);

  ctx.session.user = user;
  ctx.body = {
    success: true,
    data: user
  };
}

export async function wechatPay(code) {
  // const ip = ctx.ip.replace("::ffff:", "");
  // const session = ctx.session;
  // const { productId, name, phoneNumber, address } = ctx.request.body;
  console.log(code)

  const product = await api.product.findProduct(productId);

  if (!product) {
    return (ctx.body = {
      success: false,
      err: "这个宝贝不在了"
    });
  }

  // try {
  //   let user = await api.user.findUserByUnionId(session.user.unionid).exec();

  //   if (!user) {
  //     user = await api.user.saveFromSession(session);
  //   }

  //   const orderParams = {
  //     body: product.title,
  //     attach: "公众号周边手办支付",
  //     out_trade_no: "Product" + +new Date(),
  //     spbill_create_ip: ip,
  //     // total_fee: product.price * 100,
  //     total_fee: 0.01 * 100,
  //     openid: session.user.unionid,
  //     trade_type: "JSAPI"
  //   };

  //   const order = await getParamsAsync(orderParams);
  //   const payment = await api.payment.create(user, product, order, "公众号", {
  //     name,
  //     address,
  //     phoneNumber
  //   });

  //   ctx.body = {
  //     success: true,
  //     data: payment.order
  //   };
  // } catch (err) {
  //   ctx.body = {
  //     success: false,
  //     err: err
  //   };
  // }
}

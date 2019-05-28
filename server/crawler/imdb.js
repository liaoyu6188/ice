import rp from "request-promise";
import cheerio from "cheerio";
import R from "ramda";
import { writeFileSync } from "fs";
import { resolve } from "path";
// import Agent from'socks5-http-client/lib/Agent'

const sleep = time => new Promise(resolve => setTimeout(resolve, time));

export const getIMDbCharacters = async () => {
  const options = {
    uri: "https://www.imdb.com/title/tt0944947/fullcredits?ref_=tt_cl_sm#cast",
    // agentClass: Agent,
    // agentOptions: {
    //   socksHost: 'localhost',
    //   socksPort: 1080 // 本地 VPN 的端口，这里用的 shadowsocks
    // },
    transform: body => cheerio.load(body)
  };

  let photos = [];

  const $ = await rp(options);

  $("table.cast_list tr.odd, tr.even").each(function() {
    const nmIdDom = $(this).find("td a");
    const nmId = nmIdDom.attr("href");
    const characterDom = $(this).find("td.character a");
    const name = characterDom.text();
    // const chId = characterDom.attr("href");
    const playedByDom = $(this).find("td a");
    const playedBy = playedByDom.text();

    photos.push({
      nmId,
      name,
      playedBy
    });
  });

  console.log("共拿到" + photos.length + "条数据");
  const fn = R.compose(
    R.map(photo => {
      const reg1 = /\/name\/(.*?)\/\?ref/;
      const reg2 = /(.*?)\d/;
      const reg3 = /(.*?)\n/;

      const match1 = photo.nmId.match(reg1);
      const match2 = photo.name.match(reg2);
      const match3 = photo.playedBy.match(reg3);

      photo.nmId = match1[1];
      photo.name = match2[1];
      photo.playedBy = match3[1].replace(/^\s*/, "");

      return photo;
    }),
    R.filter(photo => photo.playedBy && photo.name && photo.nmId)
  );

  photos = fn(photos);

  console.log("清洗后，剩余 " + photos.length + "条数据");

  writeFileSync("./imdb.json", JSON.stringify(photos, null, 2), "utf8");
};

const fetchIMDbProfile = async url => {
  const options = {
    uri: url,
    transform: body => cheerio.load(body)
  };

  const $ = await rp(options);
  const img = $("a.titlecharacters-image-grid__thumbnail-link img");
  // console.log(img)
  let src = img.attr("src");

  if (src) {
    src = src.split("_V1").shift();
    src += "jpg";
  }

  return src;
};

export const getIMDbProfile = async () => {
  const characters = require(resolve(__dirname, "../../wikiCharacters.json"));

  console.log(characters.length);
  for (let i = 0; i < characters.length; i++) {
    if (!characters[i].profile) {
      const url = `https://www.imdb.com/title/tt0944947/characters/${
        characters[i].nmId
      }`;
      console.log("正在爬取" + characters[i].name);
      const src = await fetchIMDbProfile(url);
      console.log("已经爬到" + src);
      characters[i].profile = src;

      writeFileSync(
        "./imdbCharacters.json",
        JSON.stringify(characters, null, 2),
        "utf8"
      );

      await sleep(500);
    }
  }
};

const checkIMDb = () => {
  const characters = require(resolve(__dirname, "../../imdbCharacters.json"));
  const newCharacters = [];

  characters.forEach(item => {
    if (item.profile) {
      newCharacters.push(item);
    }
  });

  writeFileSync(
    "./validCharacters.json",
    JSON.stringify(newCharacters, null, 2),
    "utf8"
  );
};

const fetchIMDbImage = async url => {
  const options = {
    uri: url,
    transform: body => cheerio.load(body)
  };

  const $ = await rp(options);
  let images = [];
  $("a.titlecharacters-image-grid__thumbnail-link img").each(
    function() {
      let src = $(this).attr('src');
      
      if (src) {
        src = src.split("_V1").shift();
        src += "jpg";
        images.push(src)
      }
    }
  );

  return images;
};

export const getIMDbImages = async () => {
  const characters = require(resolve(__dirname, "../../fullCharacters.json"));

  console.log(characters.length);
  for (let i = 0; i < characters.length; i++) {
    if (!characters[i].images) {
      const url = `https://www.imdb.com/title/tt0944947/characters/${
        characters[i].nmId
      }`;
      console.log("正在爬取" + characters[i].name);
      const images = await fetchIMDbImage(url);
      console.log("已经爬到" + images.length);
      characters[i].images = images;

      writeFileSync(
        "./fullCharacters.json",
        JSON.stringify(characters, null, 2),
        "utf8"
      );

      await sleep(500);
    }
  }
};

getIMDbImages()

// http://zh.asoiaf.wikia.com/api/v1/Search/Combined?query=Tyrion%20Lannister
// http://zh.asoiaf.wikia.com/api/v1/Articles/AsSimpleJson?id=117
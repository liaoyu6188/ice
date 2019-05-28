import rp from "request-promise";
import R from "ramda";
import _ from "lodash";
import { writeFileSync } from "fs";
import { resolve } from "path";
import { fetchImage } from "../libs/qiniu";
import randomToken from "random-token";

const normalizedContent = content =>
  _.reduce(
    content,
    (acc, item) => {
      if (item.text) acc.push(item.text);

      if (item.elements && item.length) {
        let _acc = normalizedContent(item.elements);

        acc = R.concat(acc, _acc);
      }

      return acc;
    },
    []
  );

const normalizedSections = R.compose(
  R.nth(1),
  R.splitAt(1),
  R.map(i => ({
    level: i.level,
    title: i.tilte,
    content: normalizedContent(i.content)
  }))
);

const getWikiId = async data => {
  const query = data.cname || data.name;
  const url = `https://asoiaf.fandom.com/zh/api/v1/Search/List?query=${encodeURI(
    query
  )}`;
  let res;
  try {
    res = await rp(url);
  } catch (e) {
    console.log(e);
  }

  res = JSON.parse(res);
  res = res.items[0];

  console.log(res.id);

  return R.merge(data, res);
};

const getWikiDetail = async data => {
  const { id } = data;
  const url = `http://asoiaf.fandom.com/zh/api/v1/Articles/AsSimpleJson?id=${id}`;
  let res;
  try {
    res = await rp(url);
  } catch (e) {
    console.log(e);
  }

  res = JSON.parse(res);
  const getCNameAndIntro = R.compose(
    i => ({
      cname: i.title,
      intro: R.map(R.prop(["text"]))(i.content)
    }),
    R.pick(["title", "content"]),
    R.nth(0),
    R.filter(R.propEq("level", 1)),
    R.prop("sections")
  );

  const getLevel = R.compose(
    R.project(["title", "content", "level"]),
    R.reject(R.propEq("title", "拓展阅读")),
    R.reject(R.propEq("title", "引用与注释")),
    R.filter(i => i.content.length),
    R.prop("sections")
  );

  const cnameIntro = getCNameAndIntro(res);
  let sections = getLevel(res);
  let body = R.merge(data, cnameIntro);

  sections = normalizedSections(sections);

  body.sections = sections;
  body.wikiId = id;

  return R.pick(
    [
      "name",
      "cname",
      "playedBy",
      "profile",
      "images",
      "nmId",
      "sections",
      "intro",
      "wikiId",
      "words"
    ],
    body
  );
};

export const getWIkiCharacters = async () => {
  let data = require(resolve(__dirname, "../../fullCharacters.json"));

  console.log(data.length);

  data = R.map(getWikiId, data);
  data = await Promise.all(data);
  console.log("获取 wiki Id");

  data = R.map(getWikiDetail, data);
  data = await Promise.all(data);
  console.log("获取 wiki 详细资料");

  writeFileSync(
    "./finalCharacters.json",
    JSON.stringify(data, null, 2),
    "utf8"
  );
};

export const fetchImageFromIMDb = async () => {
  let IMDbCharacters = require(resolve(
    __dirname,
    "../../finalCharacters.json"
  ));

  IMDbCharacters = R.map(async item => {
    try {
      let key = `${item.nmId}/${randomToken(32)}`;
      await fetchImage(item.profile, key);
      console.log(key)
      console.log(item.profile)
      console.log('upload done!')
      item.profile = key;

      for (let i = 0; i < item.images.length; i++) {
        let _key = `${item.nmId}/${randomToken(32)}`;
        await fetchImage(item.images[i], key);
        console.log(_key)
        console.log(item.images[i])
        await 100;
        item.images[i] = _key;
      }
    } catch (e) {
      console.log(e);
    }
    return item;
  })(IMDbCharacters);

  IMDbCharacters = await Promise.all(IMDbCharacters);
  writeFileSync(
    "./completeCharacters.json",
    JSON.stringify(IMDbCharacters, null, 2),
    "utf8"
  );
};

// http://prn0qeb5d.bkt.clouddn.com/'nm0372176/uadxof19x7uz2hl1cjq980je5ff3s3fv'
// http://prn0qeb5d.bkt.clouddn.com/%27nm0182666/5tptq62g25yb97h8m73452ga1yz6ood5%27
const HOUSES = [
  {
    name: "House Stark of Winterfell",
    cname: "史塔克家族",
    words: "Winter is Coming"
  },
  {
    name: "House Targaryen",
    cname: "坦格利安家族",
    words: "Fire and Blood"
  },
  {
    name: "House Lannister of Casterly Rock",
    cname: "兰尼斯特家族",
    words: "Hear Me Roar!"
  },
  {
    name: "House Arryn of the Eyrie",
    cname: "艾林家族",
    words: "As High as Honor"
  },
  {
    name: "House Tully of the Riverrun",
    cname: "徒利家族",
    words: "Family, Duty, Honor"
  },
  {
    name: "House Greyjoy of Pyke",
    cname: "葛雷乔伊家族",
    words: "We Do Not Sow"
  },
  {
    name: "House Baratheon of Storm's End",
    cname: "风息堡的拜拉席恩家族",
    words: "Ours is the Fury"
  },
  {
    name: "House Tyrell of Highgarden",
    cname: "提利尔家族",
    words: "Growing Strong"
  },
  {
    name: "House Nymeros Martell of Sunspear",
    cname: "马泰尔家族",
    words: "Unbowed, Unbent, Unbroken"
  }
];

export const getHouses = async () => {
  let data = R.map(getWikiId, HOUSES);

  data = await Promise.all(data);
  data = R.map(getWikiDetail, data);
  data = await Promise.all(data);

  writeFileSync("./wikiHouses.json", JSON.stringify(data, null, 2), "utf8");
};

export const getSwornMembers = () => {
  let houses = require(resolve(__dirname, "../../wikiHouses.json"));
  let characters = require(resolve(__dirname, "../../completeCharacters.json"));

  const findSwornMembers = R.map(R.compose(
    i => _.reduce(i, (acc, item) => {
      acc = acc.concat(item)

      return acc
    }, []),
    R.map(i => {
      let item = R.find(R.propEq('cname', i[0]))(characters)
      return {character: item.nmId, text: i[1]}
    }),
    R.filter(item => R.find(R.propEq('cname', item[0]))(characters)),
    R.map(i => {
      let item = i.split('，')
      let name = item.shift()

      return [name.replace(/(【|】|爵士|一世女王|三世国王|公爵|国王|王后|夫人|公主|王子)/g, ''), item.join('，')]
    }),
    R.nth(1),
    R.splitAt(1),
    R.prop('content'),
    R.nth(0),
    R.filter(i => R.test(/伊耿历三世纪末的/, i.title)),
    R.prop('sections')
  ))

  let swornMembers = findSwornMembers(houses);

  houses = _.map(houses, (item, index) => {
    item.swornMembers = swornMembers[index]
    return item
  })
  // console.log(houses)
  writeFileSync('./completeHouses.json', JSON.stringify(houses, null, 2), 'utf8')
};

fetchImageFromIMDb();

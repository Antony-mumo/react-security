const Nightmare = require("nightmare");
const assert = require("assert");
const { expect } = require("chai");
const mongoose = require("mongoose");
const config = require("../server/config/config");

const baseURL = "http://localhost:3000/";
const registerPage = baseURL + "register";

describe("Socblog Test Suite", function() {
  let nightmare = null;
  let page = null;
  let nightMareInstance = null;
  let connStatus = 0;
  const waitQuantum = 500;

  let currentUser = {
    username: "",
    email: "",
    password: ""
  };

  const ArticleSchema = new mongoose.Schema(
    {
      title: String,
      description: String,
      body: String,
      tagList: [{ type: String }]
    },
    { collection: "articles" }
  );

  const articleModel = mongoose.model("Article", ArticleSchema);

  async function cleanDB() {
    await mongoose.connect(config.mongoUri, {
      // await mongoose.connect("mongodb://172.17.0.2:27017/socblog_db", {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    const collections = await mongoose.connection.db.listCollections();
    const completions = [];
    await collections.forEach(collection => {
      completions.push(mongoose.connection.db.dropCollection(collection.name));
    });
    await Promise.all(completions);
  }

  // let runningIndex = 0;
  // function genHash() {
  //   return (
  //     ((Math.random() * Math.pow(36, 6)) | 0).toString(36).replace("_", "a") +
  //     (runningIndex++).toString()
  //   );
  // }

  function genHash() {
    return Math.random()
      .toString(11)
      .replace("0.", "");
  }

  function genRandomUser() {
    const user = "mocha" + genHash();
    return {
      username: user,
      email: user + "@mail.com",
      password: "000111000"
    };
  }

  function genRandomArticle() {
    return {
      title: "Article_" + genHash(),
      description: "Thats important...",
      body: "Suddently it happend again...",
      tags: ["News\n", "Sport\n", "Politics\n"]
    };
  }

  async function dumpPage(page) {
    let text = await page.evaluate(() => document.body.innerHTML);
    console.log(text);
  }

  async function init() {
    nightmare = Nightmare({
      electronPath: require("electron-prebuilt"),
      show: process.env.VISUAL ? true : false,
      // waitTimeout: 1000,
      // gotoTimeout: 1000,
      typeInterval: 20,
      pollInterval: 150
    });
  }

  async function goHome() {
    page = await page.click("#home");
    await age.wait(waitQuantum);
    return page;
  }

  async function goYourFeed() {
    page = await page.click("#your_feed");
    await page.wait(1000);
    return page;
  }

  async function goGlobalFeed() {
    page = await page.click("#global_feed");
    await page.wait(1000);
    return page;
  }

  const checkConnection = () => expect(connStatus).eq(200);

  async function registerUser(currentPage) {
    currentUser = genRandomUser();
    page = currentPage
      ? currentPage.goto(registerPage)
      : nightmare.goto(registerPage);

    await page
      .then(status => (connStatus = status.code))
      .catch(err => (connStatus = 500));

    if (connStatus !== 200) return;

    await page.wait("#username", 500);
    await page.type("#username", currentUser.username);
    await page.type("#email", currentUser.email);
    await page.type("#password", currentUser.password);
    await page.click("#submit");
    await page.wait(waitQuantum * 2);

    const currentURL = await page.url();
    expect(currentURL).to.be.eq(baseURL);
    return page;
  }

  async function finit() {
    if (page) await page.end();
    if (nightmare) await nightmare.end();
  }

  before(async () => {});

  beforeEach(async () => {
    await cleanDB();
    await init();
    await registerUser(null);
  });

  afterEach(async () => {
    return await finit();
  });

  //assumes home location
  async function createArticle(data) {
    await page.click("#new_post");
    await page.wait(".editor-page #title");
    await page.type("#title", data.title);
    await page.type("#description", data.description);
    await page.type("#body", data.body);

    if (data.tags && data.tags.length > 0) {
      //TBI: nm type does not handle enter properly
    }

    await page.click("#submit");
    await page.wait(waitQuantum);
    return page;
  }

  //does not work with current electron :(
  async function clearField(element) {
    return await page.evaluate(element => {
      var i = document.querySelector(element);
      i.select();
      i.value = "";
    });
  }

  async function clearArticleTitle() {
    return await page.evaluate(() => {
      var input = document.querySelector("#title");
      input.select();
      input.value = "";
      // var e = $.Event("keypress");
      // e.which = 13;
      // e.keyCode = 13;
      // $("#title").trigger(e);
    });
  }

  async function clearArticleDescription() {
    return await page.evaluate(() => {
      var input = document.querySelector("#description");
      input.select();
      input.value = "";
    });
  }

  async function clearArticleBody() {
    return await page.evaluate(() => {
      var input = document.querySelector("#body");
      input.select();
    });
  }

  async function updateArticle(data) {
    // await page.inject("js", __dirname + "/jquery.min.js");

    await page.click("#edit_article");
    await page.wait(".editor-page #title");
    await page.wait(waitQuantum / 5);

    await clearArticleTitle();
    await page.type("#title", data.title);

    await clearArticleDescription();
    await page.type("#description", data.description);

    await clearArticleBody();
    await page.type("#body", data.body);

    await page.click("#submit");
    await page.wait(waitQuantum);
    return page;
  }

  async function deleteArticle() {
    await page.click("#delete_article");
    await page.wait(waitQuantum);
    return page;
  }

  // it("Page not found - 404", async () => {
  //   checkConnection();
  //   await page.goto(baseURL + "some_random_url");
  //   const text = await page.evaluate(() => document.body.innerText);
  //   expect(text).to.be.eq("Page Not Found!");
  // });

  //ok
  it("Adding new article - success", async () => {
    checkConnection();
    const article = genRandomArticle();
    await createArticle(article);
    const currentURL = await page.url();
    expect(currentURL).to.include(article.title.toLowerCase()); //this is articl details page
  });

  //ok
  it("Adding new article - failure", async () => {
    checkConnection();
    const editorURL = "http://localhost:3000/editor";
    const article = genRandomArticle();
    article.title = ""; //invalidate article
    await createArticle(article);
    const currentURL = await page.url();
    expect(editorURL).to.be.eq(currentURL); //url stays the same
    const errorIsVisible = await page.visible(".article-error-item");
    expect(errorIsVisible).to.be.true;
    return await finit();
  });

  //Integrated with Follow/Unfollow
  //ok
  // it("Article list view - Your Feed tab, HOME page - success", async () => {
  //   checkConnection();
  //   const emptyFeedCaption = "No articles are here... yet.";
  //   const articlesText = await page.evaluate(() => {
  //     var sel = document.querySelector(".article-preview");
  //     if (sel) return sel.innerText;
  //     else return "";
  //   });

  //   expect(articlesText).to.be.eq(emptyFeedCaption);
  // });

  //TBD - pls check NOTES.md
  // xit("Article list view - Your Feed tab, HOME page - failure", async () => {});

  //ok
  it("Article list view - Global Feed tab, HOME page - success", async () => {
    checkConnection();
    const article = genRandomArticle();
    await createArticle(article);
    await page.goto(baseURL);
    await page.wait("#global_feed");
    const currentURL = await page.url();
    expect(currentURL).to.be.eq(baseURL); //this is articl details page
    await page.click("#global_feed");
    await page.wait(waitQuantum);
    const thereAreArticles = await page.evaluate(() => {
      var ap = document.querySelector(".preview-link");
      return ap ? true : false;
    });
    expect(thereAreArticles).to.be.true;
  });

  //TBD - pls check NOTES.md
  // xit("Article list view - Global Feed tab, HOME page - failure", async () => {});

  //ok
  it("On click of Read more... button, article card opens - success", async () => {
    checkConnection();
    const article = genRandomArticle();
    await createArticle(article);
    await page.goto(baseURL);
    await page.wait("#global_feed");
    let currentURL = await page.url();
    expect(currentURL).to.be.eq(baseURL); //this is articl details page
    await page.click("#global_feed");
    await page.wait(waitQuantum);
    const thereAreArticles = await page.evaluate(() => {
      var ap = document.querySelector(".preview-link");
      return ap ? true : false;
    });
    expect(thereAreArticles).to.be.true;
    await page.click(".read_more");
    await page.wait(waitQuantum);
    currentURL = await page.url();
    expect(currentURL).to.include("article/article_"); //check for partial article slug
  });

  //TBD - see NOTES.md
  // xit("On click of Read more... button, article card opens - failure", async () => {});

  //ok
  it("Update an existing article - success", async () => {
    checkConnection();
    const article = genRandomArticle();
    await createArticle(article);
    let currentURL = await page.url();
    expect(currentURL).to.include(article.title.toLowerCase()); //this is articl details page

    article.title = "aaa";
    article.body = "bbb";
    article.description = "ccc";

    await updateArticle(article);

    currentURL = await page.url();
    await page.screenshot("./update");
    expect(currentURL).to.include("article/article_"); //this is articl details page

    const docs = await articleModel.find(); //check db
    expect(docs.length).to.be.equal(1); //only one article was added
    expect(docs[0].title).to.be.equal(article.title);
    expect(docs[0].description).to.be.equal(article.description);
    expect(docs[0].body).to.be.equal(article.body);
  });

  //does not work - fields are not cleared properly in redux - to investigate
  /*
  xit("Update an existing article - failure", async () => {
    const article = genRandomArticle();
    await createArticle(article);
    let currentURL = await page.url();
    expect(currentURL).to.include(article.title.toLowerCase()); //this is articl details page

    const prevArticle = { ...article };
    //invalidate fields
    article.title = "";
    article.body = "";
    article.description = "";

    await updateArticle(article);

    //check current location - should be editor
    const editorURL = "http://localhost:3000/editor";
    currentURL = await page.url();
    expect(editorURL).to.be.eq(currentURL); //url stays the same

    //errors notifications should be visible
    const errorIsVisible = await page.visible(".article-error-item");
    expect(errorIsVisible).to.be.true;

    const docs = await articleModel.find();
    expect(docs.length).to.be.equal(1); //only one article was added
    expect(docs[0].title).to.be.equal(prevArticle.title);
    expect(docs[0].description).to.be.equal(prevArticle.description);
    expect(docs[0].body).to.be.equal(prevArticle.body);
  });
  */

  //ok
  it("Delete Article - success", async () => {
    checkConnection();
    const article = genRandomArticle();
    await createArticle(article);
    let currentURL = await page.url();
    expect(currentURL).to.include(article.title.toLowerCase()); //this is articl details page

    await deleteArticle();

    //shold be navigated to home page
    const url = await page.url();
    expect(url).to.be.eq(baseURL);

    //articles collection in db must be clean
    const docs = await articleModel.find();
    expect(docs.length).to.be.equal(0);
  });

  //common plot:
  // first user flow
  // - create user and article
  // - logout
  // second user flow
  // - register another user
  // - go go global feed
  // - choose author
  // - press follow / unfollow
  // - go to your feed
  // - check result

  //ok
  it("On click of Follow button - follow", async () => {
    checkConnection();
    //first user flow
    const firstUser = currentUser.username;
    const article = genRandomArticle();
    await createArticle(article);
    let currentURL = await page.url();
    expect(currentURL).to.include(article.title.toLowerCase()); //this is articl details page
    await page.click("#settings");
    await page.wait("#logout");
    await page.click("#logout");
    await page.wait(waitQuantum);
    currentURL = await page.url();
    expect(currentURL).to.be.eq(baseURL);

    //second user
    await registerUser(page);
    await page.wait("#global_feed");
    await page.click("#global_feed");
    await page.wait("a.author");
    await page.click("a.author");

    await page.wait("#follow_ctrl_btn");
    await page.click("#follow_ctrl_btn");
    await page.wait(waitQuantum * 2);

    await page.wait("#home").click("#home");
    await page.wait("#your_feed").wait(waitQuantum);
    await page.click("#your_feed");
    await page.wait(".article-preview").wait(waitQuantum);

    const followed = await page.visible("a.author");
    expect(followed).to.be.true;
  });

  //ok
  it("On click of Follow button - unfollow", async () => {
    checkConnection();
    const firstUser = currentUser.username;
    const article = genRandomArticle();
    await createArticle(article);
    let currentURL = await page.url();
    expect(currentURL).to.include(article.title.toLowerCase()); //this is articl details page
    await page.click("#settings");
    await page.wait("#logout");
    await page.click("#logout");
    await page.wait(waitQuantum);
    currentURL = await page.url();
    expect(currentURL).to.be.eq(baseURL);

    //second user
    await registerUser(page);
    await page.wait("#global_feed");
    await page.click("#global_feed");
    await page.wait("a.author");
    await page.click("a.author");

    await page.wait("#follow_ctrl_btn");
    await page.click("#follow_ctrl_btn");
    await page.wait(waitQuantum);
    await page.click("#follow_ctrl_btn");
    await page.wait(waitQuantum / 5);
    await page.click("#home");
    await page.wait("#your_feed");
    await page.click("#your_feed");
    await page.wait(waitQuantum);

    const followed = await page.visible("a.author");
    expect(followed).to.be.false;
  });

  //ok
  it("On click on the “Favorite Article” button - mark favorite", async () => {
    checkConnection();
    const firstUser = currentUser.username;
    const article = genRandomArticle();
    await createArticle(article);
    let currentURL = await page.url();
    expect(currentURL).to.include(article.title.toLowerCase()); //this is articl details page
    await page.click("#settings");
    await page.wait("#logout");
    await page.click("#logout");
    await page.wait(waitQuantum);
    currentURL = await page.url();
    expect(currentURL).to.be.eq(baseURL);

    //second user
    await registerUser(page);
    await page.wait("#global_feed");
    await page.click("#global_feed");
    // console.log(1);
    await page.wait("a.author");
    await page.click(".fav_ctrl");
    await page.wait(waitQuantum / 5);
    await page.click("#my_profile");
    // console.log(2);
    await page.wait("#favorited_articles");
    await page.click("#favorited_articles");
    // console.log(3);
    await page.wait("a.author");
    const favorites = await page.visible("a.author");
    expect(favorites).to.be.true;
  });

  //ok
  it("On click on the “Favorite Article” button - mark unfavorite", async () => {
    checkConnection();
    const firstUser = currentUser.username;
    const article = genRandomArticle();
    await createArticle(article);
    let currentURL = await page.url();
    expect(currentURL).to.include(article.title.toLowerCase()); //this is articl details page
    await page.click("#settings");
    await page.wait("#logout");
    await page.click("#logout");
    await page.wait(waitQuantum);
    currentURL = await page.url();
    expect(currentURL).to.be.eq(baseURL);

    //second user
    await registerUser(page);
    await page.wait("#global_feed");
    await page.click("#global_feed");
    await page.wait("a.author");
    await page.click(".fav_ctrl");
    await page.wait(waitQuantum);
    await page.click("#my_profile");
    await page.wait(waitQuantum);
    await page.wait("#favorited_articles");
    await page.click("#favorited_articles");
    await page.wait("a.author");
    let favorites = await page.visible("a.author");
    expect(favorites).to.be.true;

    await page.wait(waitQuantum * 1.5);

    //unfavorite article
    await page.click(".fav_ctrl");
    await page.wait("#my_articles").wait(waitQuantum / 5);
    await page.click("#my_articles");
    // console.log(1);
    await page.wait(".article-preview").wait(waitQuantum / 5);
    // console.log(2);
    await page.wait("#favorited_articles").wait(waitQuantum / 5);
    await page.click("#favorited_articles");
    // console.log(3);
    await page.wait(".article-preview");
    favorites = await page.visible("a.author");
    expect(favorites).to.be.false;
  });
});
"use strict"

const
  router = require('koa-router')(),
  app = require('koa')(),
  parse = require('co-body'),
  db = require("./db/orm");

router.get('/', function* () {
    this.body = 'Hello World';
});

router.post('/sms', function* (next) {
    this.body = 'Hello World';
    /*let post = ["MessageSid",
				"SmsSid",
				"AccountSid",
				"MessagingServiceSid",
				"From",
				"To",
				"Body",
				"NumMedia"]
    post.map(i => console.log(this.request.body[i]));*/
    let tell = function(info) { return info };
    let eat = yield parse(this);
    console.log(eat);
}); 

app
  .use(router.routes())
  .use(router.allowedMethods());


app.listen(3000);
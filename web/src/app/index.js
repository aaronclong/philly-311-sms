"use strict";

const
  router = require("koa-router")(),
  app = require("koa")(),
  parse = require("co-body"),
  { getAllMessages } = require("./db/queries"),
  { Response } = require("./response");

//returns Boolean true if exists
let checkParams = (data) => {
  let status = true;
  let params = ["Body", "From", "MessageSid"];
  params.forEach( i => {
    if (data[i] === 'undefined') status = false;
  });
  return status;
}

router.get("/", function* () {
    this.body = "Under Construction";
});

router.post("/sms", function* (next) {
  let params = yield parse(this);
  if (!checkParams(params)) {
        this.body = "One or more fields are missing!";
        return;
  }
  let response = new Response(params);
  response.defUser();
  this.body = response.returnMessage();
}); 

app
  .use(router.routes())
  .use(router.allowedMethods());


app.listen(3000);
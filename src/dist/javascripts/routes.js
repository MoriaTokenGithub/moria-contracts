'use strict';

var express = require('express');
var app = express();

var api = require("./api.js");
api.init();

app.get('/', function (req, res) {
  return res.send('Hello World!');
});

app.get('/api/balance/:address', function (req, res) {
  return api.getBalance(req.params["address"]).then(function (result) {
    res.send({ "total": result });
  });
});

app.get('/api/total', function (req, res) {
  return api.getTotalTokens().then(function (result) {
    res.send({ "total": result });
  });
});

app.get('/api/dividends/:address', function (req, res) {
  return api.getOutstandingDividends(req.params["address"]).then(function (result) {
    res.send({ "owed": result });
  });
});

app.get('/api/pay/:address', function (req, res) {
  return api.payOutstandingDividends(req.params["address"], function (value) {
    console.log(value);
  }).then(function (result) {
    res.send(result);
  });
});

app.get('/api/mint/:address/:amount', function (req, res) {
  var address = req.params["address"];
  var amount = req.params["amount"];
  api.mintTokens(address, amount, function (minted) {
    console.log("minted = " + minted);
  }).then(function (result) {
    res.send(result);
  });
});

app.listen(3000, function () {
  return console.log('API active on port 3000!');
});
//# sourceMappingURL=routes.js.map
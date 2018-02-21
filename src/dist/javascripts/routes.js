'use strict';

var request = require('request');
var express = require('express');
var bodyParser = require('body-parser');
var app = express();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

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

app.post('/api/pay/', function (req, res) {
  var params = req.body;
  var address = params['address'];
  var callback = params['callback'];
  var created = Date.now;
  var completed = 0;

  api.payOutstandingDividends(address, function (value) {
    console.log(value);
    completed = Date.now;
  }).then(function (result) {
    request.post(address, { json: { "success": value,
        "completed": completed,
        "created": created } }, function (error, response, body) {
      if (!error && response.statusCode == 200) {
        console.log(body);
      }
    });
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

app.post('/test/callback', function (req, res) {
  console.log(req.body);
  res.send(req.body["poo"]);
});

app.post('/api/mint/:address/:amount', function (req, res) {});

app.listen(3000, function () {
  return console.log('API active on port 3000!');
});
//# sourceMappingURL=routes.js.map
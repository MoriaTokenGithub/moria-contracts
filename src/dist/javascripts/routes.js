'use strict';

var request = require('request');
var express = require('express');
var bodyParser = require('body-parser');
var app = express();

var lockExpiry = 1000 * 20; // 20 seconds
var paymentLock = {};

var lockAddress = function lockAddress(address) {
  paymentLock[address] = Date.now() + lockExpiry;
};

var unlockAddress = function unlockAddress(address) {
  paymentLock[address] = 0;
};

var isLocked = function isLocked(address) {
  if (paymentLock[address] == undefined) {
    return false;
  }
  return paymentLock[address] >= Date.now();
};

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
  if (isLocked(req.params["address"])) {}
  api.payOutstandingDividends(req.params["address"], function (value) {
    console.log(value);
  }).then(function (result) {
    res.send(result);
  });
});

app.post('/api/pay/', function (req, res) {
  var params = req.body;
  var address = params['address'];
  var callback = params['callback'];
  var created = Date.now();
  var completed = 0;

  console.log("address = " + address + " callback = " + callback);

  api.payOutstandingDividends(address, function (value) {
    console.log("pay dividend callback");
    console.log(value);
    completed = Date.now();
  }).then(function (result) {
    console.log("posting to: " + callback);
    request.post(callback, { body: {
        "completed": completed,
        "success": result,
        "created": created },
      json: true }, function (error, response, body) {
      if (!error && response.statusCode == 200) {
        console.log(body);
      }
    });
    res.send("OK!");
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
  console.log("test callback...");
  res.send(req.body);
});

app.post('/api/mint/:address/:amount', function (req, res) {});

app.listen(3000, function () {
  return console.log('API active on port 3000!');
});
//# sourceMappingURL=routes.js.map
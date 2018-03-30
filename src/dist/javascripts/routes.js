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
  api.payOutstandingDividends(req.params["address"], function (value) {
    console.log(value);
  }).then(function (result) {
    console.log("executed");
  });
  res.send("submitted");
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
        "created": created,
        "address": address },
      json: true }, function (error, response, body) {
      if (!error && response.statusCode == 200) {
        console.log(body);
      } else {
        console.log(error);
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

app.get('/test/dividend/:amount', function (req, res) {
  api.payDividend(req.params["amount"]).then(function (result) {
    res.send(result);
  });
});

app.get('/test/transfer/:to/:amount', function (req, res) {
  api.transfer(req.params["to"], req.params["amount"]).then(function (result) {
    res.send(result);
  });
});

app.post('/api/mint/:address/:amount', function (req, res) {});

app.get('/api/history/:address/', function (req, res) {
  var claimedTo;
  api.claimedTo(req.params["address"]).then(function (_claimedTo) {
    claimedTo = _claimedTo;
    return api.dividendHistory(req.params["address"]);
  }).then(function (history) {
    var historyObj = [];
    console.log('claimed to ' + claimedTo);
    for (var i = 0; i < history.length; i++) {
      var withdrawal = 0;
      if (i < claimedTo) {
        withdrawal = Date.now();
      }
      console.log('adding history data');
      if (history[i]["amount"] != null) {
        historyObj.push({ 'id': i,
          'amount': history[i]["amount"],
          'date': history[i]["date"],
          'withdrawal_date': withdrawal,
          'wallet': req.params["address"] });
      }
    }
    console.log(historyObj);
    res.send(historyObj);
  });
});

app.get('/api/ac/:address', function (req, res) {
  api.accountBalance(req.params["address"]).then(function (r) {
    res.send(r);
  });
});

app.get('/api/lock/:address', function (req, res) {
  api.lock(req.params["address"]).then(function (r) {
    res.send(r);
  });
});

app.get('/api/unlock/:address', function (req, res) {
  api.unlock(req.params["address"]).then(function (r) {
    res.send(r);
  });
});

app.listen(3000, function () {
  return console.log('API active on port 3000!');
});
//# sourceMappingURL=routes.js.map
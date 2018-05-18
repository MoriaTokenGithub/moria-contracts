const request = require('request');
const express = require('express')
const bodyParser = require('body-parser');
const app = express()

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json())

var api = require("./api.js")

var txLookup = {}

function registerRequest(address, tx, period) {
  if(txLookup[address] == null) {
    txLookup[address] = {};
  }
  txLookup[address][period] = {"tx" : tx,
                               "time" : Date.now()};
}

function pending(address, period) {
  if(txLookup[address] == null) {
    return false;
  }
  if(txLookup[address][period] == null) {
    return false;
  }
  return txLookup[address][period]["time"] <= new Date(Date.now().getTime() + 120*60000);
}

api.init();

app.get('/', (req, res) => res.send('Hello World!'))

app.get('/api/balance/:address', (req, res) => 
        api.getBalance(req.params["address"]).then(function(result) {
          res.send({"total" : result});
        }));

app.get('/api/total', (req, res) => 
        api.getTotalTokens().then(function(result) {
          res.send({"total" : result});          
        }));

app.get('/api/dividends/:address', (req, res) =>
        api.getOutstandingDividends(req.params["address"]).then(function(result) {
          res.send({"owed" : result});
        }));

app.get('/api/pay/:address', (req, res) => {
  api.payOutstandingDividends(req.params["address"], function (value) {console.log(value);} ).then(function(result) {
    console.log("executed");
  })
  res.send("submitted");
});

app.post('/api/pay/', (req, res) => {
  var params = req.body;
  var address = params['address'];
  var callback = params['callback'];
  var created = Date.now();
  var completed = 0;

  var outstanding = 0;

  console.log("address = " + address + " callback = " + callback);

  api.getOutstandingDividends(address, function(o) {
    outstanding = o;
    return api.currentPeriod();
  }).then(function(p) {
    if(outstanding > 0 && !pending(address, p)) {
      return  api.payOutstandingDividends(address, function(value) {
        console.log("pay dividend callback");
        console.log(value);
        completed = Date.now();
      });
    } else {
      return new Promise(function(resolve, reject) {
        resolve(false);
      });
    }
  }).then(function(result) {
    console.log("posting to: " + callback);
    request.post(callback,
                 {body: {
                   "completed" :  completed,
                   "success" : result,
                   "created" :  created,
                   "address" : address,
                   "_amount" : outstanding},
                  json: true},
                 function (error, response, body) {
                   if (!error && response.statusCode == 200) {
                     console.log(body)
                   } else {
                     console.log(error)
                   }
                 });
    res.send("OK!");
  })});


app.get('/api/mint/:address/:amount', (req, res) => {
  var address = req.params["address"];
  var amount = req.params["amount"];
  api.mintTokens(address, amount, function (minted) {
    console.log("minted = " + minted)}).then(function(result) {
      res.send(result);
    })});

app.post('/test/callback', (req, res) => {
  console.log("test callback...");
  res.send(req.body);
});

app.get('/test/dividend/:amount', (req, res) => {
  api.payDividend(req.params["amount"]).then(function(result) {
    res.send(result);
  });
});

app.get('/test/transfer/:to/:amount', (req, res) => {
  api.transfer(req.params["to"], req.params["amount"]).then(function(result) {
    res.send(result);
  });
});

app.post('/api/mint/:address/:amount', (req, res) => {});

app.get('/api/history/:address/', (req, res) => {
  var claimedTo;
  api.claimedTo(req.params["address"]).then(function(_claimedTo) {
    claimedTo = _claimedTo;
    return api.dividendHistory(req.params["address"]);
  }).then(function(history) {
    var historyObj = [];
    console.log('claimed to ' + claimedTo);
    for(var i = 0; i < history.length; i++) {
      var withdrawal = 0;
      if(i < claimedTo) {
        withdrawal = Date.now();
      }
      console.log('adding history data');
      if (history[i]["amount"] != null) {
        historyObj.push({'id' : i,
                         'amount' : history[i]["amount"],
                         'date' : history[i]["date"],
                         'withdrawal_date' : withdrawal,
                         'wallet' : req.params["address"]});
      } 
    }
    console.log(historyObj);
    res.send(historyObj);
  });
});

app.get('/api/ac/:address', (req, res) => {
  api.accountBalance(req.params["address"]).then(function(r) {
    res.send(r);
  });
});

app.get('/api/lock/:address', (req, res) => {
  api.lock(req.params["address"]).then(function(r) {
    res.send(r);
  });
});

app.get('/api/unlock/:address', (req, res) => {
  api.unlock(req.params["address"]).then(function(r) {
    res.send(r);
  });
});

app.listen(3000, () => console.log('API active on port 3000!'))


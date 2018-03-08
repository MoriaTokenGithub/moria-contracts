const request = require('request');
const express = require('express')
const bodyParser = require('body-parser');
const app = express()

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json())

var api = require("./api.js")
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

  console.log("address = " + address + " callback = " + callback);

  api.payOutstandingDividends(address, function(value) {
    console.log("pay dividend callback");
    console.log(value);
    completed = Date.now();
  }).then(function(result) {
    console.log("posting to: " + callback);
    request.post(callback,
                 {body: {
                   "completed" :  completed,
                   "success" : result,
                   "created" :  created,
                   "address" : address},
                  json: true},
                 function (error, response, body) {
                   if (!error && response.statusCode == 200) {
                     console.log(body)
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

app.post('/api/mint/:address/:amount', (req, res) => {});

app.get('/api/history/:address/', (req, res) => {
  api.dividendHistory(req.params["address"]).then(function(history) {
    var historyObj = [];
    console.log('constructing history...');
    for(var i = 0; i < history.length; i++) {
      console.log('adding history data');
      historyObj.push({'id' : i,
                       'amount' : history[i],
                       'date' : Date.now(),
                       'withdrawal_date' : Date.now(),
                       'wallet' : req.params["address"]});
    }
    console.log(historyObj);
    res.send(historyObj);
  });
});

app.listen(3000, () => console.log('API active on port 3000!'))

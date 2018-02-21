const express = require('express')
const app = express()

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

app.get('/api/pay/:address', (req, res) =>
        api.payOutstandingDividends(req.params["address"], function (value) {console.log(value);} ).then(function(result) {
          res.send(result);
        }));

app.post('/api/pay/', (req, res) => {
  var params = req.body;
  var address = params['address'];
  var callback = params['callback'];
});

app.get('/api/mint/:address/:amount', (req, res) => {
  var address = req.params["address"];
  var amount = req.params["amount"];
  api.mintTokens(address, amount, function (minted) {
    console.log("minted = " + minted)}).then(function(result) {
      res.send(result);
    })});

app.post('/api/mint/:address/:amount', (req, res) => {});

app.listen(3000, () => console.log('API active on port 3000!'))

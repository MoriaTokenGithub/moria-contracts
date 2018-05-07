/*
* These tests are written for testrpc by TheLedger.
*/

var MoriaToken = artifacts.require("./MoriaToken.sol");

contract('MoriaToken', function(accounts) {

    var metaMoria;
    var metaMoriaBuyback;

    it('Should be able to use the constructor', function(done) {
        
        MoriaToken.new(20000000, 3,1508006504).then(
            function(moria) {
                metaMoriaBuyback = moria;
                metaMoriaBuyback.decimals.call().then(
                    function(decimals) {
                        assert.equal(decimals.toNumber(), 3);
                        done();
                    }).catch(done);
        }).catch(done);
    });
    
    it("Should be initialized with the right name", function() {        
        return MoriaToken.deployed().then(function(instance) {
            metaMoria = instance;
            return metaMoria.name.call();        
        }).then(function(name){
            return assert.equal(name,"Moria dividend token", "Should be Moria dividend token");
        })
        ;
    });

    // test balanceOf + transfer
    it("Test balanceOf + transfer method", function() {        
        return MoriaToken.deployed().then(function(instance) {
            metaMoria = instance;
            return metaMoria.balanceOf(accounts[0]);        
        }).then(function(balance){
            return assert.equal(balance.toNumber(),100000000, "Should be 100000000");
        }).then(function(){
            return metaMoria.transfer(accounts[1],2000000);
        }).then(function(){
            return metaMoria.balanceOf(accounts[0]);        
        }).then(function(balance){
            return assert.equal(balance.toNumber(),98000000, "Should be 98000000");
        }).then(function(){
            return metaMoria.balanceOf(accounts[1]);        
        }).then(function(balance){
            return assert.equal(balance.toNumber(),2000000, "Should be 2000000");
        })
        ;
    });

    // test transferfrom with the approve method
    it("Should fail because cannot transfer more than allowed", function() {   
        var inThen=false;
    
        return MoriaToken.deployed().then(function(instance) {
            metaMoria = instance;
            return metaMoria.transfer(accounts[0], "2000001", {from: accounts[1]});
        }).then(function(){
            inThen = true;
            return assert.ok(false,"Should fail.")
        }).catch(function(err){
            if(inThen){
                assert.ok(false,"Should have failed because sends 1 more than allowed");
            } else {
                assert.ok(true,"Failed successfull");
            }
        })
        ;
    });

    // test payin
    it("Should have 1ETH in the contract through the payin function", function() {        
        return MoriaToken.deployed().then(function(instance) {
            metaMoria = instance;
            // period 0
            return metaMoria.payIn({from: accounts[0], value:1000000000000000000});        
        }).then(function(){
            return web3.eth.getBalance(metaMoria.address);
        }).then(function(balance){
            return assert.equal(balance.toNumber(),"1000000000000000000","Should have 1 ETH in the contract thanks to the payin method");            
        })
        ;
    }); 


    // test adding admin
    it("Should add accounst[1] as an admin", function() {   
        var inThen=false;
        return MoriaToken.deployed().then(function(instance) {
            metaMoria = instance;
            // payin is only for admins - period 1
            return metaMoria.payIn({from: accounts[1], value:2000000000000000000});        
        }).then(function(){
            inThen = true;
            return assert.ok(false,"Should fail")
        }).catch(function(err){
            if(inThen){
                return assert.ok(false,"Should have failed because of an invalid address");
            }else{
                return assert.ok(true,"Failed successfull");
            }
        }).then(function(){
            return metaMoria.addAdmin(accounts[1]);
        }).then(function(){
            return metaMoria.payIn({from: accounts[1], value:2000000000000000000});                    
        })
        ;
    });

    // test revoking own as admin
  it("Should not revoke itself as admin", function() {   
    var inThen=false;

    return MoriaToken.deployed().then(function(instance) {
        metaMoria = instance;
        // payin is only for admins - period 2
        return metaMoria.payIn({from: accounts[1], value:3000000000000000000});        
    }).then(function(){
        return metaMoria.revokeAdmin(accounts[1],{from: accounts[1]});
    }).then(function(){
        inThen = true;
        return assert.ok(false,"Should fail")
    }).catch(function(err){
        if(inThen){
            assert.ok(false,"Should have failed because cannot revoke itself as an admin");
        }else{
            assert.ok(true,"Failed successfull");
        }
    })
    ;
});

    // test revoking admin
    it("Should have revoked accounts[1]", function() {   
        var inThen=false;
    
        return MoriaToken.deployed().then(function(instance) {
            metaMoria = instance;
            // payin is only for admins - period 3
            return metaMoria.payIn({from: accounts[1], value:5000000000000000000});        
        }).then(function(){
            return metaMoria.revokeAdmin(accounts[1],{from: accounts[0]});
        }).then(function(){
            return metaMoria.payIn({from: accounts[1], value:1000000000000000000});        
        }).then(function(){
            inThen = true;
            return assert.ok(false,"Should fail")
        }).catch(function(err){
            if(inThen){
                assert.ok(false,"Should have failed because he is no longer an admin");
            }else{
                assert.ok(true,"Failed successfull");
            }
        })
        ;
    });

    // test onlyAdmin modifier
    it("Should not add admin when not an admin. Test onlyAdmin modifier", function() {   
        var inThen=false;

        return MoriaToken.deployed().then(function(instance) {
            metaMoria = instance;
            // payin is only for admins
            return metaMoria.addAdmin(accounts[2],{from: accounts[3]});
        }).then(function(){
            inThen = true;
            return assert.ok(false,"Should fail.")
        }).catch(function(err){
            if(inThen){
                assert.ok(false,"Should have failed because he's not an admin");
            } else {
                assert.ok(true,"Failed successfull");
            }
        })
        ;
    });


    // test payin
    it("Should not use payin when not an admin", function() {   
        var inThen=false;
        
        return MoriaToken.deployed().then(function(instance) {
            metaMoria = instance;
            return metaMoria.payIn({from: accounts[2], value:1000000000000000000});        
        }).then(function(){
            inThen = true;
            return assert.ok(false,"Should fail")
        }).catch(function(err){
            if(inThen){
                assert.ok(false,"Should have failed because accounts[2] is not an admin");
            } else {
                assert.ok(true,"Failed successfull");
            }
        });
        ;
    });

    it("Should claim the right amount of dividend for accounts[1]", function() {
        return MoriaToken.deployed().then(function(instance) {
            metaMoria = instance;
            return web3.eth.getBalance(metaMoria.address);
        }).then(function(balance){
            // The contract should have 11ETH in total
            assert.equal(balance.toNumber(),"11000000000000000000", "Should have 11ETH in the contract");
            return metaMoria.claimDividends.call({from: accounts[1]});
        }).then(function(dividend){
            assert.equal(dividend.toNumber(),"220000000000000000", "Should have 0.22ETH as dividend");
            return metaMoria.outstanding.call({from:accounts[1]});                        
        }).then(function(outstanding){
            assert.equal(outstanding.toNumber(),"220000000000000000", "Should have 0.22ETH as outstanding");
            return metaMoria.claimDividends({from: accounts[1]});
        }).then(function(){
            return web3.eth.getBalance(metaMoria.address);            
        }).then(function(balance){
            // The contract should have 10.78ETH in total
            return assert.equal(balance.toNumber(),"10780000000000000000", "Should have 10.78ETH in the contract");
        }).then(function(){
            return metaMoria.claimDividends({from: accounts[1]});
        }).then(function(){
            return metaMoria.claimDividends.call({from: accounts[1]});
        }).then(function(dividend){
            assert.equal(dividend.toNumber(),"0", "Should have 0 ETH as dividend");
            return metaMoria.outstanding.call({from:accounts[1]});                        
        }).then(function(outstanding){
            assert.equal(outstanding.toNumber(),"0", "Should have 0 ETH as outstanding");
        })
    });    
    
    //not claimall twice
    it("Should not claim twice for accounts[1]", function() {
        return MoriaToken.deployed().then(function(instance) {
            metaMoria = instance;
            return web3.eth.getBalance(metaMoria.address);
        }).then(function(balance){
            // The contract should have 11ETH in total.
            assert.equal(balance.toNumber(),"10780000000000000000", "Should have 10.78ETH in the contract");
            return metaMoria.claimDividends({from: accounts[1]});
        }).then(function(){
            return web3.eth.getBalance(metaMoria.address);            
        }).then(function(balance){
            // The contract should have 11ETH in total.
            assert.equal(balance.toNumber(),"10780000000000000000", "Should have 10.78ETH in the contract");
        })
    });        

    /* Not relevant after new claimDividends method

    // Does not work because the updateHoldings method is not called when claiming for period 0.
    // But works when we transfer some tokens. The updateHoldings will be invoked
    it("Should claim the right amount of tokens at the right period for account 1 for period 1", function() {
        return MoriaToken.deployed().then(function(instance) {
            metaMoria = instance;
            return web3.eth.getBalance(metaMoria.address);
        }).then(function(balance){
            // The contract should have 11ETH in total.
            assert.equal(balance.toNumber(),"11000000000000000000", "Should have 11ETH in the contract");
            // transfer to trigger the updateHoldings.
            return metaMoria.transfer(accounts[7],100,{from: accounts[1]});
        }).then(function(){
            return metaMoria.claim.call(1, {from: accounts[1]});
        }).then(function(claim){
            // account 1 has 2% of the tokens in period 1. 
            // In period 0 there was 2 ETH in the contract.
            return assert.equal(claim.toNumber(),"40000000000000000", "Should have 0.04ETH to claim");
        }).then(function(){
            return metaMoria.outstandingAt.call(1,{from:accounts[1]});
        }).then(function(outstanding){
            return assert.equal(outstanding.toNumber(),"40000000000000000", "Should have 0.04ETH outstanding");
        }).then(function(){
            // claim the 0.02ETH
            return metaMoria.claim(1, {from: accounts[1]});            
        }).then(function(){
            return web3.eth.getBalance(metaMoria.address);
        }).then(function(balance){
            assert.equal(balance.toNumber(),"10960000000000000000","Should have 10.96ETH in the contract");
        })
    });

    // test claim - In previous tests the payin method is called 4 times
    it("Should claim the right amount of tokens at the right period for account 1 for period 0", function() {
        var startBalance;

        return MoriaToken.deployed().then(function(instance) {
            metaMoria = instance;
            return web3.eth.getBalance(accounts[1]);
        }).then(function(balance){
            startBalance = balance.toNumber();
            return web3.eth.getBalance(metaMoria.address);
        }).then(function(balance){
            // The contract should have 11ETH in total. Spread over 4 periods
            assert.equal(balance.toNumber(),"10960000000000000000", "Should have 10.96ETH in the contract");
            return metaMoria.claim.call(0, {from: accounts[1]});
        }).then(function(claim) {
            // account 1 has 2% of the tokens in period 0. 
            // In period 0 there was 1 ETH in the contract.
            assert.equal(claim.toNumber(),"20000000000000000", "Should have 0.02ETH to claim");
            return metaMoria.outstandingAt.call(0,{from:accounts[1]});           
        }).then(function(outstanding){
            assert.equal(outstanding.toNumber(),"20000000000000000", "Should have 0.02ETH outstanding");
            // claim the 0.02ETH
            return metaMoria.claim(0, {from: accounts[1]}); 
        }).then(function(){
            return web3.eth.getBalance(metaMoria.address);
        }).then(function(balance){
            assert.equal(balance.toNumber(),"10940000000000000000","Should have 10.94ETH in the contract");
            return web3.eth.getBalance(accounts[1]);
        }).then(function(balance){
            assert.ok(balance.toNumber() > startBalance, "Should be more");
        })
    });

    
    it("Should not claim twice for the same period", function() {
        var inThen=false;
        
        return MoriaToken.deployed().then(function(instance) {
            metaMoria = instance;
            return metaMoria.claim(0, {from: accounts[1]});            
        }).then(function(){
            inThen = true;
            return assert.ok(false,"Should fail")
        }).catch(function(err){
            if(inThen){
                assert.ok(false,"Should have failed because can not claim twice");
            } else {
                assert.ok(true,"Failed successfull");
            }
        });
    });
*/


    // test outstandingAt
    it("Should return the right outstanding for account 0 at period 0", function() {
        
        return MoriaToken.deployed().then(function(instance) {
            metaMoria = instance;
            return metaMoria.outstandingAt.call(0, {from: accounts[0]});            
        }).then(function(outstanding){
            assert.equal(outstanding.toNumber(), "980000000000000000", "Outstanding should be 980000000000000000");
        })
        ;
    });

    // test outstanding
    it("Should return the right outstanding for account 0 at all periods", function() {
            
        return MoriaToken.deployed().then(function(instance) {
            metaMoria = instance;
            return metaMoria.outstanding.call({from: accounts[0]});                        
        }).then(function(outstanding){
            // has 98% of all tokens during all 4 periods.
            // So his outstanding will be 10.78 ETH
            assert.equal(outstanding.toNumber(), "10780000000000000000", "Should be 10.78ETH as outstanding");
        })
        ;
    });



    it("Should claim the right amount of dividend for accounts[0]", function() {
        return MoriaToken.deployed().then(function(instance) {
            metaMoria = instance;
            return web3.eth.getBalance(metaMoria.address);
        }).then(function(balance){
            // The contract should have 10.78ETH in total.
            assert.equal(balance.toNumber(),"10780000000000000000", "Should have 10.78ETH in the contract");
            return metaMoria.claimDividends({from: accounts[0]});
        }).then(function(){
            return web3.eth.getBalance(metaMoria.address);            
        }).then(function(balance){
            // The contract should have 0 ETH in total.
            assert.equal(balance.toNumber(),0, "Should have 0ETH in the contract");
        });
    }); 

    it("Should claim the right amount of dividend for accounts[0] after using paying again", function() {
        return MoriaToken.deployed().then(function(instance) {
            metaMoria = instance;
            return web3.eth.getBalance(metaMoria.address);
        }).then(function(balance){
            // The contract should have 0ETH in total
            assert.equal(balance.toNumber(),0, "Should have 0ETH in the contract");
            // send 1 ETH in the contract
            return metaMoria.payIn({from: accounts[0], value: 1000000000000000000});
        }).then(function(){
            return web3.eth.getBalance(metaMoria.address);            
        }).then(function(balance){
            // The contract should have 1ETH in total
            return assert.equal(balance.toNumber(),"1000000000000000000", "Should have 1ETH in the contract");
        }).then(function(){
            return metaMoria.outstanding.call({from: accounts[0]});                        
        }).then(function(outstanding){
            return assert.equal(outstanding.toNumber(),"980000000000000000", "Should have 0.98ETH as outstanding");
        }).then(function(){
            return metaMoria.claimDividends.call({from: accounts[0]});
        }).then(function(dividend){
            return assert.equal(dividend.toNumber(),"980000000000000000", "Should have 0.98ETH as outstanding");
        }).then(function(){
            return metaMoria.claimDividends({from: accounts[0]});
        }).then(function(){
            return web3.eth.getBalance(metaMoria.address);            
        }).then(function(balance){
            // The contract should have 0.02ETH in total
            return assert.equal(balance.toNumber(),"20000000000000000", "Should have 0.02ETH in the contract");
        })
        ;
    });

    /* Not relevant after claimDividends method

    //test claimAll
    it("Should use the claimAll method properly", function() {

        return MoriaToken.deployed().then(function(instance) {
            metaMoria = instance;
            return web3.eth.getBalance(metaMoria.address);                        
        }).then(function(balance){
            // should be 10.94ETH
            return assert.equal(balance.toNumber(),"10940000000000000000", "Should be 10940000000000000000");
        }).then(function(balance){
           return metaMoria.claimAll.call({from: accounts[0]});
        }).then(function(claimall){
            assert.equal(claimall.toNumber(),"10780000000000000000", "Should be 10780000000000000000");
            return metaMoria.claimAll({from: accounts[0]});
        }).then(function(){
            return web3.eth.getBalance(metaMoria.address);                        
        }).then(function(balance){
            assert.equal(balance.toNumber(),"160000000000000000", "Should have 160000000000000000 wei left. Equals 0.16 ETH");
        })
        ;
    });



    //test claimAll
    it("Should not claimAll twice", function() {
        return MoriaToken.deployed().then(function(instance) {
            metaMoria = instance;
            return web3.eth.getBalance(metaMoria.address);                        
        }).then(function(balance){
            // should be 10.94ETH
            return assert.equal(balance.toNumber(),"160000000000000000", "Should be 160000000000000000");
        }).then(function(balance){
            return metaMoria.claimAll.call({from: accounts[0]});
        }).then(function(claimall){
            assert.equal(claimall.toNumber(),"0", "Should be 0");
            return metaMoria.claimAll({from: accounts[0]});
        }).then(function(){
            return web3.eth.getBalance(metaMoria.address);                        
        }).then(function(balance){
            assert.equal(balance.toNumber(),"160000000000000000", "Should have 160000000000000000 wei left. Equals 0.16 ETH");
        })
        ;
    });
    */
    
    // test buyBack modifier
    it("Should not use buyBack() when buyBack is not yet met (canBuyBack modifier)", function() {   
        var inThen=false;
    
        return MoriaToken.deployed().then(function(instance) {
            metaMoria = instance;
            return metaMoria.buyBack({from: accounts[0], value:1000000000000000000});        
        }).then(function(){
            inThen = true;
            return assert.ok(false,"Should fail")
        }).catch(function(err){
            if(inThen){
                assert.ok(false,"Should have failed because buyBack time is not yet met");
            } else {
                assert.ok(true,"Failed successfull");
            }
        });
    });

    it("Should be able to buyBack when time is met", function() {   
        return metaMoriaBuyback.balanceOf(accounts[0]).then(function(balance){
            return metaMoriaBuyback.payIn({from: accounts[0], value:1000000000000000000});
        }).then(function(){
            return metaMoriaBuyback.buyBack({from: accounts[0], value:1000000000000000000});
        })
        ;
    });

    it("Should not payIn anymore once ended", function() {  
        var inThen=false;
        
        return metaMoriaBuyback.balanceOf(accounts[0]).then(function(balance){
            return metaMoriaBuyback.payIn({from: accounts[0], value:1000000000000000000});
        }).then(function(){
            inThen = true;
            return assert.ok(false,"Should fail")
        }).catch(function(err){
            if(inThen){
                assert.ok(false,"Should have failed because it is ended");
            } else {
                assert.ok(true,"Failed successfull");
            }
        });
        ;
    });

    // test for approve and transferfrom method.
    it("Should use the approveAndCall method properly", function() {  
        var owner = accounts[0];
        var spender = accounts[3];
        var toSpend = 1999999;
        var luckyOne = accounts[4];
        var luckyOne_start_balance;
        var owner_start_balance;
        

        return MoriaToken.deployed().then(function(instance) {
            metaMoria = instance;
            return metaMoria.balanceOf(owner);        
        }).then(function(balance){
            owner_start_balance = balance.toNumber();
            assert.equal(owner_start_balance,"98000000", "Should have 98000000 tokens");
            return metaMoria.balanceOf(luckyOne);        
        }).then(function(balance){
            luckyOne_start_balance = balance.toNumber();
            return metaMoria.approveAndCall(spender,toSpend,"extradatainbytes");                        
        }).then(function(){
            return metaMoria.allowance.call(owner,spender);
        }).then(function(allowed){
            assert.equal(allowed.toNumber(),toSpend, "Should have 1999999 tokens to spend from the owner");
            return metaMoria.transferFrom(owner,luckyOne,999999,{from: spender});
        }).then(function(){
            return metaMoria.allowance.call(owner,spender);
        }).then(function(allowed){
            return assert.equal(allowed.toNumber(),toSpend - 999999, "Should have 999999 tokens less to spend from the owner");
        }).then(function(){
            return metaMoria.balanceOf(luckyOne);        
        }).then(function(balance){
            return assert.equal(balance.toNumber(),luckyOne_start_balance + 999999, "Should have 999999 tokens more in his balance");
        }).then(function(){
            // owner should have less balance now
            return metaMoria.balanceOf(owner);                    
        }).then(function(balance){
            assert.equal(balance.toNumber(),owner_start_balance - 999999, "Should have 999999 tokens less in his balance");        
        })
        ;
    });

    it("Should not spend more than allowed", function() {
        var owner = accounts[0];
        var spender = accounts[3];
        var luckyOne = accounts[4];
        var inThen = false;
        
        return MoriaToken.deployed().then(function(instance) {
            metaMoria = instance;
            return metaMoria.allowance.call(owner,spender);
        }).then(function(allowed){
            assert.equal(allowed.toNumber(),1000000, "Should have 1000000 tokens to spend from the owner"); 
            return metaMoria.transferFrom(owner,luckyOne,1000001,{from: spender});
        }).then(function(){
            inThen = true;
            return assert.ok(false,"Should fail");
        }).catch(function(err){
            if(inThen){
                assert.ok(false,"Should have failed because spends more than allowed");
            } else {
                assert.ok(true,"Failed successfull");
            }
        });
    });

});
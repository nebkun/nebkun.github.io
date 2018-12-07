"use strict";
//n1ySb9jUhkgHWS6VTuVk8yKH4JgT5GCcpw5
var dappAddress = "n21xetGG2ZF4e8u5umeRotjMAqnHaGd2nMC"; //n1unihDxMCaSmcfVvxEELFjNEWyKiWQsCGh
var scrollOpenMinutes = 1;

//here we use neb.js to call the "get" function to search from the Dictionary
var nebulas = require("nebulas"),
  Account = nebulas.Account,
  neb = new nebulas.Neb();
neb.setRequest(new nebulas.HttpRequest("https://mainnet.nebulas.io"));

var NebPay = require("nebpay"); //https://github.com/nebulasio/nebPay
var nebPay = new NebPay();
var serialNumber

var intervalQuery

toastr.options = {
  "closeButton": true,
  "debug": false,
  "newestOnTop": true,
  "progressBar": false,
  "positionClass": "toast-top-center",
  "preventDuplicates": true,
  "onclick": null,
  "showDuration": "3000",
  "hideDuration": "1000",
  "timeOut": "3000",
  "extendedTimeOut": "1000",
  "showEasing": "swing",
  "hideEasing": "linear",
  "showMethod": "fadeIn",
  "hideMethod": "fadeOut"
}

var foods = [
  '蛟龙', '狮子', '大鹏', '巨龟'
]

// Check if browser has loaded user wallet details

function getWallectInfo(callback) {
  

  window.postMessage({
    "target": "contentscript",
    "data": {},
    "method": "getAccount",
  }, "*");

  window.addEventListener('message', function(e) {
    if (e.data && e.data.data) {
      if (e.data.data.account) { //这就是当前钱包中的地址
        var address = e.data.data.account;
        document.getElementById("txtWalletAddress").value = address;
        document.getElementById("divWalletAddress").innerHTML = '<span class="text-white"><small>玩家钱包: ' + address + "</small></span>";

        callback();
      } else {

      }
    } else {
      // $(".walletRequired").show();
    }
  });
}

function initMyKun() {
  getPlayerKun();
}

function initBattle() {
  getOpponentKuns();
  getPlayerKunBattle();
}


function rand(min, max) {
  var result = Math.floor(Math.random() * (max - min + 1) + min);

  return result;
}


/*

tx Functions

*/
function buyKun() {

  var from = $("#txtWalletAddress").val();
  var to = dappAddress;
  var value = "0";
  var callFunction = "buyKun"
  var args = [];
  var callArgs = JSON.stringify(args);
   
  toastr.remove();
  toastr.options.showDuration = "30000";
  toastr.options.timeOut = "30000";
  toastr["info"]('厉害啦亲，活抓一只传说中的神鲲，请确认交易驯服它吧，只要一点 Gas 完全不要 NAS 哦！');
  serialNumber = nebPay.call(to, value, callFunction, callArgs, { //使用nebpay的call接口去调用合约,
    listener: buyKunnebPayCallBack //设置listener, 处理交易返回信息
  });
}

function attackKun(id, eid) {

  var from = $("#txtWalletAddress").val();
  var to = dappAddress;
  var value = "0";
  var callFunction = "battle"
  var args = [];
  args.push(id);
  args.push(eid)

  var callArgs = JSON.stringify(args);

  $('#txtAttackerID').val(id);
  $('#txtDefenderID').val(eid);

  serialNumber = nebPay.call(to, value, callFunction, callArgs, { //使用nebpay的call接口去调用合约,
    listener: attackKunnebPayCallBack //设置listener, 处理交易返回信息
  });
}

var feedType;
function feedKun(id, type) {
  feedType = type;
  var from = $("#txtWalletAddress").val();
  var to = dappAddress;
  var value = "0";
  if(type=='1') {
    value = "0.01";
  } else if(type=='2') {
    value = "0.1";
  } else if(type=='3') {
    value = "1";
  }
  var callFunction = "feedKun"
 
  var args = [];
  args.push(id)
  args.push(type)

  var callArgs = JSON.stringify(args);

  serialNumber = nebPay.call(to, value, callFunction, callArgs, { //使用nebpay的call接口去调用合约,
    listener: feedKunnebPayCallBack //设置listener, 处理交易返回信息
  });
}

function abandonKun(id) {

  var from = $("#txtWalletAddress").val();
  var to = dappAddress;
  var value = "0";
  var callFunction = "abandonKun"
  var args = [];
  args.push(id)

  var callArgs = JSON.stringify(args);

  serialNumber = nebPay.call(to, value, callFunction, callArgs, { //使用nebpay的call接口去调用合约,
    listener: abandonKunnebPayCallBack //设置listener, 处理交易返回信息
  });
}


function addKuns(n,v) {

  var from = $("#txtWalletAddress").val();
  var to = dappAddress;
  var value = (n * v).toString();
  console.log(value)
  var callFunction = "addKuns"
  var args = [];
  args.push(n)

  var callArgs = JSON.stringify(args);

  serialNumber = nebPay.call(to, value, callFunction, callArgs, { //使用nebpay的call接口去调用合约,
    listener: addKunsnebPayCallBack //设置listener, 处理交易返回信息
  });
}

function buyKunnebPayCallBack(resp) {

  if (resp) {
    toastr.remove();
    if (resp.txhash) {
      toastr.options.showDuration = "30000";
      toastr.options.timeOut = "30000";
      toastr["info"]('驯服神鲲中，请稍后...');
      intervalQuery = setInterval(function() {
        receiptTransaction(resp.txhash, "initBuy")
      }, 3000);
    } else {
      toastr["warning"]("交易没确认，神鲲逃跑了(¤﹏¤)");
    }
  }
}

function attackKunnebPayCallBack(resp) {

  toastr.remove();
  if (resp) {
    if (resp.txhash) {
      toastr.options.showDuration = "30000";
      toastr.options.timeOut = "30000";
      toastr["info"]('开始对敌方鲲发起猛烈攻击！');
      ClearBattleModal();
      getBattleStatus();
      intervalQuery = setInterval(function() {
        receiptTransaction(resp.txhash, "initBattleResult")
      }, 3000);
    } else {
      toastr["warning"]("算了，放过他吧，下次再来吞他。");
    }
  }
}

function feedKunnebPayCallBack(resp) {

  if (resp) {
    toastr.remove();
    if (resp.txhash) {
      toastr.options.showDuration = "30000";
      toastr.options.timeOut = "30000";

      var food;
      if (feedType == '1') {
        food = '非洲雄狮';
      } else if (feedType == '2') {
        food = '上古巨莽';
      } else if (feedType == '3') {
        food = '帝王暴龙';
      }
      toastr["info"]('鲲正在吞' + food + '，请稍后...');

      $('#viewKunModal').modal('hide');
      intervalQuery = setInterval(function() {
        receiptTransaction(resp.txhash, "initMyKun")
      }, 3000);
    } else {
      toastr["warning"]("忍心神鲲挨饿，不喂了。");
    }
  }
}

function abandonKunnebPayCallBack(resp) {

  if (resp) {
    if (resp.txhash) {
      toastr.remove();
      toastr.options.showDuration = "30000";
      toastr.options.timeOut = "30000";

      var index = rand(0, foods.length - 1)
      toastr["info"]('鲲正在流放回神界...');

      $('#viewKunModal').modal('hide');
      intervalQuery = setInterval(function() {
        receiptTransaction(resp.txhash, "initMyKun")
      }, 3000);
    } else {
      toastr["warning"]("还是留着我心爱的鲲吧，不流放了！");
    }
  }
}

function addKunsnebPayCallBack(resp) {

  if (resp) {
    if (resp.txhash) {
      toastr.remove();
      toastr.options.showDuration = "30000";
      toastr.options.timeOut = "30000";

      var index = rand(0, foods.length - 1)
      var food = foods[index];
      toastr["info"]('管理员放鲲啦！');

      $('#viewKunModal').modal('hide');
      intervalQuery = setInterval(function() {
        receiptTransaction(resp.txhash, "initAdmin")
      }, 3000);
    } else {
      toastr["warning"]("取消");
    }
  }
}

function receiptTransaction(txhash, initObject) {
  neb.api.getTransactionReceipt(txhash).then(function(resp) {
    if(resp.from)
    {
      var address = $('#txtWalletAddress').val();
      if(address == "")
      {
        $('#txtWalletAddress').val(resp.from.toString());
        setCookie('nasaddress',resp.from.toString(),365);
      }
    }

    if (resp.status == 1) {
      toastr.remove();
      toastr.options.showDuration = "5000";
      toastr.options.timeOut = "5000";
      var r = JSON.parse(resp.execute_result);
      if (r) {
        if (r.msg) {
          if (r.success) {

            toastr["success"](r.msg);
          } else {

            toastr["warning"](r.msg);
          }
        }
      }
      clearInterval(intervalQuery);

      if (initObject == "initMyKun") {
        initMyKun();
      } else if (initObject == "initBattleResult") {
        initBattleResult(r);
      }

    } else if (resp.status == 0) { // error 
      toastr.remove();
      toastr.options.showDuration = "5000";
      toastr.options.timeOut = "5000";
      toastr["warning"](resp.execute_error);
      clearInterval(intervalQuery);
    }
  }).catch(function(err) {
    //cbSearch(err)
    console.log("error:" + err.message)
  })
}

/*

Query Functions

*/


function getPlayerKun() {

  var from = $("#txtWalletAddress").val();

  var value = "0";
  var nonce = "0"
  var gas_price = "1000000"
  var gas_limit = "2000000"
  var callFunction = "getPlayerKun";
  //var callArgs = "[\"" + $("#search_value").val() + "\"]"; //in the form of ["args"]
  var callArgs = "[]"; //in the form of ["args"]
  var contract = {
    "function": callFunction,
    "args": callArgs
  }

  neb.api.call(from, dappAddress, value, nonce, gas_price, gas_limit, contract).then(function(resp) {

    nebQueryCallBack(resp, "getPlayerKun")

  }).catch(function(err) {
    //cbSearch(err)
    console.log("error:" + err.message)
  })
}

function getPlayerKunBattle() {

  var from = $("#txtWalletAddress").val();

  var value = "0";
  var nonce = "0"
  var gas_price = "1000000"
  var gas_limit = "2000000"
  var callFunction = "getPlayerKun";
  //var callArgs = "[\"" + $("#search_value").val() + "\"]"; //in the form of ["args"]
  var callArgs = "[]"; //in the form of ["args"]
  var contract = {
    "function": callFunction,
    "args": callArgs
  }

  neb.api.call(from, dappAddress, value, nonce, gas_price, gas_limit, contract).then(function(resp) {

    nebQueryCallBack(resp, "getPlayerKunBattle")

  }).catch(function(err) {
    //cbSearch(err)
    console.log("error:" + err.message)
  })
}

function getKun(id) {

  var from = $("#txtWalletAddress").val();

  var value = "0";
  var nonce = "0"
  var gas_price = "1000000"
  var gas_limit = "2000000"
  var callFunction = "getKun";
  var args = [];
  args.push(id);

  var callArgs = JSON.stringify(args); //in the form of ["args"]
  var contract = {
    "function": callFunction,
    "args": callArgs
  }

  neb.api.call(from, dappAddress, value, nonce, gas_price, gas_limit, contract).then(function(resp) {

    nebQueryCallBack(resp, "getKun")

  }).catch(function(err) {
    //cbSearch(err)
    console.log("error:" + err.message)
  })
}

function getBattleStatus()
{
  var attackerid = $('#txtAttackerID').val();
  var defenderid = $('#txtDefenderID').val();
  getKunBattleProfileAttacker(attackerid);
  getKunBattleProfileDefender(defenderid);
  $('.kuns-placeholder').hide();
  $('.battle-placeholder').show();
  $('.battle-vs').show();
}

function initBattleResult(r)
{
  console.log(r.details)
  if(r)
  {
    if(r.details)
    {
      $('.battle-vs').hide();
      $('.battle-end').show();
      var power = r.details.power;
      var value = r.details.value;
      var attacker_isdead = r.details.attacker_isdead;
      var defender_isdead = r.details.defender_isdead;
      if(r.details.win) // attacker win
      {
        // $('.attacker .winloseresult').attr("src","assets/img/won.png");
        if(parseFloat(power) > 0)
        {
          $('.attacker .adjustpower').html('<span class="text-success">+ ' + power + '</span>');
        }
        if(parseFloat(value) > 0)
        {
          $('.attacker .adjustvalue').html('<span class="text-success">+ ' + value + '</span>');
        }

       
        $('.attacker .winloseresult').addClass("lost");
        if(attacker_isdead){
          $('.attacker .winloseresult').attr("src","assets/img/dead.png");
        }else{
          $('.attacker .winloseresult').attr("src","assets/img/won.png");
        }

        
        if(defender_isdead) {

          $('.defender .winloseresult').attr("src","assets/img/dead.png");
        }else{
          $('.defender .winloseresult').attr("src","assets/img/lost.png");
        }

        if(parseFloat(power) > 0)
        {
          $('.defender .adjustpower').html('<span class="text-danger">- ' + power + '</span>');
        }
        if(parseFloat(value) > 0)
        {
          $('.defender .adjustvalue').html('<span class="text-danger">- ' + value + '</span>');
        }
      }else {
        // $('.defender .winloseresult').attr("src","assets/img/won.png");
        if(parseFloat(power) > 0)
        {
          $('.defender .adjustpower').html('<span class="text-success">+ ' + power + '</span>');
        }
        if(parseFloat(value) > 0)
        {
          $('.defender .adjustvalue').html('<span class="text-success">+ ' + value + '</span>');
        }

        $('.defender .winloseresult').addClass("lost");

        if(attacker_isdead){
          $('.attacker .winloseresult').attr("src","assets/img/dead.png");
        }else{
          $('.attacker .winloseresult').attr("src","assets/img/lost.png");
        }

        if(defender_isdead) {
          $('.defender .winloseresult').attr("src","assets/img/dead.png");
        }else{
          $('.defender .winloseresult').attr("src","assets/img/won.png");
        }

        if(parseFloat(power) > 0)
        {
          $('.attacker .adjustpower').html('<span class="text-danger">- ' + power + '</span>');
        }
        if(parseFloat(value) > 0)
        {
          $('.attacker .adjustvalue').html('<span class="text-danger">- ' + value + '</span>');
        }
      }
      // power
      // value
      //attacker_isdead

    }
  }
}

function getKunBattleProfileAttacker(id) {

  var from = $("#txtWalletAddress").val();

  var value = "0";
  var nonce = "0"
  var gas_price = "1000000"
  var gas_limit = "2000000"
  var callFunction = "getKun";
  var args = [];
  args.push(id);

  var callArgs = JSON.stringify(args); //in the form of ["args"]
  var contract = {
    "function": callFunction,
    "args": callArgs
  }

  neb.api.call(from, dappAddress, value, nonce, gas_price, gas_limit, contract).then(function(resp) {

    nebQueryCallBack(resp, "getKunBattleProfileAttacker")

  }).catch(function(err) {
    //cbSearch(err)
    console.log("error:" + err.message)
  })
}

function getKunBattleProfileDefender(id) {

  var from = $("#txtWalletAddress").val();

  var value = "0";
  var nonce = "0"
  var gas_price = "1000000"
  var gas_limit = "2000000"
  var callFunction = "getKun";
  var args = [];
  args.push(id);

  var callArgs = JSON.stringify(args); //in the form of ["args"]
  var contract = {
    "function": callFunction,
    "args": callArgs
  }

  neb.api.call(from, dappAddress, value, nonce, gas_price, gas_limit, contract).then(function(resp) {

    nebQueryCallBack(resp, "getKunBattleProfileDefender")

  }).catch(function(err) {
    //cbSearch(err)
    console.log("error:" + err.message)
  })
}


function getKunOpponent(id) {

  var from = $("#txtWalletAddress").val();

  var value = "0";
  var nonce = "0"
  var gas_price = "1000000"
  var gas_limit = "2000000"
  var callFunction = "getKun";
  var args = [];
  args.push(id);

  var callArgs = JSON.stringify(args); //in the form of ["args"]
  var contract = {
    "function": callFunction,
    "args": callArgs
  }

  neb.api.call(from, dappAddress, value, nonce, gas_price, gas_limit, contract).then(function(resp) {

    nebQueryCallBack(resp, "getKunOpponent")

  }).catch(function(err) {
    //cbSearch(err)
    console.log("error:" + err.message)
  })
}

function getKunExport(id) {

  var from = $("#txtWalletAddress").val();

  var value = "0";
  var nonce = "0"
  var gas_price = "1000000"
  var gas_limit = "2000000"
  var callFunction = "getKun";
  var args = [];
  args.push(id);

  var callArgs = JSON.stringify(args); //in the form of ["args"]
  var contract = {
    "function": callFunction,
    "args": callArgs
  }

  neb.api.call(from, dappAddress, value, nonce, gas_price, gas_limit, contract).then(function(resp) {

    nebQueryCallBack(resp, "getKunExport")

  }).catch(function(err) {
    //cbSearch(err)
    console.log("error:" + err.message)
  })
}

function getOpponentKuns() {

  var from = $("#txtWalletAddress").val();

  var value = "0";
  var nonce = "0"
  var gas_price = "1000000"
  var gas_limit = "2000000"
  var callFunction = "getOpponentKuns";
  //var callArgs = "[\"" + $("#search_value").val() + "\"]"; //in the form of ["args"]
  var callArgs = "[]"; //in the form of ["args"]
  var contract = {
    "function": callFunction,
    "args": callArgs
  }

  neb.api.call(from, dappAddress, value, nonce, gas_price, gas_limit, contract).then(function(resp) {

    nebQueryCallBack(resp, "getOpponentKuns")

  }).catch(function(err) {
    //cbSearch(err)
    console.log("error:" + err.message)
  })
}

function getPlayerLog() {

  var from = $("#txtWalletAddress").val();

  var value = "0";
  var nonce = "0"
  var gas_price = "1000000"
  var gas_limit = "2000000"
  var callFunction = "getPlayerLog";
  //var callArgs = "[\"" + $("#search_value").val() + "\"]"; //in the form of ["args"]
  var callArgs = "[]"; //in the form of ["args"]
  var contract = {
    "function": callFunction,
    "args": callArgs
  }

  neb.api.call(from, dappAddress, value, nonce, gas_price, gas_limit, contract).then(function(resp) {


    nebQueryCallBack(resp, "getPlayerLog")

  }).catch(function(err) {
    //cbSearch(err)
    console.log("error:" + err.message)
  })
}

function getA() {

  var from = $("#txtWalletAddress").val();

  var value = "0";
  var nonce = "0"
  var gas_price = "1000000"
  var gas_limit = "2000000"
  var callFunction = "a";
  //var callArgs = "[\"" + $("#search_value").val() + "\"]"; //in the form of ["args"]
  var callArgs = "[]"; //in the form of ["args"]
  var contract = {
    "function": callFunction,
    "args": callArgs
  }

  neb.api.call(from, dappAddress, value, nonce, gas_price, gas_limit, contract).then(function(resp) {

    nebQueryCallBack(resp, "getA")

  }).catch(function(err) {
    //cbSearch(err)
    console.log("error:" + err.message)
  })
}

function exportKun() {

  var from = $("#txtWalletAddress").val();

  var value = "0";
  var nonce = "0"
  var gas_price = "1000000"
  var gas_limit = "2000000"
  var callFunction = "exportKun";
  //var callArgs = "[\"" + $("#search_value").val() + "\"]"; //in the form of ["args"]
  var callArgs = "[]"; //in the form of ["args"]
  var contract = {
    "function": callFunction,
    "args": callArgs
  }

  neb.api.call(from, dappAddress, value, nonce, gas_price, gas_limit, contract).then(function(resp) {

    nebQueryCallBack(resp, "exportKun")

  }).catch(function(err) {
    //cbSearch(err)
    console.log("error:" + err.message)
  })
}

function nebQueryCallBack(resp, action) {
  if (resp.result) {
    if (action == "getPlayerKun") {
      var kuns = JSON.parse(resp.result);
      // // TODO: Test only
      // if (kuns && kuns[0]) {
      //   var kun = kuns[0];
      //   for(var i=0; i<10; ++i) {
      //     kuns.push(kun);
      //   }
      // }
      listPlayerKuns(kuns);
      RegisterEvents();
    }
    if (action == "getPlayerKunBattle") {
      var kuns = JSON.parse(resp.result);
      //TODO: Test only
      // if (kuns && kuns[0]) {
      //   var kun = kuns[0];
      //   for(var i=0; i<100; ++i) {
      //     kuns.push(kun);
      //   }
      // }
      listPlayerKunsBattle(kuns);
      RegisterBattleEvents();
    }
    if (action == "getOpponentKuns") {
      var kuns = JSON.parse(resp.result);
      // TODO: Test only
      // if (kuns && kuns[0]) {
      //   var kun = kuns[0];
      //   for(var i=0; i<100; ++i) {
      //     kuns.push(kun);
      //   }
      // }
      listOpponentKuns(kuns);
      RegisterEvents();
    } else if (action == "getKun") {
      var kun = JSON.parse(resp.result);
      listKun(kun);
      RegisterEvents();
    } else if (action == "getKunOpponent") {
      var kun = JSON.parse(resp.result);
      listKunOpponent(kun);
      RegisterBattleEvents();
    } else if (action == "getA") {
      var r = JSON.parse(resp.result);
      console.log(r);
    } else if (action == "getKunExport") {
      var kun = JSON.parse(resp.result);
      $('#spanExportKun').append(', '+ JSON.stringify(kun))

    }else if (action == "getPlayerLog") {
      var kun = JSON.parse(resp.result);
      listPlayerLog(kun);
    }else if (action == "getKunBattleProfileAttacker") {
      var kun = JSON.parse(resp.result);
      listKunBattleProfile(kun, true,  $('.attacker'));
      RegisterBattleEvents();
    }else if (action == "getKunBattleProfileDefender") {
      var kun = JSON.parse(resp.result);
      listKunBattleProfile(kun, false, $('.defender'));
      RegisterBattleEvents();
    }
  }
}

function listPlayerLog(logs) {
  var html = "";
  html += "<div class='row'>";
  $.each(logs, function(i) {
    var log = logs[i];

    var now = new Date().getTime();
    var diff = now - log.ts;
    var ageObj = retureTimeDifferenceInDays(diff);

    html += "";
    html += "<div class='col-md-12'>";
    html += "<p class='text-normal'>" + ageObj.number + " " + ageObj.type + "前: " + log.msg + "</p>";

    html += "</div>";


  })
  html += "</div>"
  $('.logs-placeholder').html(html);
}

function listPlayerKuns(kuns) {
  var html = "";
  html += "<div class='row'>";
  if (kuns.length > 0) {
    $.each(kuns, function(i) {
      var kun = kuns[i];
      html += "<div class='col-md-3'>";

      html += "<div class='card mb-2 box-shadow kun-card-bg kun-plate-selection' data-id='" + kun.id + "'>";

      html += "<div class='row mx-auto d-flex justify-content-center flex-wr'>";
      html += "<img class='card-img-top mt-2 kun-image' src='assets/img/" + kun.code + ".png' alt='" + kun.name + "'>";
      html += "</div>"

      html += "<div class='card-body'>";
      html += "<p class='text-center kun-power'>" + kun.id + " 号鲲</p>"
      html += "<p class='text-center kun-power'>战力 " + kun.power + "</p>"
      html += "<p class='text-center kun-power'>价值 " + kun.value + " NAS</p>"

      html += "<div class='text-center mt-2'>";
      html += "<button type='button' class='btn mt-2 mr-2 btn-danger btn-openkun' data-id='" + kun.id + "'>喂养</button>";
      html += "<button type='button' class='btn mt-2 mr-2 btn-danger btn-view-abandonkun' data-id='" + kun.id + "'>流放</button>";
      html += "</div>";
      html += "</div>" // card-body

      html += "</div>"
      html += "</div>"

    })

  } else {
    html += "<div class='col-md-12 text-white'>亲，一条神鲲都没有怎样行走江湖呀，先去免费捉鲲吧，要不然你行你自己上哦？</div>";
    html += "<a role='button' href='index.html' class='btn mt-3 btn-lg col-md-2 btn-danger buy-kun-button-in-my-kun'>免费捉鲲去</a>";
  }


  html += "</div>"

  $('.kuns-placeholder').html(html);
}

function listPlayerKunsBattle(kuns) {
  var html = "";
  if (kuns.length === 0) {
    html += "<p>亲，没有鲲哦，赶紧去免费活捉一条吧。</p>";
    html += "<a role='button' href='index.html' class='btn mt-3 btn-lg col-md-5 btn-danger'>免费捉鲲去</a>";
  } else {
    html += "<div class='row'>";
    $.each(kuns, function(i) {
      var kun = kuns[i];
      html += "<div class='col-md-2 p-2'>";
  
      html += "<div class='card mb-2 box-shadow bg-dark kun-plate-selection' data-id='" + kun.id + "'>";
  
      html += "<div class='row'>";
  
      html += "<div class='col-md-12'>";
      html += "<div class='row mx-auto d-flex justify-content-center flex-wr'>";
      html += "<img class='card-img-top kun-image-tiny' src='assets/img/" + kun.code + ".png' alt='" + kun.name + "'>";
      html += "</div>"
      html += "</div>"
      html += "</div>"
      html += "<div class='row'>";
  
      html += "<div class='col-md-12'>";
      html += "<div class='mt-2 mt-2'>";
      html += "<p class='text-center kun-power-small'>" + kun.id + " 号鲲</p>"
      html += "<p class='text-center kun-power-small'>战力 " + kun.power + "</p>"
      html += "<p class='text-center kun-power-small'>价值 " + kun.value + " NAS</p>"
  
      html += "</div>" // card-body
      html += "</div>"
  
      html += "</div>"
  
  
      html += "</div>"
      html += "</div>"
  
    })
    html += "</div>"
  }

  $('.mykuns-placeholder').html(html);
}


function listOpponentKuns(kuns) {
  var html = "";
  html += "<div class='row'>";
  if (kuns.length > 0) {
    $.each(kuns, function(i) {
      var kun = kuns[i];
      html += "<div class='col-md-2 p-2'>";

      html += "<div class='card mb-2 box-shadow bg-dark character-plate-selection' data-id='" + kun.id + "'>";

      html += "<div class='row'>";

      html += "<div class='col-md-7'>";
      html += "<div class='row mx-auto d-flex justify-content-center flex-wr'>";
      html += "<img class='card-img-top mt-2 ml-2 mr-2 mb-2 kun-image-small' src='assets/img/" + kun.code + ".png' alt='" + kun.name + "'>";
      html += "</div>"
      html += "</div>"

      html += "<div class='col-md-5'>";
      html += "<div class='mt-2 mt-2'>";
      html += "<p class='text-center kun-power-small'>" + kun.id + " 号鲲</p>"
      html += "<p class='text-center kun-power-small'>战力 " + kun.power + "</p>"
      html += "<p class='text-center kun-power-small'>价值 " + kun.value + " NAS</p>"

      html += "<div class='text-center mt-1'>";
      html += "<button type='button' class='btn btn-sm mt-2 mr-2 btn-danger btn-openattackkun' data-id='" + kun.id + "'>攻击</button>";
      html += "</div>";
      html += "</div>" // card-body
      html += "</div>"

      html += "</div>"


      html += "</div>"
      html += "</div>"

    })

  } else {
    html += "<div class='col-md-12 text-white'>找不到其他鲲，可能都在冷却保护中，请稍等再回来灭它们</div>";
  }
  html += "</div>"

  $('.kuns-placeholder').html(html);
}


function listKun(kun) {

  var canAttack = true;
  var ageObj;
  var protection_lbl = "";
  if(kun.protected)
  {
    if(kun.protection_endts)
    {
        var now = new Date().getTime();
        if((now - kun.protection_endts) < 0) 
        {
            canAttack = false;

            ageObj = retureTimeDifferenceInDays(now - kun.protection_endts)

        }
    }
  }
  if(!canAttack)
  {
    protection_lbl = "鲲还在保护时间：还剩" + ageObj.number + " " + ageObj.type;
    $('#lblProtectionLabel').html(protection_lbl)
  }else{
    $('#lblProtectionLabel').html('')
  } 

  var pwr_gap = kun.winpower - kun.losepower;
  var value_gap = kun.winvalue - kun.losevalue;
  
  var html = "";
  html += "<div class='row'>";
  html += "<div class='col-md-12'>";

  html += "<div class='card mb-2 box-shadow bg-dark character-plate-selection' data-id='" + kun.id + "'>";

  html += "<div class='row mx-auto d-flex justify-content-center flex-wr'>";
  html += "<img class='card-img-top mt-2 kun-image' src='assets/img/" + kun.code + ".png' alt='" + kun.name + "'>";
  html += "</div>"

  html += "<div class='card-body'>";
  html += "<p class='text-center kun-power'>" + kun.id + " 号鲲</p>"
  html += "<p class='text-center kun-power'>玩家 " + retureShortAddress(kun.from) + "</p>"
  html += "<p class='text-center kun-power'>战力 " + kun.power + "</p>"
  html += "<p class='text-center kun-power'>价值 " + kun.value + " NAS</p>"
  html += "<p class='text-center kun-power'><small>嬴场 " + kun.wins + " </small></p>"
  html += "<p class='text-center kun-power'><small>输场 " + kun.loses + " </small></p>"
  if(pwr_gap>=0)
  {
    html += "<p class='text-center kun-power'><small>战力得失 <span class='text-success'>" + pwr_gap + "</span></small></p>"
  }else{
    html += "<p class='text-center kun-power'><small>战力得失 <span class='text-danger'>" + pwr_gap + "</span></small></p>"
  }
  if(value_gap>=0)
  {
    html += "<p class='text-center kun-power'><small>价值得失(NAS)<span class='text-success'>" + value_gap + "</span></small></p>"
  }else{
    html += "<p class='text-center kun-power'><small>价值得失(NAS)<span class='text-danger'>" + value_gap + "</span></small></p>"
  }
  // html += "<p class='text-center kun-power'><small>嬴 " + kun.winvalue + " NAS</small></p>"
  // html += "<p class='text-center kun-power'><small>输 " + kun.losevalue + " NAS</small></p>"
  // html += "<p class='text-center kun-power'><small>嬴 " + kun.winpower + " 战力</small></p>"
  // html += "<p class='text-center kun-power'><small>输 " + kun.losepower + " 战力</small></p>"
  // html += "<p class='text-center kun-power'><small>喂养 " + kun.feedpower + " 战力</small></p>"

  html += "</div>" // card-body

  html += "</div>"
  html += "</div>"
  html += "</div>"

  $('.kun-placeholder').html(html);
}



function listKunBattleProfile(kun,isattacker,placeholder) {
  var html = "";
  html += "<div class='row'>";
  html += "<div class='col-md-12'>";

  html += "<div class='card mb-2 box-shadow kun-card-bg' data-id='" + kun.id + "'>";

  html += "<div class='text-center text-info mt-2'>";
  if(isattacker)
  {
    html += "<h5 class='battle-title'>我【鲲】</h5>";
  }else{
    html += "<h5 class='battle-title'>敌【鲲】</h5>";
  }
  html += "</div>";
  html += "<div class='row mx-auto d-flex justify-content-center flex-wr'>";
  html += "<img class='card-img-top mt-2 kun-image' src='assets/img/" + kun.code + ".png' alt='" + kun.name + "'>";
  html += "<img class='winloseresult animated'>";
  html += "</div>"

  html += "<div class='card-body'>";
  html += "<p class='text-center kun-power'>" + kun.id + " 号鲲</p>"
  html += "<p class='text-center kun-power'>战力 " + kun.power + " <span class='adjustpower'><span></p>"
  html += "<p class='text-center kun-power'>价值 " + kun.value + " NAS <span class='adjustvalue'><span></p>"
  html += "</div>" // card-body

  html += "</div>"
  html += "</div>"

  html += "</div>"

  $(placeholder).html(html);
}

function listKunOpponent(kun) {
  var html = "";
  html += "<div class='row'>";
  html += "<div class='col-md-12 p-2'>";

  html += "<div class='card mb-2 box-shadow bg-dark character-plate-selection' data-id='" + kun.id + "'>";

  html += "<div class='row'>";

  html += "<div class='col-md-7'>";
  html += "<div class='row mx-auto d-flex justify-content-center flex-wr'>";
  html += "<img class='card-img-top mt-2 ml-2 mr-2 mb-2 kun-image-small' src='assets/img/" + kun.code + ".png' alt='" + kun.name + "'>";
  html += "</div>"
  html += "</div>"

  html += "<div class='col-md-5'>";
  html += "<div class='mt-2 mt-2'>";
  html += "<p class='text-center kun-power-small'>" + kun.id + " 号鲲</p>"
  html += "<p class='text-center kun-power-small'>战力 " + kun.power + "</p>"
  html += "<p class='text-center kun-power-small'>价值 " + kun.value + " NAS</p>"

  html += "</div>" // card-body
  html += "</div>"

  html += "</div>"


  html += "</div>"
  html += "</div>"
  html += "</div>"

  $('.opponentkun-placeholder').html(html);
}

function ClearBattleModal() {

  $('#viewKunModal').modal('hide');
  $('#txtSelectedKunID').val('');
  $('.mykuns-placeholder').html('');
}
/*

Register Events

*/

function RegisterBattleEvents() {
  $('.kun-plate-selection').unbind("click");
  $('.kun-plate-selection').click(function() {
    var id = $(this).data('id');
    $('#txtSelectedKunID').val(id);
    toggleKunSelection(this);
  });
}

function toggleKunSelection(obj) {
  $(".kun-plate-selection").removeClass('border-selected');
  $(obj).addClass('border-selected');
}

function RegisterEvents() {
  $("#buyKun").unbind("click");
  $("#buyKun").click(function() {
    buyKun();
  });


  $("#getA").unbind("click");
  $("#getA").click(function() {
    getA();
  });


  $(".btn-openkun").unbind("click");
  $(".btn-openkun").click(function() {
    var id = $(this).data('id');
    $('#txtKunID').val(id);
    $('#viewKunModal').modal('show');
    getKun(id);
  });

  $(".btn-view-abandonkun").unbind("click");
  $(".btn-view-abandonkun").click(function() {
    var id = $(this).data('id');
    $('#txtKunID').val(id);
    $('#abandonKunModal').modal('show');
    getKun(id);
  });

  $(".btn-feedkun").unbind("click");
  $(".btn-feedkun").click(function() {
    var id = $('#txtKunID').val();
    var type = $(this).data('type');
    feedKun(id, type);
  });


  $(".btn-abandonkun").unbind("click");
  $(".btn-abandonkun").click(function() {
    var id = $('#txtKunID').val();
    abandonKun(id);
  });

  $(".btn-addkuns").unbind("click");
  $(".btn-addkuns").click(function() {
    var n = parseInt($(this).data("number"));
    var v = parseFloat($(this).data("value"));
    addKuns(n,v);
  });


  $(".btn-openattackkun").unbind("click");
  $(".btn-openattackkun").click(function() {
    var id = $(this).data('id');
    $('#txtKunID').val(id);
    $('#viewKunModal').modal('show');
    getKunOpponent(id);
  });

  $(".btn-attackkun").unbind("click");
  $(".btn-attackkun").click(function() {
    var id = $('#txtSelectedKunID').val();
    var eid = $('#txtKunID').val();
    if (id && eid) {
      attackKun(id, eid);
    } else {
      toastr["warning"]("请选择你的鲲");
    }

  });

  $("#getPlayerLog").unbind("click");
  $("#getPlayerLog").click(function() {
    $('#viewLogsModal').modal('show');
    getPlayerLog();
  });


  $("#getA").unbind("click");
  $("#getA").click(function() {
    getA();
  });

 

  $(".btn-login").unbind("click");
  $(".btn-login").click(function() {
    $('#loginModal').modal('show');
  });

  $(".btn-confirmaddress").unbind("click");
  $(".btn-confirmaddress").click(function() {
    var address = $('#txtNASAddress').val();
    if(address.length>10&& address.startsWith('n1'))
    {

      $('#txtWalletAddress').val(address);
      setCookie('nasaddress',address,365);
      $('.lblCurrentWalletAddress').html('<small>玩家钱包: ' + address + '</small>');
      $('#loginModal').modal('hide');

    }else{
      toastr["warning"]("无效的地址");
    }
  });

var indexC = 0;
  $('#exportKun').unbind("click");
  $('#exportKun').click(function(){
    

    var arr = [50,70,71,76,94,97,109,126,132,157,158,159,160]
    $.each(arr,function(i)
    {
      getKunExport(arr[i]);
    });
    
   // scrapeKun()
  })

  function scrapeKun()
  {
    getKunExport(indexC);
    indexC++;
    if(indexC<168)
    {
     setTimeout(scrapeKun, 3000)
    }
  }

  $('#validate').unbind("click");
  $('#validate').click(function(){
    console.log(chars)
   for(var i=-3;i<168;i++)
     {
        var find = false;
         for(var j=0;j<chars.length;j++)
         {
          if(chars[j])
          {
            if(chars[j].id == i)
            {
                find = true;
                break;
            }
          }
            
         }
         if(!find)
         {
            console.log('NO:' + i.toString());
         }
         
     }

  })

}



function retureShortAddress(str) {
  var r = str
  if (str.length > 8) {
    r = str.substr(0, 4) + '...' + str.substr(str.length - 4, 4)
  }
  return r;
}

function retureTimeDifferenceInDays(diff) {

  var r = {};

  // get total seconds between the times
  var delta = Math.abs(diff) / 1000;

  // calculate (and subtract) whole days
  var days = Math.floor(delta / 86400);

  // calculate (and subtract) whole hours
  var hours = Math.floor(delta / 3600) % 24;

  // calculate (and subtract) whole minutes
  var minutes = Math.floor(delta / 60) % 60;

  // what's left is seconds
  var seconds = Math.floor(delta % 60);

  if (days > 0) {
    r.number = days;
    r.type = "天";
  } else {
    if (hours > 0) {
      r.number = hours;
      r.type = "小时";
    } else {
      if (minutes > 0) {
        r.number = minutes;
        r.type = "分钟";
      } else {
        if (seconds > 0) {
          r.number = seconds;
          r.type = "秒";
        } else {

          r.number = 0;
          r.type = "";
        }

      }

    }

  }

  return r;
}

function setCookie(name,value,days) {
    var expires = "";
    if (days) {
        var date = new Date();
        date.setTime(date.getTime() + (days*24*60*60*1000));
        expires = "; expires=" + date.toUTCString();
    }
    document.cookie = name + "=" + (value || "")  + expires + "; path=/";
}
function getCookie(name) {
    var nameEQ = name + "=";
    var ca = document.cookie.split(';');
    for(var i=0;i < ca.length;i++) {
        var c = ca[i];
        while (c.charAt(0)==' ') c = c.substring(1,c.length);
        if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length,c.length);
    }
    return null;
}
function eraseCookie(name) {   
    document.cookie = name+'=; Max-Age=-99999999;';  
}

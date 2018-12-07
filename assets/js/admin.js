

$( "#heroRarity" ).change(function() {
  var rarity = parseInt($('#heroRarity').val());
  if(rarity == 1)
  {
    $('#heroSupply').val('1000000');
    $('#heroMinStats').val('50');
    $('#heroMaxStats').val('59');
  }else if(rarity == 2)
  {
    $('#heroSupply').val('1000');
    $('#heroMinStats').val('60');
    $('#heroMaxStats').val('74');
  }else if(rarity == 3)
  {
    $('#heroSupply').val('100');
    $('#heroMinStats').val('75');
    $('#heroMaxStats').val('90');
  }else if(rarity == 4)
  {
    $('#heroSupply').val('10');
    $('#heroMinStats').val('91');
    $('#heroMaxStats').val('100');
  }
});
$(".adminAddHeroClass").click(function() {

    var id = $('#heroID').val();
    var name = $('#heroName').val();
    var rarity = parseInt($('#heroRarity').val());
    var role = parseInt($('#heroRole').val());
    var cla = parseInt($('#heroClass').val());
    var supply = parseInt($('#heroSupply').val());
    var minstats = parseInt($('#heroMinStats').val());
    var maxstats = parseInt($('#heroMaxStats').val());
    var price = parseFloat($('#heroPrice').val()).toFixed(6);

    var to = dappAddress;
    var value = "0";
    var callFunction = "adminAddHeroClass"
    var callArgs = "[\"" + id + "\",\"" + name + "\",\"" + rarity + "\",\"" + role + "\",\"" + cla + "\",\"" + supply + "\",\"" + minstats + "\",\"" + maxstats + "\",\"" + price + "\"]"
    
    serialNumber = nebPay.call(to, value, callFunction, callArgs, {    //使用nebpay的call接口去调用合约,
        listener: cbPush        //设置listener, 处理交易返回信息
    });

    // intervalQuery = setInterval(function () {
    //     funcIntervalQuery();
    // }, 5000);
});
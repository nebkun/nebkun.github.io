
"use strict";

var dappAddress = "n226tnWGHTrZ2EBSDpZ1hr4VdAW3KyPDJuH";
var scrollOpenMinutes = 1;

//here we use neb.js to call the "get" function to search from the Dictionary
var nebulas = require("nebulas"),
    Account = nebulas.Account,
    neb = new nebulas.Neb();
neb.setRequest(new nebulas.HttpRequest("https://testnet.nebulas.io"));

var NebPay = require("nebpay");     //https://github.com/nebulasio/nebPay
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

// Check if browser has loaded user wallet details

function getWallectInfo(callback) {
    window.postMessage({
        "target": "contentscript",
        "data": {},
        "method": "getAccount",
    }, "*");

    window.addEventListener('message', function (e) {
        if (e.data && e.data.data) {
            if (e.data.data.account) {//这就是当前钱包中的地址
                document.getElementById("txtWalletAddress").value = e.data.data.account;
                
                $(".walletRequired").addClass("d-none");
                callback();

            }else{
            }
        }else{
        }
    });
}


// Init functions

function initHome()
{
  getAllPetClasses();
  getPlayerAsset();
  RegisterTooltips();
}

function initTeam()
{
  checkPlayerProfile();
  getPlayerProfile();
  getPlayerPet();
  getPlayerAsset();
  getPlayerGear();
  getRewardLog();
  RegisterEvents();
  RegisterTooltips();
}

function initInstance()
{
  checkPlayerProfile();
  getPlayerPetSelection();
  getInstances();
}

function initCastle()
{
  checkPlayerProfile();
  getPlayerPetSelection();
  getProfileCastle();
  getPlayerGuards();
  getBattleLog();
  getBattleDetails();
  RegisterCastleEvents();
  RegisterEvents();
}


function loadPlayerScroll(payload){
    var scroll = JSON.parse(payload)

    var date = new Date().getTime();

    var scrollValid = true;
    if(scroll.normal_ts)
    {
        var minutes = (date - scroll.normal_ts) / 60000;
        if(minutes>=scrollOpenMinutes)
        {
            scrollValid = true;
            
        }else{
            scrollValid = false;
        }
    }else{
        scrollValid = true;
        
    }

    if(scrollValid)
    {
        $(".normal-scroll-label").html("<small class='text-muted'>Open now!</small>");
        $(".open-scroll").attr("src","assets/img/grand_scroll.png");
    }else{
        var left = Math.round(scrollOpenMinutes-Math.abs(minutes));
        $(".normal-scroll-label").html("<small class='text-muted'>" + left + " minutes before use</small>");
       
        $(".open-scroll").attr("src","assets/img/grand_scroll_reverse.png");
        $(".open-scroll").unbind('click');
    }
    
}

function loadPetSockets(payload){
    var pet = JSON.parse(payload);
    var gears = pet.gears;
    if(gears)
    {
      if(gears.length>0)
      {
        $.each(gears, function(i) {
            var item = gears[i];
            var id = item.id;
            var slot = item.slot;
            var name = item.name;
            var level = item.level;
            var plushp = item.plushp;
            var plusattack = item.plusattack;
            var plusdefence = item.plusdefence;
            var pluscritical = (item.pluscritical*100);
            var img ="";
            var gear = getGearByID(item.cid);
            if(gear)
            {
              img = gear.img; 
            }

            var html ="<span class=''><img class='gear-image' src='" + img + "' data-toggle='tooltip' title='" + name + " (level " + level + "), +" + plushp +" hp, +" + plusattack +" attack, +" + plusdefence +" defence, +" + pluscritical +"% critical ' /></span>";

            $('.gear-socket').each(function(j, obj) {
                var sid = $(obj).data('id');
                if(sid == slot)
                {
                  $(obj).css("background-image", "url('" + img + "')");  
                  $(obj).attr("data-toggle","tooltip");
                  $(obj).attr("title", name + " (level " + level + "), +" + plushp +" hp, +" + plusattack +" attack, +" + plusdefence +" defence, +" + pluscritical +"% critical");
                }
            });
        });
      }
    }
    RegisterTooltips();
}

function loadPlayerPet(payload){
    var pets = JSON.parse(payload);
    var html = "";
     html += "<div class='row' >";
    $.each(pets, function(i) {
      var item = pets[i];
      var pet = getPetByID(item.cid);
      var form = item.form;

      var displayimage = pet.img;
      if(form>0)
      {
        if(pet.evo)
        {
          displayimage = pet.evo[form-1].img;
        }

      }


      var bp = item.battlepower;
      var extrabp = item.extrabp;
      var totalbp = bp + extrabp;
      var extrabplabel = "";
      if(extrabp>0)
      {
        extrabplabel = "<span class='text-info'>(+" + extrabp + " BP)</span>";
      }

      html += "<div class='col-md-3'>";
      html += "<div class='card mb-3 box-shadow pet-bg-" + item.classes[0] + "'>";
      html += "<div class='card-float-right'><span class='text-large text-info float-right' data-toggle='tooltip' title='Battle Power'>BP " + totalbp + "</span><br/><span class='badge badge-light float-right'> lvl " + item.level + "</span></div>"
      html +="<div class='row mx-auto d-flex justify-content-center flex-wr'>";
      html += "<img class='card-img-top pet-image' id='pet-image-" + item.id + "' src='" + displayimage + "' alt='" + item.name + "'>";
      html += "</div>"
      html += "<div class='card-body'>";

      html += "<div class='card mb-3 box-shadow bg-light'>";
      html += "<p class='card-text text-center text-info pet-name' id='pet-name-" + item.id + "'>" + item.name + "<p>"
      html += "<p class='card-text text-center'><small><span class='text-muted' data-toggle='tooltip' title='Unique ID'> #" + item.id + "</span></small></p> ";
     

      var evotooltip = "";
      $.each(pet.evo, function(j) {
        var ev = pet.evo[j];
        evotooltip+= "lvl " + ev.level + " evolve to " + ev.name +"; ";
      });

      var evos = pet.evo;
      var evohtml = "";
      
      if(evos.length>0)
      { 
        evohtml += "<span class='text-muted evolution-placeholder' data-toggle='tooltip' title='" + evotooltip + "'><small>Evolution </small></span>"; 
        
        var buttonstyle1 = "btn-info";
        var buttonstyle2 = "btn-outline-info";
        if(form>=1)
        {
          buttonstyle1 = "btn-outline-info";
          buttonstyle2 = "btn-info";
        }

        evohtml += "<button class='btn btn-sm " + buttonstyle1 + " mr-1 pet-evo'  data-id='" + item.id + "' data-name='" + item.name +  "' data-img='" + pet.img +  "'>1</button>";
        evohtml += "<button class='btn btn-sm " + buttonstyle2 + " mr-1 pet-evo'  data-id='" + item.id + "' data-name='" + evos[0].name +  "' data-img='" + evos[0].img +  "'>2</button>";
      }
      if(evos.length>1){ 
        var buttonstyle3 = "btn-outline-info";
        if(form>=2)
        {
          buttonstyle3 = "btn-info";
        }
        evohtml += "<button class='btn btn-sm " + buttonstyle3 + " mr-1 pet-evo' data-id='" + item.id + "' data-name='" + evos[1].name +  "' data-img='" + evos[1].img +  "'>3</button>";
      }
      html += "<p class='card-text mt-1 mb-3 text-center'>" + evohtml + "</p>";

    
      var rarity = getRarityByID(item.rarity);
      var cla = getClassByID(item.cla);
      var cla_labels = "";
      $.each(item.classes, function(j) {

        var cla = getClassByID(item.classes[j]);
        var againstcla = getClassByID(cla.againstid);
        cla_labels +="<span class='mr-2'><img class='icon-image-small' src='assets/img/skills/" + cla.icon + "' data-toggle='tooltip' title='" + cla.name + " (counter " + againstcla.name + ")' /></span>";
      });
      html += "<p class='card-text text-center'><span class='badge badge-" + rarity.badge + " mr-2'>" + rarity.name + "</span>" + cla_labels + "</p>";
      
      var now = new Date().getTime();
      var diff = now - item.ts;
      var ageObj = retureTimeDifferenceInDays(diff);

      
      
      html += "<div class='row mt-3 ml-1 card-text text-normal'><div class='col-md-6 col-sm-6 col-xs-6'><small><img class='icon-image-small-no-radius' src='assets/img/skills/talent.png' data-toggle='tooltip' title='Talent' /> <span class='text-muted'>" + item.stats + "</span></small></div><div class='col-md-6 col-sm-6 col-xs-6'><small><img class='icon-image-small-no-radius' src='assets/img/skills/age.png' data-toggle='tooltip' title='Age' /> <span class='text-muted'>" + ageObj.number + " " + ageObj.type + "</span></small></div> </div>";
      html += "<div class='row mt-1 ml-1 card-text text-normal'><div class='col-md-6 col-sm-6 col-xs-6'><small><img class='icon-image-small-no-radius' src='assets/img/skills/hp.png' data-toggle='tooltip' title='Health' /> <span class='text-muted'>" + item.hp + "</span></small></div><div class='col-md-6 col-sm-6 col-xs-6'><small><img class='icon-image-small-no-radius' src='assets/img/skills/critical.png' data-toggle='tooltip' title='Critical Strike Chance' /> <span class='text-muted'>" + (item.critical*100) + "%</span></small></div> </div>";
      html += "<div class='row mt-1 ml-1 mb-2 card-text text-normal'><div class='col-md-6 col-sm-6 col-xs-6'><small><img class='icon-image-small-no-radius' src='assets/img/skills/attack.png' data-toggle='tooltip' title='Attack' /> <span class='text-muted'>" + item.attack + "</span></small></div><div class='col-md-6 col-sm-6 col-xs-6'><small><img class='icon-image-small-no-radius' src='assets/img/skills/defence.png' data-toggle='tooltip' title='Defence' /> <span class='text-muted'>" + item.defence + "</span></small></div></div>";

      var drops_label = "";
      var gears = item.gears;

      $.each(gears, function(j) {

          var gear = gears[j];
          if(gear)
          {
            var id = gear.id;
            var cid = gear.cid;
            var name = gear.name;
            var level = gear.level;
            var plushp = gear.plushp;
            var plusattack = gear.plusattack;
            var plusdefence = gear.plusdefence;
            var pluscritical = (gear.pluscritical*100);


            var g = getGearByID(cid);
            drops_label+="<span class='mr-3'><img class='gear-image-small' src='" + g.img + "' data-toggle='tooltip' title='" + name + " (level " + level + "), +" + plushp +" hp, +" + plusattack +" attack, +" + plusdefence +" defence, +" + pluscritical +"% critical ' /></span>";

          }

      });
      html += "<p class='card-text text-center text-muted mt-1'><small>"+extrabplabel+"</small> " + drops_label + "</p>";

      var exp = getExpByLevel(item.level);
      var expNow = Math.round((item.exp/exp.max)*100);
      //console.log(expNow)
      html += "<p class='card-text text-center text-muted mt-1'><small>exp</small><div class='progress'><div class='progress-bar' role='progressbar' style='width: " + expNow + "%;' aria-valuenow='" + expNow + "' aria-valuemin='0' aria-valuemax='100'>" + item.exp + "</div></div></p>";

      html += "</div>";
      
      html += "<div class='text-center mt-2'>";
      html += "<button type='button' class='btn btn-sm mt-2 btn-outline-dark btn-equipgear' data-id='" + item.id + "'>Gear</button>";
    
      html += "</div>";
      html += "</div>";
      html += "</div>";
      html += "</div>";
    });
    html += "</div>";

    $('.army-placeholder').html(html);

    RegisterOpenEquipEvents();
    RegisterTooltips();
    RegisterPetEvoEvents();

}

function loadPlayerGuards(payload){
    var pets = JSON.parse(payload);
   var html = "";
     html += "<div class='row'>";
    $.each(pets, function(i) {
      var item = pets[i];
      var pet = getPetByID(item.cid);
       var bp = item.battlepower;
      var extrabp = item.extrabp;
      var totalbp = bp + extrabp;

      html += "<div class='col-md-3' data-id=" + item.id + "  data-bp=" + totalbp + ">";
      html += "<div class='card mb-0 box-shadow pet-bg-" + item.classes[0] + "'>";
      html += "<div class='text-center'><span class='text-small text-info' data-toggle='tooltip' title='Battle Power'>BP " + totalbp + "</span></div>"
      
      html +="<div class='row mx-auto d-flex justify-content-center flex-wr'>";
      html += "<img class='card-img-top pet-image-small' src='" + pet.img + "' alt='" + item.name + "'>";
      html += "</div>"
      html += "<div class='card-body'>";
      html += "<p class='card-text text-center text-info pet-name-small' >" + item.name + "<p>"
      //html += "<p class='card-text text-center'><small><span class='text-muted' data-toggle='tooltip' title='Unique ID'> #" + item.id + "</span></small></p> ";
     
      var rarity = getRarityByID(item.rarity);
      var cla = getClassByID(item.cla);
      var cla_labels = "";
      $.each(item.classes, function(j) {

        var cla = getClassByID(item.classes[j]);
        var againstcla = getClassByID(cla.againstid);
        cla_labels +="<span class='mr-1'><img class='icon-image-small' src='assets/img/skills/" + cla.icon + "' data-toggle='tooltip' title='" + cla.name + " (counter " + againstcla.name + ")' /></span>";
      });
      html += "<p class='card-text text-center'>" + cla_labels + "</p>";

      
      html += "</div>";
      html += "</div>";
      html += "</div>";
    });
    html += "</div>";

    $('.guards-placeholder').html(html);

    RegisterTooltips();
}

function loadPlayerPetSelection(payload){
    var pets = JSON.parse(payload);
    var html = "";
     html += "<div class='row'>";
    $.each(pets, function(i) {
      var item = pets[i];
      var pet = getPetByID(item.cid);
       var bp = item.battlepower;
      var extrabp = item.extrabp;
      var totalbp = bp + extrabp;

      html += "<div class='col-md-3 petcard' data-id=" + item.id + "  data-bp=" + totalbp + ">";
      html += "<div class='card mb-3 box-shadow pet-bg-" + item.classes[0] + "'>";
      html += "<div class='card-float-right'><span class='text-small text-info float-right' data-toggle='tooltip' title='Battle Power'>BP " + totalbp + "</span><br/><span class='badge badge-light float-right'> lvl " + item.level + "</span></div>"
      
      html +="<div class='row mx-auto d-flex justify-content-center flex-wr'>";
      html += "<img class='card-img-top pet-image-small' src='" + pet.img + "' alt='" + item.name + "'>";
      html += "</div>"
      html += "<div class='card-body'>";
      html += "<p class='card-text text-center text-info pet-name-small' >" + item.name + "<p>"
      html += "<p class='card-text text-center'><small><span class='text-muted' data-toggle='tooltip' title='Unique ID'> #" + item.id + "</span></small></p> ";
     
      var rarity = getRarityByID(item.rarity);
      var cla = getClassByID(item.cla);
      var cla_labels = "";
      $.each(item.classes, function(j) {

        var cla = getClassByID(item.classes[j]);
        var againstcla = getClassByID(cla.againstid);
        cla_labels +="<span class='mr-2'><img class='icon-image-small' src='assets/img/skills/" + cla.icon + "' data-toggle='tooltip' title='" + cla.name + " (counter " + againstcla.name + ")' /></span>";
      });
      html += "<p class='card-text text-center'><span class='badge badge-" + rarity.badge + " mr-2'>" + rarity.name + "</span>" + cla_labels + "</p>";

      
      html += "</div>";
      html += "</div>";
      html += "</div>";
    });
    html += "</div>";

    $('.army-placeholder').html(html);

    RegisterSelectionEvents();
}



function loadInstances(payload){
    var instances = JSON.parse(payload);

    var html = "";
     html += "<div class='row'>";
    $.each(instances, function(i) {
      var instance = instances[i];
      var item = instanceDB[i];
       html += "<div class='col-md-12 mt-3 mb-3'>";

      html +="<div class='card'>";
      html +="<div class='card-body'>";

      html += "<div class='row'>";

      html += "<div class='col-md-4'>";
      html += "<img class='mr-3 training-image' src='"+ item.img + "' alt='Generic placeholder image'>";
      html += "</div>"

      html +="<div class='col-md-6'>"

      html += "<h5 class='mb-2 text-left text-info'>" + item.name + "</h5>";
      html += "<small>";
      html += "<div>";
      html += "<p class='text-left'><b>Entry Condition: Total BP " + instance.minbp + " ~ " + instance.maxbp + "</b> </p>";
     
      html += "<p class='text-left'>Exp:" + instance.minexp + " ~ " + instance.maxexp + "</p>";
      html += "<p class='text-left'>Gold:" + instance.mingold + " ~ " + instance.maxgold + "</p>";

      if(instance.drops)
      {
        var drops = instance.drops;
        var drops_label = "";

        $.each(drops, function(j) {

          var gear = drops[j].gear;
          if(gear)
          {
            var id = gear.id;
            var name = gear.name;
            var level = gear.level;
            var plushp = gear.plushp;
            var plusattack = gear.plusattack;
            var plusdefence = gear.plusdefence;
            var pluscritical = (gear.pluscritical*100);


            var g = getGearByID(id);
            drops_label+="<span class='mr-3'><img class='gear-image' src='" + g.img + "' data-toggle='tooltip' title='" + name + " (level " + level + "), +" + plushp +" hp, +" + plusattack +" attack, +" + plusdefence +" defence, +" + pluscritical +"% critical ' /></span>";

          }

        });
        html += "<p class='text-left'>Chance to drop: " + drops_label+ "</p>";

      }

      html+= "<p class='text-left mt-4'><button type='button' class='btn btn-sm btn-success mr-3 btn-openinstance' data-id='" + item.id + "' data-minbp='" + instance.minbp + "' data-maxbp='" + instance.maxbp + "'>Attack</button></p>"
      
      html += "</div>";
      html += "</small>";
      html += "</div>";
      html += "</div>";

       html += "</div>";


      html += "</div>";
      html += "</div>";
    });
    html += "</div>";

    $('.instances-placeholder').html(html);

    RegisterInstanceEvents();

}


function loadPlayerProfile(payload){
    var profile = JSON.parse(payload);
    var html = "";
    var nickname = "";
    var battlepower = 0;

    if(profile)
    {
      nickname = profile.nickname;
      battlepower = profile.battlepower;
    }else{
      nickname = $("#txtWalletAddress").val();
    }
    $('.nickname').html(nickname);
    $('.battlepower').html(battlepower);
   
    if(profile)
    {
       $('#txtProfileName').val(nickname);
       $('#txtSelectedImage').val(profile.image);
       var profileimage = getProfileImageByID(profile.image);
       $('.profile-image').attr("src",profileimage.img);
    }else{

      $('#txtProfileName').val(nickname);
       $('#txtSelectedImage').val("1");
       var profileimage = getProfileImageByID("1");
       $('.profile-image').attr("src",profileimage.img)


    }

    var html = "";
     html += "<div class='row'>";
    $.each(profileImageDB, function(i) {
      var item = profileImageDB[i];

      html += "<div class='col-md-3 profileimagecard' data-id=" + item.id + ">";
      html += "<div class='card mb-3 box-shadow'>";
      html += "<img class='card-img-top profile-image' src='" + item.img + "' alt=''>";
      html += "</div>";
      html += "</div>";
    });
    html += "</div>";

    $(".profile-image-placeholder").html(html);

    RegisterSelectionEvents();

}

function loadProfileCastle(payload){
    var profilecastle = JSON.parse(payload);
    var regainenergy = 0;
    if(profilecastle)
    {
        if(profilecastle.ts)
      {
        var now = new Date().getTime();
        var diff = now - profilecastle.ts;

        var minutes = Math.floor(Math.abs(now - profilecastle.ts) / 60000);

        regainenergy = minutes;

      }

      var plusbprate = profilecastle.plusbprate;
      var bufflabel = "";
      if(plusbprate>0)
      {
        bufflabel = "<small>(increase BP for all pets by " + (plusbprate*100) + "%)</small>";
      }
      
      var html = "";

      var exp = getCastleExpByLevel(profilecastle.castlelevel);
      var expNow = Math.round((profilecastle.castleexp/exp.max)*100);

      var castleenergy = profilecastle.castleenergy + regainenergy;
      if(castleenergy > 100)
      {
        castleenergy = 100;
      }

      var engNow = Math.round((castleenergy/100)*100);

      html += "<div class='row'>";
      html += "<div class='col-md-12'>";
      html += "<p class='card-text text-muted mt-2' data-toggle='tooltip' title='Castle level will provide buffs to all your pets'>Castle Level: " + profilecastle.castlelevel + " " +  bufflabel +  "</p>"; 
      html += "<p class='card-text text-muted mt-2' data-toggle='tooltip' title='Castle gains experience by winning battle, or lose experience by losing battle. Keep gaining experience to level up your castle '>Experience: <div class='progress'><div class='progress-bar' role='progressbar' style='width: " + expNow + "%;' aria-valuenow='" + expNow + "' aria-valuemin='0' aria-valuemax='100'>" + profilecastle.castleexp + "</div></div></p>";
      html += "<p class='card-text text-muted mt-2' data-toggle='tooltip' title='Each battle will cost 5 energy, when energy is too low you will need to wait before start another battle. Each minute castle will regain 1 energy. '>Engery: <div class='progress'><div class='progress-bar bg-warning' role='progressbar' style='width: " + engNow + "%;' aria-valuenow='" + engNow + "' aria-valuemin='0' aria-valuemax='100'>" + castleenergy + "</div></div></p>";
      
      html += "</div>";
      html += "</div>";

      
    $('.castlestatus-placeholder').html(html);

    }
    

    
    RegisterTooltips();
}

function loadPlayerAsset(payload){
    var assets = JSON.parse(payload);
    var html = "";
    var gold_quantity = 0;
    var honor_quantity = 0;

    $.each(assets, function(i) {
      var asset = assets[i];
      if(asset.name == "gold")
      {
        gold_quantity = asset.quantity;
      }else if(asset.name == "honor")
      {
        honor_quantity = asset.quantity;
      
      }
    });

    html += "<div class='row'>";
    html += "<div class='col-md-12'>";
    html += "<h3><span class='text-gold mr-3'><i class='fas fa-coins' data-toggle='tooltip' title='gold'></i></span> " + gold_quantity;
    html += "</h3></div>";
    html += "</div>";

    html += "<div class='row'>";
    html += "<div class='col-md-12'>";
     html += "<h3><span class='text-rare mr-3'><i class='fas fa-trophy' data-toggle='tooltip' title='honor'></i></span> " + honor_quantity;
    html += "</h3></div>";
    html += "</div>";

   
    $('.asset-placeholder').html(html);
    $('#txtGoldQuantity').val(gold_quantity);
    $('#txtHonorQuantity').val(honor_quantity);

    RegisterTooltips();
}

function loadPlayerGear(payload){
    var gears = JSON.parse(payload);

    var html = "";
    var html2 = "";
    if(gears)
    {
      if(gears.length>0)
      {
        $.each(gears, function(i) {
            var item = gears[i];
            var id = item.id;
            var slot = item.slot;
            var name = item.name;
            var level = item.level;
            var plushp = item.plushp;
            var plusattack = item.plusattack;
            var plusdefence = item.plusdefence;
            var pluscritical = (item.pluscritical*100);
            var img ="";
            var gear = getGearByID(item.cid);
            if(gear)
            {
              img = gear.img; 
            }

            html+="<span class='mr-3'><img class='gear-image' src='" + img + "' data-toggle='tooltip' title='" + name + " (level " + level + "), +" + plushp +" hp, +" + plusattack +" attack, +" + plusdefence +" defence, +" + pluscritical +"% critical ' /></span>";


            html2+="<span class='mr-3'><img class='gear-image gear' src='" + img + "' data-toggle='tooltip' title='" + name + " (level " + level + "), +" + plushp +" hp, +" + plusattack +" attack, +" + plusdefence +" defence, +" + pluscritical +"% critical ' data-id='" + id + "' data-socket='" + slot + "' /></span>";
            
        });
      }else{
        html= "<p class='text-muted'>Your bag is empty, play instance or castle pvp to win amazing rewards</p>";
      
      }

    }else{
      html = "<p class='text-muted'>Your bag is empty, play instance or castle pvp to win amazing rewards</p>";
    }

    $('.gear-placeholder').html(html);
    $('.equip-placeholder').html(html2);

    RegisterTooltips();
    RegisterEquipEvents();
}

function loadRewardLog(payload){
    var rewardlogs = JSON.parse(payload);
    var html = "";
    $.each(rewardlogs, function(i) {
      var rewardlog = rewardlogs[i];
      var now = new Date().getTime();
      var diff = now - rewardlog.ts;
      var ageObj = retureTimeDifferenceInDays(diff);

      html += "";
      html += "<div class='col-md-12'>";
      html += "<p class='text-muted'>" + ageObj.number + " " + ageObj.type + " ago: " + rewardlog.name + " in " + rewardlog.source +"</p> ";
      
      html += "</div>";
    });

    $('.rewardlog-placeholder').html(html);
    
}

function loadBattleDetails(payload){
    var battles = JSON.parse(payload);
    var html = "";
    $.each(battles, function(i) {
      var battle = battles[i];


      var challengerprofileimage = getProfileImageByID(battle.challengerimg);

      var defenderprofileimage = getProfileImageByID(battle.defenderimg);
      //var pet = getPetByID(item.cid);
      // var bp = item.battlepower;
      // var extrabp = item.extrabp;
      // var totalbp = bp + extrabp;
      var challengerresult = battle.winner == 1?"<span class='text-danger'><h1>Win</h1></span>":"<span class='text-info'><h1>Lose</h1></span>";
      var defenderresult = battle.winner == 2?"<span class='text-danger'><h1>Win</h1></span>":"<span class='text-info'><h1>Lose</h1></span>";


      html += "<div class='row text-center'>";

      html += "<div class='col-md-12 mt-2 mb-2 card box-shadow'>";


      html += "<div class='row mt-3'>";

      html += "<div class='col-md-6'>";
      html += "<div class='card mb-3 box-shadow pet-bg'>";
      html +="<div class='row mx-auto d-flex justify-content-center flex-wr'>";
      //html += "<img class='card-img-top pet-image-small' src='" + pet.img + "' alt='" + item.name + "'>";
      html += "</div>"
      html += "<div class='card-body'>";

      html += "<div class='row text-center'>";    
      html += "<div class='col-md-12'>";
      html += "<p class='card-text text-large text-center text-dark pet-name-small' >" + battle.challenger + "</p>"
      html += "</div>"
       html += "</div>"
      html += "<div class='row'>";
      html += "<div class='col-md-3'>";
      html +="<img class='mr-4 profile-image-small' src='" + challengerprofileimage.img + "' alt='Profile'>"
      html += "<div class='mb-1'>"
      html += "<p class='card-text text-center text-info pet-name-small' >BP " + battle.challengerbp + "<p>"
      
      html += "<p class='card-text text-center text-info pet-name-small' >Castle Level " + battle.challengercastlelevel + "<p>"
      html += "</div>";
      html += "</div>";
      html += "<div class='col-md-9'>";

      html += "<div class='row'>";

      $.each(battle.challengerpets, function(j) {
      var item = battle.challengerpets[j];
      var pet = getPetByID(item.cid);
       var bp = item.battlepower;
      var extrabp = item.extrabp;
      var totalbp = bp + extrabp;

      html += "<div class='col-md-2' data-id=" + item.id + "  data-bp=" + totalbp + ">";
      html += "<div class='mb-0 box-shadow'>";
      html += "<div class='text-center'><span class='text-sm text-info' data-toggle='tooltip' title='Battle Power'>" + totalbp + "</span></div>"
      
      html +="<div class='row'>";
      html += "<img class='pet-image-xs' src='" + pet.img + "' alt='" + item.name + "'>";
      html += "</div>"
      var rarity = getRarityByID(item.rarity);
      var cla = getClassByID(item.cla);
      var cla_labels = "";
      $.each(item.classes, function(j) {

        var cla = getClassByID(item.classes[j]);
        var againstcla = getClassByID(cla.againstid);
        cla_labels +="<span class='mr-1'><img class='icon-image-small' src='assets/img/skills/" + cla.icon + "' data-toggle='tooltip' title='" + cla.name + " (counter " + againstcla.name + ")' /></span>";
      });

      html += "</div>";
      html += "</div>";
    });

      html += "</div>";


      html +=challengerresult;
     
      html += "</div>";

      html += "</div>";
      html += "</div>";
      html += "</div>";

      html += "</div>";

      //winner


      html += "<div class='col-md-6'>";
      html += "<div class='card mb-3 box-shadow pet-bg'>";
      html +="<div class='row mx-auto d-flex justify-content-center flex-wr'>";
      //html += "<img class='card-img-top pet-image-small' src='" + pet.img + "' alt='" + item.name + "'>";
      html += "</div>"
      html += "<div class='card-body'>";

      html += "<div class='row text-center'>";    
      html += "<div class='col-md-12'>";
      html += "<p class='card-text text-large text-center text-dark pet-name-small' >" + battle.defender + "</p>"
      html += "</div>"
       html += "</div>"

      html += "<div class='row'>";
      html += "<div class='col-md-3'>";
      html +="<img class='mr-4 profile-image-small' src='" + defenderprofileimage.img + "' alt='Profile'>"

      html += "<div class='mb-1'>"
      html += "<p class='card-text text-center text-info pet-name-small' >BP " + battle.defenderbp + "<p>"
      
      html += "<p class='card-text text-center text-info pet-name-small' >Castle Level " + battle.defendercastlelevel + "<p>"
      html += "</div>";
      html += "</div>";
      html += "<div class='col-md-9'>";

      html += "<div class='row'>";

      $.each(battle.defenderpets, function(j) {
      var item = battle.defenderpets[j];
      var pet = getPetByID(item.cid);
       var bp = item.battlepower;
      var extrabp = item.extrabp;
      var totalbp = bp + extrabp;

      html += "<div class='col-md-2' data-id=" + item.id + "  data-bp=" + totalbp + ">";
      html += "<div class='mb-0 box-shadow'>";
      html += "<div class='text-center'><span class='text-sm text-info' data-toggle='tooltip' title='Battle Power'>" + totalbp + "</span></div>"
      
      html +="<div class='row'>";
      html += "<img class='pet-image-xs' src='" + pet.img + "' alt='" + item.name + "'>";
      html += "</div>"
      var rarity = getRarityByID(item.rarity);
      var cla = getClassByID(item.cla);
      var cla_labels = "";
      $.each(item.classes, function(j) {

        var cla = getClassByID(item.classes[j]);
        var againstcla = getClassByID(cla.againstid);
        cla_labels +="<span class='mr-1'><img class='icon-image-small' src='assets/img/skills/" + cla.icon + "' data-toggle='tooltip' title='" + cla.name + " (counter " + againstcla.name + ")' /></span>";
      });

      html += "</div>";
      html += "</div>";
    });

      html += "</div>";

      html +=defenderresult;

      html += "</div>";

      html += "</div>";
      html += "</div>";
      html += "</div>";

      html += "</div>";
      html += "</div>";

      
      html += "</div>";
    html += "</div>";
    });

    $('.battledetails-placeholder').html(html);
    
}

function loadBattleLog(payload){
    var battlelogs = JSON.parse(payload);
    var html = "";
    $.each(battlelogs, function(i) {
      var battlelog = battlelogs[i];
      var now = new Date().getTime();
      var diff = now - battlelog.ts;
      var ageObj = retureTimeDifferenceInDays(diff);

      html += "";
      html += "<div class='col-md-12'>";
      html += "<p class='text-muted'>" + ageObj.number + " " + ageObj.type + " ago: " + battlelog.name;
      
      html += "</div>";
    });

    $('.battlelog-placeholder').html(html);
    
}

function loadAllPetClasses(payload){
    var classes = JSON.parse(payload);
    var html = "";
    $.each(classes, function(i) {

      var item = classes[i];
      var petClass = getPetByID(item.id);
      html += "";

      html += "<div class='col-md-3'>";
      html += "<div class='card mb-3 box-shadow pet-bg-" + item.classes[0] + "'>";
      html +="<div class='row mx-auto d-flex justify-content-center flex-wr'>";
      html += "<img class='card-img-top pet-image' id='pet-image-" + item.id + "' src='" + petClass.img + "' alt='" + item.name + "'>";
      html += "</div>"
      html += "<div class='card-body'>";
      var price_label = "";
      if(item.price > 0)
      {
        if(item.pricetype==1)
        {
          price_label = "<i class='fas fa-tags'></i> " + item.price + " NAS";
        }else if(item.pricetype==2){
          price_label ="<span><span class='text-gold'><i class='fas fa-coins' data-toggle='tooltip' title='Gold' data-original-title='gold'></i></span> " + item.price + " Gold</span>"
        }else if(item.pricetype==3){
          price_label ="<span><span class='text-rare'><i class='fas fa-trophy' data-toggle='tooltip' title='Honor' data-original-title='honor'></i></span> " + item.price + " Honor</span>"
        }
       
      }else{
        price_label = "Get for Free";
      }


      html += "<div class='card mb-1 box-shadow bg-light'>"
      html += "<p class='card-text text-center text-info pet-name' id='pet-name-" + item.id + "'>" + item.name + "</p>"; //
      
       var evos = petClass.evo;

       var evotooltip = "";
      $.each(petClass.evo, function(j) {
        var ev = petClass.evo[j];
        evotooltip+= "lvl " + ev.level + " evolve to " + ev.name +"; ";
      });

      var evohtml = "";
      if(evos.length>0)
      { 
        evohtml += "<span class='text-muted evolution-placeholder' data-toggle='tooltip' title='" + evotooltip + "'><small>Evolution </small></span>"; 
        evohtml += "<button class='btn btn-sm btn-info mr-1 pet-evo'  data-id='" + item.id + "' data-name='" + item.name +  "' data-img='" + petClass.img +  "'>1</button>";
        evohtml += "<button class='btn btn-sm btn-outline-info mr-1 pet-evo'  data-id='" + item.id + "' data-name='" + evos[0].name +  "' data-img='" + evos[0].img +  "'>2</button>";
      }
      if(evos.length>1){ 
        evohtml += "<button class='btn btn-sm btn-outline-info mr-1 pet-evo' data-id='" + item.id + "' data-name='" + evos[1].name +  "' data-img='" + evos[1].img +  "'>3</button>";
      }
     
      html += "<p class='card-text mt-3 mb-3 text-center'>" + evohtml + "</p>";

      var rarity = getRarityByID(item.rarity);
      //var role = getRoleByID(item.role);
      

      var cla_labels = "";
      $.each(item.classes, function(j) {

        var cla = getClassByID(item.classes[j]);
        var againstcla = getClassByID(cla.againstid);
        cla_labels +="<span class='mr-2'><img class='icon-image-small' src='assets/img/skills/" + cla.icon + "' data-toggle='tooltip' title='" + cla.name + " (counter " + againstcla.name + ")' /></span>";
      });

      html += "<p class='card-text text-center'><span class='badge badge-" + rarity.badge + " mr-2'>" + rarity.name + "</span>" + cla_labels + "</p>";
     
      html += "<p class='card-text mt-2 text-center text-muted'><small><img class='icon-image-small-no-radius' src='assets/img/skills/talent.png' data-toggle='tooltip' title='Talent' /> " + rarity.minstats + " ~ " + rarity.maxstats + "</small></p>";
      var t = item.supply - item.circulate;
      html += "<p class='card-text text-normal text-center text-muted'><small><span class='text-primary petclasssupply'>" + item.supply + "</span> " + item.name + " in the world, <span class='text-warning petclassavailable'>" + t + "</span> available.</small></p>";


     
     
      // html += "<small class='card-text'>" + petClass.desc + "</small>";

      // html += "<div class='d-flex justify-content-between align-items-center'>";
      html += "<div class='text-center mt-4 mb-2'>";
      html += "<button type='button' class='btn btn-sm btn-outline-dark btn-openbuy' data-cid='" + item.id + "' data-price='" + item.price + "' data-pricetype='" + item.pricetype + "' data-name='" + item.name + "'>" + price_label + "</button>";
      
      html += "</div>";
       html += "</div>";
      //html += "<small class='text-danger'>0.00005 NAS</small>";
      // html += "</div>";
      html += "</div>";
      html += "</div>";
      html += "</div>";
    });

    $('.shop-placeholder').html(html);
    
    RegisterEvents();


    // $('.petclasssupply').each(function(i, obj) {
    //    var id = $(obj).data("id");

    //    $.each(classes, function(j) {

    //     var cla = classes[j];
    //     if(id==cla.id)
    //     {
    //       $(obj).html(cla.supply);
    //       var t = cla.supply - cla.circulate;
    //       $(obj).next('.petclassavailable').html(t);
         
          
    //     }

    //    });
    // });
    
    
}




function getAllPetClasses(){

        var from = $("#txtWalletAddress").val();

        var value = "0";
        var nonce = "0"
        var gas_price = "1000000"
        var gas_limit = "2000000"
        var callFunction = "getAllPetClasses";
        //var callArgs = "[\"" + $("#search_value").val() + "\"]"; //in the form of ["args"]
        var callArgs = "[]"; //in the form of ["args"]
        var contract = {
            "function": callFunction,
            "args": callArgs
        }

        neb.api.call(from,dappAddress,value,nonce,gas_price,gas_limit,contract).then(function (resp) {
            console.log(resp)
            if(resp.result)
            {
              loadAllPetClasses(resp.result)
            }
        }).catch(function (err) {
            //cbSearch(err)
            console.log("error:" + err.message)
        })
}
function GetPetSockets(petid){

        var from = $("#txtWalletAddress").val();

        var value = "0";
        var nonce = "0"
        var gas_price = "1000000"
        var gas_limit = "2000000"
        var callFunction = "getPet";
        var args = [];
        args.push(petid);
        //var callArgs = "[\"" + $("#search_value").val() + "\"]"; //in the form of ["args"]
        var callArgs = JSON.stringify(args); //in the form of ["args"]
        var contract = {
            "function": callFunction,
            "args": callArgs
        }

        neb.api.call(from,dappAddress,value,nonce,gas_price,gas_limit,contract).then(function (resp) {
            
            if(resp.result)
            {
              loadPetSockets(resp.result)
            }
        }).catch(function (err) {
            //cbSearch(err)
            console.log("error:" + err.message)
        })
}


function getPlayerPet(){

        var from = $("#txtWalletAddress").val();

        var value = "0";
        var nonce = "0"
        var gas_price = "1000000"
        var gas_limit = "2000000"
        var callFunction = "getPlayerPet";
        //var callArgs = "[\"" + $("#search_value").val() + "\"]"; //in the form of ["args"]
        var callArgs = "[]"; //in the form of ["args"]
        var contract = {
            "function": callFunction,
            "args": callArgs
        }

        neb.api.call(from,dappAddress,value,nonce,gas_price,gas_limit,contract).then(function (resp) {
            
            if(resp.result)
            {
              loadPlayerPet(resp.result)
            }
        }).catch(function (err) {
            //cbSearch(err)
            console.log("error:" + err.message)
        })
}


function getPlayerGuards(){

        var from = $("#txtWalletAddress").val();

        var value = "0";
        var nonce = "0"
        var gas_price = "1000000"
        var gas_limit = "2000000"
        var callFunction = "getPlayerGuards";
        //var callArgs = "[\"" + $("#search_value").val() + "\"]"; //in the form of ["args"]
        var callArgs = "[]"; //in the form of ["args"]
        var contract = {
            "function": callFunction,
            "args": callArgs
        }

        neb.api.call(from,dappAddress,value,nonce,gas_price,gas_limit,contract).then(function (resp) {
           
            if(resp.result)
            {
              loadPlayerGuards(resp.result)
            }
        }).catch(function (err) {
            //cbSearch(err)
            console.log("error:" + err.message)
        })
}
function getPlayerPetSelection(){

        var from = $("#txtWalletAddress").val();

        var value = "0";
        var nonce = "0"
        var gas_price = "1000000"
        var gas_limit = "2000000"
        var callFunction = "getPlayerPet";
        //var callArgs = "[\"" + $("#search_value").val() + "\"]"; //in the form of ["args"]
        var callArgs = "[]"; //in the form of ["args"]
        var contract = {
            "function": callFunction,
            "args": callArgs
        }

        neb.api.call(from,dappAddress,value,nonce,gas_price,gas_limit,contract).then(function (resp) {
           
            if(resp.result)
            {
              loadPlayerPetSelection(resp.result)
            }
        }).catch(function (err) {
            //cbSearch(err)
            console.log("error:" + err.message)
        })
}

function checkPlayerProfile(){

        var from = $("#txtWalletAddress").val();

        var value = "0";
        var nonce = "0"
        var gas_price = "1000000"
        var gas_limit = "2000000"
        var callFunction = "getProfile";
        //var callArgs = "[\"" + $("#search_value").val() + "\"]"; //in the form of ["args"]
        var callArgs = "[]"; //in the form of ["args"]
        var contract = {
            "function": callFunction,
            "args": callArgs
        }

        neb.api.call(from,dappAddress,value,nonce,gas_price,gas_limit,contract).then(function (resp) {
            
            if(resp.result)
            {
              if(resp.result!="" && resp.result!="null" )
              {
                  $(".content-placeholder").removeClass("d-none");
                  
              }else{
              $(".profile-required-placeholder").removeClass("d-none");
              }
            }else{
              $(".profile-required-placeholder").removeClass("d-none");
            }
        }).catch(function (err) {
            //cbSearch(err)
            console.log("error:" + err.message)
        })
}

function getPlayerProfile(){

        var from = $("#txtWalletAddress").val();

        var value = "0";
        var nonce = "0"
        var gas_price = "1000000"
        var gas_limit = "2000000"
        var callFunction = "getProfile";
        //var callArgs = "[\"" + $("#search_value").val() + "\"]"; //in the form of ["args"]
        var callArgs = "[]"; //in the form of ["args"]
        var contract = {
            "function": callFunction,
            "args": callArgs
        }

        neb.api.call(from,dappAddress,value,nonce,gas_price,gas_limit,contract).then(function (resp) {
            
            if(resp.result)
            {
              if(resp.result!="" && resp.result!="null" )
              {
                  $(".content-placeholder").removeClass("d-none");
                  loadPlayerProfile(resp.result)
              }else{
              $(".profile-required-placeholder").removeClass("d-none");
              }
            }else{
              $(".profile-required-placeholder").removeClass("d-none");
            }
        }).catch(function (err) {
            //cbSearch(err)
            console.log("error:" + err.message)
        })
}

function attackCastle(){

        var from = $("#txtWalletAddress").val();

    
        var to = dappAddress;
        var value = "0";
        var callFunction = "attackCastle"
        var callArgs = "[]";
        
        serialNumber = nebPay.call(to, value, callFunction, callArgs, {    //使用nebpay的call接口去调用合约,
            listener: attackCastleCallback        //设置listener, 处理交易返回信息
        }); 
}

function changeProfile(name,image){

        var from = $("#txtWalletAddress").val();

       
        var Args = [];
        Args.push(name); 
        Args.push(image); 

        var to = dappAddress;
        var value = "0";
        var callFunction = "changeProfile"
        var callArgs = JSON.stringify(Args);
        
        serialNumber = nebPay.call(to, value, callFunction, callArgs, {    //使用nebpay的call接口去调用合约,
            listener: changeProfileCallback        //设置listener, 处理交易返回信息
        }); 
}


function attackTraining(trainingID,IDs){

        var from = $("#txtWalletAddress").val();

        var value = "0";
        var nonce = "0"
        var gas_price = "1000000"
        var gas_limit = "2000000"
        var callFunction = "attackTraining";
       
        var Args = [];
        Args.push(trainingID); 
        Args.push(JSON.stringify(IDs)); 


        var to = dappAddress;
        var value = "0";
        var callFunction = "attackTraining"
        var callArgs = JSON.stringify(Args);
        
        serialNumber = nebPay.call(to, value, callFunction, callArgs, {    //使用nebpay的call接口去调用合约,
            listener: attackTrainingCallback        //设置listener, 处理交易返回信息
        }); 
}



function addPetSlotAssignment(petID,slotID,gearID){

        var from = $("#txtWalletAddress").val();

       
        var Args = [];
        Args.push(petID); 
        Args.push(slotID); 
        Args.push(gearID); 

        var to = dappAddress;
        var value = "0";
        var callFunction = "addPetSlotAssignment"
        var callArgs = JSON.stringify(Args);
        
        serialNumber = nebPay.call(to, value, callFunction, callArgs, {    //使用nebpay的call接口去调用合约,
            listener: addPetSlotAssignmentCallback        //设置listener, 处理交易返回信息
        }); 
}

function attackInstance(instanceID,IDs){

        var from = $("#txtWalletAddress").val();

       
        var Args = [];
        Args.push(instanceID); 
        Args.push(JSON.stringify(IDs)); 

        var to = dappAddress;
        var value = "0";
        var callFunction = "attackInstance"
        var callArgs = JSON.stringify(Args);
        
        serialNumber = nebPay.call(to, value, callFunction, callArgs, {    //使用nebpay的call接口去调用合约,
            listener: attackInstanceCallback        //设置listener, 处理交易返回信息
        }); 
}

function updateGuards(IDs){

        var from = $("#txtWalletAddress").val();

       
        var Args = [];
        Args.push(JSON.stringify(IDs)); 

        var to = dappAddress;
        var value = "0";
        var callFunction = "updateGuards"
        var callArgs = JSON.stringify(Args);
        
        serialNumber = nebPay.call(to, value, callFunction, callArgs, {    //使用nebpay的call接口去调用合约,
            listener: updateGuardsCallback        //设置listener, 处理交易返回信息
        }); 
}

function getPlayerScroll(){

        var from = $("#txtWalletAddress").val();

        var value = "0";
        var nonce = "0"
        var gas_price = "1000000"
        var gas_limit = "2000000"
        var callFunction = "getScroll";
        //var callArgs = "[\"" + $("#search_value").val() + "\"]"; //in the form of ["args"]
        var callArgs = "[]"; //in the form of ["args"]
        var contract = {
            "function": callFunction,
            "args": callArgs
        }

        neb.api.call(from,dappAddress,value,nonce,gas_price,gas_limit,contract).then(function (resp) {
       
            if(resp.result)
            {
              loadPlayerScroll(resp.result)
            }
        }).catch(function (err) {
            //cbSearch(err)
            console.log("error:" + err.message)
        })
}

function getProfileCastle(){
    var from = $("#txtWalletAddress").val();

    var value = "0";
    var nonce = "0"
    var gas_price = "1000000"
    var gas_limit = "2000000"
    var callFunction = "getProfileCastle";
    //var callArgs = "[\"" + $("#search_value").val() + "\"]"; //in the form of ["args"]
    var callArgs = "[]"; //in the form of ["args"]
    var contract = {
        "function": callFunction,
        "args": callArgs
    }

    neb.api.call(from,dappAddress,value,nonce,gas_price,gas_limit,contract).then(function (resp) {
        if(resp.result)
            {
              loadProfileCastle(resp.result)
            }
    }).catch(function (err) {
        //cbSearch(err)
        console.log("error:" + err.message)
    })

}

function getPlayerAsset(){
    var from = $("#txtWalletAddress").val();

    var value = "0";
    var nonce = "0"
    var gas_price = "1000000"
    var gas_limit = "2000000"
    var callFunction = "getPlayerAsset";
    //var callArgs = "[\"" + $("#search_value").val() + "\"]"; //in the form of ["args"]
    var callArgs = "[]"; //in the form of ["args"]
    var contract = {
        "function": callFunction,
        "args": callArgs
    }

    neb.api.call(from,dappAddress,value,nonce,gas_price,gas_limit,contract).then(function (resp) {
        if(resp.result)
            {
              loadPlayerAsset(resp.result)
            }
    }).catch(function (err) {
        //cbSearch(err)
        console.log("error:" + err.message)
    })

}

function getPlayerGear(){
    var from = $("#txtWalletAddress").val();

    var value = "0";
    var nonce = "0"
    var gas_price = "1000000"
    var gas_limit = "2000000"
    var callFunction = "getPlayerGear";
    //var callArgs = "[\"" + $("#search_value").val() + "\"]"; //in the form of ["args"]
    var callArgs = "[]"; //in the form of ["args"]
    var contract = {
        "function": callFunction,
        "args": callArgs
    }

    neb.api.call(from,dappAddress,value,nonce,gas_price,gas_limit,contract).then(function (resp) {
        if(resp.result)
            {
              loadPlayerGear(resp.result)
            }
    }).catch(function (err) {
        //cbSearch(err)
        console.log("error:" + err.message)
    })

}

function getRewardLog(){
    var from = $("#txtWalletAddress").val();

    var value = "0";
    var nonce = "0"
    var gas_price = "1000000"
    var gas_limit = "2000000"
    var callFunction = "getRewardLog";
    //var callArgs = "[\"" + $("#search_value").val() + "\"]"; //in the form of ["args"]
    var callArgs = "[]"; //in the form of ["args"]
    var contract = {
        "function": callFunction,
        "args": callArgs
    }

    neb.api.call(from,dappAddress,value,nonce,gas_price,gas_limit,contract).then(function (resp) {
        if(resp.result)
        {
              loadRewardLog(resp.result)
        }
    }).catch(function (err) {
        //cbSearch(err)
        console.log("error:" + err.message)
    })

}


function getBattleLog(){
    var from = $("#txtWalletAddress").val();

    var value = "0";
    var nonce = "0"
    var gas_price = "1000000"
    var gas_limit = "2000000"
    var callFunction = "getBattleLog";
    //var callArgs = "[\"" + $("#search_value").val() + "\"]"; //in the form of ["args"]
    var callArgs = "[]"; //in the form of ["args"]
    var contract = {
        "function": callFunction,
        "args": callArgs
    }

    neb.api.call(from,dappAddress,value,nonce,gas_price,gas_limit,contract).then(function (resp) {
        if(resp.result)
        {
              loadBattleLog(resp.result)
        }
    }).catch(function (err) {
        //cbSearch(err)
        console.log("error:" + err.message)
    })

}
function getBattleDetails(){
    var from = $("#txtWalletAddress").val();

    var value = "0";
    var nonce = "0"
    var gas_price = "1000000"
    var gas_limit = "2000000"
    var callFunction = "getBattle";
    //var callArgs = "[\"" + $("#search_value").val() + "\"]"; //in the form of ["args"]
    var callArgs = "[]"; //in the form of ["args"]
    var contract = {
        "function": callFunction,
        "args": callArgs
    }

    neb.api.call(from,dappAddress,value,nonce,gas_price,gas_limit,contract).then(function (resp) {
        if(resp.result)
        {
              loadBattleDetails(resp.result)
        }
    }).catch(function (err) {
        //cbSearch(err)
        console.log("error:" + err.message)
    })

}

function getInstances(){
    var from = $("#txtWalletAddress").val();

    var value = "0";
    var nonce = "0"
    var gas_price = "1000000"
    var gas_limit = "2000000"
    var callFunction = "getInstances";
    //var callArgs = "[\"" + $("#search_value").val() + "\"]"; //in the form of ["args"]
    var callArgs = "[]"; //in the form of ["args"]
    var contract = {
        "function": callFunction,
        "args": callArgs
    }

    neb.api.call(from,dappAddress,value,nonce,gas_price,gas_limit,contract).then(function (resp) {
        if(resp.result)
        {
          loadInstances(resp.result)
        }
    }).catch(function (err) {
        //cbSearch(err)
        console.log("error:" + err.message)
    })

}
function receiptTransaction(txhash, initObject, successfultext, errortext) {
    
      neb.api.getTransactionReceipt(txhash).then(function (resp) {

      if(resp.status == 1)
      {
        toastr.remove();
        toastr.options.showDuration = "5000";
        toastr.options.timeOut = "5000";
        toastr["success"](resp.execute_result);
        clearInterval(intervalQuery);

        if(initObject=="initHome")
        {
          initHome();
        }else if(initObject=="initTeam")
        {
          initTeam();
        }else if(initObject=="initCastle")
        {
          initCastle();
        }else if(initObject=="initInstance")
        {
          initInstance();
        }


      }else if(resp.status == 0){ // error 
        toastr.remove();
        toastr.options.showDuration = "5000";
        toastr.options.timeOut = "5000";
        if(resp.execute_error == "insufficient gas")
        {

        toastr["warning"](resp.execute_error + " - please increase your GAS Limit");
        }else{

        toastr["warning"](resp.execute_error);

        }
        clearInterval(intervalQuery);
      }
    }).catch(function (err) {
        //cbSearch(err)
        console.log("error:" + err.message)
    })
}

function cbPush(resp) {

        if(resp)
        {
          if(resp.txhash)
          {
            toastr["info"]("Please check 'My team' page for result, it makes take a few minutes depend on the network");
          }else{
            toastr["warning"]("Request is canceled");
          }
        }
}
function openScrollCallback(resp) {

        if(resp)
        {
          if(resp.txhash)
          {
            toastr["info"]("Please check 'My team' page for result, it makes take a few minutes depend on the network");
          }else{
            toastr["warning"]("Request is canceled");
          }
        }
}
function buyPetCallback(resp) {

        if(resp)
        {
          if(resp.txhash)
          {

            $("#txtPetID").val("");
            $("#txtPetPrice").val("");
            $("#buyPetModal").modal("hide");

            toastr.options.showDuration = "30000";
            toastr.options.timeOut = "30000";
            toastr["info"]("Request sent, please wait...");

            intervalQuery = setInterval(function () {
                receiptTransaction(resp.txhash, "initHome", "Transaction is successful, check 'My team' page for your new friend :)", "Transaction failed")
            }, 3000);
            
          }else{
            toastr["warning"]("Request is canceled");
          }
        }
}




function attackTrainingCallback(resp) {

        if(resp)
        {
          if(resp.txhash)
          {

            $("#txtTrainingID").val("");
            $("#txtSelectedIDs").val("");
            $("#trainingModal").modal("hide");

            toastr.options.showDuration = "30000";
            toastr.options.timeOut = "30000";
            toastr["info"]("Attack has begun, please wait...");

            intervalQuery = setInterval(function () {
                receiptTransaction(resp.txhash, "initTraining", "Attack is completed, check 'My team' page for result", "Transaction failed")
            }, 3000);
          }else{
            toastr["warning"]("Request is canceled");
          }
        }
}

function attackCastleCallback(resp) {

        if(resp)
        {
          if(resp.txhash)
          {

            
            toastr.options.showDuration = "30000";
            toastr.options.timeOut = "30000";
            toastr["info"]("Searching for opponent, please wait...");

            intervalQuery = setInterval(function () {
                receiptTransaction(resp.txhash, "initCastle","Succesful! Check battle log for details", "Transaction failed")
            }, 3000);
          }else{
            toastr["warning"]("Request is canceled");
          }
        }
}

function changeProfileCallback(resp) {

        if(resp)
        {
          if(resp.txhash)
          {

            $("#txtProfileName").val("");
            $("#txtSelectedImage").val("");
            $("#changeProfileModal").modal("hide");
            toastr.options.showDuration = "30000";
            toastr.options.timeOut = "30000";
            toastr["info"]("Request sent, please wait...");

            intervalQuery = setInterval(function () {
                receiptTransaction(resp.txhash,"initTeam","Profile is updated", "Transaction failed")
            }, 3000);
          }else{
            toastr["warning"]("Request is canceled");
          }
        }
}


function addPetSlotAssignmentCallback(resp) {

        if(resp)
        {
          if(resp.txhash)
          {

            $("#txtSelectedPetID").val("");
            $("#txtSelectedSocketID").val("");
            $("#txtSelectedGearID").val("");
            $("#equipModal").modal("hide");
            toastr.options.showDuration = "30000";
            toastr.options.timeOut = "30000";
            toastr["info"]("Request sent, please wait...");

            intervalQuery = setInterval(function () {
                receiptTransaction(resp.txhash,"initTeam", "Successful, please refresh the page", "Transaction failed")
            }, 3000);
          }else{
            toastr["warning"]("Request is canceled");
          }
        }
}

function updateGuardsCallback(resp) {

        if(resp)
        {
          if(resp.txhash)
          {

            $("#txtSelectedIDs").val("");
            $("#guardsModal").modal("hide");
            toastr.options.showDuration = "30000";
            toastr.options.timeOut = "30000";
            toastr["info"]("Request sent, please wait...");

            intervalQuery = setInterval(function () {
                receiptTransaction(resp.txhash,"initCastle", "Guards updated", "Transaction failed")
            }, 3000);
          }else{
            toastr["warning"]("Request is canceled");
          }
        }
}

function attackInstanceCallback(resp) {

        if(resp)
        {
          if(resp.txhash)
          {

            $("#txtInstanceID").val("");
            $("#txtSelectedIDs").val("");
            $("#instanceModal").modal("hide");
            toastr.options.showDuration = "30000";
            toastr.options.timeOut = "30000";
            toastr["info"]("Attack has begun, please wait...");

            intervalQuery = setInterval(function () {
                receiptTransaction(resp.txhash,"initCastle", "Attack is completed, check 'My team' page", "Transaction failed")
            }, 3000);
          }else{
            toastr["warning"]("Request is canceled");
          }
        }
}

function getProfileImageByID(id)
{
   var r = null;
   $.each(profileImageDB, function(i) { 
    var profileimage = profileImageDB[i];
    if(profileimage.id == id)
    {
        r = profileimage;
    }
   });
   return r;
}

function getPetByID(id)
{
   var r = null;
   $.each(petDB, function(i) { 
    var pet = petDB[i];
    if(pet.id == id)
    {
        r = pet;
    }
   });
   return r;
}
function getGearByID(id)
{
   var r = null;
   $.each(gearDB, function(i) { 
    var gear = gearDB[i];
    if(gear.id == id)
    {
        r = gear;
    }
   });
   return r;
}

function getRarityByID(id)
{
   var r = null;
   $.each(rarityDB, function(i) { 
    var rarity = rarityDB[i];
    if(rarity.id == id)
    {
        r = rarity;
    }
   });
   return r;
}

function getRoleByID(id)
{
   var r = null;
   $.each(roleDB, function(i) { 
    var role = roleDB[i];
    if(role.id == id)
    {
        r = role;
    }
   });
   return r;
}

function getClassByID(id)
{
   var r = null;
   $.each(claDB, function(i) { 
    var cla = claDB[i];
    if(cla.id == id)
    {
        r = cla;
    }
   });
   return r;
}


function getExpByLevel(lvl)
{
   var r = null;
   $.each(lvlDB, function(i) { 
    var exp = lvlDB[i];
    if(exp.id == lvl)
    {
        r = exp;
    }
   });
   return r;
}
function getCastleExpByLevel(lvl)
{
   var r = null;
   $.each(castlelvlDB, function(i) { 
    var exp = castlelvlDB[i];
    if(exp.id == lvl)
    {
        r = exp;
    }
   });
   return r;
}
function RegisterOpenEquipEvents()
{
  
$(".btn-equipgear").unbind("click");
  $(".btn-equipgear").click(function(){
    var petid=$(this).data("id");
    $("#txtSelectedPetID").val(petid);
    GetPetSockets(petid);
    $("#equipModal").modal("show");
  });
}

function RegisterEquipEvents()
{

$(".gear-socket").unbind("click");
  $(".gear-socket").click(function(){
    var id=$(this).data("id");
    $("#txtSelectedSocketID").val(id);
    toggleGearSocketSelection(this)
  });


$(".gear").unbind("click");
  $(".gear").click(function(){
    var id=$(this).data("id");
    var socket=$(this).data("socket");
    $("#txtSelectedGearID").val(id);
    toggleGearSelection(this)
  });



$(".btn-updategear").unbind("click");
 $(".btn-updategear").click(function(){

    var petID = $('#txtSelectedPetID').val();
    var socketID = $('#txtSelectedSocketID').val();
    var gearID = $('#txtSelectedGearID').val();

    if(petID!="" && socketID!="" &&gearID!="")
    {
         addPetSlotAssignment(petID,socketID,gearID);
    }else{
      toastr["warning"]("Please select the socket and gear to equip")
    }
  });
}

function toggleGearSocketSelection(obj)
{
  $(".gear-socket").removeClass("socket-selected");
  $(obj).addClass("socket-selected");
}

function toggleGearSelection(obj)
{
  $(".gear").removeClass("gear-selected");
  $(obj).addClass("gear-selected");
}

function RegisterTooltips()
{
  $('[data-toggle="tooltip"]').tooltip(); 
}
function RegisterSelectionEvents()
{
    
$(".btn-petcard").unbind("click");
    $(".petcard").click(function(){
      var id=$(this).data("id");
      var bp=$(this).data("bp");
      var ids =$("#txtSelectedIDs").val();
      if(ids)
      {
        ids = JSON.parse("[" + ids + "]");
        if(ids.includes(id))
        {
          var index = ids.indexOf(id);
          if (index > -1) {
            ids.splice(index, 1);
          }

        }else{
          ids.push(id);
        }

      }else{
        ids = [];
        ids.push(id);
      }

      $("#txtSelectedIDs").val(ids.toString());
      var bptotal = 0;
      $.each(ids, function(i) { 
        var bp = $("[data-id='" + ids[i] + "']").data("bp");
        bptotal= bptotal + bp;
      });
      $("#txtSelectedBPTotal").val(bptotal);
      togglePetCardSelection(this);
      

    });

    
$(".btn-profileimagecard").unbind("click");

    $(".profileimagecard").click(function(){
      var id=$(this).data("id");

      $("#txtSelectedImage").val(id);

      $(".box-shadow").removeClass("border");
      $(".box-shadow").removeClass("border-selected");
      $(".box-shadow").removeClass("border-success");
      $(".box-shadow .card-selected").remove(); 

      $(".box-shadow",this).addClass("border");
      $(".box-shadow",this).addClass("border-selected");
      $(".box-shadow",this).addClass("border-success");
      var html = "<div class='card-float-center card-selected text-legend'><h1><i class='fas fa-check'></i></h1></div>";
      $(".box-shadow",this).append(html);

    });
}

function RegisterInstanceEvents()
{
    $('[data-toggle="tooltip"]').tooltip(); 

$(".btn-openinstance").unbind("click");
    $(".btn-openinstance").click(function(){

      var id = $(this).data('id');
      var minbp = $(this).data('minbp');
      var maxbp = $(this).data('maxbp');
      $('#txtInstanceID').val(id);
      $('#txtInstanceMinBP').val(minbp);
      $('#txtInstanceMaxBP').val(maxbp);
       // getInstanceStatus(id);

      $("#instanceModal").modal("show");

    })

$(".btn-attackinstance").unbind("click");

    $(".btn-attackinstance").click(function(){

      var instanceID = $('#txtInstanceID').val();
      var ids = $('#txtSelectedIDs').val();
      ids = JSON.parse("[" + ids + "]");

      if($("#txtSelectedBPTotal").val()!="" && ids!="")
      {
          var totalbp = parseInt($("#txtSelectedBPTotal").val());

        var minbp =  parseInt($("#txtInstanceMinBP").val());
        var maxbp =  parseInt($("#txtInstanceMaxBP").val());

        if(totalbp<minbp || totalbp > maxbp)
        {
          toastr["info"]("Total BP of selected pets must be between " + minbp + " and " + maxbp);
        }else{

          if(ids.length>5)
          {
            toastr["info"]("You can select maximum of 5 pets");
          }else{
            attackInstance(instanceID,ids);

          }

           
        }
      }else{
        toastr["info"]("Please select pets");
      
      }
    })
}

function RegisterCastleEvents()
{
    $(".btn-updateguards").unbind("click");

    $(".btn-updateguards").click(function(){

      var ids = $('#txtSelectedIDs').val();
      ids = JSON.parse("[" + ids + "]");
      if(ids.length>6)
      {
        toastr["info"]("You can select maximum of 6 pets");
      }else{
        updateGuards(ids);

      }
    })
}

function togglePetCardSelection(obj)
{
  if($(".box-shadow",obj).hasClass("border"))
  {
    $(".box-shadow",obj).removeClass("border");
    $(".box-shadow",obj).removeClass("border-selected");
    $(".box-shadow",obj).removeClass("border-success"); 
    $(".box-shadow .card-selected",obj).remove(); 


  }else{

    $(".box-shadow",obj).addClass("border");
    $(".box-shadow",obj).addClass("border-selected");
    $(".box-shadow",obj).addClass("border-success");

    var html = "<div class='card-float-center card-selected text-selected'><h1><i class='fas fa-check'></i></h1></div>";
    $(".box-shadow",obj).append(html); 
  }
}

function RegisterPetEvoEvents()
{

  $(".pet-evo").unbind("click");
  $(".pet-evo").click(function(){
      console.log("click")
      var id = $(this).data("id");
      var name = $(this).data("name");
      var img = $(this).data("img");
      
      $(this).siblings().removeClass("btn-info");
      $(this).siblings().addClass("btn-outline-info");
      $(this).addClass("btn-info");
      $(this).removeClass("btn-outline-info");

      $("#pet-name-" + id).html(name);
      $("#pet-image-" + id).attr("src",img);


    });
}

function RegisterEvents()
{

   $('[data-toggle="tooltip"]').tooltip(); 

    
$(".pet-evo").unbind("click");
    $(".pet-evo").click(function(){
      console.log("click")
      var id = $(this).data("id");
      var name = $(this).data("name");
      var img = $(this).data("img");
      
      $(this).siblings().removeClass("btn-info");
      $(this).siblings().addClass("btn-outline-info");
      $(this).addClass("btn-info");
      $(this).removeClass("btn-outline-info");

      $("#pet-name-" + id).html(name);
      $("#pet-image-" + id).attr("src",img);


    });


$(".btn-openguards").unbind("click");

    $(".btn-openguards").click(function(){

      $('#txtSelectedIDs').val('');

      $("#guardsModal").modal("show");

    })


$(".search").unbind("click");
    $(".search").click(function(){

    var from = Account.NewAccount().getAddressString();


    var value = "0";
    var nonce = "0"
    var gas_price = "1000000"
    var gas_limit = "2000000"
    var callFunction = "getPetClass";
    //var callArgs = "[\"" + $("#search_value").val() + "\"]"; //in the form of ["args"]
    var callArgs = "[\"1\"]"; //in the form of ["args"]
    var contract = {
        "function": callFunction,
        "args": callArgs
    }

    neb.api.call(from,dappAddress,value,nonce,gas_price,gas_limit,contract).then(function (resp) {
        console.log(resp)
    }).catch(function (err) {
        //cbSearch(err)
        console.log("error:" + err.message)
    })

   })
$(".btn-opentraining").unbind("click");
    $(".btn-opentraining").click(function(){

      var id = $(this).data('id');
      $('#txtTrainingID').val(id);
      //getTrainingStatus(id);

      $("#trainingModal").modal("show");

    })



$(".btn-changeprofile").unbind("click");

     $(".btn-changeprofile").click(function(){

      var name = $('#txtProfileName').val();
      var image = $('#txtSelectedImage').val();
      changeProfile(name,image);
    })

     $(".btn-startbattle").unbind("click");
    $(".btn-startbattle").click(function(){
      attackCastle();
    })



    $(".getclass").click(function(){
    // $("#search_value").val() 搜索框内的值
    var id = $(this).data('id');
    console.log(id)
    var from = Account.NewAccount().getAddressString();

    var value = "0";
    var nonce = "0"
    var gas_price = "1000000"
    var gas_limit = "2000000"
    var callFunction = "getPetClass";
    //var callArgs = "[\"" + $("#search_value").val() + "\"]"; //in the form of ["args"]
    var callArgs = "[\"" + id + "\"]"; //in the form of ["args"]
    var contract = {
        "function": callFunction,
        "args": callArgs
    }

    neb.api.call(from,dappAddress,value,nonce,gas_price,gas_limit,contract).then(function (resp) {
        console.log(resp)
    }).catch(function (err) {
        //cbSearch(err)
        console.log("error:" + err.message)
    })

   })

$(".getpet").unbind("click");

$(".getpet").click(function(){
    // $("#search_value").val() 搜索框内的值
    var id = $(this).data('id');
    console.log(id)
    var from = Account.NewAccount().getAddressString();

    var value = "0";
    var nonce = "0"
    var gas_price = "1000000"
    var gas_limit = "2000000"
    var callFunction = "getPet";
    //var callArgs = "[\"" + $("#search_value").val() + "\"]"; //in the form of ["args"]
    var callArgs = "[\"" + id + "\"]"; //in the form of ["args"]
    var contract = {
        "function": callFunction,
        "args": callArgs
    }

    neb.api.call(from,dappAddress,value,nonce,gas_price,gas_limit,contract).then(function (resp) {
        console.log(resp)
    }).catch(function (err) {
        //cbSearch(err)
        console.log("error:" + err.message)
    })

})

$(".btn-openprofile").unbind("click");

$(".btn-openprofile").click(function(){

    

    $("#changeProfileModal").modal("show");

})



$(".btn-openbuy").unbind("click");
$(".btn-openbuy").click(function() {

    var cid = $(this).data('cid');
    var name = $(this).data('name');
    var price = $(this).data('price');
    var pricetype = $(this).data('pricetype');

    $("#txtPetID").val(cid);
    $("#txtPetPrice").val(price);
    $("#txtPetPriceType").val(pricetype);

    $("#txtPetName").val(name);
    $(".petname").html(name);

    $("#buyPetModal").modal("show");

});

$(".btn-buy").unbind("click");

$(".btn-buy").click(function() {

    var cid = $("#txtPetID").val();
    var price = $("#txtPetPrice").val();
    var pricetype = $("#txtPetPriceType").val();
    var gold_quantity = $("#txtGoldQuantity").val();
    var honor_quantity = $("#txtHonorQuantity").val();
    var name = $("#txtPetName").val();

    if(pricetype=="1") // buy with NAS
    {
      var to = dappAddress;
      var value = price;
      var callFunction = "buyPet"
      var args = []
      args.push(cid);
      args.push(name);

      var callArgs = JSON.stringify(args);
      serialNumber = nebPay.call(to, value, callFunction, callArgs, {    //使用nebpay的call接口去调用合约,
          listener: buyPetCallback        //设置listener, 处理交易返回信息
      });
    }else if(pricetype=="2") // buy with Gold
    {
      var priceInt = parseInt(price);
      var goldInt = parseInt(gold_quantity);
      if(goldInt>=priceInt) // enough fund
      {
        var to = dappAddress;
        var value = "0";
        var callFunction = "buyPet"
        var args = []
        args.push(cid);
        args.push(name);

        var callArgs = JSON.stringify(args);
        serialNumber = nebPay.call(to, value, callFunction, callArgs, {    //使用nebpay的call接口去调用合约,
            listener: buyPetCallback        //设置listener, 处理交易返回信息
        });

      }else{
        toastr["warning"]("Sorry, you don't have enough gold");
      }
    }else if(pricetype=="3") // buy with Honor
    {
      var priceInt = parseInt(price);
      var honorInt = parseInt(honor_quantity);
      if(honorInt>=priceInt) // enough fund
      {
        var to = dappAddress;
        var value = "0";
        var callFunction = "buyPet"
        var args = []
        args.push(cid);
        args.push(name);

        var callArgs = JSON.stringify(args);
        serialNumber = nebPay.call(to, value, callFunction, callArgs, {    //使用nebpay的call接口去调用合约,
            listener: buyPetCallback        //设置listener, 处理交易返回信息
        });

      }else{
        toastr["warning"]("Sorry, you don't have enough honor");
      }
    }
});




$(".count").click(function(){
    // $("#search_value").val() 搜索框内的值

    var from = Account.NewAccount().getAddressString();

    var value = "0";
    var nonce = "0"
    var gas_price = "1000000"
    var gas_limit = "2000000"
    var callFunction = "countPetClass";
    //var callArgs = "[\"" + $("#search_value").val() + "\"]"; //in the form of ["args"]
    var callArgs = "[]"; //in the form of ["args"]
    var contract = {
        "function": callFunction,
        "args": callArgs
    }

    neb.api.call(from,dappAddress,value,nonce,gas_price,gas_limit,contract).then(function (resp) {
        console.log(resp)
    }).catch(function (err) {
        //cbSearch(err)
        console.log("error:" + err.message)
    })

})

$(".countpet").click(function(){
    // $("#search_value").val() 搜索框内的值

    var from = Account.NewAccount().getAddressString();

    var value = "0";
    var nonce = "0"
    var gas_price = "1000000"
    var gas_limit = "2000000"
    var callFunction = "countPet";
    //var callArgs = "[\"" + $("#search_value").val() + "\"]"; //in the form of ["args"]
    var callArgs = "[]"; //in the form of ["args"]
    var contract = {
        "function": callFunction,
        "args": callArgs
    }

    neb.api.call(from,dappAddress,value,nonce,gas_price,gas_limit,contract).then(function (resp) {
        console.log(resp)
    }).catch(function (err) {
        //cbSearch(err)
        console.log("error:" + err.message)
    })

})

$(".getdex").click(function(){
    var from = $("#txtWalletAddress").val();

    var value = "0";
    var nonce = "0"
    var gas_price = "1000000"
    var gas_limit = "2000000"
    var callFunction = "getDEX";
    //var callArgs = "[\"" + $("#search_value").val() + "\"]"; //in the form of ["args"]
    var callArgs = "[]"; //in the form of ["args"]
    var contract = {
        "function": callFunction,
        "args": callArgs
    }

    neb.api.call(from,dappAddress,value,nonce,gas_price,gas_limit,contract).then(function (resp) {
        console.log(resp)
    }).catch(function (err) {
        //cbSearch(err)
        console.log("error:" + err.message)
    })

})


}






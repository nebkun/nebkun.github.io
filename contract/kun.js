'use strict';

var KunContract = function() {
	LocalContractStorage.defineProperty(this, 'admin', null);
	LocalContractStorage.defineProperty(this, 'kunclass_cnt');
	LocalContractStorage.defineProperty(this, 'kun_cnt');
	LocalContractStorage.defineProperty(this, 'log_cnt');
	LocalContractStorage.defineProperty(this, 'counter_rate');
	LocalContractStorage.defineProperty(this, 'battle_rate');
	LocalContractStorage.defineProperty(this, 'feed_value');
	LocalContractStorage.defineProperty(this, 'feed_value2');
	LocalContractStorage.defineProperty(this, 'feed_value3');
	LocalContractStorage.defineProperty(this, 'min_power');
	LocalContractStorage.defineProperty(this, 'min_transfer_value');
	LocalContractStorage.defineProperty(this, 'max_search_records');
	LocalContractStorage.defineProperty(this, 'protection_minutes');
	LocalContractStorage.defineProperty(this, 'log_maxlength');
	LocalContractStorage.defineProperty(this, 'init_power');
	LocalContractStorage.defineProperty(this, 'feed_power');
	LocalContractStorage.defineProperty(this, 'feed_power2');
	LocalContractStorage.defineProperty(this, 'feed_power3');
	LocalContractStorage.defineProperty(this, 'precision');

	LocalContractStorage.defineMapProperty(this, 'kunClasses');
	LocalContractStorage.defineMapProperty(this, 'kuns');
	LocalContractStorage.defineMapProperty(this, 'log');
	LocalContractStorage.defineMapProperty(this, 'playerKuns');
	LocalContractStorage.defineMapProperty(this, 'playerLogs');
}

KunContract.prototype = {
	init: function() {
		this.admin = Blockchain.transaction.from; //管理员地址，用于管理员Function
		this.kunclass_cnt = 0; //总鲲累数，现在一共8个
		this.kun_cnt = 0; //总鲲数，并且是鲲的ID
		this.log_cnt = 0; //总Log数
		this.counter_rate = new BigNumber(0.05); // 鲲种类互相克制，counter会让被counter的kun战力减少这个rate
		this.battle_rate = new BigNumber(0.1); // 战斗后吸取或者损失的能力rate
		this.feed_value = new BigNumber(0.01); //这个是支付喂养的NAS值 0.01等级，如果发来更多我们也不退了：）
		this.feed_value2 = new BigNumber(0.1); //这个是支付喂养的NAS值 0.02等级，如果发来更多我们也不退了：）
		this.feed_value3 = new BigNumber(1); //这个是支付喂养的NAS值 0.02等级，如果发来更多我们也不退了：）
		
		this.min_power = new BigNumber(15); //低于这个数值，鲲自动死亡，回收NAS
		this.min_transfer_value = new BigNumber(0.002); // 鲲最少需要有这个NAS值才会被吸取NAS
		this.max_search_records = 50; // 搜对方鲲的时候最多返回的record
		this.protection_minutes = 5; //保护时间5分钟
		this.log_maxlength = 30; // 最大的记录长度
		this.precision = 5; // 小数位精确度
		this.init_power = [50, 100]; // 初始战斗力区间
		this.feed_power = [5, 15]; //每次喂食提高的战斗力区间
		this.feed_power2 = [50, 150]; //每次喂食提高的战斗力区间
		this.feed_power3 = [500, 1500]; //每次喂食提高的战斗力区间

		this._initKunClass();
	},
	_nasToWei: function() {
		return 1000000000000000000;
	},
	_initKunClass: function() {
		this._addkunclass({
			'name': '皇·土鲲',
			'code': 'tukun',
			'counter': 'lankun'
		});
		this._addkunclass({
			'name': '将·骨鲲',
			'code': 'gukun',
			'counter': 'tukun'
		});
		this._addkunclass({
			'name': '帅·巨鲲',
			'code': 'jukun',
			'counter': 'gukun'
		});
		this._addkunclass({
			'name': '王·彩鲲',
			'code': 'caikun',
			'counter': 'jukun'
		});
		this._addkunclass({
			'name': '公·灵鲲',
			'code': 'lingkun',
			'counter': 'caikun'
		});
		this._addkunclass({
			'name': '侯·齿鲲',
			'code': 'chikun',
			'counter': 'lingkun'
		});
		this._addkunclass({
			'name': '子·尸鲲',
			'code': 'shikun',
			'counter': 'chikun'
		});
		this._addkunclass({
			'name': '伯·蓝鲲',
			'code': 'lankun',
			'counter': 'shikun'
		});
	},
	_addkunclass: function(data) {
		data.id = this.kunclass_cnt;
		this.kunClasses.set(this.kunclass_cnt, data);
		this.kunclass_cnt+=1;
		return true;
	},
	_updatekunclass: function(data) {
		this.kunClasses.set(data.id, data);
		return true;
	},
	_updatekun: function(data) {
		this.kuns.set(data.id, data);
		return true;
	},
	_getrandomkunclass: function() {
		var classindex = this._random(0, this.kunclass_cnt - 1);
		var selectedclass = this.kunClasses.get(classindex);
		return selectedclass;
	},
	_random: function(min, max) {
		var result = Math.floor(Math.random() * (max - min + 1) + min);
		return result;
	},

	_shuffle: function(array) {
		var currentIndex = array.length,
			temporaryValue, randomIndex;

		// While there remain elements to shuffle...
		while (0 !== currentIndex) {

			// Pick a remaining element...
			randomIndex = Math.floor(Math.random() * currentIndex);
			currentIndex--;

			// And swap it with the current element.
			temporaryValue = array[currentIndex];
			array[currentIndex] = array[randomIndex];
			array[randomIndex] = temporaryValue;
		}

		return array;
	},
	buyKun: function() {
		var from = Blockchain.transaction.from
		var playerlog = this.playerLogs.get(from);
		var msg = '';
		if (!playerlog) {
			playerlog = [];
		}
		var playerkun = this.playerKuns.get(from);
		if (!playerkun) {
			playerkun = [];
		}
		var cla = this._getrandomkunclass();

		if (cla) {
			var kun = {};
			kun.id = this.kun_cnt;
			kun.name = cla.name;
			kun.power = new BigNumber(this._random(this.init_power[0], this.init_power[1]));
			kun.code = cla.code;
			kun.counter = cla.counter;
			kun.value = new BigNumber(0);
			kun.from = from;
			kun.wins = 0;
			kun.loses = 0;
			kun.feedpower = new BigNumber(0);
			kun.winpower = new BigNumber(0);
			kun.losepower = new BigNumber(0);
			kun.winvalue = new BigNumber(0);
			kun.losevalue = new BigNumber(0);
			kun.protected = false;
			kun.protection_startts = null;
			kun.protection_endts = null;
			kun.isdead = false;

			playerkun[playerkun.length] = kun.id;
			this.playerKuns.set(from, playerkun);
			this.kuns.set(this.kun_cnt, kun);
			this.kun_cnt += 1;
			msg = '恭喜，驯服了【' + kun.name + '】! 请去\'我【鲲】吞吞吞\'页面查看吧！';

			var log = {};
			log.id= this.log_cnt;
			log.ts = new Date().getTime();
			log.msg = msg;
			this.log.set(log.id,log);
			this.log_cnt +=1;

			playerlog[playerlog.length] = log.id;

			// player log
			if (playerlog.length > this.log_maxlength) {
				playerlog = playerlog.slice(playerlog.length - this.log_maxlength, playerlog.length);
			}
			this.playerLogs.set(from, playerlog);

		} else {
			return {
				'msg': '鲲迷失了，再来一次吧！',
				'success': false
			}
		}
		return {
			'msg': msg,
			'success': true
		}
	},
	feedKun: function(kunid,type) {
		var from = Blockchain.transaction.from
		var value = new BigNumber(Blockchain.transaction.value)
		var playerlog = this.playerLogs.get(from);
		if (!playerlog) {
			playerlog = [];
		}
		var wei = this._nasToWei();

		var fv = new BigNumber(0);
		var fp = [0,0];

		if(type=="3")  // 1 NAS
		{
			if (value.lt((new BigNumber(this.feed_value3)).mul(wei))) {
				return {
					'msg': 'NAS不够',
					'success': false
				}
			}
			fv = this.feed_value3;
			fp = this.feed_power3;
		}else if(type=="2")  // 0.1 NAS
		{
			if (value.lt((new BigNumber(this.feed_value2)).mul(wei))) {
				return {
					'msg': 'NAS不够',
					'success': false
				}
			}
			fv = this.feed_value2;
			fp = this.feed_power2;
		}else if(type=="1")  // 0.01 NAS
		{
			if (value.lt((new BigNumber(this.feed_value)).mul(wei))) {
				return {
					'msg': 'NAS不够',
					'success': false
				}
			}
			fv = this.feed_value;
			fp = this.feed_power;
		}else
		{
			if (value.lt((new BigNumber(this.feed_value)).mul(wei))) {
				return {
					'msg': 'NAS不够',
					'success': false
				}
			}
			fv = this.feed_value;
			fp = this.feed_power;
		}

		

		var kun = this.kuns.get(kunid)
		if (!kun) {
			return {
				'msg': '鲲迷失了，请重试！',
				'success': false
			}

		}

		if (kun.from != from) {
			return {
				'msg': '这只不是你的鲲',
				'success': false
			}
		}

		var pwr = new BigNumber(this._random(fp[0], fp[1]));
		kun.power = (new BigNumber(kun.power)).plus(pwr);
		kun.feedpower = (new BigNumber(kun.feedpower)).plus(pwr);
		kun.value = (new BigNumber(kun.value)).plus(new BigNumber(fv));
		this.kuns.set(kun.id, kun);

		// Log
		var msg = '【' + kun.name + '】 吃饱了。获得' + pwr + ' 战斗力';
		var log = {};
		log.id= this.log_cnt;
		log.ts = new Date().getTime();
		log.msg = msg;
		this.log.set(log.id,log);
		this.log_cnt +=1;

		playerlog[playerlog.length] = log.id;

		// player log
		if (playerlog.length > this.log_maxlength) {
			playerlog = playerlog.slice(playerlog.length - this.log_maxlength, playerlog.length);
		}
		this.playerLogs.set(from, playerlog);


		return {
			'msg': msg,
			'success': true
		};
	},
	abandonKun: function(kunid) {
		var from = Blockchain.transaction.from
		var playerlog = this.playerLogs.get(from);
		if (!playerlog) {
			playerlog = [];
		}
		
		var kun = this.kuns.get(kunid)
		if (!kun) {
			return {
				'msg': '鲲迷失了，请重试！',
				'success': false
			}

		}

		if (kun.from != from) {
			return {
				'msg': '这只不是你的鲲',
				'success': false
			}
		}

		var msg = '【' + kun.name + '】被流放了。';
        if((new BigNumber(kun.value)).gt(0)) //回收鲲的NAS
		{
			var wei = this._nasToWei();
			var r = Blockchain.transfer(kun.from, ((new BigNumber(kun.value)).mul(wei)).toFixed(0));
			
		    msg+='收回了' + kun.value + 'NAS。';

		    kun.value = new BigNumber(0);

		}

		kun.isdead = true;
		this.kuns.set(kun.id, kun);

		var log = {};
		log.id= this.log_cnt;
		log.ts = new Date().getTime();
		log.msg = msg;
		this.log.set(log.id,log);
		this.log_cnt +=1;
		playerlog[playerlog.length] = log.id;

		// player log
		if (playerlog.length > this.log_maxlength) {
			playerlog = playerlog.slice(playerlog.length - this.log_maxlength, playerlog.length);
		}
		this.playerLogs.set(from, playerlog);


		return {
			'msg': msg,
			'success': true
		};
	},
	battle: function(kunid, opponentkunid) {
		var from = Blockchain.transaction.from
		var msg = '';
		var playerlog = this.playerLogs.get(from);
		if (!playerlog) {
			playerlog = [];
		}

		var kun = this.kuns.get(kunid)
		if (!kun) {
			return {
				'msg': '找不到鲲',
				'success': false
			}
		}

		if (kun.from != from) {
			return {
				'msg': '这只不是你的鲲',
				'success': false
			}
		}

		var selectedopponent = this.kuns.get(opponentkunid);

		if (!selectedopponent) {
			return {
				'msg': '找不到对手鲲，稍后再试',
				'success': false
			}

		} 


		if (selectedopponent.from == from) {
			return {
				'msg': '你不能攻击自己的鲲',
				'success': false
			}

		} 
		

		// UI上不让选？ UI不让选，用户还是可以改发送的Kun的ID数据
		if ((new BigNumber(kun.power)).lt(this.min_power)) {
			return {
				'msg': '你的鲲战斗力太低，请先喂食至30才能战斗',
				'success': false
			}
		}
 
		// 我们是不是在UI就不显示这个了？UI不让选，用户还是可以改发送的Kun的ID数据
		if ((new BigNumber(selectedopponent.power)).lt(this.min_power)) {
			return {
				'msg': '对方的鲲战斗力太低，需要最少30才能战斗',
				'success': false
			}

		}
		var opponentfrom = selectedopponent.from;
		var opponentlog = this.playerLogs.get(opponentfrom);
		if (!opponentlog) {
			opponentlog = [];
		}

		var wei = this._nasToWei();
		var attacker_pwr = new BigNumber(kun.power); //进攻方鲲的战斗力
		var opponent_pwr = new BigNumber(selectedopponent.power);//防守方鲲的战斗力

		//防守方是否克制进攻方的鲲 - 进攻方战斗力减弱
		if(kun.counter == selectedopponent.code)
		{
			attacker_pwr = attacker_pwr.mul((new BigNumber(1)).minus(this.counter_rate));
		}
		//进攻方是否克制防守方的鲲- 防守方战斗力减弱
		if(selectedopponent.counter == kun.code)
		{
			opponent_pwr = opponent_pwr.mul((new BigNumber(1)).minus(this.counter_rate));
		}
		
		var base_pwr = (attacker_pwr.plus(opponent_pwr)).toFixed(0);  // 总和战斗力

		
		var rng = this._random(1,base_pwr)

		var r_win = false;
		var r_power = new BigNumber(0);
		var r_value = new BigNumber(0);
		var r_attacker_isdead = false;
		var r_defender_isdead = false;

		kun.protected = false; // reset attacker protection

		if (attacker_pwr >= rng) {

			r_win = true;
			// attacker win

			msg = '【' + kun.name + '】 (' + from + ')' + ' 战胜了 【' + selectedopponent.name + '】(' + opponentfrom + ') ' + attacker_pwr + '|' + opponent_pwr + '|' + base_pwr + '|' + rng;
			var log = {};
			log.id= this.log_cnt;
			log.ts = new Date().getTime();
			log.msg = msg;
			this.log.set(log.id,log);
			this.log_cnt +=1;

			playerlog[playerlog.length] = log.id;
			opponentlog[opponentlog.length] = log.id;

			// update stats
			var attacker_value = kun.value;
			var defender_value = selectedopponent.value;

			// 为什么要至少 0.002 才能转？
			// 这个地方原先没有括号，可能有错
			// 我在测试的时候出现过不是什么 BigNumber 的错误

			// Bo - 我怕太少了再div，小数位太多
			// 双方的NAS值都需要比最少nas值高，才会触发NAS transfer，防止低NAS Spam fish rare chance
			if ((new BigNumber(attacker_value)).gte(this.min_transfer_value) && (new BigNumber(defender_value)).gte(this.min_transfer_value) ) { 

				//用胜负双方中最低的NAS作为基础值来计算转NAS值，防止低NAS
				var min_value_in_two = defender_value;
				if(attacker_value<min_value_in_two)
				{
					min_value_in_two = attacker_value;
				}

				var adjust_value = ((new BigNumber(min_value_in_two)).mul(this.battle_rate)).toFixed(this.precision);
				r_value = adjust_value;
			
				// transfer nas
				var r = Blockchain.transfer(kun.from, ((new BigNumber(adjust_value)).mul(wei)).toFixed(0));

				kun.value = (new BigNumber(attacker_value)).plus(adjust_value);
				var selectedopponent_value = (new BigNumber(defender_value)).minus(adjust_value);
				if (selectedopponent_value < 0) {
					selectedopponent_value = 0;
				}
				selectedopponent.value = selectedopponent_value;

				kun.winvalue = (new BigNumber(kun.winvalue)).plus(adjust_value);
				selectedopponent.losevalue = (new BigNumber(selectedopponent.losevalue)).plus(adjust_value);

				var log1 = {};
				log1.id= this.log_cnt;
				log1.ts = new Date().getTime();
				log1.msg = adjust_value + 'NAS 转移到玩家 【' + from + '】';
				this.log.set(log1.id,log1);
				this.log_cnt +=1;	

				playerlog[playerlog.length] = log1.id;
				opponentlog[opponentlog.length] = log1.id;

			}

			// 用最小的战斗力值做计算
			var min_power_in_two = (new BigNumber(kun.power));
			if((new BigNumber(selectedopponent.power)).lt(min_power_in_two))
			{
				min_power_in_two = new BigNumber(selectedopponent.power);
			}

			// 转换战斗力值
			var adjust_pwr = ((new BigNumber(min_power_in_two)).mul(this.battle_rate)).toFixed(0);

			r_power = adjust_pwr;

			// 给胜方加值
			kun.power = ((new BigNumber(kun.power)).plus(adjust_pwr)).toFixed(0);
			// 给负方减值
			var selectedopponent_power = (new BigNumber(selectedopponent.power)).minus(adjust_pwr);

			
			
			var log2 = {};
			log2.id= this.log_cnt;
			log2.ts = new Date().getTime();
			log2.msg = adjust_pwr + '战斗力转移到胜者 【' + kun.name + '】';
			this.log.set(log2.id,log2);
			this.log_cnt +=1;	
			playerlog[playerlog.length] = log2.id;
			opponentlog[opponentlog.length] = log2.id;


			if(selectedopponent_power.lt(this.min_power)) //低于最小战斗力值鲲直接回收NAS死亡
			{
				var log3 = {};
				log3.id= this.log_cnt;
				log3.ts = new Date().getTime();
				log3.msg = '【' + selectedopponent.name + '】低于最低战斗值' + this.min_power + '而直接死亡。';
				this.log.set(log3.id,log3);
				this.log_cnt +=1;

				if((new BigNumber(selectedopponent.value)).gt(0)){
					var r = Blockchain.transfer(selectedopponent.from, ((new BigNumber(selectedopponent.value)).mul(wei)).toFixed(0));
					
					log3.msg+='回收' + selectedopponent.value + 'NAS';

					selectedopponent.value = new BigNumber(0);

				}
			    selectedopponent.isdead = true;
			    r_defender_isdead = true;

				opponentlog[opponentlog.length] = log3.id;
			}
			
			selectedopponent.power = selectedopponent_power.toFixed(0); 


			kun.winpower = (new BigNumber(kun.winpower)).plus(adjust_pwr);
			selectedopponent.losepower = (new BigNumber(selectedopponent.losepower)).plus(adjust_pwr);

			kun.wins = kun.wins + 1;
			selectedopponent.loses = selectedopponent.loses + 1;

			selectedopponent.protected = true; //鲲进入保护时间
            var ts = new Date().getTime();
            selectedopponent.protection_startts = ts;
            selectedopponent.protection_endts = ts + 60000 * this.protection_minutes;

			this.kuns.set(kunid, kun);
			this.kuns.set(opponentkunid, selectedopponent);

			// player log
			if (playerlog.length > this.log_maxlength) {
				playerlog = playerlog.slice(playerlog.length - this.log_maxlength, playerlog.length);
			}
			this.playerLogs.set(from, playerlog);

			// player log
			if (opponentlog.length > this.log_maxlength) {
				opponentlog = opponentlog.slice(opponentlog.length - this.log_maxlength, opponentlog.length);
			}
			this.playerLogs.set(opponentfrom, opponentlog);

		} else {

			r_win = false;
			// defender win

			msg = '【' + kun.name + '】(' + from + ')' + ' 被【' + selectedopponent.name + '】(' + opponentfrom + ') 击败' + attacker_pwr + '|' + opponent_pwr + '|' + base_pwr + '|' + rng;
			var log = {};
			log.id= this.log_cnt;
			log.ts = new Date().getTime();
			log.msg = msg;
			this.log.set(log.id,log);
			this.log_cnt +=1;
			playerlog[playerlog.length] = log.id;
			opponentlog[opponentlog.length] = log.id;

			// update stats
			var attacker_value = kun.value;
			var defender_value = selectedopponent.value;

			// 这个地方原先没有括号，可能有错
			// Bo-加上了括号，并且加上条件双方的NAS值都需要比最少nas值高，才会触发NAS transfer，防止低NAS Spam fish rare chance
			if ((new BigNumber(attacker_value)).gte(this.min_transfer_value) && (new BigNumber(defender_value)).gte(this.min_transfer_value) ) { 

				//用胜负双方中最低的NAS作为基础值来计算转NAS值，防止低NAS
				var min_value_in_two = attacker_value;
				if(defender_value<min_value_in_two)
				{
					min_value_in_two = defender_value;
				}

				var adjust_value = (new BigNumber(min_value_in_two).mul(this.battle_rate)).toFixed(this.precision);
				r_value = adjust_value;
				// transfer nas
				var r = Blockchain.transfer(selectedopponent.from, ((new BigNumber(adjust_value)).mul(wei)).toFixed(0));

				selectedopponent.value = (new BigNumber(defender_value)).plus(adjust_value);
				var kun_value = (new BigNumber(attacker_value)).minus(adjust_value);
				if (kun_value.lt(0)) {
					kun_value = 0;
				}
				kun.value = kun_value;

				kun.losevalue = (new BigNumber(kun.losevalue)).plus(adjust_value);
				selectedopponent.winvalue = (new BigNumber(selectedopponent.winvalue)).plus(adjust_value);


				var log1 = {};
				log1.id= this.log_cnt;
				log1.ts = new Date().getTime();
				log1.msg = adjust_value + 'NAS 转移到玩家 【' + selectedopponent.from + '】';
				this.log.set(log1.id,log1);
				this.log_cnt +=1;
				playerlog[playerlog.length] = log1.id;
				opponentlog[opponentlog.length] = log1.id;

			}


			// 用最小的战斗力值做计算
			var min_power_in_two = (new BigNumber(kun.power));
			if((new BigNumber(selectedopponent.power)).lt(min_power_in_two))
			{
				min_power_in_two = new BigNumber(selectedopponent.power);
			}
			// 计算转换值
			var adjust_pwr = (new BigNumber(new BigNumber(min_power_in_two).mul(this.battle_rate))).toFixed(0);
			r_power = adjust_pwr;
			// 给胜方加值
			selectedopponent.power = ((new BigNumber(selectedopponent.power)).plus(adjust_pwr)).toFixed(0);
			
			// 给负方减值
			var kun_power = ((new BigNumber(kun.power)).minus(adjust_pwr));



			var log2 = {};
			log2.id= this.log_cnt;
			log2.ts = new Date().getTime();
			log2.msg = adjust_pwr + '战斗力转移到胜者 【' + selectedopponent.name + '】';
			this.log.set(log2.id,log2);
			this.log_cnt +=1;
			playerlog[playerlog.length] = log2.id;
			opponentlog[opponentlog.length] = log2.id;

			if(kun_power.lt(this.min_power)) //低于最小战斗力值鲲直接回收NAS死亡
			{
				var log3 = {};
				log3.id= this.log_cnt;
				log3.ts = new Date().getTime();
				log3.msg = '【' + kun.name + '】低于最低战斗值' + this.min_power + '而直接死亡。';
				this.log.set(log3.id,log3);
				this.log_cnt +=1;

				if((new BigNumber(kun.value)).gt(0)){
					var r = Blockchain.transfer(kun.from, ((new BigNumber(kun.value)).mul(wei)).toFixed(0));
					
					log3.msg+='回收' + kun.value + 'NAS';

					kun.value = new BigNumber(0);

				}
			    kun.isdead = true;
			    r_attacker_isdead = true;

				playerlog[playerlog.length] = log3.id;
			}

			kun.power = kun_power;

			kun.losepower = (new BigNumber(kun.losepower)).plus(adjust_pwr);
			selectedopponent.winpower = (new BigNumber(selectedopponent.winpower)).plus(adjust_pwr);

			kun.loses = kun.loses + 1;
			selectedopponent.wins = selectedopponent.wins + 1;


			kun.protected = true; //鲲进入保护时间
            var ts = new Date().getTime();
            kun.protection_startts = ts;
            kun.protection_endts = ts + 60000 * this.protection_minutes;

			this.kuns.set(kunid, kun);
			this.kuns.set(opponentkunid, selectedopponent);


			// player log
			if (playerlog.length > this.log_maxlength) {
				playerlog = playerlog.slice(playerlog.length - this.log_maxlength, playerlog.length);
			}
			this.playerLogs.set(from, playerlog);

			// player log
			if (opponentlog.length > this.log_maxlength) {
				opponentlog = opponentlog.slice(opponentlog.length - this.log_maxlength, opponentlog.length);
			}
			this.playerLogs.set(opponentfrom, opponentlog);
		}
	
		return {
			'msg':'战斗结束',
			'success': true,
			'details':{
				'win':r_win,
				'power':r_power.toString(),
				'value':r_value.toString(),
				'attacker_isdead':r_attacker_isdead,
				'defender_isdead':r_defender_isdead
			}
		};
	},
	getKun: function(id) {

		var kun = this.kuns.get(id);
		return kun;
	},
	getPlayerKun: function() {

		var from = Blockchain.transaction.from
		var playerKuns = this.playerKuns.get(from)
		var kuns = [];
		if (playerKuns) {
			for (var i = 0; i < playerKuns.length; i++) {
				var kun = this.kuns.get(playerKuns[i]);
				if (kun) {
					if(!kun.isdead)
					{
						kuns[kuns.length] = kun
					}
				}
			}
		}
		return kuns;
	},
	getOpponentKuns: function() {

		var from = Blockchain.transaction.from

		var kuns = [];
		var opponentIDs = [];
		for (var i = 0; i < this.kun_cnt; i++) {
			var k = this.kuns.get(i);
			if(k)
			{
				// 只加入还活着并且不在保护时间的鲲
				if ((k.from != from) && !k.isdead){
					var addTo = false;
					if (!k.protected) {
						addTo = true;
					} else {
						if (k.protection_endts) {
							var now = new Date().getTime();
							if ((now - k.protection_endts) > 0) {
								addTo = true;
							}
						}
					}

					if (addTo) {
						opponentIDs[opponentIDs.length] = k.id;
					}
				}

			}
			
		}



		// 随机顺序去一些鲲
		var shuffleopponentIDs = this._shuffle(opponentIDs);

		var boundryLength = shuffleopponentIDs.length;

		// 最多返回一定数目的鲲
		if(boundryLength > this.max_search_records)
		{
			boundryLength = this.max_search_records;
		}


		//取出鲲的数据
		for (var i = 0; i < boundryLength; i++) {
			var kun = this.kuns.get(shuffleopponentIDs[i]);
			if (kun) {
				kuns[kuns.length] = kun
			}
		}
		
		return kuns;
	},
	getPlayerLog: function() {
		var from = Blockchain.transaction.from
		var playerlog = this.playerLogs.get(from);
		var logs = []
		for(var i=0;i<playerlog.length;i++)
		{
			var log = this.log.get(playerlog[i]);
			if(log)
			{
				logs[logs.length] = log;
			}
		}
		return logs.reverse();
	},
	a: function() {
		return {
			'kunclass_cnt': this.kunclass_cnt,
			'kun_cnt': this.kun_cnt,
			'counter_rate': this.counter_rate,
			'battle_rate': this.battle_rate,
			'feed_value': this.feed_value,
			'min_power': this.min_power,
			'min_transfer_value': this.min_transfer_value,
			'max_search_records': this.max_search_records,
			'protection_minutes': this.protection_minutes,
			'log_maxlength': this.log_maxlength,
			'init_power': this.init_power,
			'feed_power': this.feed_power,
			'precision': this.precision
		}
	},
	 // Admin
    withdrawNAS: function(value) {
        var from = Blockchain.transaction.from;
        if (from === this.admin) {
            var result = Blockchain.transfer(this.admin, value * this._nasToWei());
            return result;
        }else{
        	throw new Error('没有管理员权限');
        }
        return true;
    },
    transferNAS: function(address, value) {
        var from = Blockchain.transaction.from;
        if (from === this.admin) {
            var result = Blockchain.transfer(address, value * this._nasToWei());
            return result;
        }else{
        	throw new Error('没有管理员权限');
        }
        return true;
    },
	updateKunClassCount: function(data) {
        var from = Blockchain.transaction.from;
        if (from === this.admin) {
            var d = JSON.parse(data);
            this.kunclass_cnt = d;
            
        }else{
        	throw new Error('没有管理员权限');
        }
        return true;
    },
    updateKunCount: function(data) {
        var from = Blockchain.transaction.from;
        if (from === this.admin) {
            var d = JSON.parse(data);
            this.kun_cnt = d;
            
        }else{
        	throw new Error('没有管理员权限');
        }
        return true;
    },
    updateCounterRate: function(data) {
        var from = Blockchain.transaction.from;
        if (from === this.admin) {
            var d = JSON.parse(data);
            this.counter_rate = d;
        }else{
        	throw new Error('没有管理员权限');
        }
        return true;
    },
    updateBattleRate: function(data) {
        var from = Blockchain.transaction.from;
        if (from === this.admin) {
            var d = JSON.parse(data);
            this.battle_rate = d;
        }else{
        	throw new Error('没有管理员权限');
        }
        return true;
    },
    updateFeeValue: function(data) {
        var from = Blockchain.transaction.from;
        if (from === this.admin) {
            var d = JSON.parse(data);
            this.feed_value = d;
        }else{
        	throw new Error('没有管理员权限');
        }
        return true;
    },
    updateMinPower: function(data) {
        var from = Blockchain.transaction.from;
        if (from === this.admin) {
            var d = JSON.parse(data);
            this.min_power = d;
        }else{
        	throw new Error('没有管理员权限');
        }
        return true;
    },
    updateMinTransferValue: function(data) {
        var from = Blockchain.transaction.from;
        if (from === this.admin) {
            var d = JSON.parse(data);
            this.min_transfer_value = d;
        }else{
        	throw new Error('没有管理员权限');
        }
        return true;
    },
    updateMaxSearchRecords: function(data) {
        var from = Blockchain.transaction.from;
        if (from === this.admin) {
            var d = JSON.parse(data);
            this.max_search_records = d;
        }else{
        	throw new Error('没有管理员权限');
        }
        return true;
    },
    updateProtectionMinus: function(data) {
        var from = Blockchain.transaction.from;
        if (from === this.admin) {
            var d = JSON.parse(data);
            this.protection_minutes = d;
        }else{
        	throw new Error('没有管理员权限');
        }
        return true;
    },
    updateLogMaxLength: function(data) {
        var from = Blockchain.transaction.from;
        if (from === this.admin) {
            var d = JSON.parse(data);
            this.log_maxlength = d;
        }else{
        	throw new Error('没有管理员权限');
        }
        return true;
    },
    updateInitPower: function(data) {
        var from = Blockchain.transaction.from;
        if (from === this.admin) {
            var d = JSON.parse(data);
            this.init_power = d;
        }else{
        	throw new Error('没有管理员权限');
        }
        return true;
    },
    updateFeedPower: function(data) {
        var from = Blockchain.transaction.from;
        if (from === this.admin) {
            var d = JSON.parse(data);
            this.feed_power = d;
        }else{
        	throw new Error('没有管理员权限');
        }
        return true;
    },
    updatePrecision: function(data) {
        var from = Blockchain.transaction.from;
        if (from === this.admin) {
            var d = JSON.parse(data);
            this.precision = d;
        }else{
        	throw new Error('没有管理员权限');
        }
        return true;
    },
    exportKun: function() {

		var from = Blockchain.transaction.from;
		var kuns = [];
        if (from === this.admin) {

            for (var i = 0; i < this.kun_cnt; i++) {
				var kun = this.kuns.get(i);
				kuns[kuns.length] = kun
			}
        }else{
        	throw new Error('没有管理员权限');
        }
        return kuns;
	},
	addKunClass: function(data) {
        var from = Blockchain.transaction.from;
        if (from === this.admin) {
            var d = JSON.parse(data);
            this._addkunclass(data);
        }else{
        	throw new Error('没有管理员权限');
        }
        return true;
    },
	updateKunClass: function(data) {
        var from = Blockchain.transaction.from;
        if (from === this.admin) {
            var d = JSON.parse(data);
            this._updatekunclass(data);
        }else{
        	throw new Error('没有管理员权限');
        }
        return true;
    },
    updateKun: function(data) {
        var from = Blockchain.transaction.from;
        if (from === this.admin) {
            var d = JSON.parse(data);
            this._updatekun(data);
        }else{
        	throw new Error('没有管理员权限');
        }
        return true;
    },
    addKuns: function(number) {
		var from = Blockchain.transaction.from;
		if (from === this.admin) {
			var n = parseInt(number);

			var value = new BigNumber(Blockchain.transaction.value)
			var playerlog = this.playerLogs.get(from);
			if (!playerlog) {
				playerlog = [];
			}
			var wei = this._nasToWei();

			var fv = new BigNumber(0);
			var fp = [0,0];

			var giveValue = false;
			if(value.gt(0))
			{
				if (value.lt((new BigNumber(this.feed_value)).mul(number).mul(wei))) {
					return {
						'msg': 'NAS不够',
						'success': false
					}
				}
				giveValue = true;
			}
			

			var playerkun = this.playerKuns.get(from);
			if (!playerkun) {
				playerkun = [];
			}

			for(var i=0;i<n;i++)
			{

				var cla = this._getrandomkunclass();

				if (cla) {
					var kun = {};
					kun.id = this.kun_cnt;
					kun.name = cla.name;
					kun.power = new BigNumber(this._random(this.init_power[0], this.init_power[1]));
					kun.code = cla.code;
					kun.counter = cla.counter;
					if(giveValue)
					{
						kun.value = new BigNumber(this.feed_value)
					}else{
						kun.value = new BigNumber(0);
					}
					kun.from = from;
					kun.wins = 0;
					kun.loses = 0;
					kun.feedpower = new BigNumber(0);
					kun.winpower = new BigNumber(0);
					kun.losepower = new BigNumber(0);
					kun.winvalue = new BigNumber(0);
					kun.losevalue = new BigNumber(0);
					kun.protected = false;
					kun.protection_startts = null;
					kun.protection_endts = null;
					kun.isdead = false;

					playerkun[playerkun.length] = kun.id;
					this.playerKuns.set(from, playerkun);
					this.kuns.set(this.kun_cnt, kun);
					this.kun_cnt += 1;
				}
			}
        }else{
        	throw new Error('没有管理员权限');
        }
        return true;
	},
	importKuns: function(data) {
        var from = Blockchain.transaction.from;
        if (from === this.admin) {
            var arr = JSON.parse(data);

            for(var i=0;i<arr.length;i++)
            {
                var obj = arr[i];

                var playerkun = this.playerkun.get(obj.from);
                if(!playerkun)
                {
                    playerkun = [];
                }
                var kun = {};
                kun.id = obj.id;
				kun.name = obj.name;
				kun.power = new BigNumber(obj.power);
				kun.code = obj.code;
				kun.counter = obj.counter;
				kun.value = new BigNumber(obj.value);
				kun.from = obj.from;
				kun.wins = obj.wins;
				kun.loses = obj.loses;
				kun.feedpower = new BigNumber(obj.feedpower);
				kun.winpower = new BigNumber(obj.winpower);
				kun.losepower = new BigNumber(obj.losepower);
				kun.winvalue = new BigNumber(obj.winvalue);
				kun.losevalue = new BigNumber(obj.losevalue);
				kun.protected = obj.protected;
				kun.protection_startts = obj.protection_startts;
				kun.protection_endts = obj.protection_endts;
				kun.isdead = obj.isdead;

				playerkun[playerkun.length] = kun.id;
				this.playerKuns.set(from, playerkun);
				this.kuns.set(obj.id, kun);

            }
           
        }
        return true;
    },

    updateKunCount: function(data) {
        var from = Blockchain.transaction.from;
        if (from === this.admin) {
            var d = JSON.parse(data);
            this.kun_cnt = d;
        }
        return true;
    }


}

module.exports = KunContract
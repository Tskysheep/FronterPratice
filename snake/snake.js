var ca  = document.getElementById("myca");
var ctx = ca.getContext("2d");

var sc = document.getElementById("sc");


//////全局变量区
const MapWidth = ca.width;
const MapHeight = ca.height;

const FoodColor = "blue";
const HeadColor = "yellow";
const TailColor = "orange";

const HeadRadius = 5;
const FoodRadius = 5;

const PeerScore = 1;

var interval = null;

var food = null;
var head = null;

var score = 0;


//////类区
function Head(x,y,r,pace,dir,tail){
	this.x = x;

	this.y = y;

	this.r = r;

	this.pace = pace;

	this.dir = dir;

	this.tail = tail;

	//转上
	this.up = function(){

		this.dir = 'w';

	}

	//转下
	this.down = function(){

		this.dir = 's';

	}

	//转左
	this.left = function(){

		this.dir = 'a';

	}

	//转右
	this.right = function(){
		
		this.dir = 'd';
	}

	//移动，行走
	this.move = function(){
		this.moveTail();
		switch(this.dir){
			case'w':
				this.y -= this.pace;
			break;

			case 's':
				this.y += this.pace;	
			break;

			case 'a':
				this.x -= this.pace;
			break;

			case 'd':
				this.x += this.pace;
			break;
		}
	}

	this.moveTail = function(){
		//先改变尾部的点的坐标
		if(this.tail.length > 0){
			for(var i = this.tail.length -1; i >= 0; i--){
				//是否是尾部第一个点,第一个继承头的点
				if(i == 0){
					this.tail[i].x = this.x;
					this.tail[i].y = this.y;
				}else{
					this.tail[i].x = this.tail[i - 1].x;
					this.tail[i].y = this.tail[i - 1].y;
				}
			}
		}
	}

	//吃到食物
	this.iseat = function(){
		//因为head 是圆形以及步长问题，用俩点间距离来判断是否吃到食物
		if(pointToPointDistance(head,food) < FoodRadius){
			food.eated_flag = true;
			this.tail.push(new Tail_dot());
		}
	}
}



//尾部每一点的构造器
function Tail_dot(x,y){
	this.x = x;
	this.y = y;
}


//食物构造器
function Food(x,y,r,eated_flag){
	this.x = x;
	this.y = y;
	this.r = r;
	this.eated_flag = eated_flag;
	/*监听food 对象的eated_flag 属性是否改变
		当改变的时候，就重新产生food
	*/
	Object.defineProperty(this,'eated_flag',{
		get:function(){
			return eated_flag;
		},
		set:function(newValue){
			eated_flag=newValue;
			//当food对象的eated_flag 属性变为true 时，需要产生新的食物
			if(eated_flag){
				productFood();
			}
		}
	});
}


//////功能函数区

//在canvas上绘制点
function draw(){
	ctx.clearRect(0,0,MapWidth,MapHeight);
	drawFood();
	drawHead();
	drawTail();

}

//绘制head
function drawHead(){
	ctx.beginPath();
	ctx.fillStyle = HeadColor;
	ctx.arc(head.x, head.y, head.r, 0, 2*Math.PI);
	ctx.fill();
}

//绘制尾部
function drawTail(){
	//console.log(head.tail.length);
	for(var i = 0; i < head.tail.length; i++){
		ctx.beginPath();
		ctx.fillStyle = TailColor;
		ctx.arc(head.tail[i].x, head.tail[i].y, head.r, 0, 2*Math.PI);
		ctx.fill();
	}
}

//绘制食物
function drawFood(){
	ctx.beginPath();
	ctx.fillStyle = FoodColor;
	ctx.arc(food.x, food.y, food.r, 0, 2*Math.PI);
	ctx.fill();
}

//产生食物
function productFood(){
	let x = getRndInteger(head.pace, MapWidth - head.pace);
	let y = getRndInteger(head.pace, MapHeight - head.pace);
	
	if(food == null){
		food = new Food(x, y, FoodRadius, false);
	}else{

		food.x = x;
		food.y = y;
		food.eated_flag = false;
	}

}


//函数返回 min（包含）～ max（包含）之间的数字
function getRndInteger(min, max) {
  return Math.floor(Math.random() * (max - min + 1) ) + min;
}

// 函数返回两点间距离
function pointToPointDistance(p1,p2){
	//d = sqrt((x1 - x2)^2 + (y1 - y2)^2)
	dx = p1.x - p2.x;
	dy = p1.y - p2.y;
	return Math.sqrt(Math.pow(dx,2) + Math.pow(dy,2));
}

//检测是否死亡
function checkDeath(){
	//碰撞边界
	if(head.x <= 0 || head.x >= MapWidth || head.y <= 0 || head.y >= MapHeight){
		gameOver();
	}

	//碰撞尾部，3是因为，要有四节尾部才有可能碰撞
	for(var i = 3; i < head.tail.length; i++){
		//console.log(pointToPointDistance(head, head.tail[i]));
		if(pointToPointDistance(head, head.tail[i]) < HeadRadius){
			gameOver();
		}
	}
}

function showScore(){
	score = head.tail.length * PeerScore;
	sc.innerHTML = "得分:" + score;
}

//游戏初始化
function gameInit(){
	head = new Head(50, 50, HeadRadius, 5,'d',[]);
	productFood();
	draw();
}

//程序循环运行
function gameStart(){
	interval = setInterval(function(){
		checkDeath();
		head.move();
		head.iseat();
		showScore();		
		draw();

	},200);
}


function gameOver(){
	clearInterval(interval);
	var ans = confirm("游戏结束!\n是否重新开始游戏？");
	if(ans){
		gameInit();
		gameStart();
	}else{
		gameInit();
	}
}


//按键响应
document.onkeydown = function(e){
	var ev = e || window.event;
	//console.log(String.fromCharCode(ev.keyCode) );
	var dir = String.fromCharCode(ev.keyCode);
	switch(dir){
		case 'w':
		case 'W':
			//不许往回跑
			if(head.dir != 's') head.up();
			//console.log(head.y);
			break;

		case 's':
		case 'S':
			if(head.dir != 'w') head.down();
			//console.log(head.y);
			break;

		case 'a':
		case 'A':
			if(head.dir != 'd') head.left();
			//console.log(head.x);
			break;

		case 'd':
		case 'D':
			if(head.dir != 'a') head.right();
			//console.log(head.x);
			break;

		//输入不是 a w d s 四个字母的就不作处理，按键
		default:
			return false;

	}

	return false;
}



//////程序入口////
if(confirm("是否开始游戏？")){
	gameInit();
	gameStart();
}else{
	gameInit();
}














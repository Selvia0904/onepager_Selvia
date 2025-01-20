let currentTextIndex = 0;
const texts = document.querySelectorAll('.text');
const totalTexts = texts.length;
const cube = document.getElementById('rotatingCube');
// 選取 hover-section 區域
// 選取 hover-section 區域
const hoverSection = document.querySelector('.ripple.container');

var RENDERER = {
	POWER : 10000,
	EDGE_OFFSET : 5,
	OFFSET_LIMIT : 50,
	GOLDFISH_COUNT : 15,

    

	
	init : function(){
		this.setParameters();
		this.reconstructMethods();
		this.createGoldfishes();
		this.bindEvent();
		this.render();
	},
	setParameters : function(){
		this.$window = $(window);
		this.$container = $('#jsi-ripple-container');
		this.width = this.$container.width();
		this.height = this.$container.height();
		this.context = $('<canvas />').attr({width : this.width, height : this.height}).appendTo(this.$container).get(0).getContext('2d');
		this.goldfishes = [];
		this.currentHeights = new Array(this.width * this.height).fill(0);
		this.nextHeights = new Array(this.width * this.height).fill(0);
		this.x = 0;
		this.y = 0;
		this.distance = Math.sqrt(Math.pow(this.width, 2) + Math.pow(this.height, 2));
	},
	reconstructMethods : function(){
		this.watchMouse = this.watchMouse.bind(this);
		this.render = this.render.bind(this);
	},
	createGoldfishes : function(){
		for(var i = 0, count = this.GOLDFISH_COUNT; i < count; i++){
			this.goldfishes.push(new GOLDFISH(this));
		}
	},
	bindEvent : function(){
		this.$container.on('click mousemove', this.watchMouse);
	},
	watchMouse : function(event){
		var offset = this.$container.offset();
		this.x = event.clientX - offset.left + this.$window.scrollLeft();
		this.y = event.clientY - offset.top + this.$window.scrollTop();
		this.propagateRipple(Math.round(this.x), Math.round(this.y));
	},
	propagateRipple : function(x, y){
		if(x <= this.EDGE_OFFSET || x >= this.width - this.EDGE_OFFSET || y <= this.EDGE_OFFSET || y >= this.height - this.EDGE_OFFSET){
			return;
		}
		var index = Math.round(x + this.width * y);
		this.currentHeights[index] += this.POWER;
		this.currentHeights[index - this.width] -= this.POWER;
	},
	processData : function(){
		var image = this.context.getImageData(0, 0, this.width, this.height),
			data = image.data,
			width = this.width,
			currentHeights = this.currentHeights,
			nextHeights = this.nextHeights;
			
		for(var y = 1, lengthy = this.height - 1; y < lengthy; y++){
			for(var x = 1, lengthx = width - 1; x < lengthx; x++){
				var index = x + width * y;
				currentHeights[index] = (currentHeights[index] + currentHeights[index - 1] + currentHeights[index + 1] + currentHeights[index - width] + currentHeights[index + width]) / 5;
			}
		}
		for(var y = 1, lengthy = this.height - 1; y < lengthy; y++){
			for(var x = 1, lengthx = width - 1; x < lengthx; x++){
				var baseIndex = x + width * y,
					index = baseIndex * 4,
					height = (currentHeights[baseIndex - 1] + currentHeights[baseIndex + 1] + currentHeights[baseIndex - width] + currentHeights[baseIndex + width]) / 2 - nextHeights[baseIndex];
					
				nextHeights[baseIndex] = height;
				height = height < -this.OFFSET_LIMIT ? -this.OFFSET_LIMIT : (height > this.OFFSET_LIMIT ? this.OFFSET_LIMIT : height);
				
				for(var i = 0; i < 3; i++){
					data[index + i] += height;
				}
			}
		}
		this.context.putImageData(image, 0, 0);
		
		var tmp = this.currentHeights;
		this.currentHeights = this.nextHeights;
		this.nextHeights = tmp;
	},
	render : function(){
		requestAnimationFrame(this.render);
		
		var gradient = this.context.createRadialGradient(this.x, this.y, 0, this.x, this.y, this.distance);
		gradient.addColorStop(0, 'rgb(160, 251, 233)');
		gradient.addColorStop(1, 'rgb(30, 78, 222)');
		this.context.fillStyle = gradient;
		this.context.fillRect(0, 0, this.width, this.height);
		
		for(var i = 0, count = this.goldfishes.length; i < count; i++){
			this.goldfishes[i].render(this.context);
		}
		this.processData();
	}
};
var GOLDFISH = function(renderer){
	this.renderer = renderer;
	this.init();
};
GOLDFISH.prototype = {
	OFFSET : 30,
	RIPPLE_INTERVAL : 20,
	VELOCITY_LIMIT : 0.3,
	
	init : function(toRandomize){
		this.x = this.getRandomValue(0, this.renderer.width);
		this.y = this.getRandomValue(0, this.renderer.height);
		this.radius = this.getRandomValue(0, Math.PI * 2);
		this.velocity = this.getRandomValue(1, 2);
		this.theta = 0;
		this.vx = this.velocity * Math.sin(this.radius);
		this.vy = -this.velocity * Math.cos(this.radius);
		this.waitCount = this.getRandomValue(0, 100) | 0;
		this.rippleInterval = this.RIPPLE_INTERVAL;
		this.hue = this.getRandomValue(0, 30) | 0;
		
		this.gradient = this.renderer.context.createLinearGradient(-15, 0, 15, 0);
		this.gradient.addColorStop(0, 'hsl(' + (this.hue + 20) + ', 50%, 80%)');
		this.gradient.addColorStop(0.5, 'hsl(' + this.hue + ', 70%, 50%)');
		this.gradient.addColorStop(1, 'hsl(' + (this.hue + 20) + ', 50%, 80%)');
	},
	getRandomValue : function(min, max){
		return min + (max - min) * Math.random();
	},
	render : function(context){
		context.save();
		context.translate(this.x, this.y);
		context.rotate(this.radius);
		context.fillStyle = 'hsla(' + (this.hue + 20) + ', 70%, 50%, 0.8)';
		
		for(var i = -1; i <= 1; i += 2){
			context.save();
			context.translate(0, 10);
			context.rotate(Math.PI / 12 * Math.sin(this.theta * 2) * i);
			context.beginPath();
			context.moveTo(0, 0);
			context.lineTo(12 * i, 4);
			context.lineTo(10 * i, 10);
			context.lineTo(0 * i, 4);
			context.fill();
			context.restore();
		}
		context.save();
		context.translate(0, 25);
		context.rotate(Math.PI / 12 * Math.sin(this.theta * 8));
		context.beginPath();
		context.moveTo(0, 0);
		context.quadraticCurveTo(5, 5, 3, 15);
		context.lineTo(0, 8);
		context.lineTo(-3, 15);
		context.quadraticCurveTo(-5, 5, 0, 0);
		context.fill();
		context.restore();
		
		context.fillStyle = this.gradient;
		context.beginPath();
		context.moveTo(0, 30);
		context.quadraticCurveTo(-10, 10, 0, 0);
		context.quadraticCurveTo(10, 10, 0, 30);
		context.fill();
		context.restore();
		
		if(this.waitCount == 0){
			var rate = Math.max(this.VELOCITY_LIMIT, Math.sin(this.theta));
			this.x += this.vx * rate;
			this.y += this.vy * rate;
			this.theta += Math.PI / 100;
			
			if(this.theta >= Math.PI){
				this.theta %= Math.PI;
				this.waitCount = this.getRandomValue(0, 100) | 0;
			}
			if(--this.rippleInterval == 0){
				this.rippleInterval = this.RIPPLE_INTERVAL;
				
				if(this.theta >= Math.PI * 3 / 8 && this.theta <= Math.PI * 5 / 8){
					this.renderer.propagateRipple(Math.round(this.x), Math.round(this.y));
				}
			}
		}else{
			this.x += this.vx * this.VELOCITY_LIMIT;
			this.y += this.vy * this.VELOCITY_LIMIT;
			this.waitCount--;
		}
		if(this.x < -this.OFFSET && this.vx < 0 || this.x > this.renderer.width + this.OFFSET && this.vx > 0 || this.y < -this.OFFSET && this.vy < 0|| this.y > this.renderer.height + this.OFFSET && this.vy > 0){
			this.radius += Math.PI + this.getRandomValue(-Math.PI / 4, Math.PI / 4);
			this.radius %= Math.PI * 2;
			this.vx = this.velocity * Math.sin(this.radius);
			this.vy = -this.velocity * Math.cos(this.radius);
		}
	}
};
$(function(){
	RENDERER.init();
});


// scripts.js
window.onscroll = function() {
    var navbar = document.querySelector('.navbar');
    if (window.pageYOffset > 0) {
        navbar.classList.add('transparent'); // Add transparent class when scrolled
    } else {
        navbar.classList.remove('transparent'); // Remove transparent class when at the top
    }
};


$('.navTrigger').click(function () {
    $(this).toggleClass('active');
    console.log("Clicked menu");
    $("#mainListDiv").toggleClass("show_list");
    $("#mainListDiv").fadeIn();

});

window.addEventListener("scroll", function () {
    const navbar = document.querySelector(".navbar");
    if (window.scrollY > 100) { // 滾動超過 100px 時啟用 affix
        navbar.classList.add("affix");
    } else {
        navbar.classList.remove("affix");
    }
});




// 更新顯示的文字
function updateText() {
    texts.forEach((text, index) => {
        if (index === currentTextIndex) {
            text.classList.add('active'); // 顯示當前文字
        } else {
            text.classList.remove('active'); // 隱藏其他文字
        }
    });
}



const MIN_SPEED = 1.5
const MAX_SPEED = 2.5

function randomNumber(min, max) {
  return Math.random() * (max - min) + min
}

class Blob {
  constructor(el) {
    this.el = el
    const boundingRect = this.el.getBoundingClientRect()
    this.size = boundingRect.width
    this.initialX = randomNumber(0, window.innerWidth - this.size)
    this.initialY = randomNumber(0, window.innerHeight - this.size)
    this.el.style.top = `${this.initialY}px`
    this.el.style.left = `${this.initialX}px`
    this.vx =
      randomNumber(MIN_SPEED, MAX_SPEED) * (Math.random() > 0.5 ? 1 : -1)
    this.vy =
      randomNumber(MIN_SPEED, MAX_SPEED) * (Math.random() > 0.5 ? 1 : -1)
    this.x = this.initialX
    this.y = this.initialY
  }

  update() {
    this.x += this.vx
    this.y += this.vy
    if (this.x >= window.innerWidth - this.size) {
      this.x = window.innerWidth - this.size
      this.vx *= -1
    }
    if (this.y >= window.innerHeight - this.size) {
      this.y = window.innerHeight - this.size
      this.vy *= -1
    }
    if (this.x <= 0) {
      this.x = 0
      this.vx *= -1
    }
    if (this.y <= 0) {
      this.y = 0
      this.vy *= -1
    }
  }

  move() {
    this.el.style.transform = `translate(${this.x - this.initialX}px, ${
      this.y - this.initialY
    }px)`
  }
}

function initBlobs() {
  const blobEls = document.querySelectorAll('.bouncing-blob')
  const blobs = Array.from(blobEls).map((blobEl) => new Blob(blobEl))

  function update() {
    requestAnimationFrame(update)
    blobs.forEach((blob) => {
      blob.update()
      blob.move()
    })
  }

  requestAnimationFrame(update)
}

initBlobs()






gsap.registerPlugin(ScrollTrigger);

const pageContainer = document.querySelector(".container");

/* SMOOTH SCROLL */
const scroller = new LocomotiveScroll({
  el: pageContainer,
  smooth: true
});

scroller.on("scroll", ScrollTrigger.update);

ScrollTrigger.scrollerProxy(pageContainer, {
  scrollTop(value) {
    return arguments.length
      ? scroller.scrollTo(value, 0, 0)
      : scroller.scroll.instance.scroll.y;
  },
  getBoundingClientRect() {
    return {
      left: 0,
      top: 0,
      width: window.innerWidth,
      height: window.innerHeight
    };
  },
  pinType: pageContainer.style.transform ? "transform" : "fixed"
});

////////////////////////////////////
////////////////////////////////////
window.addEventListener("load", function () {
  let pinBoxes = document.querySelectorAll(".pin-wrap > *");
  let pinWrap = document.querySelector(".pin-wrap");
  let pinWrapWidth = pinWrap.offsetWidth;
  let horizontalScrollLength = pinWrapWidth - window.innerWidth;

  // Pinning and horizontal scrolling

  gsap.to(".pin-wrap", {
    scrollTrigger: {
      scroller: pageContainer, //locomotive-scroll
      scrub: true,
      trigger: "#sectionPin",
      pin: true,
      // anticipatePin: 1,
      start: "top top",
      end: pinWrapWidth
    },
    x: -horizontalScrollLength,
    ease: "none"
  });

  ScrollTrigger.addEventListener("refresh", () => scroller.update()); //locomotive-scroll

  ScrollTrigger.refresh();
});




(function () {
	const WALL_THICKNESS = 80;
	// The helper needs to be the size of the container
	const MATTER_CONTAINER = document.querySelector("#container");
	const MATTER_HELPER = document.querySelector("#helper");

	let Engine = Matter.Engine,
		Render = Matter.Render,
		Runner = Matter.Runner,
		Bodies = Matter.Bodies,
		World = Matter.World,
		Composite = Matter.Composite;

	let engine = Engine.create();
	let render = Render.create({
		element: MATTER_HELPER,
		engine: engine,
		background: "black",
		options: {
			width: MATTER_CONTAINER.offsetWidth,
			height: MATTER_CONTAINER.offsetHeight
		}
	});

	let domBodies = document.querySelectorAll(".menu__item");
	let matterBodies = {};
	let runner;
	let leftWall, rightWall, ground;

	init();

	function init() {
		createBounds();
		// Add all the bounds to the world
		Composite.add(engine.world, [leftWall, rightWall, ground]);
		// run the renderer
		Render.run(render);
		// create runner
		runner = Runner.create();
		// run the engine
		Runner.run(runner, engine);
		// Add visual duplicates of the html elements to the helper canvas
		creatMatterBodies();
		World.add(engine.world, Object.values(matterBodies));
		window.requestAnimationFrame(updateElementPositions);
		window.addEventListener("resize", () => handleResize());
	}

	function createBounds() {
		ground = Bodies.rectangle(
			MATTER_CONTAINER.offsetWidth / 2,
			MATTER_CONTAINER.offsetHeight + WALL_THICKNESS / 2,
			6000,
			WALL_THICKNESS,
			{ isStatic: true }
		);

		leftWall = Bodies.rectangle(
			0 - WALL_THICKNESS / 2,
			MATTER_CONTAINER.offsetHeight / 2,
			WALL_THICKNESS,
			MATTER_CONTAINER.offsetHeight * 5,
			{ isStatic: true }
		);

		rightWall = Bodies.rectangle(
			MATTER_CONTAINER.offsetWidth + WALL_THICKNESS / 2,
			MATTER_CONTAINER.offsetHeight / 2,
			WALL_THICKNESS,
			MATTER_CONTAINER.offsetHeight * 5,
			{ isStatic: true }
		);
	}

	function creatMatterBodies() {
		domBodies.forEach(function (domBody, index) {
			let matterBody = Bodies.rectangle(
				MATTER_CONTAINER.offsetWidth / 2,
				-MATTER_CONTAINER.offsetHeight,
				domBody.offsetWidth,
				domBody.offsetHeight,
				{
					chamfer: {
						radius: domBody.offsetHeight / 2
					},
					restitution: 0.925,
					density: Math.random() * 15,
					angle: Math.random() * 10,
					friction: Math.random() * 50,
					frictionAir: Math.random() / 150
				}
			);
			domBody.id = matterBody.id;
			matterBodies[matterBody.id] = matterBody;
		});
	}

	function updateElementPositions() {
		domBodies.forEach((domBody, index) => {
			let matterBody = matterBodies[domBody.id];

			if (matterBody) {
				domBody.style.transform =
					"translate( " +
					(-domBody.offsetWidth + matterBody.position.x + domBody.offsetWidth / 2) +
					"px, " +
					(-domBody.offsetHeight +
						matterBody.position.y +
						domBody.offsetHeight / 2) +
					"px )";
				domBody.style.transform += "rotate( " + matterBody.angle + "rad )";
			}
		});

		window.requestAnimationFrame(updateElementPositions);
	}

	function handleResize() {
		render.canvas.width = MATTER_CONTAINER.offsetWidth;
		render.canvas.height = MATTER_CONTAINER.offsetHeight;

		Matter.Render.setPixelRatio(render, window.devicePixelRatio);

		Matter.Body.setPosition(
			ground,
			Matter.Vector.create(
				MATTER_CONTAINER.offsetWidth / 2,
				MATTER_CONTAINER.offsetHeight + WALL_THICKNESS / 2
			)
		);

		Matter.Body.setPosition(
			leftWall,
			Matter.Vector.create(
				0 - WALL_THICKNESS / 2,
				MATTER_CONTAINER.offsetHeight / 2
			)
		);

		Matter.Body.setPosition(
			rightWall,
			Matter.Vector.create(
				MATTER_CONTAINER.offsetWidth + WALL_THICKNESS / 2,
				MATTER_CONTAINER.offsetHeight / 2
			)
		);
	}
})();

  

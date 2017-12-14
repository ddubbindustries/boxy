// ideas
// api for player to code their own block with behaviors


_.limit = function(num, max){
  if (num > max) return max;
  if (num < -max) return -max;
  return num;
};
_.log = function(){
  var a = arguments;
  if (a.length == 1) {
    console.log(a[0]);
  } else if (a.length == 2) {
    return console.log(a[0],a[1]);
  } else if (a.length == 3) {
    return console.log(a[0],a[1],a[2]);
  } else {
    return console.log(a[0],a[1],a[2],a[3]);
  }
};

var init = {
      x:20, 
      y:20,
      stepDelay: 100,
      c: 0.1,
      inventory: [
        {type: 'wood',  qty: 10, health: 5},
        {type: 'rubber',qty: 10, health: 5},
        {type: 'glass', qty: 10, health: 5},
        {type: 'brick', qty: 20, health: 3},
        //{type: 'glue',  qty: 3,  health: 3},
        {type: 'magnet',qty: 10, health: 10, force: 0.5},
        {type: 'mank',  qty: 10, health: 3,  force: -0.1},
        {type: 'hero',  qty: 3,  health: 10, force: 0},
        {type: 'bot',   qty: 42, health: 50, birthRate: 25, decayRate: 50, chargeRate: 2}
      ]
    },
    table=[],
    sprites = [],
    bots = _.find(init.inventory, {type:'bot'}).qty,
    firstBot = {},
    clock = 0,
    play = false,
    stop = false,
    inventory = _.cloneDeep(init.inventory),
    step = function(){
      clock++;
      grid.sprites.forEach(function(sprite){
        sprite.move();
      });
      grid.draw();
    },
    setup = function(){
      clock = 0;
      /*testsprites = [
        //new Square('hero', {x:0, y:0}),
        //new Square('hero', {x:init.x/2-1, y:init.y/2-1}),
        //new Square('hero', {x:_.random(init.x-1), y:_.random(init.y-1)}),
        //new Square('bot', {x:13, y:5}, {x:-1,y:1}),
        
        new Square('bot', {x:8, y:9}, {x:-1,y:-1}),
        new Square('bot', {x:9, y:9}, {x:0,y:-1}),
        new Square('bot', {x:10, y:9},{x:1,y:-1}),
        new Square('bot', {x:8, y:10},{x:-1,y:0}),
        new Square('bot', {x:10, y:10}, {x:1,y:0}),
        new Square('bot', {x:8, y:11}, {x:-1,y:1}),
        new Square('bot', {x:9, y:11}, {x:0,y:1}),
        new Square('bot', {x:10, y:11}, {x:1,y:1}),
        
        //new Square('brick', {x:12, y:10},{x:0,y:0}),
        //new Square('brick', {x:13, y:10}),
        //new Square('brick', {x:14, y:10}),
        //new Square('bot', {x:19, y:10},{x:-1,y:1})
      ];*/
      grid = new Grid(init.x, init.y);
      grid.setRandom('hero');
            
      //for (e=0; e<bots; e++) 
      firstBot = grid.setRandom('bot', 3);
      _.merge(firstBot, {
        queen: true,
        health: 1,
        charging: true,
        dx: 0,
        dy: 0
      });

      grid.draw();

    };

class Grid {
  constructor(x,y){
    this.table = [];
    this.sprites = [];
    this.max = {x:x,y:y};
  }
  add(sprite){
    this.sprites.push(sprite);
    this.updateInventory();
  }
  delete(sprite){
    _.pull(this.sprites, sprite);
    this.updateInventory();
  }
  updateInventory(){
    var status = grid.getInventoryCounts();
    inventory.map(function(item, key){
      if (status[item.type]) 
        item.qty = init.inventory[key].qty - status[item.type];
    });
  }
  getInventoryCounts(){
    return _.countBy(this.sprites, 'type');
  }
  setRandom(type, minDist){
    var timeout = 1000, noob = {};
    do {
      var randCoords = {x:_.random(this.max.x-1),y:_.random(this.max.y-1)},
          bestDist = Infinity;
      this.sprites.forEach(function(sprite){
        var thisDist = sprite.getDistance(randCoords);
        if (thisDist < bestDist) bestDist = thisDist;
      });          
    } while (bestDist < minDist && timeout-- > 0);

    noob = new Square(type, randCoords);
    if (timeout > 0) this.add(noob);
    return noob;
  }
  draw(){
    for (var y=0; y<init.y; y++){
      table[y]=[];
      for (var x=0; x<init.x; x++) {
        var out = {};
        this.sprites.forEach(function(sprite){
          if (_.round(sprite.x) == x && _.round(sprite.y) == y) out = sprite;
        });
        table[y][x]=out;
      }
    }
  }
}

class Square {
  constructor(type, coords, delta) {
    this.type = type;
    this.x = coords.x;
    this.y = coords.y;
    
    delta = delta || (type == 'bot' ? _.random(7)*45 : {x:0,y:0});
    if (_.isObject(delta)) {
      this.dx = delta.x;
      this.dy = delta.y;
    } else {
      this.setAngle(delta);
    }
    this.ax = 0;
    this.ay = 0;
    this.age = 0;
    this.gen = 0;
    
    this.init = _.find(inventory, {type: type});
    var thisObj = this;
    _.forEach(this.init, function(val, key) {
      thisObj[key] = val;
    });
  }  
  getDistance(other){
    return Math.floor(Math.sqrt(Math.pow(this.x-other.x,2) + Math.pow(this.y-other.y,2)));
  }
  getAngle(){
    // wish this could be more elegant
    var mod = 0;
    if (this.dx < 0) mod = 180;
    if (this.dx < 0 && this.dy < 0) mod = -180;
    return Math.atan(this.dy/this.dx)*180/Math.PI + mod;
  }
  setAngle(angle){
    var a = angle*Math.PI/180;
    this.dx = Math.round(Math.cos(a));
    this.dy = Math.round(Math.sin(a));
  }
  checkGlobalStatus(){
    var lastBot = _.filter(grid.sprites, {type: 'bot'});
    if (lastBot.length == 1 && !lastBot[0].queen) {
      console.log('boss bot!', lastBot);
      lastBot = lastBot[0];
      lastBot.charging = true;
    }
  }
  isPrego(){
    return (
      !this.charging &&
      this.age > 0 && 
      this.age % this.birthRate == 0
    );
  }
  decay() {
    if (
      this.gen > 0 &&
      !this.charging && 
      this.decayRate && 
      this.age % this.decayRate == 0
    ) 
      this.health--;
    if (this.health <= 0 && !this.charging) grid.delete(this);
  }
  dampen(){
    this.ax = 0; 
    this.ay = 0;
  }
  decel(c){
    if (Math.abs(this.dx) > c) {
      this.ax = -this.dx*c;
    } else {  
      this.ax = 0;
      this.dx = 0;
    }
    
    if (Math.abs(this.dy) > c) {
      this.ay = -this.dy*c;
    } else {  
      this.ay = 0;
      this.dy = 0;
    }
    
  }
  charge(){
    this.decel(init.c);
    if (this.health < this.init.health) {
      if (this.age % this.chargeRate == 0) this.health++;
    } else {
      this.charging = false;
      this.queen = true;
      this.setAngle(_.random(7)*45);
    }
  }
  move(splitting) {
    //if (!_.find(sprites, function(s){return s.force;})) this.dampen();
    
    this.dx = _.limit(this.dx + this.ax, 1);
    this.dy = _.limit(this.dy + this.ay, 1);
    this.x = _.round(this.x + this.dx, 3);
    this.y = _.round(this.y + this.dy, 3);  
    
    if (this.charging) this.charge();
    
    this.interactWith(grid.sprites);
    this.borderBounce();
    if (!splitting && this.isPrego()) this.split();
    this.checkGlobalStatus();
    this.age++;
    this.decay();
  }
  borderBounce() {
    if (this.x <= 0) {this.x = 0; this.dx = -this.dx;}
    if (this.x >= init.x-1) {this.x = init.x-1; this.dx = -this.dx;}
    if (this.y <= 0) {this.y = 0; this.dy = -this.dy;}
    if (this.y >= init.y-1) {this.y = init.y-1; this.dy = -this.dy;}
  }
  interactWith(others) {
    var a = this, touch, diag;
    others.forEach(function(b){
      if (a == b) return false;
      
      // forces
      if (a.force) a.useTheForce(b, a.force);
      
      // collisions
      var diag = false, touch = false;
      
      if (
        _.round(a.x - b.x) !== 0 &&
        _.round(a.y - b.y) !== 0 &&
        _.round(a.x + a.dx) == b.x &&
        _.round(a.y + a.dy) == b.y
      ) diag = {target:b, x:true, y:true};
      
      if (
        _.round(a.x - b.x) == 0 &&
        _.round(a.y + a.dy) == b.y
      ) touch = {target:b, y:true};
      
      if (
        _.round(a.y - b.y) == 0 &&
        _.round(a.x + a.dx) == b.x
      ) touch = {target:b, x:true};

      if (diag && !touch) touch = diag;
      if (touch) a.hit(touch.target, touch.x, touch.y);
    });
  }
  hit(target, x, y) {
    switch (target.type) {
      case 'hero':
      case 'wood':
        this.rebound(target, x,y);
        break;
      case 'brick':
        this.rebound(target, x, y);
        this.split();
        break;
      case 'glass':
        this.impact(target, x, y);
        this.rebound(target, x, y);
        target.split(true);
        break;
      case 'glue':
        target.stick(this);
        break;
      default:
        this.impact(target, x, y);
        this.rebound(target, x, y);
    }
  }
  useTheForce(target, k) {
    if (_.isFinite(target.getAngle())) {
      target.ax = _.limit(k/(this.x - target.x),1);
      target.ay = _.limit(k/(this.y - target.y),1);
    }
  }
  impact(target, x, y){
    if (x) target.dx = this.dx;
    if (y) target.dy = this.dy;
    //console.log(this.type, 'impacted', target.type, x, y);
  }
  rebound(target, x, y){
    if (x) this.dx *= -1;
    if (y) this.dy *= -1;
    if (target && target.type !== this.type) {
      target.health--;
      this.health--;
    }
    //console.log(target.type, 'rebounded', this.type);
  }
  stick(target){
    this.dx = target.dx;
    this.dy = target.dy;
    this.ax = target.ax;
    this.ay = target.ay;
    target.type = this.type;
  }
  split(impacted){
    if (
      _.filter(grid.sprites, {type:this.type}).length >= 
      _.find(init.inventory, {type: this.type}).qty
    ) return false;
    
    if (!_.isFinite(this.getAngle())) this.setAngle(45);
    var angle = this.getAngle(),
        halflife = _.floor(this.health / 2),
        child = _.cloneDeep(this);
    this.setAngle(angle+45);
    if (!impacted) this.move(true);
    
    child.age = 0;
    child.queen = false;
    child.gen++;
    child.setAngle(angle-45);
    child.move(true);
    
    this.health = halflife;
    child.health = halflife;
    
    grid.add(child);
    //console.log('split', this.type, angle, 'thisnew', this.getAngle(), 'child', child.getAngle());
  }
}

setup();

var app = angular.module("myApp", [])
  .controller("myCtrl", ['$scope', '$interval', function($scope, $interval) {
  $scope.table = table;
  $scope.inventory = inventory;
  $scope.currentType = 0;
  $scope.setCurrentType = function(t){
    $scope.currentType = t;
  };
  $scope.step = function(){
    step();
    if (stop) $interval.cancel(play);
  };
  $scope.stepInterval = false;
  $scope.reset = setup;
  $scope.getClock = function(){
    return clock;
  };
  $scope.togglePlay = function(){
    if (play) {
      $interval.cancel(play);
      play = false;
    } else {
      play = $interval($scope.step, init.stepDelay);
      stop = false;
    }
  };
  $scope.click = function(cell, x, y) {
    
    var hero = _.find(grid.sprites, {type:'hero'}),
        heroSafe = hero && hero.getDistance({x:x,y:y})>1;
    
    if (!cell.type &&
        (heroSafe || !hero) && 
        inventory[$scope.currentType].qty > 0
    ) {
      var currentItem = inventory[$scope.currentType];
      grid.add(new Square(currentItem.type, {x:x,y:y}));
    }
    
    grid.draw();
    console.log('inspect cell', cell, 'sprites', grid.sprites, inventory);
  }; 
}]);
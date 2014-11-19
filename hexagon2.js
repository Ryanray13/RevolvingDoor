'use strict';
angular.module('myApp.hexagon2', ['myApp.gameLogic']).service('hexagon2', function(gameLogic){
	var OriginX;
	var OriginY;

  var radius;
  var height;
  var width;
  var side;
  var center;
  var vertex;
  var points;
  var tile;
  var sideNum;
  var sidePt;

  function init(x, y, r){
  	OriginX = x;
  	OriginY = y;
    radius = r;
    height = Math.sqrt(3) * radius;
    width = 2 * radius;
    side = (3 / 2) * radius;
    sideNum = 6;

		center = [width/2, height/2];
    vertex = [];
		vertex[0] = [0, (height / 2)];                //0
		vertex[1] = [width - side, 0];                //1
		vertex[2] = [side, 0];                        //2
		vertex[3] = [width, (height / 2)];            //3
		vertex[4] = [side, height];                   //4
		vertex[5] = [width - side, height];           //5

		sidePt = [];
    for(var i = 0; i < sideNum; i++){
      sidePt[i] = [(vertex[i][0] + vertex[(i+1)%sideNum][0])/2, (vertex[i][1] + vertex[(i+1)%sideNum][1])/2];
    }

		points = pointLsToStr(vertex);

    tile = [[1,0,3,2,5,4],
            [1,0,4,5,2,3],
            [1,0,5,4,3,2],
            [2,4,0,5,1,3],
            [3,4,5,0,1,2]];
  }
  
  function pointLsToStr(pointLs){
  	var str = "";
		for(var i = 0; i < pointLs.length; i++){
			if(i > 0)
				str = str + " ";
			str = str + pointLs[i][0]+","+pointLs[i][1];
		}
		return str;
  }

	function genTile(r, c){
		var tile = { 
				r: r,
				c: c,
  			tx: OriginX + c*side,
  			ty: OriginY + c*height/2 + height*r,
				pathLs: [],
				edgeLs: [],
				points: points
		};
		return tile;
	}

	function genTileLs(board){
		var tileLs = [];
		for(var c = 0; c < board[0].length; c++){
		  for(var r = 0; r < board.length; r++){
				var tile = genTile(r, c);

				for(var s = 0; s < sideNum; s++){
					if(gameLogic.isEdge(r, c, s)){
						var pointLs = [vertex[s], vertex[(s+1)%sideNum], center];
						var edge = {
								points: pointLsToStr(pointLs),
								s: s
						}
						tile.edgeLs.push(edge);
					}
				}

				tileLs.push(tile);
			}
		}
		return tileLs;
	};
	
  function drawPathTile(t, tid, rot) {
    //console.log("drawPathTile");
    for(var i = 0; i < sideNum; i++){
      var ss = i;
      var se = tile[tid][i];
      ss = (ss + sideNum - rot) % sideNum;
      se = (se + sideNum - rot) % sideNum;
  	  t.pathLs.push(drawPath(ss, se));
    }
    return t;
  }
  
  function pathToStr(path){
    return "M"+sidePt[path.ss][0]+","+sidePt[path.ss][1]+" A"+path.r+","+path.r+" 0 0,1 "+sidePt[path.se][0]+","+sidePt[path.se][1];
  }
  
  function drawPath(s0, s1){

    var diff = Math.abs(s1 - s0);
    if(diff == 1 || diff == 5){
        // Draw an arc with half radius
        var vs;
        var ve;
        if((s0 + 1)%sideNum == s1){
            vs = s1;
            ve = s0;
        }
        else{
            vs = s0;
            ve = s1;
        }
        //context.beginPath();
        //context.arc(vertex[vs][0],vertex[vs][1], radius/2, 1/3*Math.PI*ve, 2/3*Math.PI + 1/3*Math.PI*ve);
        //context.stroke();

        /*
         * start: 30,0
         *   end: 0,51.96
         * radius: 30,30
         Example:
        	<path d="M30,0
            A30,30 0 0,1 0,51.96"
         style="stroke:#FFFFFF; fill:none; stroke-width:5"/>
        */
        var path = {
        		ss: vs,
        		se: ve,
        		ctr: vertex[vs],
        		r: radius/2,
        		arc: [1/3*Math.PI*ve, 2/3*Math.PI + 1/3*Math.PI*ve]
        }
        path.str = pathToStr(path);
        return path;
    }
    else if(diff == 2 || diff == 4){
        // Draw an arc with 2/3 radius
        var vs;
        var ve;
        var ss;
        var se;
        if((s0 + 2)%sideNum == s1){
            vs = s0;
            ve = (vs+1)%sideNum;
            ss = s1;
            se = s0;
        }
        else{
            vs = s1;
            ve = (vs+1)%sideNum;
            ss = s0;
            se = s1;
        }
        var cx = vertex[ve][0] + vertex[ve][0] - vertex[vs][0];
        var cy = vertex[ve][1] + vertex[ve][1] - vertex[vs][1];

        //context.beginPath();
        //context.arc(cx,cy, radius*3/2, 1/3*Math.PI*ve, 1/3*Math.PI*ve + 1/3*Math.PI);
        //context.stroke();
        var path = {
        		ss: ss,
        		se: se,
        		ctr: [cx,cy],
        		r: radius*3/2,
        		arc: [1/3*Math.PI*ve, 1/3*Math.PI*ve + 1/3*Math.PI]
        }
        path.str = pathToStr(path);
        return path;
    }
    else if(diff == 3){
        //Draw a line
        //context.moveTo(sidePt[s0][0], sidePt[s0][1]); 
        //context.lineTo(sidePt[s1][0], sidePt[s1][1]); 
        //context.stroke();
    	  var ss;
    	  var se;
    	  if(s0 < s1){
    	  	ss = s0;
    	  	se = s1;
    	  }
    	  else{
    	  	ss = s1;
    	  	se = s0;
    	  }
        var path = {
        		ss: ss,
        		se: se,
        }
        path.str = "M" + sidePt[path.ss][0]+","+sidePt[path.ss][1]+" L"+sidePt[path.se][0]+","+sidePt[path.se][1];
        return path;
    }
  }
  
  function genToken(r, c, s){
  	var token = {
  			r: r,
  			c: c,
  			s: s,
  			tx: OriginX + c*side,
  			ty: OriginY + c*height/2 + height*r,
  			pt: sidePt[s],
  	}
  	return token;
  }

	this.init = init;
	this.genTile = genTile;
	this.genTileLs = genTileLs;
	this.drawPathTile = drawPathTile;
	this.genToken = genToken;
});

// The MIT License
//
// Copyright (c) 2012-2013 Robert Anton Reese
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
// THE SOFTWARE.

// Hex math defined here: http://blog.ruslans.com/2011/02/hexagonal-grid-math.html

'use strict';

angular.module('myApp.hexagon', []).service('hexagon', function(){
    var radius;

    var height;
    var width;
    var side;

    var canvas;
    var context;

    var canvasOriginX;
    var canvasOriginY;

    var sideNum;

    this.init = function init(canvasId, r) {
        radius = r;
    
        height = Math.sqrt(3) * radius;
        width = 2 * radius;
        side = (3 / 2) * radius;
    
        canvas = document.getElementById(canvasId);
        context = canvas.getContext('2d');
    
        canvasOriginX = 0;
        canvasOriginY = 0;
    
        sideNum = 6;
        this.sideNum = sideNum;
        this.color = "#FFCC00";
        this.lineWidth = "5";

        context.strokeStyle = this.color;
        context.lineWidth = this.lineWidth;


        
        //canvas.addEventListener("mousedown", clickEvent.bind(this), false);
    };

    
    this.drawHexGrid = function drawHexGrid(rows, cols, originX, originY, boardSize ,isDebug) {
        canvasOriginX = originX;
        canvasOriginY = originY;
        
        var currentHexX;
        var currentHexY;
        var debugText = "";
    
        var offsetColumn = false;
    
        for (var col = 0; col < cols; col++) {
            for (var row = 0; row < rows; row++) {
                if (!offsetColumn) {
                    currentHexX = (col * side) + originX;
                    currentHexY = (row * height) + originY;
                } else {
                    currentHexX = col * side + originX;
                    currentHexY = (row * height) + originY + (height * 0.5);
                }
    
                var cord = offsetToAxial(row, col) ;

                if (isDebug) {
                    //var tr = offsetToAxial(row, col);
                    //debugText = tr[0]+ "," + tr[1];
                    debugText = col+ "," + row;
                }

                console.log("boardSize:" + boardSize);
                if(cord.row >= 0 && cord.row < boardSize && cord.column >= 0 && cord.column < boardSize){
    
                    drawHex(currentHexX, currentHexY, "#000", debugText);
                    //console.log(currentHexX + " " + currentHexY);
                    //drawPath(currentHexX, currentHexY, 0, 2);
                    //this.drawPathTile(currentHexX, currentHexY, 1, 0);
                }
                else{
                    //drawHex(currentHexX, currentHexY, "#fff", debugText);
                }
            }
            offsetColumn = !offsetColumn;
        }
    };
    
    function locHexAtColRow(column, row) {
        var drawy = column % 2 == 0 ? (row * height) + canvasOriginY : (row * height) + canvasOriginY + (height / 2);
        var drawx = (column * side) + canvasOriginX;
        return { x: drawx, y: drawy };
    }

    function drawSelectedTileSide(column, row, s, c){

        var cord = axialToOffset(row, column);
        row = cord.row;
        column = cord.column;

        var loc = locHexAtColRow(column, row);
        var x0 = loc.x;
        var y0 = loc.y;

        var vertex = [];
        vertex[0] = [x0, y0 + (height / 2)];                    //0
        vertex[1] = [x0 + width - side, y0];                    //1
        vertex[2] = [x0 + side, y0];                            //2
        vertex[3] = [x0 + width, y0 + (height / 2)];            //3
        vertex[4] = [x0 + side, y0 + height];                   //4
        vertex[5] = [x0 + width - side, y0 + height];           //5

        var ctr = new Object();
        ctr.x = vertex[0][0] + radius;
        ctr.y = vertex[0][1];

        var vs = new Object();
        vs.x = vertex[s][0];
        vs.y = vertex[s][1];

        var ve = new Object();
        ve.x = vertex[(s+1)%sideNum][0];
        ve.y = vertex[(s+1)%sideNum][1];


        context.lineWidth = "1";
        context.beginPath();
        context.moveTo(ctr.x, ctr.y); //0
        context.lineTo(vs.x, vs.y); //0
        context.lineTo(ve.x, ve.y); //0
        context.closePath();

        context.fillStyle = this.color;

        if(c !== undefined){
            context.fillStyle = c;
        }
        context.fill();

        context.stroke();

        context.lineWidth = this.lineWidth;

        /*
        */

    }
    this.drawSelectedTileSide = drawSelectedTileSide;

    function getSelectedTileSide(mouseX, mouseY){
        var obj = getSelectedTile(mouseX, mouseY);

    	var offSet = getRelativeCanvasOffset();
    
        mouseX -= offSet.x;
        mouseY -= offSet.y;

        var row = obj.row;
        var column = obj.column;

        var loc = locHexAtColRow(column, row);

        var x0 = loc.x;
        var y0 = loc.y;

        var vertex = [];
        vertex[0] = [x0, y0 + (height / 2)];                    //0
        vertex[1] = [x0 + width - side, y0];                    //1
        vertex[2] = [x0 + side, y0];                            //2
        vertex[3] = [x0 + width, y0 + (height / 2)];            //3
        vertex[4] = [x0 + side, y0 + height];                   //4
        vertex[5] = [x0 + width - side, y0 + height];           //5

        var ctr = new Object();
        ctr.x = vertex[0][0] + radius;
        ctr.y = vertex[0][1];

        var mousePoint = new Object();
        mousePoint.x = mouseX;
        mousePoint.y = mouseY;

        var s = -1;

        for(var i = 0; i < sideNum; i++){
            var vs = new Object();
            vs.x = vertex[i][0];
            vs.y = vertex[i][1];

            var ve = new Object();
            ve.x = vertex[(i+1)%sideNum][0];
            ve.y = vertex[(i+1)%sideNum][1];

            if(isPointInTriangle(mousePoint, ctr, vs, ve)){
                s = i;
                //context.strokeStyle = "#000";
                //context.beginPath();
                //context.moveTo(ctr.x, ctr.y); //0
                //context.lineTo(vs.x, vs.y); //0
                //context.lineTo(ve.x, ve.y); //0
                //context.closePath();
                //context.stroke();
                break;
            }
        }

        var cord = offsetToAxial(row, column);

        return  { row: cord.row, column: cord.column, side: s };
    }
    this.getSelectedTileSide = getSelectedTileSide;

    function drawHexAtColRow(column, row, color) {

        var cord = axialToOffset(row, column);
        row = cord.row;
        column = cord.column;

        var drawy = column % 2 == 0 ? (row * height) + canvasOriginY : (row * height) + canvasOriginY + (height / 2);
        var drawx = (column * side) + canvasOriginX;
    
        drawHex(drawx, drawy, color, "");
    };

    this.drawHexAtColRow = drawHexAtColRow;



    this.drawPathTileAtColRow = function drawPathTileAtColRow(column, row, tid, rot) {
        var cord = axialToOffset(row, column);
        row = cord.row;
        column = cord.column;

        var drawy = column % 2 == 0 ? (row * height) + canvasOriginY : (row * height) + canvasOriginY + (height / 2);
        var drawx = (column * side) + canvasOriginX;
    
        drawPathTile(drawx, drawy, tid, rot);
    };

    function drawPathTileSide(column, row, s){
        var cord = axialToOffset(row, column);
        row = cord.row;
        column = cord.column;

        var y0 = column % 2 == 0 ? (row * height) + canvasOriginY : (row * height) + canvasOriginY + (height / 2);
        var x0 = (column * side) + canvasOriginX;

        var sidePt = [];
        var vertex = [];

        vertex[0] = [x0, y0 + (height / 2)];                    //0
        vertex[1] = [x0 + width - side, y0];                    //1
        vertex[2] = [x0 + side, y0];                            //2
        vertex[3] = [x0 + width, y0 + (height / 2)];            //3
        vertex[4] = [x0 + side, y0 + height];                   //4
        vertex[5] = [x0 + width - side, y0 + height];           //5

    
        for(var i = 0; i < sideNum; i++){
            sidePt[i] = [(vertex[i][0] + vertex[(i+1)%sideNum][0])/2, (vertex[i][1] + vertex[(i+1)%sideNum][1])/2];
        }

        //context.strokeStyle = "#000";
        context.beginPath();
        context.arc(sidePt[s][0],sidePt[s][1], radius/4, 0, 2*Math.PI);
        context.stroke();

    }
    this.drawPathTileSide = drawPathTileSide;
    
    function drawHex(x0, y0, fillColor, debugText) {
    
        /* 
         
       0 1  2
          __
       0 /  \ 3
         \__/
         5  4  */
        //console.log("drawHex");
        //context.strokeStyle = "#000";
        context.beginPath();
        context.moveTo(x0, y0 + (height / 2)); //0
        context.lineTo(x0 + width - side, y0); //1
        context.lineTo(x0 + side, y0); //2
        context.lineTo(x0 + width, y0 + (height / 2)); //3
        context.lineTo(x0 + side, y0 + height); //4
        context.lineTo(x0 + width - side, y0 + height); //5
    
        if (fillColor) {
            context.fillStyle = fillColor;
            context.fill();
        }
    
        context.closePath();
        context.stroke();
    
        if (debugText) {
            context.font = "8px";
            context.fillStyle = "#000";
            context.fillText(debugText, x0 + (width / 2) - (width/4), y0 + (height - 5));
        }
    };
    
    this.drawColorPathAtColRow = function (column, row, s0, s1, c) {
        var cord = axialToOffset(row, column);
        row = cord.row;
        column = cord.column;
        var drawy = column % 2 == 0 ? (row * height) + canvasOriginY : (row * height) + canvasOriginY + (height / 2);
        var drawx = (column * side) + canvasOriginX;

        if(c!== undefined){
            context.strokeStyle = c;
        }
        drawPath(drawx, drawy, s0, s1);
        context.strokeStyle = this.color;
    };

    function drawPath(x0, y0, s0, s1) {
        //console.log("drawPath");
        var sidePt = [];
        var vertex = [];

        vertex[0] = [x0, y0 + (height / 2)];                    //0
        vertex[1] = [x0 + width - side, y0];                    //1
        vertex[2] = [x0 + side, y0];                            //2
        vertex[3] = [x0 + width, y0 + (height / 2)];            //3
        vertex[4] = [x0 + side, y0 + height];                   //4
        vertex[5] = [x0 + width - side, y0 + height];           //5

    
        for(var i = 0; i < sideNum; i++){
            sidePt[i] = [(vertex[i][0] + vertex[(i+1)%sideNum][0])/2, (vertex[i][1] + vertex[(i+1)%sideNum][1])/2];
        }
    
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
            context.beginPath();
            context.arc(vertex[vs][0],vertex[vs][1], radius/2, 1/3*Math.PI*ve, 2/3*Math.PI + 1/3*Math.PI*ve);
            context.stroke();
        }
        else if(diff == 2 || diff == 4){
            // Draw an arc with 2/3 radius
            var vs;
            var ve;
            if((s0 + 2)%sideNum == s1){
                vs = s0;
                ve = (vs+1)%sideNum;
            }
            else{
                vs = s1;
                ve = (vs+1)%sideNum;
            }
            var cx = vertex[ve][0] + vertex[ve][0] - vertex[vs][0];
            var cy = vertex[ve][1] + vertex[ve][1] - vertex[vs][1];
            context.beginPath();
            context.arc(cx,cy, radius*3/2, 1/3*Math.PI*ve, 1/3*Math.PI*ve + 1/3*Math.PI);
            context.stroke();
        }
        else if(diff == 3){
            //Draw a line
            context.moveTo(sidePt[s0][0], sidePt[s0][1]); 
            context.lineTo(sidePt[s1][0], sidePt[s1][1]); 
            context.stroke();
        }
    };
    
    function drawPathTile(x0, y0, tid, rot) {
        //console.log("drawPathTile");
        var tile = [[1,0,3,2,5,4],
                    [1,0,4,5,2,3],
                    [1,0,5,4,3,2],
                    [2,4,0,5,1,3],
                    [3,4,5,0,1,2]];
        
        drawHex(x0, y0, "#000", "");
        for(var i = 0; i < sideNum; i++){
            var ss = i;
            var se = tile[tid][i];
            ss = (ss + sideNum - rot) % sideNum;
            se = (se + sideNum - rot) % sideNum;
            drawPath(x0, y0, ss, se);
        }
    
    };
    this.drawPathTile = drawPathTile;
    
    
    //Recusivly step up to the body to calculate canvas offset.
    function getRelativeCanvasOffset() {
    	var x = 0, y = 0;
    	var layoutElement = canvas;
        if (layoutElement.offsetParent) {
            do {
                x += layoutElement.offsetLeft;
                y += layoutElement.offsetTop;
            } while (layoutElement = layoutElement.offsetParent);
            
            return { x: x, y: y };
        }
    }
    
    //Uses a grid overlay algorithm to determine hexagon location
    //Left edge of grid has a test to acuratly determin correct hex
    function getSelectedTile(mouseX, mouseY) {
    
    	var offSet = getRelativeCanvasOffset();
    
        mouseX -= offSet.x;
        mouseY -= offSet.y;

        mouseX -= canvasOriginX;
        mouseY -= canvasOriginY;
    
        var column = Math.floor((mouseX) / side);
        var row = Math.floor(
            column % 2 == 0
                ? Math.floor((mouseY) / height)
                : Math.floor(((mouseY + (height * 0.5)) / height)) - 1);
    
    
        //Test if on left side of frame            
        if (mouseX > (column * side) && mouseX < (column * side) + width - side) {
    
    
            //Now test which of the two triangles we are in 
            //Top left triangle points
            var p1 = new Object();
            p1.x = column * side;
            p1.y = column % 2 == 0
                ? row * height
                : (row * height) + (height / 2);
    
            var p2 = new Object();
            p2.x = p1.x;
            p2.y = p1.y + (height / 2);
    
            var p3 = new Object();
            p3.x = p1.x + width - side;
            p3.y = p1.y;
    
            var mousePoint = new Object();
            mousePoint.x = mouseX;
            mousePoint.y = mouseY;
    
            if (isPointInTriangle(mousePoint, p1, p2, p3)) {
                column--;
    
                if (column % 2 != 0) {
                    row--;
                }
            }
    
            //Bottom left triangle points
            var p4 = new Object();
            p4 = p2;
    
            var p5 = new Object();
            p5.x = p4.x;
            p5.y = p4.y + (height / 2);
    
            var p6 = new Object();
            p6.x = p5.x + (width - side);
            p6.y = p5.y;
    
            if (isPointInTriangle(mousePoint, p4, p5, p6)) {
                column--;
    
                if (column % 2 == 0) {
                    row++;
                }
            }
        }
    
        return  { row: row, column: column };
    };

    this.getSelectedTile = getSelectedTile;
    
    function sign(p1, p2, p3) {
        return (p1.x - p3.x) * (p2.y - p3.y) - (p2.x - p3.x) * (p1.y - p3.y);
    };
    
    //TODO: Replace with optimized barycentric coordinate method
    function isPointInTriangle(pt, v1, v2, v3) {
        var b1, b2, b3;
    
        b1 = sign(pt, v1, v2) < 0.0;
        b2 = sign(pt, v2, v3) < 0.0;
        b3 = sign(pt, v3, v1) < 0.0;
    
        return ((b1 == b2) && (b2 == b3));
    };
    
    function clickEvent(e) {
        var mouseX = e.pageX;
        var mouseY = e.pageY;
    
        var localX = mouseX;
        var localY = mouseY;
    
        var tile = getSelectedTile(localX, localY);
        if (tile.column >= 0 && tile.row >= 0) {
            var drawy = tile.column % 2 == 0 ? (tile.row * height) + canvasOriginY + 6 : (tile.row * height) + canvasOriginY + 6 + (height / 2);
            var drawx = (tile.column * side) + canvasOriginX;
    
            drawHex(drawx, drawy - 6, "rgba(110,110,70,0.3)", "");
        } 
    };
    
    function axialToOffset(arow, acol) {
        var ocol = acol;
        var orow = arow + (acol - (acol&1))/2;
        return {row:orow, column:ocol};
    };
    this.axialToOffset = axialToOffset;
    
    function offsetToAxial(orow, ocol) {
        var acol = ocol;
        var arow = orow - (ocol - (ocol&1))/2;
        return {row:arow, column:acol};
    };
    this.offsetToAxial = offsetToAxial;

});

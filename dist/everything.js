angular.module('myApp', ['ngTouch', 'ui.bootstrap']).factory('gameLogic', function () {

    'use strict';

    /*
    Revolving Door:
    Game stuff:
        * One nxn Hexagon Board
        * Two Tokens
        * Several Hexagon Tiles. Each tile has 3 paths from side to side;
    Rule:
        Phase0
            Phase00) players put their own token on one edge of the board
            Phase01) two tokens can not colide
        Phase1
            * two players take turns to do:
                Phase10) player places one tile on the location of it's token
                Phase11) move two players' token according to the path of on the board
        Dead
            Dead0) Player is dead if his/her token is moved to the edge of the board
        Win
            Win0)  Player's token is still alive while opponent's token is dead.
            
     */

    /* ------------ Hexagon Board ------------
     I use Axial coordinates to represent the board by a 2-D array "board"
     Reference: http' path map://www.redblobgames.com/grids/hexagons/#coordinates
     Example:
     board: [[[4, 0],[-1, -1],[-1, -1]], 
             [[-1, -1],[-1, -1],[-1, -1]], 
             [[-1, -1],[-1, -1],[-1, -1]]],

     Explaination:
     board[1][1] === [-1,-1] means there is no tile on 1x1
     board[0][0] === [4,0] means there is a tile with id: 4 rotation: 0 on 0x0
    */

    /* ------------ 6 directions of Hexsgon grid ------------
      __
     /  \
     \__/ 

     [0,-1]: left
     [-1,0]: up left
     [-1,1]: up right
     [0,1]: right
     [1,0]: right down
     [1,-1]: left down
    */
    var dir = [[0,-1], [-1,0], [-1,1], [0,1], [1,0], [1,-1]];

    /* ------------ Token ------------
     Edge idx
        1
        __
     0 /  \ 2
     5 \__/ 3
         4

     I use 2x3 array integers to represent tokens' locations
     Example:
     token: [[0,1,0], [2, 1, 5]],

     Explaination:
     token[0] === [0,1,0] means token 0 is at 0x1's edge 0
     token[1] === [2,1,5] means token 1 is at 2x1's edge 5
    */

    /*
     For a hexagon tile with one path-crossing perside, there are five unique tiles. 
     Reference: http://blog.garritys.org/2012/01/path-tile-games.html
     Those five unique tiles' path can be representd as follows
     tile[i][j] = k means ith tile's jth edge connects with kth edge
    */
    var tile = [[1,0,3,2,5,4],
                [1,0,4,5,2,3],
                [1,0,5,4,3,2],
                [2,4,0,5,1,3],
                [3,4,5,0,1,2]];

    var opposite = [3,4,5,0,1,2]; 
    var edgeNum = 6;
    var boardSize = 4;
    var playerNum = 2;
    var tileNum = 5;
    function isEqual(object1, object2) {
        //console.log(JSON.stringify(object1));
        //console.log(JSON.stringify(object2));
        //return JSON.stringify(object1) === JSON.stringify(object2);
        return angular.equals(object1, object2);
    }

    function copyObject(object) {
        return angular.copy(object);
    }

    // check if token's location is at the edge of board
    function isEdge(row, col, edg){

        try{
            if(row < 0 || row >= boardSize || col < 0 || col >= boardSize){
                return false;
            }
            if(row+dir[edg][0]===-1 || row+dir[edg][0]===boardSize){
                return true;
            }
            if(col+dir[edg][1]===-1 || col+dir[edg][1]===boardSize){
                return true;
            }
            return false;
        } catch(e){
            return false;
        }
    }

    function updateToken(board, token, tokenId){
        var row = token[tokenId][0];
        var col = token[tokenId][1];
        var edg = token[tokenId][2];
        var id = board[row][col][0];
        var rot = board[row][col][1];
        if(id !== -1){
            //console.log("update token: " + tokenId);
            //console.log(token[tokenId]);
            edg = (tile[id][(edg+rot)%edgeNum]+edgeNum-rot)%edgeNum;
            if(isEdge(row, col, edg)){
                token[tokenId][2] = edg;
                //token dead
                return token;
            }
            else{
                token[tokenId][0] = row + dir[edg][0];
                token[tokenId][1] = col + dir[edg][1];
                token[tokenId][2] = opposite[edg];
                
                return updateToken(board, token, tokenId);
            }
        }
        else{
            return token;
        }
    }

    function getTokenPath(board, token, tokenId, path){
      var row = token[tokenId][0];
      var col = token[tokenId][1];
      var edg = token[tokenId][2];
      getPrevTokenPath(board, row, col, edg, path);
    	getCurrTokenPath(board, token, tokenId, path);
    	return path;
    }

    function getPrevTokenPath(board, row, col, edg, path){
        if(isEdge(row, col, edg)){
        	return path;
        }
        else{
            row = row + dir[edg][0];
            col = col + dir[edg][1];
            edg = opposite[edg];

            var id = board[row][col][0];
            var rot = board[row][col][1];
            var prevEdg = edg;
            edg = (tile[id][(edg+rot)%edgeNum]+edgeNum-rot)%edgeNum;
            path.push({row: row, col: col, s0: prevEdg, s1: edg});
            return getPrevTokenPath(board, row, col, edg, path);
        }

    }

    function getCurrTokenPath(board, token, tokenId, path){
        var row = token[tokenId][0];
        var col = token[tokenId][1];
        var edg = token[tokenId][2];
        var id = board[row][col][0];
        var rot = board[row][col][1];
        if(id !== -1){
            var prevEdg = edg;
            edg = (tile[id][(edg+rot)%edgeNum]+edgeNum-rot)%edgeNum;
            if(isEdge(row, col, edg)){

                path.push({row: row, col: col, s0: prevEdg, s1: edg});
                token[tokenId][2] = edg;
                //token dead
                return path;
            }
            else{
                path.push({row: row, col: col, s0: prevEdg, s1: edg});
                console.log("push: " + path.length);
                
                token[tokenId][0] = row + dir[edg][0];
                token[tokenId][1] = col + dir[edg][1];
                token[tokenId][2] = opposite[edg];
                
                return getCurrTokenPath(board, token, tokenId, path);
            }
        }
        else{
            return path;
        }
    }

    function getInitialBoard(){
        var board = [];
        var i,j;
        for(i = 0; i < boardSize; i++){
            board[i] = [];
            for(j = 0; j < boardSize; j++){
                board[i][j] = [-1,-1];
            }
        }

        var token = [];
        for(i = 0; i < playerNum; i++){
            token[i] = [];
            for(j = 0; j < 3; j++){
                token[i][j] = -1;
            }
        }
        return {board: board, token: token};
    }

    function createMove(board, token, row, col, id, rot, turnIndexBeforeMove){
        board = copyObject(board);
        token = copyObject(token);
        //console.log("create move");
        var firstOperation = {setTurn: {turnIndex: 1 - turnIndexBeforeMove}};
        if(token[turnIndexBeforeMove][0] === -1){
            // Phase00: place token
            token[turnIndexBeforeMove][0] = row;
            token[turnIndexBeforeMove][1] = col;
            token[turnIndexBeforeMove][2] = rot; //when putting token, rot is dir;
        }
        else{
            // Phase10: place tile
            board[row][col][0] = id;
            board[row][col][1] = rot;
            // Phase11: update the locations of tokens since a new tile has change the paths on board
            token = updateToken(board, token, 0);
            token = updateToken(board, token, 1);

            // Dead0: Check if tokens reach the edge of the board
            var dead0 = isEdge(token[0][0], token[0][1], token[0][2]) && board[token[0][0]][token[0][1]][0]!==-1;
            var dead1 = isEdge(token[1][0], token[1][1], token[1][2]) && board[token[1][0]][token[1][1]][0]!==-1;
            if(dead0 === true || dead1 === true){
                firstOperation = {endMatch: {endMatchScores: [1-dead0, 1-dead1]}};
            }
        }
        return [firstOperation,
               {set: {key: 'board', value: board}},
               {set: {key: 'token', value: token}},
               {set: {key: 'delta', value: {row: row, col: col, id: id, rot: rot}}},
               {setRandomInteger: {key: 't0', from: 0, to: 5}},
               {setRandomInteger: {key: 't1', from: 0, to: 5}}]; // 5 is not included
    }

    function checkScore(board, token, row, col, id, rot){
        board[row][col][0] = id;
        board[row][col][1] = rot;

        token= copyObject(token);

        token = updateToken(board, token, 0);
        token = updateToken(board, token, 1);

        // Dead0: Check if tokens reach the edge of the board
        var dead0 = isEdge(token[0][0], token[0][1], token[0][2]) && board[token[0][0]][token[0][1]][0]!==-1;
        var dead1 = isEdge(token[1][0], token[1][1], token[1][2]) && board[token[1][0]][token[1][1]][0]!==-1;

        //reverse
        board[row][col][0] = -1;
        board[row][col][1] = -1;

        return [1-dead0, 1-dead1];
    }

    /** Returns an array of {stateBeforeMove, move, comment}. */
    function getExampleMoves(initialTurnIndex, initialState, arrayOfRowColComment) {
        var exampleMoves = [];
        var state = copyObject(initialState);
        var turnIndex = initialTurnIndex;
        for (var i = 0; i < arrayOfRowColComment.length; i++) {
            var rowColComment = arrayOfRowColComment[i];
            var move = createMove(state.board, state.token, rowColComment.row, rowColComment.col, rowColComment.id, rowColComment.rot, turnIndex);
            var stateAfterMove = {board : move[1].set.value, token: move[2].set.value, delta: move[3].set.value};
            exampleMoves.push({
                stateBeforeMove: state,
                stateAfterMove: stateAfterMove,
                turnIndexBeforeMove: turnIndex,
                turnIndexAfterMove: 1 - turnIndex,
                move: move,
                comment: {en: rowColComment.comment}});

            state = copyObject(stateAfterMove);
            turnIndex = 1 - turnIndex;
            //console.log(JSON.stringify(state));
        }
        return exampleMoves;
    }

    function getExampleGame() {
        return getExampleMoves(0, {board: [[[-1, -1],[-1, -1],[-1, -1]], 
                                           [[-1, -1],[-1, -1],[-1, -1]], 
                                           [[-1, -1],[-1, -1],[-1, -1]]],
                                   token: [[-1,-1,-1], [-1,-1, -1]],
                                   delta: {row: 0, col: 0, id: 0, rot: 0}},
                [
                {row: 2, col: 1, id: 0, rot: 5, comment: "player0 put token0 at the board edge"},
                {row: 0, col: 0, id: 0, rot: 0, comment: "player1 put token1 at the board edge"},

                {row: 2, col: 1, id: 1, rot: 5, comment: "player0 put tile1 at 2x1 with rotation 5"},
                {row: 0, col: 0, id: 4, rot: 0, comment: "player1 put tile4 at 0x0 with rotation 0"},

                {row: 2, col: 2, id: 0, rot: 0, comment: "player0 put tile0 at 2x2 with rotation 0"},
                {row: 0, col: 1, id: 1, rot: 5, comment: "player1 put tile1 at 0x1 with rotation 5"},

                {row: 1, col: 2, id: 2, rot: 1, comment: "player0 put tile2 at 1x2 with rotation 1"},
                {row: 1, col: 1, id: 0, rot: 1, comment: "player1 put tile0 at 1x1 with rotation 1"},

                {row: 0, col: 2, id: 3, rot: 2, comment: "to win the game, player0 put a tile to move token1 reach the board edge"},
                ]);
    }



    function isMoveOk(params){
        //return true;
        var move = params.move;
        var turnIndexBeforeMove = params.turnIndexBeforeMove;
        var stateBeforeMove = params.stateBeforeMove;
        try{
            // Example move:
            // [{setturn: {turnindex : 1},
            //  {set: {key: 'board', value: [[[4,0], [1,1], [-1,-1]],[[-1,-1],[0,1],[-1,-1]],[[-1,-1],[1,1],[0,0]]}},
            //  {set: {key: 'token', value: [[0,1,4], [2,2,1]]}},
            //  {set: {key: 'delta', value: {row: 1, col: 1, id: 0, rot: 1, token: [1,1,2]}},
            //  {setRandomInteger: {key: 't0', from: 0, to: 6}},
            //  {setRandomInteger: {key: 't1', from: 0, to: 6}}]
            var deltaValue = move[3].set.value;
            var row = deltaValue.row;
            var col = deltaValue.col;
            var id = deltaValue.id;
            var rot = deltaValue.rot;
            var board = stateBeforeMove.board;
            var token = stateBeforeMove.token;
            var t0 = stateBeforeMove.t0;
            var t1 = stateBeforeMove.t1;

            // Init Board
            if(board === undefined || token === undefined){
                var init = getInitialBoard();
                board = init.board;
                token = init.token;
            }


            if(token[turnIndexBeforeMove][0] === -1){
                // Phase00: Check if token's initial location is on the edge of board
                if(isEdge(row, col, rot) === false){
                    return false;
                }
                // Phase01: Check if token's initial location colides with other token
                if(row === token[1-turnIndexBeforeMove][0] && 
                   col === token[1-turnIndexBeforeMove][1] &&
                   rot === token[1-turnIndexBeforeMove][2]){
                    return false;
                }
            }
            else{
                if(board[row][col][0] !== -1){
                    return false;
                }
                //Phase10
                if(token[turnIndexBeforeMove][0] !== row || token[turnIndexBeforeMove][1] !== col){
                    return false;
                }

                //random
                if(id !== t0 && id !== t1){
                    //console.log("id: " + id);
                    return false;
                }
            }
            var expectMove = createMove(board, token, row, col, id, rot, turnIndexBeforeMove);
            if (!isEqual(move, expectMove)) {
                return false;
            }
        }
        catch(e){
            return false;
        }
        return true;
    }

    function getRandom(from, to){
        return Math.floor((to-from)*Math.random()) + from;
    }

    function createComputerMove(board, token, tid, turnIndex){
        var row = token[turnIndex][0]; 
        var col = token[turnIndex][1];
        var rot = token[turnIndex][2];
        var r, c, e;
        if(row === -1){
            var edgeLs = [];
            for(r = 0; r < boardSize; r += boardSize-1){
                for(c = 0; c < boardSize; c++){
                    if(r !== token[1-turnIndex][0] || c !== token[1-turnIndex][1]){
                        for(e= 0; e< edgeNum; e++){
                            if(isEdge(r, c, e)){
                                edgeLs.push([r,c,e]);
                            }
                        }
                    }
                }
            }

            for(c = 0; c < boardSize; c += boardSize-1){
                for(r = 1; r < boardSize-1; r++){
                    if(r !== token[1-turnIndex][0] || c !== token[1-turnIndex][1]){
                        for(e= 0; e< edgeNum; e++){
                            if(isEdge(r, c, e)){
                                edgeLs.push([r,c,e]);
                            }
                        }
                    }
                }
            }

            var rand = getRandom(0, edgeLs.length);
            row = edgeLs[rand][0];
            col = edgeLs[rand][1];
            rot = edgeLs[rand][2];
            
            return createMove(board, token, row, col, 0, rot, turnIndex);
        }
        else{
            var id = 0;
            rot = 0;
            var maxScore = -2;
            for(var ti = 0; ti < tid.length; ti++){
                for(var ri = 0; ri < edgeNum; ri++){
                    /* self-dead: score -= 1
                     * self-life: score += 1
                     * opponent-dead: score += 1
                     * opponent-life: score += 0
                     */
                    var scoreLs = checkScore(board, token, row, col, tid[ti], ri);
                    var score = scoreLs[turnIndex]*2 - 1 + (1 - scoreLs[1-turnIndex]); 
                    if(score > maxScore){
                        id = tid[ti];
                        rot = ri;
                        maxScore = score;
                    }
                }
            }
            return createMove(board, token, row, col, id, rot, turnIndex);
        }
    }

    return {
        isMoveOk : isMoveOk,
        getExampleGame : getExampleGame,
        createMove : createMove,
        getInitialBoard : getInitialBoard,
        boardSize : boardSize,
        tileNum : tileNum,
        isEdge : isEdge,
        createComputerMove : createComputerMove,
        getTokenPath : getTokenPath
    };
});
;angular.module('myApp')
  .controller('Ctrl', ['$rootScope', '$scope', '$log', '$timeout',
    'gameService', 'stateService', 'gameLogic', 'hexagon', 
    'resizeGameAreaService', 
    function ($rootScope, $scope, $log, $timeout,
      gameService, stateService, gameLogic, hexagon, 
      resizeGameAreaService) {

    'use strict';

    resizeGameAreaService.setWidthToHeight(0.8);

    $rootScope.isHelpModalShown = false;
    $scope.mouseClick = function(r, c, s){
        console.log("Clicked " + r + " " + c + " " + s);
        if(!$scope.isYourTurn){
            return;
        }
        try{
            if($scope.token !== undefined && $scope.token[$scope.turnIndex][0] === -1){
                if(gameLogic.isEdge(r, c, s)){
                    var move = gameLogic.createMove($scope.board, $scope.token, r, c, 0, s, $scope.turnIndex);
                    $scope.isYourTurn = false;
                    //console.log("isYorTurn:" + $scope.isYourTurn)
                    sendMakeMove(move);
                }
            }
        } catch(e){
            $log.info(["Cell is already full in position:", $scope.token[$scope.turnIndex][0], $scope.token[$scope.turnIndex][1]]);
            return;
        }
    };

    $scope.drawTile = function() {
        if($scope.isYourTurn && $scope.token !== undefined && $scope.token[$scope.turnIndex][0] !== -1){
            var row = $scope.token[$scope.turnIndex][0];
            var column = $scope.token[$scope.turnIndex][1];
            //var s = $scope.token[$scope.turnIndex][2];
            $scope.currTile = hexagon.genTile(row, column);
            hexagon.drawPathTile($scope.currTile, $scope.tid[$scope.tidIdx], $scope.rot);
        }
    };

    $scope.selTile = function () {
        if(!$scope.isYourTurn){
            console.log("not your turn");
            return;
        }
        try{
            if($scope.token !== undefined && $scope.token[$scope.turnIndex][0] !== -1){
                $scope.tidIdx = ($scope.tidIdx+1)%2;
                $scope.rot = 0;
                $scope.drawTile();
            }
        } catch(e){
            $log.info(["Cell is already full in position:", $scope.token[$scope.turnIndex][0], $scope.token[$scope.turnIndex][1]]);
            return;
        }
    };

    $scope.turnTile = function () {
        if(!$scope.isYourTurn){
            return;
        }
        try{
            if($scope.token !== undefined && $scope.token[$scope.turnIndex][0] !== -1){
                $scope.rot = ($scope.rot + 1)%hexagon.sideNum;
                $scope.drawTile();
            }
        } catch(e){
            $log.info(["Cell is already full in position:", $scope.token[$scope.turnIndex][0], $scope.token[$scope.turnIndex][1]]);
            return;
        }
    };

    $scope.makeMove = function () {
        if(!$scope.isYourTurn){
            return;
        }
        try{
            var row = $scope.token[$scope.turnIndex][0];
            var column = $scope.token[$scope.turnIndex][1];
            var moveObj = gameLogic.createMove($scope.board, $scope.token, row, column, $scope.tid[$scope.tidIdx], $scope.rot, $scope.turnIndex);
            $log.info(["Making move:", moveObj]);
            $scope.isYourTurn = false;
            sendMakeMove(moveObj);
        } catch(e){
            $log.info(["Cell is already full in position:", $scope.token[$scope.turnIndex][0], $scope.token[$scope.turnIndex][1]]);
            return;
        }
    };

    function sendMakeMove(move){
        $log.info(["Making move:", move]);
        gameService.makeMove(move);
    }

    function sendComputerMove() {
        sendMakeMove(gameLogic.createComputerMove($scope.board, $scope.token, $scope.tid, $scope.turnIndex));
    }

    function updateUI(params) {
        $scope.isYourTurn = params.turnIndexAfterMove >= 0 && // game is ongoing
            params.yourPlayerIndex === params.turnIndexAfterMove; // it's my turn
        $scope.turnIndex = params.turnIndexAfterMove;
        console.log("updateUI " + $scope.turnIndex);

        $scope.endMatchScores = params.endMatchScores;


        $scope.jsonState = angular.toJson(params.stateAfterMove, true);
        $scope.board = params.stateAfterMove.board;
        $scope.token = params.stateAfterMove.token;
        $scope.tid[0] = params.stateAfterMove.t0;
        $scope.tid[1] = params.stateAfterMove.t1;
        $scope.tidIdx = 0;
        $scope.delta = params.stateAfterMove.delta;
        console.log("tileid: " + $scope.tid[0] + " " + $scope.tid[1]);

        if($scope.board === undefined){
            var init = gameLogic.getInitialBoard();
            $scope.isHelpModalShown = false;
            $scope.board = init.board;
            $scope.token = init.token;
            $scope.tileLs = hexagon.genTileLs(init.board);
            $scope.tokenLs = [];
            $scope.pathLs = [[],[]];
            $scope.tid = [0, 0];
            $scope.tidIdx = 0;
            $scope.rot = 0;
            $scope.putToken = true;
            $scope.currTile = null;
        }
        else{
            for(var r = 0; r < $scope.board.length; r++){
                for(var c = 0; c < $scope.board[0].length; c++){
                    if($scope.board[r][c][0] !== -1){
                        var tid = $scope.board[r][c][0];
                        var rot = $scope.board[r][c][1];
                        hexagon.drawPathTile($scope.tileLs[r][c], tid, rot);
                    }
                }
            }
        }
        console.log($scope.board[0][0]);
        $scope.drawTile();
        var p;
        //draw path
        if(params.stateBeforeMove !== undefined && params.stateBeforeMove !== null){
            var prevToken = params.stateBeforeMove.token;

            for(p = 0; p < 2; p++){
                if(prevToken !== undefined && prevToken[p][0] !== -1){
                    var path = [];
                    path = gameLogic.getTokenPath($scope.board, prevToken, p, path);
                    //console.log("path len: " + path.length);
                    $scope.pathLs[p] = [];
                    for(var pi = 0; pi < path.length; pi++){
                        var piece = path[pi];
                        $scope.pathLs[p].push(hexagon.drawPath(piece.row, piece.col, piece.s0, piece.s1));
                    }
                }
            }
        }


        console.log("endMatchScores:" + $scope.endMatchScores);
        //draw token
        for(p = 0; p < 2; p++){
            if($scope.token[p][0] !== -1){
                var row    = $scope.token[p][0];
                var column = $scope.token[p][1];
                var s      = $scope.token[p][2];
                if($scope.endMatchScores !== undefined && $scope.endMatchScores !== null && $scope.endMatchScores[p] === 0){
                    // draw dead token here
                    $scope.tokenLs[p] = hexagon.genToken(row, column, s);
                }
                else{
                    $scope.tokenLs[p] = hexagon.genToken(row, column, s);
                }
            }
        }

        if($scope.turnIndex >= 0 && $scope.token[$scope.turnIndex][0] !== -1){
            $scope.putToken = false;
        }

        //Is it the computer's turn?
        if ($scope.isYourTurn && params.playersInfo[params.yourPlayerIndex].playerId === '') {
            $scope.isYourTurn = false;
            // Wait 500 milliseconds until animation ends.
            $timeout(sendComputerMove, 500);
        }
    }

    $scope.tid = [0, 0];
    $scope.tidIdx = 0;
    $scope.rot = 0;
    $scope.putToken = true;
    
    //var color = ["#FF0000", "#00FF00"];
    var svg = document.getElementById("svg");
    
    $scope.getFontSize = function () {   
        return svg.clientWidth / 15;
    };

    hexagon.init(40, 15, 60);
    $scope.tileLs = hexagon.genTileLs(gameLogic.getInitialBoard().board);
    $scope.tokenLs = [];
    $scope.pathLs = [[],[]];

    gameService.setGame({
      gameDeveloperEmail: "angieyayabird@gmail.com",
      minNumberOfPlayers: 2,
      maxNumberOfPlayers: 2,
      exampleGame: gameLogic.getExampleGame(),
      isMoveOk: gameLogic.isMoveOk,
      updateUI: updateUI
    });
}]);
;angular.module('myApp').factory('hexagon',
  ["gameLogic", function (gameLogic) {
  'use strict';
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
  var sideNum = 6;
  var sidePt;

  function init(x, y, r){
  	OriginX = x;
  	OriginY = y;
    radius = r;
    height = Math.sqrt(3) * radius;
    width = 2 * radius;
    side = 3 / 2 * radius;
    sideNum = 6;

		center = [width/2, height/2];
    vertex = [];
		vertex[0] = [0, height / 2];                //0
		vertex[1] = [width - side, 0];                //1
		vertex[2] = [side, 0];                        //2
		vertex[3] = [width, height / 2];            //3
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
			if(i > 0) {
				str = str + " ";
      }
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
		for(var r = 0; r < board.length; r++){
			tileLs.push([]);
			for(var c = 0; c < board[0].length; c++){
				var tile = genTile(r, c);
				for(var s = 0; s < sideNum; s++){
					if(gameLogic.isEdge(r, c, s)){
						var pointLs = [vertex[s], vertex[(s+1)%sideNum], center];
						var edge = { points: pointLsToStr(pointLs), s: s };
						tile.edgeLs.push(edge);
					}
				}
				tileLs[r].push(tile);
			}
		}
		return tileLs;
	}
	
  function drawPathTile(t, tid, rot) {
    //console.log("drawPathTile");
    for(var i = 0; i < sideNum; i++){
      var ss = i;
      var se = tile[tid][i];
      ss = (ss + sideNum - rot) % sideNum;
      se = (se + sideNum - rot) % sideNum;
  	  t.pathLs.push(drawPath(t.r, t.c, ss, se));
    }
    return t;
  }
  
  function pathToStr(path){
    return "M"+sidePt[path.ss][0]+","+sidePt[path.ss][1]+" A"+path.r+","+path.r+" 0 0,1 "+sidePt[path.se][0]+","+sidePt[path.se][1];
  }
  
  function drawPath(r, c, s0, s1){

    var diff = Math.abs(s1 - s0);
    var vs, ve, ss, se, path;
    if(diff === 1 || diff === 5){
        // Draw an arc with half radius
        if((s0 + 1)%sideNum === s1){
            vs = s1;
            ve = s0;
        } else {
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
        path = {
        		ss: vs,
        		se: ve,
        		ctr: vertex[vs],
        		r: radius/2,
        		arc: [1/3*Math.PI*ve, 2/3*Math.PI + 1/3*Math.PI*ve]
        };
        path.str = pathToStr(path);
    } else if (diff === 2 || diff === 4) {
        // Draw an arc with 2/3 radius
        if((s0 + 2)%sideNum === s1){
            vs = s0;
            ve = (vs+1)%sideNum;
            ss = s1;
            se = s0;
        } else {
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
        path = {
        		ss: ss,
        		se: se,
        		ctr: [cx,cy],
        		r: radius*3/2,
        		arc: [1/3*Math.PI*ve, 1/3*Math.PI*ve + 1/3*Math.PI]
        };
        path.str = pathToStr(path);
    } else if(diff === 3) {
        //Draw a line
        //context.moveTo(sidePt[s0][0], sidePt[s0][1]); 
        //context.lineTo(sidePt[s1][0], sidePt[s1][1]); 
        //context.stroke();
    	  if(s0 < s1){
    	  	ss = s0;
    	  	se = s1;
    	  } else {
    	  	ss = s1;
    	  	se = s0;
    	  }
        path = {
        		ss: ss,
        		se: se,
        };
        path.str = "M" + sidePt[path.ss][0]+","+sidePt[path.ss][1]+" L"+sidePt[path.se][0]+","+sidePt[path.se][1];
    }
    path.r = r;
    path.c = c;
  	path.tx = OriginX + c*side;
  	path.ty = OriginY + c*height/2 + height*r;
   return path;
  }
  
  function genToken(r, c, s){
  	var token = {
  			r: r,
  			c: c,
  			s: s,
  			tx: OriginX + c*side,
  			ty: OriginY + c*height/2 + height*r,
  			pt: sidePt[s],
  	};
  	return token;
  }

	
  return {
    init : init,
    genTile : genTile,
    genTileLs : genTileLs,
    drawPathTile : drawPathTile,
    genToken : genToken,
    drawPath : drawPath,
    sideNum : sideNum
  };

}]);

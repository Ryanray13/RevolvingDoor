'use strict';

angular.module('myApp.gameLogic', []).service('gameLogic', function(){

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
    var boardSize = 5;
    var playerNum = 2;
    var tileNum = 5;
    function isEqual(object1, object2) {
        //console.log(JSON.stringify(object1));
        //console.log(JSON.stringify(object2));
        return JSON.stringify(object1) === JSON.stringify(object2);
    }

    function copyObject(object) {
        return JSON.parse(JSON.stringify(object));
    }

    // check if token's location is at the edge of board
    function isEdge(row, col, edg){

        try{
            if(row < 0 || row >= boardSize || col < 0 || col >= boardSize){
                return false;
            }
            if(row+dir[edg][0]==-1 || row+dir[edg][0]==boardSize){
                return true;
            }
            if(col+dir[edg][1]==-1 || col+dir[edg][1]==boardSize){
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
        if(id != -1){
            console.log("update token: " + tokenId);
            console.log(token[tokenId]);
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
    function getInitialBoard(){
        var board = new Array(boardSize);
        for(var i = 0; i < boardSize; i++){
            board[i] = new Array(boardSize);
            for(var j = 0; j < boardSize; j++){
                board[i][j] = [-1,-1];
            }
        }

        var token = new Array(playerNum);
        for(var i = 0; i < playerNum; i++){
            token[i] = new Array(3);
            for(var j = 0; j < 3; j++){
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
            var dead0 = isEdge(token[0][0], token[0][1], token[0][2]) && board[token[0][0]][token[0][1]][0]!=-1;
            var dead1 = isEdge(token[1][0], token[1][1], token[1][2]) && board[token[1][0]][token[1][1]][0]!=-1;
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
                if(board[row][col][0] != -1){
                    return false;
                }
                //Phase10
                if(token[turnIndexBeforeMove][0] != row || token[turnIndexBeforeMove][1] != col){
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
    this.isMoveOk = isMoveOk;
    this.getExampleGame = getExampleGame;
    this.createMove = createMove;
    this.getInitialBoard= getInitialBoard;
    this.boardSize = boardSize;
    this.tileNum = tileNum;
    this.isEdge = isEdge;
});

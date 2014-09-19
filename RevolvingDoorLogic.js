var isMoveOk = (function(){
    'use strict';

    var dir = [[0,-1], [-1,0], [-1,1], [0,1], [1,0], [1,-1]];

    // five unique tiles' path map 
    // tile[i][j] = k means ith tile's jth edge connects with kth edge
    var tile = [[1,0,3,2,5,4],
                [1,0,4,5,2,3],
                [1,0,5,4,3,2],
                [2,4,0,5,1,3],
                [3,4,5,0,1,2]];

    var opposite = [3,4,5,0,1,2]; 
    var edgeNum = 6;
    var boardSize = 3;
    var playerNum = 2;
    function isEqual(object1, object2) {
        console.log(JSON.stringify(object1));
        console.log(JSON.stringify(object2));
        return JSON.stringify(object1) === JSON.stringify(object2);
    }

    function copyObject(object) {
        return JSON.parse(JSON.stringify(object));
    }

    function isEdge(row, col, edg){
        if(row+dir[edg][0]<0 || row+dir[edg][0]>=boardSize){
            return true;
        }
        if(col+dir[edg][1]<0 || col+dir[edg][1]>=boardSize){
            return true;
        }
    }
    function updateToken(board, token, tokenId){
        var row = token[tokenId][0];
        var col = token[tokenId][1];
        var edg = token[tokenId][2];
        var id = board[row][col][0];
        var rot = board[row][col][1];
        if(id != -1){
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

    function createMove(board, token, row, col, id, rot, turnIndexBeforeMove){
        console.log("create move");
        var firstOperation = {setTurn: {turnIndex: 1 - turnIndexBeforeMove}};
        if(token[turnIndexBeforeMove][0] === -1){
            // put token;
            token[turnIndexBeforeMove][0] = row;
            token[turnIndexBeforeMove][1] = col;
            token[turnIndexBeforeMove][2] = rot; //when putting token, rot is dir;
        }
        else{
            // put tile;
            board[row][col][0] = id;
            board[row][col][1] = rot;
            // update the location of token
            token = updateToken(board, token, 0);
            token = updateToken(board, token, 1);

            var dead0 = isEdge(token[0][0], token[0][1], token[0][2]) && board[token[0][0]][token[0][1]][0]!=-1;
            var dead1 = isEdge(token[1][0], token[1][1], token[1][2]) && board[token[1][0]][token[1][1]][0]!=-1;
            if(dead0 === true || dead1 === true){
                firstOperation = {endMatch: {endMatchScores: [1-dead0, 1-dead1]}};
            }
        }
        return [firstOperation,
               {set: {key: 'board', value: board}},
               {set: {key: 'token', value: token}},
               {set: {key: 'delta', value: {row: row, col: col, id: id, rot: rot}}}];
    }


    function isMoveOk(params){
        var move = params.move;
        var turnIndexBeforeMove = params.turnIndexBeforeMove;
        var stateBeforeMove = params.stateBeforeMove;
        try{
            // Example move:
            // [{setturn: {turnindex : 1},
            //  {set: {key: 'board', value: [[[4,0], [1,1], [-1,-1]],[[-1,-1],[0,1],[-1,-1]],[[-1,-1],[1,1],[0,0]]}},
            //  {set: {key: 'token', value: [[0,1,4], [2,2,1]]}},
            //  {set: {key: 'delta', value: {row: 1, col: 1, id: 0, rot: 1, token: [1,1,2]}}}]
            var deltaValue = move[3].set.value;
            var row = deltaValue.row;
            var col = deltaValue.col;
            var id = deltaValue.id;
            var rot = deltaValue.rot;
            var board = stateBeforeMove.board;
            var token = stateBeforeMove.token;
            if(board === undefined){
                var board = new Array(boardSize);
                for(var i = 0; i < boardSize; i++){
                    board[i] = new Array(boardSize);
                    for(var j = 0; j < boardSize; j++){
                        board[i][j] = [-1,-1];
                    }
                }
            }
            if(token === undefined){
                var token = new Array(playerNum);
                for(var i = 0; i < playerNum; i++){
                    token[i] = new Array(3);
                    for(var j = 0; j < 3; j++){
                        token[i][j] = -1;
                    }
                }
            }
            if(token[turnIndexBeforeMove][0] === -1){
                if(isEdge(row, col, rot) === false){
                    return false;
                }
            }
            else{
                if(board[row][col][0] != -1){
                    return false;
                }
                if(token[turnIndexBeforeMove][0] != row || token[turnIndexBeforeMove][1] != col){
                    return false;
                }
            }
            var expectMove = createMove(board, token, row, col, id, rot, turnIndexBeforeMove);
            console.log("move");
            console.log(move);
            console.log("expectMove");
            console.log(expectMove);
            if (!isEqual(move, expectMove)) {
                return false;
            }
        }
        catch(e){
            return false;
        }
        return true;
    }
    console.log(
        // put first player's token at row: 0 col: 0 edg:0
        [isMoveOk({turnIndexBeforeMove: 0, stateBeforeMove: {}, 
        move: [{setTurn: {turnIndex : 1}},
        {set: {key: 'board', value: [[[-1, -1],[-1, -1],[-1, -1]], [[-1, -1],[-1, -1],[-1, -1]], [[-1, -1],[-1, -1],[-1, -1]]]}},
        {set: {key: 'token', value: [[0,0,0], [-1,-1, -1]]}},
        {set: {key: 'delta', value: {row: 0, col: 0, id: 0, rot: 0}}}]})

        ,

        // put second player's token at row: 2 col: 1 edg:5
        isMoveOk({turnIndexBeforeMove: 1, stateBeforeMove: {board: [[[-1, -1],[-1, -1],[-1, -1]], [[-1, -1],[-1, -1],[-1, -1]], [[-1, -1],[-1, -1],[-1, -1]]], token: [[0,0,0], [-1,-1, -1]], delta: {row: 0, col: 0, id: 0, rot: 0}}, 
        move: [{setTurn: {turnIndex : 0}},
        {set: {key: 'board', value: [[[-1, -1],[-1, -1],[-1, -1]], [[-1, -1],[-1, -1],[-1, -1]], [[-1, -1],[-1, -1],[-1, -1]]]}},
        {set: {key: 'token', value: [[0,0,0], [2,1,5]]}},
        {set: {key: 'delta', value: {row: 2, col: 1, id: 0, rot: 5}}}]})

        ,
        // first player puts tile id:4 rot:0 at row: 0 col: 0  -->  first player's token move to col:0 row:1 edg:0
        isMoveOk({turnIndexBeforeMove: 0, stateBeforeMove: {board: [[[-1, -1],[-1, -1],[-1, -1]], [[-1, -1],[-1, -1],[-1, -1]], [[-1, -1],[-1, -1],[-1, -1]]], token: [[0,0,0], [2,1, 5]], delta: {row: 2, col: 1, id: 0, rot: 5}}, 
        move: [{setTurn: {turnIndex : 1}},
        {set: {key: 'board', value: [[[4, 0],[-1, -1],[-1, -1]], [[-1, -1],[-1, -1],[-1, -1]], [[-1, -1],[-1, -1],[-1, -1]]]}},
        {set: {key: 'token', value: [[0,1,0], [2,1,5]]}},
        {set: {key: 'delta', value: {row: 0, col: 0, id: 4, rot: 0}}}]})

        ,
        // second player puts tile id:1 rot:5 at row: 2 col: 1 -->  second player's token move to col:2 row:2 edg:0
        isMoveOk({turnIndexBeforeMove: 1, stateBeforeMove: {board: [[[4, 0],[-1, -1],[-1, -1]], [[-1, -1],[-1, -1],[-1, -1]], [[-1, -1],[-1, -1],[-1, -1]]], token: [[0,1,0], [2,1, 5]], delta: {row: 0, col: 0, id: 4, rot: 0}}, 
        move: [{setTurn: {turnIndex : 0}},
        {set: {key: 'board', value: [[[4, 0],[-1, -1],[-1, -1]], [[-1, -1],[-1, -1],[-1, -1]], [[-1, -1],[1, 5],[-1, -1]]]}},
        {set: {key: 'token', value: [[0,1,0], [2,2,0]]}},
        {set: {key: 'delta', value: {row: 2, col: 1, id: 1, rot: 5}}}]})
        ]

            )
    return isMoveOk;
})();

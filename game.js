angular.module('myApp')
  .controller('Ctrl', ['$scope', '$log', '$timeout',
    'gameService', 'stateService', 'gameLogic', 'hexagon', 
    'resizeGameAreaService', 
    function ($scope, $log, $timeout,
      gameService, stateService, gameLogic, hexagon, 
      resizeGameAreaService) {

    'use strict';

    resizeGameAreaService.setWidthToHeight(0.833);
	
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
            $scope.board = init.board;
            $scope.token = init.token;
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
                if($scope.endMatchScores !== undefined && $scope.endMatchScores[p] === 0){
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

	  hexagon.init(20, 20, 60);
	  $scope.tileLs = hexagon.genTileLs(gameLogic.getInitialBoard().board);
	  $scope.tokenLs = [];
	  $scope.pathLs = [[],[]];

    updateUI({stateAfterMove: {}, turnIndexAfterMove: 0, yourPlayerIndex: -2});

    gameService.setGame({
      gameDeveloperEmail: "angieyayabird@gmail.com",
      minNumberOfPlayers: 2,
      maxNumberOfPlayers: 2,
      exampleGame: gameLogic.getExampleGame(),
      isMoveOk: gameLogic.isMoveOk,
      updateUI: updateUI
    });
}]);

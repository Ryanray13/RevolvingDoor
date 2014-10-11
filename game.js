'use strict';

// TODO: remove stateService before launching the game.
var app = angular.module('myApp', ['myApp.messageService', 'myApp.gameLogic', 'platformApp', 'myApp.hexagon', 'myApp.scaleBodyService']);
  app.controller('Ctrl', function (
      $window, $scope, $log,
      messageService, stateService, gameLogic, hexagon, scaleBodyService) {

      var canvas = document.getElementById("canvas");
      hexagon.init("canvas", 50);
      hexagon.drawHexGrid(8, 6, 50, 50, gameLogic.boardSize, false);
      //hexagon.drawPathTile(0, 0, 4, 0);
      $scope.tid = 0;
      $scope.rot = 0;

      /*
      var prevTileSide = undefined;
      $scope.mouseMove= function mouseMove($event) {
          if(!$scope.isYourTurn){
              return;
          }
          try{
              if($scope.token !== undefined && $scope.token[$scope.turnIndex][0] == -1){
                  var tileSide = hexagon.getSelectedTileSide($event.pageX, $event.pageY);
                  if(prevTileSide !== undefined){
                      hexagon.drawHexAtColRow(prevTileSide.column, prevTileSide.row, "#000");
                      prevTileSide = undefined;
                  }
                  if(gameLogic.isEdge(tileSide.row, tileSide.column, tileSide.side)){
                      //console.log("tileSide: " + tileSide.row + " " + tileSide.column);
                      hexagon.drawSelectedTileSide(tileSide.column, tileSide.row, tileSide.side);
                      prevTileSide = tileSide;
                  }
              }
          } catch(e){
              $log.info(["Cell is already full in position:", row, col]);
              return;
          }
      };
      */

      $scope.mouseDown= function mouseDown($event) {
          if(!$scope.isYourTurn){
              return;
          }
          try{
              if($scope.token !== undefined && $scope.token[$scope.turnIndex][0] == -1){

                  var tileSide = hexagon.getSelectedTileSide($event.pageX, $event.pageY);
                  console.log(tileSide);
                  if(gameLogic.isEdge(tileSide.row, tileSide.column, tileSide.side)){
                     var move = gameLogic.createMove($scope.board, $scope.token, tileSide.row, tileSide.column, 0, tileSide.side, $scope.turnIndex);
                     sendMakeMove(move);
                  }
              }
              else{
                  /*
                  // offset coordinate
                  var cord = hexagon.getSelectedTile($event.pageX, $event.pageY);
                  console.log(cord);
                  if((cord.row == 7 && cord.column == 0) || (cord.row == 0 && cord.column == 5)){
                      $scope.turnTile();
                  }
                  else if((cord.row == 7 && cord.column == 1) || (cord.row == 0 && cord.column == 4)){
                      $scope.selTile();
                  }
                  else if((cord.row == 6 && cord.column == 1) || (cord.row == 1 && cord.column == 4)){
                      $scope.makeMove();
                  }
                  */
              }
          } catch(e){
              $log.info(["Cell is already full in position:", row, col]);
              return;
          }
      };

    $scope.selTile = function selTile() {
        console.log("selTile");
        if(!$scope.isYourTurn){
            console.log("not your turn");
            return;
        }
        try{
            if($scope.token !== undefined && $scope.token[$scope.turnIndex][0] !== -1){
                $scope.tid = ($scope.tid+1)%gameLogic.tileNum;
                $scope.rot = 0;
                var row = $scope.token[$scope.turnIndex][0];
                var column = $scope.token[$scope.turnIndex][1];
                var s = $scope.token[$scope.turnIndex][2];
                hexagon.drawPathTileAtColRow(column, row, $scope.tid, $scope.rot);
                hexagon.drawSelectedTileSide(column, row, s);
            }
        } catch(e){
            $log.info(["Cell is already full in position:", row, col]);
            return;
        }
    };

    $scope.turnTile = function turnTile() {
        if(!$scope.isYourTurn){
            return;
        }
        try{
            if($scope.token !== undefined && $scope.token[$scope.turnIndex][0] !== -1){
                $scope.rot = ($scope.rot + 1)%hexagon.sideNum;
                var row = $scope.token[$scope.turnIndex][0];
                var column = $scope.token[$scope.turnIndex][1];
                var s = $scope.token[$scope.turnIndex][2];
                hexagon.drawPathTileAtColRow(column, row, $scope.tid, $scope.rot);
                hexagon.drawSelectedTileSide(column, row, s);
            }
        } catch(e){
            $log.info(["Cell is already full in position:", row, col]);
            return;
        }
    };

    function updateUI(params) {
        $scope.isYourTurn = params.turnIndexAfterMove >= 0 && // game is ongoing
                            params.yourPlayerIndex === params.turnIndexAfterMove; // it's my turn
        $scope.turnIndex = params.turnIndexAfterMove;
        console.log("updateUI " + $scope.turnIndex);

        $scope.jsonState = angular.toJson(params.stateAfterMove, true);
        $scope.board = params.stateAfterMove.board;
        $scope.token = params.stateAfterMove.token;

        if($scope.board === undefined){
            var init = gameLogic.getInitialBoard();
            $scope.board = init.board;
            $scope.token = init.token;
        }

        var rn = $scope.board.length;
        var cn = $scope.board[0].length;
        for(var r = 0; r < rn; r++){
            for(var c = 0; c < cn; c++){
                if($scope.board[r][c][0] !== -1){
                    var tid = $scope.board[r][c][0];
                    var rot = $scope.board[r][c][1];
                    console.log("drawing");
                    hexagon.drawPathTileAtColRow(c, r, tid, rot);
                }
            }
        }

        for(var p = 0; p < 2; p++){
          if($scope.token[p][0] != -1){
              var row    = $scope.token[p][0];
              var column = $scope.token[p][1];
              var s      = $scope.token[p][2];
              //hexagon.drawPathTileSide(column, row, s);
              hexagon.drawSelectedTileSide(column, row, s);
          }
        }
    }
    updateUI({stateAfterMove: {}, turnIndexAfterMove: 0, yourPlayerIndex: -2});

    var game = {
      gameDeveloperEmail: "angieyayabird@gmail.com",
      minNumberOfPlayers: 2,
      maxNumberOfPlayers: 2,
      exampleGame: gameLogic.getExampleGame(),
    };

    //scaleBodyService.scaleBody({width: 1000, height: 1000});
    var isLocalTesting = $window.parent === $window;

    $scope.move = "[{setTurn: {turnIndex : 1}}, {set: {key: 'board', value: [[[-1, -1],[-1, -1],[-1, -1]], [[-1, -1],[-1, -1],[-1, -1]], [[-1, -1],[-1, -1],[-1, -1]]]}}, {set: {key: 'token',     value: [[2,1,5], [-1,-1, -1]]}}, {set: {key: 'delta', value: {row: 2, col: 1, id: 0, rot: 5}}}]";

    $scope.makeMove = function () {
      var row = $scope.token[$scope.turnIndex][0];
      var column = $scope.token[$scope.turnIndex][1];
      var moveObj = gameLogic.createMove($scope.board, $scope.token, row, column, $scope.tid, $scope.rot, $scope.turnIndex);
      $log.info(["Making move:", moveObj]);
      sendMakeMove(moveObj);
    };

    function sendMakeMove(move){
        $log.info(["Making move:", move]);
        if (isLocalTesting) {
            stateService.makeMove(move);
        } else {
            messageService.sendMessage({makeMove: move});
        }
    };

    if (isLocalTesting) {
      game.isMoveOk = gameLogic.isMoveOk;
      game.updateUI = updateUI;
      stateService.setGame(game);
    } else {
      messageService.addMessageListener(function (message) {
        if (message.isMoveOk !== undefined) {
          var isMoveOkResult = gameLogic.isMoveOk(message.isMoveOk);
          messageService.sendMessage({isMoveOkResult: isMoveOkResult});
        } else if (message.updateUI !== undefined) {
          updateUI(message.updateUI);
        }
      });

      messageService.sendMessage({gameReady : game});
    }
  });

'use strict';

// TODO: remove stateService before launching the game.
var app = angular.module('myApp', ['myApp.messageService', 'myApp.gameLogic', 'platformApp', 'myApp.hexagon']);
  app.controller('Ctrl', function (
      $window, $scope, $log,
      messageService, stateService, gameLogic, hexagon) {

      var canvas = document.getElementById("canvas");
      hexagon.init("canvas", 50);
      hexagon.drawHexGrid(7, 7, 50, 50, true);
      //hexagon.drawPathTile(0, 0, 4, 0);

      $scope.putToken = function putToken($event) {
          if(!$scope.isYourTurn){
              return;
          }
          try{
              if($scope.token !== undefined && $scope.token[$scope.turnIndex][0] == -1){
                  //var cord = hexagon.getSelectedTile($event.pageX, $event.pageY);
                  //cord = hexagon.offsetToAxial(cord.row, cord.column);
                  //console.log(cord);

                  var tileSide = hexagon.getSelectedTileSide($event.pageX, $event.pageY);
                  console.log(tileSide);

                  var move = gameLogic.createMove($scope.board, $scope.token, tileSide.row, tileSide.column, 0, tileSide.side, $scope.turnIndex);
                  console.log(move);
                  sendMakeMove(move);
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
                    var cord = hexagon.axialToOffset(r, c);
                    var tid = $scope.board[r][c][0];
                    var rot = $scope.board[r][c][1];
                    console.log("drawing");
                    console.log(cord);
                    hexagon.drawPathTileAtColRow(cord.column, cord.row, tid, rot);
                }
            }
        }

        for(var p = 0; p < 2; p++){
          if($scope.token[p][0] != -1){
              var r = $scope.token[p][0];
              var c = $scope.token[p][1];
              var e = $scope.token[p][2];
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

    var isLocalTesting = $window.location.origin === "file://";

    $scope.move = "[{setTurn: {turnIndex : 1}}, {set: {key: 'board', value: [[[-1, -1],[-1, -1],[-1, -1]], [[-1, -1],[-1, -1],[-1, -1]], [[-1, -1],[-1, -1],[-1, -1]]]}}, {set: {key: 'token',     value: [[2,1,5], [-1,-1, -1]]}}, {set: {key: 'delta', value: {row: 2, col: 1, id: 0, rot: 5}}}]";

    $scope.makeMove = function () {
      $log.info(["Making move:", $scope.move]);
      var moveObj = eval($scope.move);
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

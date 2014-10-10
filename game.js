'use strict';

// TODO: remove stateService before launching the game.
var app = angular.module('myApp', ['myApp.messageService', 'myApp.gameLogic', 'platformApp', 'myApp.hexagon']);
  app.controller('Ctrl', function (
      $window, $scope, $log,
      messageService, stateService, gameLogic, hexagon) {

      var canvas = document.getElementById("canvas");
      var ctx = canvas.getContext("2d");
      hexagon.init("canvas", 50);
      hexagon.drawHexGrid(7, 10, 50, 50, true);

      $scope.onMouseDown = function onMouseDown($event) {
          var cord = hexagon.getSelectedTile($event.pageX, $event.pageY);
          cord = hexagon.offsetToAxial(cord.row, cord.column);
          console.log(cord);
      };

    function updateUI(params) {
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
                    var cord = hexagon.offsetToAxial(r, c);
                    var tid = $scope.board[r][c][0];
                    var rot = $scope.board[r][c][1];
                    hexagon.drawPathTile(cord.row, cord.col, tid, rot);
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
    updateUI({stateAfterMove: {}});
    var game = {
      gameDeveloperEmail: "angieyayabird@gmail.com",
      minNumberOfPlayers: 2,
      maxNumberOfPlayers: 2,
      exampleGame: gameLogic.getExampleGame(),
    };

    var isLocalTesting = $window.location.origin === "file://";
    $scope.move = "[{setTurn: {turnIndex : 1}}, {set: {key: 'board', value: [[[-1, -1],[-1, -1],[-1, -1]], [[-1, -1],[-1, -1],[-1, -1]], [[-1, -1],[-1, -1],[-1, -1]]]}}, {set: {key: 'token',     value: [[2,1,5], [-1,-1, -1]]}}, {set: {key: 'delta', value: {row: 2, col: 1, id: 0, rot: 5}}}]"
      $scope.makeMove = function () {
      $log.info(["Making move:", $scope.move]);
      var moveObj = eval($scope.move);
      if (isLocalTesting) {
        stateService.makeMove(moveObj);
      } else {
        messageService.sendMessage({makeMove: moveObj});
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

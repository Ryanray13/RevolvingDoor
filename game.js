'use strict';

// TODO: remove stateService before launching the game.
angular.module('myApp',
    ['myApp.messageService', 'myApp.gameLogic', 'platformApp'])
  .controller('Ctrl', function (
      $window, $scope, $log,
      messageService, stateService, gameLogic) {

    function updateUI(params) {
      $scope.jsonState = angular.toJson(params.stateAfterMove, true);
      var board = params.stateAfterMove.board;
      var token = params.stateAfterMove.token;
      $scope.board = [['', '', ''],
                      ['', '', ''],
                      ['', '', '']];
      if(board !== undefined){
        Board = board;
        var rn = board.length;
        var cn = board[0].length;
        for(var r = 0; r < rn; r++){
            for(var c = 0; c < cn; c++){
                if(board[r][c][0] === -1){
                    $scope.board[r][c] = '';
                }
                else{
                    $scope.board[r][c] = board[r][c][0]+' '+board[r][c][1];
                }
            }
        }
      }
      if(token !== undefined){
          Token = token;
          for(var p = 0; p < 2; p++){
            if(token[p][0] != -1){
                var r = token[p][0];
                var c = token[p][1];
                var e = token[p][2];
                $scope.board[r][c] = 'token:' + p + ' edge:' + e +' ' + $scope.board[r][c];
            }
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

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
describe("In RevolvingLogic ", function() {
  var RevolvingLogic;

  beforeEach(module("myApp.gameLogic"));

  beforeEach(inject(function (gameLogic) {
    RevolvingLogic = gameLogic;
  }));

  function expectMoveOk(turnIndexBeforeMove, stateBeforeMove, move) {
    expect(RevolvingLogic.isMoveOk({turnIndexBeforeMove: turnIndexBeforeMove,
      stateBeforeMove: stateBeforeMove,
      move: move})).toBe(true);
  }

  function expectIllegalMove(turnIndexBeforeMove, stateBeforeMove, move) {
    expect(RevolvingLogic.isMoveOk({turnIndexBeforeMove: turnIndexBeforeMove,
      stateBeforeMove: stateBeforeMove,
      move: move})).toBe(false);
  }

  // Phase0: placing token legally 
  it("Phase00: placing token0 at row: 0 col: 0 edg:0 from initial state is legal", function() {
    expectMoveOk(0, {},
        [{setTurn: {turnIndex : 1}},
        {set: {key: 'board', value: [[[-1, -1],[-1, -1],[-1, -1]], 
                                     [[-1, -1],[-1, -1],[-1, -1]], 
                                     [[-1, -1],[-1, -1],[-1, -1]]]}},
        {set: {key: 'token', value: [[0,0,0], [-1,-1, -1]]}},
        {set: {key: 'delta', value: {row: 0, col: 0, id: 0, rot: 0}}}]
      );
  });

  it("Phase00: placing token 1 in row: 2 col: 1 edg:5 from initial state is legal", function() {
    expectMoveOk(1, {board: [[[-1, -1],[-1, -1],[-1, -1]], 
                             [[-1, -1],[-1, -1],[-1, -1]], 
                             [[-1, -1],[-1, -1],[-1, -1]]],
                     token: [[0,0,0], [-1,-1, -1]], 
                     delta: {row: 0, col: 0, id: 0, rot: 0}},
        [{setTurn: {turnIndex : 0}},
        {set: {key: 'board', value: [[[-1, -1],[-1, -1],[-1, -1]], 
                                     [[-1, -1],[-1, -1],[-1, -1]], 
                                     [[-1, -1],[-1, -1],[-1, -1]]]}},
        {set: {key: 'token', value: [[0,0,0], [2, 1, 5]]}},
        {set: {key: 'delta', value: {row: 2, col: 1, id: 0, rot: 5}}}]
      );
  });

  // Phase0: placing token illegally 
  it("Phase00: placing token 0 at a non-edge location row: 1 col: 1 edg:0 is illegal", function() {
    expectIllegalMove(0, {},
        [{setTurn: {turnIndex : 1}},
        {set: {key: 'board', value: [[[-1, -1],[-1, -1],[-1, -1]], 
                                     [[-1, -1],[-1, -1],[-1, -1]], 
                                     [[-1, -1],[-1, -1],[-1, -1]]]}},
        {set: {key: 'token', value: [[1,1,0], [-1,-1, -1]]}},
        {set: {key: 'delta', value: {row: 1, col: 1, id: 0, rot: 0}}}]
      );
  });

  it("Phase01: placing token 1 colides with token 0 at row: 0 col: 0 edg:0", function() {
    expectIllegalMove(1, 
                    {board: [[[-1, -1],[-1, -1],[-1, -1]], 
                             [[-1, -1],[-1, -1],[-1, -1]], 
                             [[-1, -1],[-1, -1],[-1, -1]]],
                     token: [[0,0,0], [-1,-1, -1]], 
                     delta: {row: 0, col: 0, id: 0, rot: 0}},
        [{setTurn: {turnIndex : 0}},
        {set: {key: 'board', value: [[[-1, -1],[-1, -1],[-1, -1]], 
                                     [[-1, -1],[-1, -1],[-1, -1]], 
                                     [[-1, -1],[-1, -1],[-1, -1]]]}},
        {set: {key: 'token', value: [[0,0,0], [0,0, 0]]}},
        {set: {key: 'delta', value: {row: 0, col: 0, id: 0, rot: 0}}}]
      );
  });


  // Phase1: place tile legally
  it("Phase10 Phase11: player 0 places tile id:4 rot:0 at row: 0 col: 0 --> token 0 move to col:0 row:1 edg:0", 
     function(){
         expectMoveOk(0, 
             {board: [[[-1, -1],[-1, -1],[-1, -1]], 
                     [[-1, -1],[-1, -1],[-1, -1]], 
                     [[-1, -1],[-1, -1],[-1, -1]]],
              token: [[0,0,0], [2, 1, 5]],
              delta: {row: 2, col: 1, id: 0, rot: 5}
             },
             [{setTurn: {turnIndex : 1}},
             {set: {key: 'board', value: [[[4, 0],[-1, -1],[-1, -1]], 
                                          [[-1, -1],[-1, -1],[-1, -1]], 
                                          [[-1, -1],[-1, -1],[-1, -1]]]}},
             {set: {key: 'token', value: [[0,1,0], [2, 1, 5]]}},
             {set: {key: 'delta', value: {row: 0, col: 0, id: 4, rot: 0}}}]
         );
     }
  );
  it("Phase10 Phase11: player 1 places tile id:1 rot:5 at row: 2 col: 1 --> token 1 move to col:2 row:2 edg:0", 
     function(){
         expectMoveOk(1, 
             {board: [[[4, 0],[-1, -1],[-1, -1]], 
                     [[-1, -1],[-1, -1],[-1, -1]], 
                     [[-1, -1],[-1, -1],[-1, -1]]],
              token: [[0,1,0], [2, 1, 5]],
              delta: {row: 0, col: 0, id: 4, rot: 0}
             },
             [{setTurn: {turnIndex : 0}},
             {set: {key: 'board', value: [[[4, 0],[-1, -1],[-1, -1]], 
                                          [[-1, -1],[-1, -1],[-1, -1]], 
                                          [[-1, -1],[1, 5],[-1, -1]]]}},
             {set: {key: 'token', value: [[0,1,0], [2, 2, 0]]}},
             {set: {key: 'delta', value: {row: 2, col: 1, id: 1, rot: 5}}}]
         );
     }
  );

  // Phase1: place tile illegally
  it("Phase1: player 0 places tile id:3 rot:3 at row: 2 col: 1 is illegal because row: 2 col: 1 already has a tile", 
     function(){
         expectIllegalMove(0, 
             {board: [[[4, 0],[-1, -1],[-1, -1]], 
                     [[-1, -1],[-1, -1],[-1, -1]], 
                     [[-1, -1],[1, 5],[-1, -1]]],
              token: [[0,1,0], [2, 2, 0]],
              delta: {row: 2, col: 1, id: 1, rot: 5}
             },
             [{setTurn: {turnIndex : 1}},
             {set: {key: 'board', value: [[[4, 0],[-1, -1],[-1, -1]], 
                                          [[-1, -1],[-1, -1],[-1, -1]], 
                                          [[-1, -1],[3, 3],[-1, -1]]]}},
             {set: {key: 'token', value: [[0,1,0], [2, 2, 0]]}},
             {set: {key: 'delta', value: {row: 2, col: 1, id: 3, rot: 3}}}]
         );
     }
  );

  it("Phase10: player 0 places tile id:3 rot:3 at row: 1 col: 0 which is not the location of token 0", 
     function(){
         expectIllegalMove(0, 
             {board: [[[4, 0],[-1, -1],[-1, -1]], 
                     [[-1, -1],[-1, -1],[-1, -1]], 
                     [[-1, -1],[1, 5],[-1, -1]]],
              token: [[0,1,0], [2, 2, 0]],
              delta: {row: 2, col: 1, id: 1, rot: 5}
             },
             [{setTurn: {turnIndex : 1}},
             {set: {key: 'board', value: [[[4, 0],[-1, -1],[-1, -1]], 
                                          [[3, 3],[-1, -1],[-1, -1]], 
                                          [[-1, -1],[1, 5],[-1, -1]]]}},
             {set: {key: 'token', value: [[0,1,0], [2, 2, 0]]}},
             {set: {key: 'delta', value: {row: 1, col: 0, id: 3, rot: 3}}}]
         );
     }
  );

  //Dead
  it("Dead0: player 1 places tile id:3 rot:1 at row: 1 col: 2 --> token 1 is dead", 
     function(){
         expectMoveOk(1, 
             {board: [[[4, 0],[1, 5],[-1, -1]], 
                     [[-1, -1],[0, 1],[-1, -1]], 
                     [[-1, -1],[1, 5],[0, 0]]],
              token: [[0,2,5], [1, 2, 4]],
              delta: {row: 1, col: 1, id: 0, rot: 1}
             },
             [{endMatch: {endMatchScores: [1 , 0]}},
             {set: {key: 'board', value: [[[4, 0],[1, 5],[-1, -1]], 
                                          [[-1, -1],[0, 1],[3, 1]], 
                                          [[-1, -1],[1, 5],[0, 0]]]}},
             {set: {key: 'token', value: [[0,2,5], [1, 2, 2]]}},
             {set: {key: 'delta', value: {row: 1, col: 2, id: 3, rot: 1}}}]
         );
     }
  );

  it("Dead0: player 0 places tile id:3 rot:2 at row: 0 col: 2 --> token 0 is dead", 
     function(){
         expectMoveOk(0, 
             {board: [[[4, 0],[1, 5],[-1, -1]], 
                     [[-1, -1],[0, 1],[2, 1]], 
                     [[-1, -1],[1, 5],[0, 0]]],
              token: [[0,2,5], [0, 2, 4]],
              delta: {row: 1, col: 2, id: 2, rot: 1}
             },
             [{endMatch: {endMatchScores: [0 , 1]}},
             {set: {key: 'board', value: [[[4, 0],[1, 5],[3, 2]], 
                                          [[-1, -1],[0, 1],[2, 1]], 
                                          [[-1, -1],[1, 5],[0, 0]]]}},
             {set: {key: 'token', value: [[0,2,2], [1, 0, 2]]}},
             {set: {key: 'delta', value: {row: 0, col: 2, id: 3, rot: 2}}}]
         );
     }
  );
  
  //other illegal move
  it("player 1 places tile id:1 rot:5 at row: 2 col: 1 but generate wrong board", 
     function(){
         expectIllegalMove(1, 
             {board: [[[4, 0],[-1, -1],[-1, -1]], 
                     [[-1, -1],[-1, -1],[-1, -1]], 
                     [[-1, -1],[-1, -1],[-1, -1]]],
              token: [[0,1,0], [2, 1, 5]],
              delta: {row: 0, col: 0, id: 4, rot: 0}
             },
             [{setTurn: {turnIndex : 0}},
             {set: {key: 'board', value: [[[4, 0],[-1, -1],[-1, -1]], 
                                          [[-1, -1],[-1, -1],[-1, -1]], 
                                          [[1, 5],[-1, -1],[-1, -1]]]}},
             {set: {key: 'token', value: [[0,1,0], [2, 2, 0]]}},
             {set: {key: 'delta', value: {row: 2, col: 1, id: 1, rot: 5}}}]
         );
     }
  );

  //exception
  it("player 0's move doesn't have delta part", function() {
    expectIllegalMove(0, {},
        [{setTurn: {turnIndex : 1}},
        {set: {key: 'board', value: [[[-1, -1],[-1, -1],[-1, -1]], 
                                     [[-1, -1],[-1, -1],[-1, -1]], 
                                     [[-1, -1],[-1, -1],[-1, -1]]]}},
        {set: {key: 'token', value: [[0,0,0], [-1,-1, -1]]}}]
      );
  });

});

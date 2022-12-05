const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const express = require("express");
let app = express();
app.use(express.json());
const path = require("path");
const dbPath = path.join(__dirname, "cricketMatchDetails.db");
let db = null;
const listenDbToServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server is running http://localhost:3000/");
    });
  } catch (e) {
    console.log(`db error : ${e.message}`);
  }
};

listenDbToServer();

app.get("/players/", async (request, response) => {
  let playerDetails = `SELECT * FROM player_details`;
  let dbResponse = await db.all(playerDetails);
  let conviteIntoObject = (dbResponse) => {
    let myArray = [];
    for (let value of dbResponse) {
      let object = {
        playerId: value.player_id,
        playerName: value.player_name,
      };
      myArray.push(object);
    }
    return myArray;
  };
  console.log(dbResponse);
  response.send(conviteIntoObject(dbResponse));
});

//get spacifi player details
app.get("/players/:playerId/", async (request, response) => {
  let { playerId } = request.params;
  let playerDetails = `SELECT * FROM player_details WHERE player_id = ${playerId}`;
  let dbResponse = await db.all(playerDetails);
  let conviteIntoObject = (dbResponse) => {
    let myArray = [];
    for (let value of dbResponse) {
      let object = {
        playerId: value.player_id,
        playerName: value.player_name,
      };
      return object;
    }
  };
  response.send(conviteIntoObject(dbResponse));
});

//update new player
app.put("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const { playerName } = request.body;
  const playerDetails = `UPDATE player_details
        SET 
            player_name = '${playerName}'
        where player_id = '${playerId}'
    `;
  const dbResponse = await db.run(playerDetails);
  response.send("Player Details Updated");
});

//get spacific match details
app.get("/matches/:matchId/", async (request, response) => {
  let { matchId } = request.params;
  let playerDetails = `SELECT * FROM match_details WHERE match_id = ${matchId}`;
  let dbResponse = await db.all(playerDetails);
  let conviteIntoObject = (dbResponse) => {
    let myArray = [];
    for (let value of dbResponse) {
      let object = {
        matchId: value.match_id,
        match: value.match,
        year: value.year,
      };
      return object;
    }
  };
  response.send(conviteIntoObject(dbResponse));
});

// get unique player all matches
app.get("/players/:playerId/matches", async (request, response) => {
  try {
    let { playerId } = request.params;
    let playerDetails = `SELECT match_details.match_id as match_id , match_details.match as match , match_details.year as year FROM
    (player_details inner join player_match_score on player_details.player_id = player_match_score.player_id) as 
    T inner join match_details  on T.match_id = match_details.match_id
    WHERE player_details.player_id = ${playerId}`;
    let dbResponse = await db.all(playerDetails);
    let conviteIntoObject = (dbResponse) => {
      let myArray = [];
      for (let value of dbResponse) {
        let object = {
          matchId: value.match_id,
          match: value.match,
          year: value.year,
        };
        myArray.push(object);
      }
      return myArray;
    };
    response.send(conviteIntoObject(dbResponse));
  } catch (e) {
    console.log(e.message);
  }
});

app.get("/matches/:matchId/players", async (request, response) => {
  try {
    let { matchId } = request.params;
    let playerDetails = `SELECT player_details.player_id as player_id , player_details.player_name as player_name  FROM
    (player_details inner join player_match_score on player_details.player_id = player_match_score.player_id) as 
    T inner join match_details  on T.match_id = match_details.match_id
    WHERE match_details.match_id = ${matchId}`;
    let dbResponse = await db.all(playerDetails);
    let conviteIntoObject = (dbResponse) => {
      let myArray = [];
      for (let value of dbResponse) {
        let object = {
          playerId: value.player_id,
          playerName: value.player_name,
        };
        myArray.push(object);
      }
      return myArray;
    };
    response.send(conviteIntoObject(dbResponse));
  } catch (e) {
    console.log(e.message);
  }
});

app.get("/players/:playerId/playerScores", async (request, response) => {
  try {
    let { playerId } = request.params;
    let playerDetails = `SELECT player_details.player_id as player_id , player_details.player_name as player_name , sum(score) as total , sum(fours) as fours , sum(sixes) as sixes FROM
    (player_details inner join player_match_score on player_details.player_id = player_match_score.player_id) as 
    T inner join match_details  on T.match_id = match_details.match_id
    
    Where player_details.player_id = ${playerId}`;
    let dbResponse = await db.all(playerDetails);
    let conviteIntoObject = (dbResponse) => {
      let myArray = [];
      for (let value of dbResponse) {
        let object = {
          player_id: value.player_id,
          playerName: value.player_name,
          totalScore: value.total,
          totalFours: value.fours,
          totalSixes: value.sixes,
        };
        //console.log(object.playerName);
        return object;
      }
    };
    console.log(dbResponse);
    response.send(conviteIntoObject(dbResponse));
  } catch (e) {
    console.log(e.message);
  }
});
module.exports = app;

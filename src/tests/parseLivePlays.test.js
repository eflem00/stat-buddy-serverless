const parseLivePlays = require('../parseLivePlays');

let gamePk;
let gameEvents;
let gameShifts;

describe('Test the parseLivePlays Method', () => {
  beforeEach(() => {
    gamePk = 'abc123';
    gameEvents = {
      data: {
        gameData: {
          game: {
            type: 'R',
            season: '20172018'
          },
          datetime: {
            dateTime: '2018-01-01',
            endDateTime: '2018-01-01'
          },
          venue: {
            name: 'kappa arena'
          }
        },
        liveData: {
          plays: {
            allPlays: []
          }
        }
      }
    };
    gameShifts = {
      data: {
        data: []
      }
    };
  });

  test('Should return succesfully with empty plays', () => {
    expect(() => parseLivePlays(gamePk, gameEvents, gameShifts)).not.toThrow();
  });

  test('Should handle play with undefined data', () => {
    //TODO
    gameEvents.data.liveData.plays.allPlays = [{}];
    const events = parseLivePlays(gamePk, gameEvents, gameShifts);
    console.log(events);
  });

});

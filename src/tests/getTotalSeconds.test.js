const getTotalSeconds = require('../getTotalSeconds');

describe('Test the getTotalSeconds Method', () => {
  test('Should handle period and time', () => {
    let seconds = getTotalSeconds(1, '19:59');
    expect(seconds).toEqual(1199);

    seconds = getTotalSeconds(3, '00:00');
    expect(seconds).toEqual(2400);

    seconds = getTotalSeconds(2, '00:00');
    expect(seconds).toEqual(1200);
  });
});

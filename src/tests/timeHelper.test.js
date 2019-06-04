const timeHelper = require('../timeHelper');

describe('Test the getTotalSeconds Method', () => {
  test('Should handle period and time', () => {
    let seconds = timeHelper.getTotalSeconds(1, '19:59', 'R');
    expect(seconds).toEqual(1199);

    seconds = timeHelper.getTotalSeconds(3, '00:00', 'R');
    expect(seconds).toEqual(2400);

    seconds = timeHelper.getTotalSeconds(2, '00:00', 'R');
    expect(seconds).toEqual(1200);

    seconds = timeHelper.getTotalSeconds(5, '00:01', 'R');
    expect(seconds).toEqual(3901);

    seconds = timeHelper.getTotalSeconds(5, '00:01', 'P');
    expect(seconds).toEqual(4801);

    seconds = timeHelper.timeToInt('12:34');
    expect(seconds).toEqual(754);
  });
});

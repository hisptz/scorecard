/**
 * Created by kelvin on 3/14/18.
 */
export const arr = {
  max: function(array) {
    return Math.max.apply(null, array);
  },

  min: function(array) {
    return Math.min.apply(null, array);
  },

  range: function(array) {
    return arr.max(array) - arr.min(array);
  },

  midrange: function(array) {
    return arr.range(array) / 2;
  },

  sum: function(array) {
    let num = 0;
    for (let i = 0, l = array.length; i < l; i++) { num += array[i]; }
    return num;
  },

  mean: function(array) {
    return arr.sum(array) / array.length;
  },

  median: function(array) {
    array.sort(function(a, b) {
      return a - b;
    });
    const mid = array.length / 2;
    return mid % 1 ? array[mid - 0.5] : (array[mid - 1] + array[mid]) / 2;
  },

  modes: function(array) {
    if (!array.length) { return []; }
    const modeMap = {};
    let maxCount = 0;
    let modes = [];

    array.forEach(function(val) {
      if (!modeMap[val]) { modeMap[val] = 1;
      } else { modeMap[val]++; }

      if (modeMap[val] > maxCount) {
        modes = [val];
        maxCount = modeMap[val];
      } else if (modeMap[val] === maxCount) {
        modes.push(val);
        maxCount = modeMap[val];
      }
    });
    return modes;
  },

  variance: function(array) {
    const mean = arr.mean(array);
    return arr.mean(array.map(function(num) {
      return Math.pow(num - mean, 2);
    }));
  },

  standardDeviation: function(array) {
    return Math.sqrt(arr.variance(array));
  },

  meanAbsoluteDeviation: function(array) {
    const mean = arr.mean(array);
    return arr.mean(array.map(function(num) {
      return Math.abs(num - mean);
    }));
  },

  zScores: function(array) {
    const mean = arr.mean(array);
    const standardDeviation = arr.standardDeviation(array);
    return array.map(function(num) {
      return (num - mean) / standardDeviation;
    });
  }
};

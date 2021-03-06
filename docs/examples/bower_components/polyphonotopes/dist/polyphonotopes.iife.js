var Poly = (function (exports) {
'use strict';

var classCallCheck = function classCallCheck(instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
};

var createClass = function () {
  function defineProperties(target, props) {
    for (var i = 0; i < props.length; i++) {
      var descriptor = props[i];
      descriptor.enumerable = descriptor.enumerable || false;
      descriptor.configurable = true;
      if ("value" in descriptor) descriptor.writable = true;
      Object.defineProperty(target, descriptor.key, descriptor);
    }
  }

  return function (Constructor, protoProps, staticProps) {
    if (protoProps) defineProperties(Constructor.prototype, protoProps);
    if (staticProps) defineProperties(Constructor, staticProps);
    return Constructor;
  };
}();

/** Calculator for finding widest and/or shortest paths in a graph using the Floyed-Warshall algorithm. */

var FloydWarshall = function () {

  /**
   * Create a Floyd-Warshall calculator for a specific adjacency matrix.
   * @param {number[][]} adjacencyMatrix - A square matrix representing a graph with weighted edges.
   */
  function FloydWarshall(adjacencyMatrix) {
    classCallCheck(this, FloydWarshall);

    this.adjacencyMatrix = adjacencyMatrix;
  }

  /**
   * Calculates the widest distance from one node to the other.
   * @return {number[][]} - Matrix with distances from a node to the other
   */

  createClass(FloydWarshall, [{
    key: '_initializeDistanceMatrix',

    /**
     * @private
     */
    value: function _initializeDistanceMatrix(blankFiller) {
      var distMatrix = [];
      for (var i = 0; i < this.order; ++i) {
        distMatrix[i] = [];
        for (var j = 0; j < this.order; ++j) {
          if (i === j) {
            distMatrix[i][j] = 0;
          } else {
            var val = this.adjacencyMatrix[i][j];
            if (val) {
              distMatrix[i][j] = val;
            } else {
              distMatrix[i][j] = blankFiller;
            }
          }
        }
      }
      return distMatrix;
    }
  }, {
    key: 'widestPaths',
    get: function get$$1() {
      var distMatrix = this._initializeDistanceMatrix(0);
      for (var k = 0; k < this.order; ++k) {
        for (var i = 0; i < this.order; ++i) {
          if (i === k) {
            continue;
          }
          for (var j = 0; j < this.order; ++j) {
            if (j === i || j === k) {
              continue;
            }
            var direct = distMatrix[i][j];
            var detour = Math.min(distMatrix[i][k], distMatrix[k][j]);
            if (detour > direct) {
              distMatrix[i][j] = detour;
            }
          }
        }
      }
      return distMatrix;
    }

    /**
     * Calculates the shortest paths of the weighted graph.
     * (The output will not be accurate if the graph has a negative cycle.)
     * @return {number[][]} - Matrix with distances from a node to the other
     */

  }, {
    key: 'shortestPaths',
    get: function get$$1() {
      var distMatrix = this._initializeDistanceMatrix(Infinity);

      for (var k = 0; k < this.order; ++k) {
        for (var i = 0; i < this.order; ++i) {
          for (var j = 0; j < this.order; ++j) {
            var dist = distMatrix[i][k] + distMatrix[k][j];
            if (distMatrix[i][j] > dist) {
              distMatrix[i][j] = dist;
            }
          }
        }
      }

      for (var _i = 0; _i < this.order; ++_i) {
        for (var _j = 0; _j < this.order; ++_j) {
          if (distMatrix[_i][_j] === Infinity) {
            distMatrix[_i][_j] = -1;
          }
        }
      }

      return distMatrix;
    }

    /**
     * Get the order of the adjacency matrix (and of the output distance matrices.)
     * @return {integer} The order of the adjacency matrix.
     */

  }, {
    key: 'order',
    get: function get$$1() {
      return this.adjacencyMatrix.length;
    }
  }]);
  return FloydWarshall;
}();

function createCommonjsModule(fn, module) {
	return module = { exports: {} }, fn(module, module.exports), module.exports;
}

var BitSet_1 = createCommonjsModule(function (module, exports) {
  //Matt Krick, matt.krick@gmail.com, MIT License

  //each bin holds bits 0 - 30, totaling 31 (sign takes up last bit)
  var BITS_PER_INT = 31;
  //used for ffs of a word in O(1) time. LUTs get a bad wrap, they are fast.
  var multiplyDeBruijnBitPosition = [0, 1, 28, 2, 29, 14, 24, 3, 30, 22, 20, 15, 25, 17, 4, 8, 31, 27, 13, 23, 21, 19, 16, 7, 26, 12, 18, 6, 11, 5, 10, 9];

  /**
   *
   * Create a new bitset. Accepts either the maximum number of bits, or a dehydrated bitset
   * @param {number|string} nBitsOrKey - Number of bits in the set or dehydrated bitset.
   * For speed and space concerns, the initial number of bits cannot be increased.
   * @constructor
   */
  var BitSet = function BitSet(nBitsOrKey) {
    var wordCount, arrVals, front, leadingZeros, i;
    if (typeof nBitsOrKey === 'number') {
      nBitsOrKey = nBitsOrKey || BITS_PER_INT; //default to 1 word
      wordCount = Math.ceil(nBitsOrKey / BITS_PER_INT);
      this.arr = new Uint32Array(wordCount);
      this.MAX_BIT = nBitsOrKey - 1;
    } else {
      arrVals = JSON.parse("[" + nBitsOrKey + "]");
      this.MAX_BIT = arrVals.pop();
      leadingZeros = arrVals.pop();
      if (leadingZeros > 0) {
        front = [];
        for (i = 0; i < leadingZeros; i++) {
          front[i] = 0;
        }for (i = 0; i < arrVals.length; i++) {
          front[leadingZeros + i] = arrVals[i];
        }arrVals = front;
      }
      wordCount = Math.ceil((this.MAX_BIT + 1) / BITS_PER_INT);
      this.arr = new Uint32Array(wordCount);
      this.arr.set(arrVals);
    }
  };

  /**
   * Check whether a bit at a specific index is set
   * @param {number} idx the position of a single bit to check
   * @returns {boolean} true if bit is set, else false
   */
  BitSet.prototype.get = function (idx) {
    var word = this._getWord(idx);
    return word === -1 ? false : (this.arr[word] >> idx % BITS_PER_INT & 1) === 1;
  };

  /**
   * Set a single bit
   * @param {number} idx the position of a single bit to set
   * @returns {boolean} true if set was successful, else false
   */
  BitSet.prototype.set = function (idx) {
    var word = this._getWord(idx);
    if (word === -1) return false;
    this.arr[word] |= 1 << idx % BITS_PER_INT;
    return true;
  };

  /**
   * Set a range of bits
   * @param {number} from the starting index of the range to set
   * @param {number} to the ending index of the range to set
   * @returns {boolean} true if set was successful, else false
   */
  BitSet.prototype.setRange = function (from, to) {
    return this._doRange(from, to, _setFunc);
  };

  /**
   * Unset a single bit
   * @param {number} idx the position of a single bit to unset
   * @returns {boolean} true if set was successful, else false
   */
  BitSet.prototype.unset = function (idx) {
    var word = this._getWord(idx);
    if (word === -1) return false;
    this.arr[word] &= ~(1 << idx % BITS_PER_INT);
    return true;
  };

  /**
   * Unset a range of bits
   * @param {number} from the starting index of the range to unset
   * @param {number} to the ending index of the range to unset
   * @returns {boolean} true if set was successful, else false
   */
  BitSet.prototype.unsetRange = function (from, to) {
    return this._doRange(from, to, _unsetFunc);
  };

  /**
   * Toggle a single bit
   * @param {number} idx the position of a single bit to toggle
   * @returns {boolean} true if set was successful, else false
   */
  BitSet.prototype.toggle = function (idx) {
    var word = this._getWord(idx);
    if (word === -1) return false;
    this.arr[word] ^= 1 << idx % BITS_PER_INT;
    return true;
  };

  /**
   * Toggle a range of bits
   * @param {number} from the starting index of the range to toggle
   * @param {number} to the ending index of the range to toggle
   * @returns {boolean} true if set was successful, else false
   */
  BitSet.prototype.toggleRange = function (from, to) {
    return this._doRange(from, to, _toggleFunc);
  };

  /**
   *
   * Clear an entire bitset
   * @returns {boolean} true
   */
  BitSet.prototype.clear = function () {
    for (var i = 0; i < this.arr.length; i++) {
      this.arr[i] = 0;
    }
    return true;
  };

  /**
   * Clone a bitset
   * @returns {BitSet} an copy (by value) of the calling bitset
   */
  BitSet.prototype.clone = function () {
    return new BitSet(this.dehydrate());
  };

  /**
   *
   * Turn the bitset into a comma separated string that skips leading & trailing 0 words.
   * Ends with the number of leading 0s and MAX_BIT.
   * Useful if you need the bitset to be an object key (eg dynamic programming).
   * Can rehydrate by passing the result into the constructor
   * @returns {string} representation of the bitset
   */
  BitSet.prototype.dehydrate = function () {
    var i, lastUsedWord, s;
    var leadingZeros = 0;
    for (i = 0; i < this.arr.length; i++) {
      if (this.arr[i] !== 0) break;
      leadingZeros++;
    }
    for (i = this.arr.length - 1; i >= leadingZeros; i--) {
      if (this.arr[i] !== 0) {
        lastUsedWord = i;
        break;
      }
    }
    s = '';
    for (i = leadingZeros; i <= lastUsedWord; i++) {
      s += this.arr[i] + ',';
    }
    s += leadingZeros + ',' + this.MAX_BIT; //leading 0s, stop numbers
    return s;
  };

  /**
   *
   * Perform a bitwise AND on 2 bitsets or 1 bitset and 1 index.
   * Both bitsets must have the same number of words, no length check is performed to prevent and overflow.
   * @param {BitSet | Number} bsOrIdx a bitset or single index to check (useful for LP, DP problems)
   * @returns {BitSet} a new bitset that is the bitwise AND of the two
   */
  BitSet.prototype.and = function (bsOrIdx) {
    return this._op(bsOrIdx, _and);
  };

  /**
   *
   * Perform a bitwise OR on 2 bitsets or 1 bitset and 1 index.
   * Both bitsets must have the same number of words, no length check is performed to prevent and overflow.
   * @param {BitSet | Number} bsOrIdx a bitset or single index to check (useful for LP, DP problems)
   * @returns {BitSet} a new bitset that is the bitwise OR of the two
   */
  BitSet.prototype.or = function (bsOrIdx) {
    return this._op(bsOrIdx, _or);
  };

  /**
   *
   * Perform a bitwise XOR on 2 bitsets or 1 bitset and 1 index.
   * Both bitsets must have the same number of words, no length check is performed to prevent and overflow.
   * @param {BitSet | Number} bsOrIdx a bitset or single index to check (useful for LP, DP problems)
   * @returns {BitSet} a new bitset that is the bitwise XOR of the two
   */
  BitSet.prototype.xor = function (bsOrIdx) {
    return this._op(bsOrIdx, _xor);
  };

  /**
   * Run a custom function on every set bit. Faster than iterating over the entire bitset with a `get()`
   * Source code includes a nice pattern to follow if you need to break the for-loop early
   * @param {Function} func the function to pass the next set bit to
   */
  BitSet.prototype.forEach = function (func) {
    for (var i = this.ffs(); i !== -1; i = this.nextSetBit(i + 1)) {
      func(i);
    }
  };

  /**
   * Circular shift bitset by an offset
   * @param {Number} number of positions that the bitset that will be shifted to the right.
   * Using a negative number will result in a left shift.
   * @returns {Bitset} a new bitset that is rotated by the offset
   */

  BitSet.prototype.circularShift = function (offset) {
    offset = -offset;

    var S = this; // source BitSet (this)
    var MASK_SIGN = 0x7fffffff;
    var BITS = S.MAX_BIT + 1;
    var WORDS = S.arr.length;
    var BITS_LAST_WORD = BITS_PER_INT - (WORDS * BITS_PER_INT - BITS);

    var T = new BitSet(BITS); // target BitSet (the shifted bitset)

    var s;var t = 0; // (s)ource and (t)arget word indices
    var i;var j = 0; // current bit indices for source (i) and target (j) words
    var z = 0; // bit index for entire sequence.

    offset = (BITS + offset % BITS) % BITS; // positive, within length
    var s = ~~(offset / BITS_PER_INT) % WORDS;
    var i = offset % BITS_PER_INT;
    while (z < BITS) {
      var sourceWordLength = s === WORDS - 1 ? BITS_LAST_WORD : BITS_PER_INT;
      var bits = S.arr[s];

      if (i > 0) {
        bits = bits >>> i;
      }
      if (j > 0) {
        bits = bits << j;
      }

      T.arr[t] = T.arr[t] | bits;

      var bitsAdded = Math.min(BITS_PER_INT - j, sourceWordLength - i);
      z += bitsAdded;
      j += bitsAdded;
      if (j >= BITS_PER_INT) {
        T.arr[t] = T.arr[t] & MASK_SIGN;
        j = 0;t++;
      }
      i += bitsAdded;
      if (i >= sourceWordLength) {
        i = 0;s++;
      }
      if (s >= WORDS) {
        s -= WORDS;
      }
    }
    T.arr[WORDS - 1] = T.arr[WORDS - 1] & MASK_SIGN >>> BITS_PER_INT - BITS_LAST_WORD;
    return T;
  };

  /**
   * Get the cardinality (count of set bits) for the entire bitset
   * @returns {number} cardinality
   */
  BitSet.prototype.getCardinality = function () {
    var setCount = 0;
    for (var i = this.arr.length - 1; i >= 0; i--) {
      var j = this.arr[i];
      j = j - (j >> 1 & 0x55555555);
      j = (j & 0x33333333) + (j >> 2 & 0x33333333);
      setCount += (j + (j >> 4) & 0x0F0F0F0F) * 0x01010101 >> 24;
    }
    return setCount;
  };

  /**
   * Get the indices of all set bits. Useful for debugging, uses `forEach` internally
   * @returns {Array} Indices of all set bits
   */
  BitSet.prototype.getIndices = function () {
    var indices = [];
    this.forEach(function (i) {
      indices.push(i);
    });
    return indices;
  };

  /**
   * Checks if one bitset is subset of another. Same thing can be done using _and_ operation and equality check,
   * but then new BitSet would be created, and if one is only interested in yes/no information it would be a waste of memory
   * and additional GC strain.
   * @param {BitSet} bs a bitset to check
   * @returns {Boolean} `true` if provided bitset is a subset of this bitset, `false` otherwise
   */
  BitSet.prototype.isSubsetOf = function (bs) {
    var arr1 = this.arr;
    var arr2 = bs.arr;
    var len = arr1.length;
    for (var i = 0; i < len; i++) {
      if ((arr1[i] & arr2[i]) !== arr1[i]) {
        return false;
      }
    }
    return true;
  };

  /**
   * Quickly determine if a bitset is empty
   * @returns {boolean} true if the entire bitset is empty, else false
   */
  BitSet.prototype.isEmpty = function () {
    var i, arr;
    arr = this.arr;
    for (i = 0; i < arr.length; i++) {
      if (arr[i]) {
        return false;
      }
    }
    return true;
  };

  /**
   *
   * Quickly determine if both bitsets are equal (faster than checking if the XOR of the two is === 0).
   * Both bitsets must have the same number of words, no length check is performed to prevent and overflow.
   * @param {BitSet} bs
   * @returns {boolean} true if the entire bitset is empty, else false
   */
  BitSet.prototype.isEqual = function (bs) {
    var i;
    for (i = 0; i < this.arr.length; i++) {
      if (this.arr[i] !== bs.arr[i]) {
        return false;
      }
    }
    return true;
  };

  /**
   * Get a string representation of the entire bitset, including leading 0s (useful for debugging)
   * @returns {string} a base 2 representation of the entire bitset
   */
  BitSet.prototype.toString = function () {
    var i,
        str,
        fullString = '';
    for (i = this.arr.length - 1; i >= 0; i--) {
      str = this.arr[i].toString(2);
      fullString += ('0000000000000000000000000000000' + str).slice(-BITS_PER_INT);
    }
    return fullString;
  };

  /**
   * Find first set bit (useful for processing queues, breadth-first tree searches, etc.)
   * @param {number} _startWord the word to start with (only used internally by nextSetBit)
   * @returns {number} the index of the first set bit in the bitset, or -1 if not found
   */
  BitSet.prototype.ffs = function (_startWord) {
    var setVal,
        i,
        fs = -1;
    _startWord = _startWord || 0;
    for (i = _startWord; i < this.arr.length; i++) {
      setVal = this.arr[i];
      if (setVal === 0) continue;
      fs = _lsb(setVal) + i * BITS_PER_INT;
      break;
    }
    return fs <= this.MAX_BIT ? fs : -1;
  };

  /**
   * Find first zero (unset bit)
   * @param {number} _startWord the word to start with (only used internally by nextUnsetBit)
   * @returns {number} the index of the first unset bit in the bitset, or -1 if not found
   */
  BitSet.prototype.ffz = function (_startWord) {
    var i,
        setVal,
        fz = -1;
    _startWord = _startWord || 0;
    for (i = _startWord; i < this.arr.length; i++) {
      setVal = this.arr[i];
      if (setVal === 0x7fffffff) continue;
      setVal ^= 0x7fffffff;
      fz = _lsb(setVal) + i * BITS_PER_INT;
      break;
    }
    return fz <= this.MAX_BIT ? fz : -1;
  };

  /**
   *
   * Find last set bit
   * @param {number} _startWord the word to start with (only used internally by previousSetBit)
   * @returns {number} the index of the last set bit in the bitset, or -1 if not found
   */
  BitSet.prototype.fls = function (_startWord) {
    var i,
        setVal,
        ls = -1;
    if (_startWord === undefined) _startWord = this.arr.length - 1;
    for (i = _startWord; i >= 0; i--) {
      setVal = this.arr[i];
      if (setVal === 0) continue;
      ls = _msb(setVal) + i * BITS_PER_INT;
      break;
    }
    return ls;
  };

  /**
   *
   * Find last zero (unset bit)
   * @param {number} _startWord the word to start with (only used internally by previousUnsetBit)
   * @returns {number} the index of the last unset bit in the bitset, or -1 if not found
   */
  BitSet.prototype.flz = function (_startWord) {
    var i,
        setVal,
        ls = -1;
    if (_startWord === undefined) _startWord = this.arr.length - 1;
    for (i = _startWord; i >= 0; i--) {
      setVal = this.arr[i];
      if (i === this.arr.length - 1) {
        var wordIdx = this.MAX_BIT % BITS_PER_INT;
        var unusedBitCount = BITS_PER_INT - wordIdx - 1;
        setVal |= (1 << unusedBitCount) - 1 << wordIdx + 1;
      }
      if (setVal === 0x7fffffff) continue;
      setVal ^= 0x7fffffff;
      ls = _msb(setVal) + i * BITS_PER_INT;
      break;
    }
    return ls;
  };

  /**
   * Find first set bit, starting at a given index
   * @param {number} idx the starting index for the next set bit
   * @returns {number} the index of the next set bit >= idx, or -1 if not found
   */
  BitSet.prototype.nextSetBit = function (idx) {
    var startWord = this._getWord(idx);
    if (startWord === -1) return -1;
    var wordIdx = idx % BITS_PER_INT;
    var len = BITS_PER_INT - wordIdx;
    var mask = (1 << len) - 1 << wordIdx;
    var reducedWord = this.arr[startWord] & mask;
    if (reducedWord > 0) {
      return _lsb(reducedWord) + startWord * BITS_PER_INT;
    }
    return this.ffs(startWord + 1);
  };

  /**
   * Find first unset bit, starting at a given index
   * @param {number} idx the starting index for the next unset bit
   * @returns {number} the index of the next unset bit >= idx, or -1 if not found
   */
  BitSet.prototype.nextUnsetBit = function (idx) {
    var startWord = this._getWord(idx);
    if (startWord === -1) return -1;
    var mask = (1 << idx % BITS_PER_INT) - 1;
    var reducedWord = this.arr[startWord] | mask;
    if (reducedWord === 0x7fffffff) {
      return this.ffz(startWord + 1);
    }
    return _lsb(0x7fffffff ^ reducedWord) + startWord * BITS_PER_INT;
  };

  /**
   * Find last set bit, up to a given index
   * @param {number} idx the starting index for the next unset bit (going in reverse)
   * @returns {number} the index of the next unset bit <= idx, or -1 if not found
   */
  BitSet.prototype.previousSetBit = function (idx) {
    var startWord = this._getWord(idx);
    if (startWord === -1) return -1;
    var mask = 0x7fffffff >>> BITS_PER_INT - idx % BITS_PER_INT - 1;
    var reducedWord = this.arr[startWord] & mask;
    if (reducedWord > 0) {
      return _msb(reducedWord) + startWord * BITS_PER_INT;
    }
    return this.fls(startWord - 1);
  };

  /**
   * Find last unset bit, up to a given index
   * @param {number} idx the starting index for the next unset bit (going in reverse)
   * @returns {number} the index of the next unset bit <= idx, or -1 if not found
   */
  BitSet.prototype.previousUnsetBit = function (idx) {
    var startWord = this._getWord(idx);
    if (startWord === -1) return -1;
    var wordIdx = idx % BITS_PER_INT;
    var mask = (1 << BITS_PER_INT - wordIdx - 1) - 1 << wordIdx + 1;
    var reducedWord = this.arr[startWord] | mask;
    if (reducedWord === 0x7fffffff) {
      return this.flz(startWord - 1);
    }
    return _msb(0x7fffffff ^ reducedWord) + startWord * BITS_PER_INT;
  };

  /**
   *
   * @param {number} idx position of bit in bitset
   * @returns {number} the word where the index is located, or -1 if out of range
   * @private
   */
  BitSet.prototype._getWord = function (idx) {
    return idx < 0 || idx > this.MAX_BIT ? -1 : ~~(idx / BITS_PER_INT);
  };

  /**
   * Shared function for setting, unsetting, or toggling a range of bits
   * @param {number} from the starting index of the range to set
   * @param {number} to the ending index of the range to set
   * @param {Function} func function to run (set, unset, or toggle)
   * @returns {boolean} true if set was successful, else false
   * @private
   */
  BitSet.prototype._doRange = function (from, to, func) {
    var i, curStart, curEnd, len;
    if (to < from) {
      to ^= from;
      from ^= to;
      to ^= from;
    }
    var startWord = this._getWord(from);
    var endWord = this._getWord(to);
    if (startWord === -1 || endWord === -1) return false;
    for (i = startWord; i <= endWord; i++) {
      curStart = i === startWord ? from % BITS_PER_INT : 0;
      curEnd = i === endWord ? to % BITS_PER_INT : BITS_PER_INT - 1;
      len = curEnd - curStart + 1;
      this.arr[i] = func(this.arr[i], len, curStart);
    }
    return true;
  };

  /**
   * Both bitsets must have the same number of words, no length check is performed to prevent and overflow.
   * @param {BitSet | Number} bsOrIdx a bitset or single index to check (useful for LP, DP problems)
   * @param {Function} func the operation to perform (and, or, xor)
   * @returns {BitSet} a new bitset that is the bitwise operation of the two
   * @private
   */
  BitSet.prototype._op = function (bsOrIdx, func) {
    var i, arr1, arr2, len, newBS, word;
    arr1 = this.arr;
    if (typeof bsOrIdx === 'number') {
      word = this._getWord(bsOrIdx);
      newBS = this.clone();
      if (word !== -1) newBS.arr[word] = func(arr1[word], 1 << bsOrIdx % BITS_PER_INT);
    } else {
      arr2 = bsOrIdx.arr;
      len = arr1.length;
      newBS = new BitSet(this.MAX_BIT + 1);
      for (i = 0; i < len; i++) {
        newBS.arr[i] = func(arr1[i], arr2[i]);
      }
    }
    return newBS;
  };

  /**
   *
   * Returns the least signifcant bit, or 0 if none set, so a prior check to see if the word > 0 is required
   * @param {number} word the current array
   * @returns {number} the index of the least significant bit in the current array
   * @private
   *
   */
  function _lsb(word) {
    return multiplyDeBruijnBitPosition[(word & -word) * 0x077CB531 >>> 27];
  }

  /**
   * Returns the least signifcant bit, or 0 if none set, so a prior check to see if the word > 0 is required
   * @param word the current array
   * @returns {number} the index of the most significant bit in the current array
   * @private
   */
  function _msb(word) {
    word |= word >> 1;
    word |= word >> 2;
    word |= word >> 4;
    word |= word >> 8;
    word |= word >> 16;
    word = (word >> 1) + 1;
    return multiplyDeBruijnBitPosition[word * 0x077CB531 >>> 27];
  }

  function _toggleFunc(word, len, curStart) {
    var mask = (1 << len) - 1 << curStart;
    return word ^ mask;
  }

  function _setFunc(word, len, curStart) {
    var mask = (1 << len) - 1 << curStart;
    return word | mask;
  }

  function _unsetFunc(word, len, curStart) {
    var mask = 0x7fffffff ^ (1 << len) - 1 << curStart;
    return word & mask;
  }

  function _and(word1, word2) {
    return word1 & word2;
  }

  function _or(word1, word2) {
    return word1 | word2;
  }

  function _xor(word1, word2) {
    return word1 ^ word2;
  }

  if (typeof undefined === 'function' && undefined['amd']) {
    undefined([], function () {
      return BitSet;
    });
  } else {
    module['exports'] = BitSet;
  }
});

var minRepr = createCommonjsModule(function (module) {
    (function () {
        function minRepr(str, comparer) {
            var arr = str;
            if (Array.isArray(str)) {
                arr = str;
            } else if (typeof str === 'string') {
                arr = str.split('');
            } else {
                throw new Error('Parameter "str" should be a string or an array with comparable elements.');
            }

            var s = Array.prototype.concat(arr, arr);
            if (comparer === undefined) {
                comparer = function comparer(a, b) {
                    if (a < b) {
                        return -1;
                    } else if (a > b) {
                        return 1;
                    } else {
                        return 0;
                    }
                };
            }

            var i = 0;
            var j = 1;
            var l = arr.length;
            while (i < l && j < l) {
                var k = 0;
                while (comparer(s[i + k], s[j + k]) === 0 && k < l) {
                    ++k;
                }
                if (k === l) {
                    break;
                }
                if (comparer(s[i + k], s[j + k]) > 0) {
                    i = Math.max(i + k + 1, j + 1);
                } else {
                    j = Math.max(j + k + 1, i + 1);
                }
            }

            return Math.min(i, j);
        }

        module.exports = minRepr;
    })();
});

function accidentals(size) {
    var acc = new BitSet_1(size);
    acc.set(0);
    acc.set(1);

    var accidentals = [];
    for (var i = 0; i < size; i++) {
        accidentals.push(acc);
        acc = acc.circularShift(1);
    }

    return accidentals;
}

function fromIndices(size, indices) {
    var bs = new BitSet_1(size);
    indices.forEach(function (x) {
        bs.set(x);
    });
    return bs;
}

function intervals(bs) {
    var r = [];
    var indices = bs.getIndices();
    var size = indices.length;
    for (var i = 0; i < size; i++) {
        r.push(indices[(i + 1) % size] + (i + 1 >= size ? bs.MAX_BIT + 1 : 0) - indices[i]);
    }
    return r;
}

function info(bs) {
    var sh = shape(bs, true);
    sh['chroma'] = bs.getIndices();
    sh['id'] = String(sh['chroma']);
    sh['bitset'] = bs;
    return sh;
}

function shape(bs) {
    var info = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;

    var intershape = intervals(bs);
    var shift = minRepr(intershape);
    var size = intershape.length;
    var shape = [];
    for (var i = shift; i < size + shift; i++) {
        shape.push(intershape[i % size]);
    }
    shape = String(shape);
    if (info) {
        return { intervals: intershape, shape: shape, offset: shift };
    } else {
        return shape;
    }
}

function findShapes(shapes, visit) {
    if (shapes.getIndices) {
        shapes = [shapes];
    }
    if (visit && visit.getIndices) {
        visit = [visit];
    }
    visit = visit ? visit : shapes;
    shapes = shapes.map(function (s) {
        return shape(s);
    });
    var lookingFor = function lookingFor(g) {
        return shapes.includes(g['shape']);
    };
    var makeNode = info;
    var makeEdge = function makeEdge(f, t) {
        return { from: f.id, to: t.id };
    };
    return explore(visit, lookingFor, makeEdge, makeNode);
}

function explore(visit, lookingFor, makeEdge, makeNode) {
    makeEdge = makeEdge ? makeEdge : function (frm, to) {
        return { from: frm, to: to };
    };
    makeNode = makeNode ? makeNode : function (n) {
        return n;
    };

    lookingFor = lookingFor ? lookingFor : function (g) {
        return true;
    };
    if (visit && visit.getIndices) {
        visit = [visit];
    }
    var size = visit[0].MAX_BIT + 1;

    var visited = [];
    var edges = [];
    var nodes = [];

    var Acc = accidentals(size);

    var _loop = function _loop() {
        var start = visit.pop();
        var startNode = makeNode(start);
        if (visited.includes(start.dehydrate())) {
            return 'continue';
        }
        visited.push(start.dehydrate());
        nodes.push(startNode);
        var goto = Acc.map(function (a) {
            return start.xor(a);
        });
        var _iteratorNormalCompletion = true;
        var _didIteratorError = false;
        var _iteratorError = undefined;

        try {
            for (var _iterator = goto[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                var g = _step.value;

                var gNode = makeNode(g);
                if (lookingFor(gNode)) {
                    edges.push(makeEdge(startNode, gNode));
                    if (!visited.includes(g.dehydrate())) {
                        visit.push(g);
                    }
                }
            }
        } catch (err) {
            _didIteratorError = true;
            _iteratorError = err;
        } finally {
            try {
                if (!_iteratorNormalCompletion && _iterator.return) {
                    _iterator.return();
                }
            } finally {
                if (_didIteratorError) {
                    throw _iteratorError;
                }
            }
        }
    };

    while (visit.length > 0) {
        var _ret = _loop();

        if (_ret === 'continue') continue;
    }
    return { nodes: nodes, edges: edges };
}

exports.accidentals = accidentals;
exports.fromIndices = fromIndices;
exports.intervals = intervals;
exports.info = info;
exports.shape = shape;
exports.findShapes = findShapes;
exports.explore = explore;

return exports;

}({}));
//# sourceMappingURL=polyphonotopes.iife.js.map

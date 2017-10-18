(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
	typeof define === 'function' && define.amd ? define(['exports'], factory) :
	(factory((global.graphHops = {})));
}(this, (function (exports) { 'use strict';

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

var Bitset = require('fast-bitset');
var minrepr = require('min-repr');

function accidentals(size) {
    var acc = new Bitset(size);
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
    var bs = new Bitset(size);
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
    var shift = minrepr(intershape);
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
    if (shapes.constructor === Bitset) {
        shapes = [shapes];
    }
    if (visit && visit.constructor === Bitset) {
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
        return { source: f.id, target: t.id };
    };
    return explore(visit, lookingFor, makeEdge, makeNode);
}

function explore(visit, lookingFor, makeEdge, makeNode) {
    makeEdge = makeEdge ? makeEdge : function (frm, to) {
        return { source: frm, target: to };
    };
    makeNode = makeNode ? makeNode : function (n) {
        return n;
    };

    lookingFor = lookingFor ? lookingFor : function (g) {
        return true;
    };
    if (visit && visit.constructor === Bitset) {
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

Object.defineProperty(exports, '__esModule', { value: true });

})));
//# sourceMappingURL=polyphonotopes.js.map

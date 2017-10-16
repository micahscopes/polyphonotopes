var P = require('../dist/polyphonotopes.js')
var accidentals = P.accidentals

var t = require('tap')

t.test('accidentals', function (t) {
    let n = 48
    let a = accidentals(n)
    for (let i=0; i<n; i++) {
        t.assert(a[i].getIndices().includes(i))
        t.assert(a[i].getIndices().includes((i+1)%n))
    }
  t.end()
})

var P = require('../dist/polyphonotopes.js')
const Bitset = require('fast-bitset')
const minrepr = require('min-repr')

var t = require('tap')

var majorDiatonic = new Bitset(12)
for(let step of [0,2,4,5,7,9,11]){
    majorDiatonic.set(step)
}

t.test('accidentals', function (t) {
    var accidentals = P.accidentals
    let n = 48
    let a = accidentals(n)
    for (let i=0; i<n; i++) {
        t.assert(a[i].getIndices().includes(i))
        t.assert(a[i].getIndices().includes((i+1)%n))
    }
  t.end()
})

t.test('shape', function(t) {
    var shape = P.shape
    t.equal(shape(majorDiatonic),shape(majorDiatonic.circularShift(3)))

    t.end()
})

t.test('forage', function(t) {
    let forage = P.forage
    t.test('major', function(t){
        debugger
        t.equal(forage(majorDiatonic).length,24)
        t.end()
    })

    t.test('major and altered', function(t){
        debugger
        let acc = P.accidentals(12)
        let alteredDiatonic = acc[0].xor(majorDiatonic)
        t.equal(forage([majorDiatonic,alteredDiatonic]).length,72)
        t.end()
    })
    t.end()
})



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

t.test('find shapes', function(t) {
    let findShapes = P.findShapes
    t.test('major', function(t){
        t.equal(findShapes(majorDiatonic).length,24)
        t.end()
    })

    t.test('major and altered', function(t){
        let acc = P.accidentals(12)
        let alteredDiatonic = acc[0].xor(majorDiatonic)
        t.equal(findShapes([majorDiatonic,alteredDiatonic]).length,72)
        t.end()
    })
    t.end()
})

t.test('explore', function(t){
    t.test('little space, all connections', function(t){
        let start = new Bitset(3)
        let explore = P.explore
        debugger
        t.equal(explore(start).length,12)
        t.end()
    })

    t.test("find scales that are maximally even", function(t){

        let f = function(s){
            let i = P.intervals(s)
            let size = i.length
            i = new Set(i)
            let myhill = i.has(1) && i.has(2) && i.size == 2
            return myhill
        }
        t.equal(P.explore(majorDiatonic,f).length,24*5)
        t.end()
    })

    t.end()
})
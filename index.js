import ghops from 'graph-hops'
const Bitset = require('fast-bitset')

export function accidentals(size) {
    let acc = new Bitset(size)
    acc.set(0)
    acc.set(1)
    
    let accidentals = []
    for (let i=0; i<size; i++) {
        accidentals.push(acc)
        acc = acc.circularShift(1)
    }

    return accidentals;
}

export function walk(set){
    for(let i=0; i <= set.MAX_BIT; i++){
        a = 2;
    }
}


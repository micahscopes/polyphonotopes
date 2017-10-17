import ghops from 'graph-hops'
const Bitset = require('fast-bitset')
const minrepr = require('min-repr')

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
export function intervals(bs){
    let r = []
    let indices = bs.getIndices()
    let size = indices.length
    for(let i=0; i<size; i++){
        r.push(indices[(i+1)%size] + (i+1 >= size ? bs.MAX_BIT+1 : 0) - indices[i])
    }
    return r;
}

export function shape(bs){
    let intershape = intervals(bs)
    let shift = minrepr(intershape)
    let size = intershape.length
    let shape = []
    for(let i=shift; i<size+shift; i++){
        shape.push(intershape[i%size])
    }
    return String(shape)
}

export function forage(shapes,visit){
    if(shapes.constructor === Bitset){shapes = [shapes]}
    if(visit && visit.constructor === Bitset){visit = [visit]}
    let size = shapes[0].MAX_BIT+1
    visit = visit ? visit : shapes
    shapes = shapes.map((s) => shape(s))

    let visited = []
    let keepers = []

    let Acc = accidentals(size)
    while(visit.length > 0) {
        let start = visit.pop()
        if (visited.includes(start.dehydrate())) { continue }
        console.log('starting on',start.getIndices())
        console.log(keepers.length,'keepers so far')
        visited.push(start.dehydrate())
        let goto = Acc.map((a)=>start.xor(a))
        for(let g of goto){
            if(shapes.includes(shape(g))){
                keepers.push([start,g])
                console.log(start.getIndices(),g.getIndices())
                if(!visited.includes(g.dehydrate())){
                    visit.push(g)
                }
            }
        }
    }
    return keepers
}


// was gonna make an algorithm that accumulates a
// running smallest shape but then i found the 
// min-repr library and decided not to.
//export function shape(set){
//    let size = set.MAX_BIT+1
//    let indices = set.getIndices()
//    let sh = []
//    let shift = 0;
//    while( sh.length < set.getIndices().length ) {
//        for(let k=0; k<sh.length; k++){
//            let next = indices[(shift+k)%size]
//            if(next > sh[k]) {
//                shift += k
//                sh = []
//            } else {
//                sh.push(next)
//            }
//        }
//    }
//}


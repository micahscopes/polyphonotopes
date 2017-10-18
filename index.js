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

export function fromIndices(size,indices) {
    let bs = new Bitset(size)
    indices.forEach((x)=>{bs.set(x)})
    return bs
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

export function info(bs){
    let sh = shape(bs,True)
    sh['chroma'] = bs.getIndices()
    return sh
}

export function shape(bs,info=false){
    let intershape = intervals(bs)
    let shift = minrepr(intershape)
    let size = intershape.length
    let shape = []
    for(let i=shift; i<size+shift; i++){
        shape.push(intershape[i%size])
    }
    shape = String(shape)
    if(info){
        return {intervals: intershape, shape: shape, offset: shift}
    } else {
        return shape
    }
}


export function findShapes(shapes,visit){
    if(shapes.constructor === Bitset){shapes = [shapes]}
    if(visit && visit.constructor === Bitset){visit = [visit]}
    let size = shapes[0].MAX_BIT+1
    visit = visit ? visit : shapes
    shapes = shapes.map((s) => shape(s))
    let lookingFor = (g) => shapes.includes(shape(g))
    return explore(visit,lookingFor)
}

export function explore(visit,lookingFor,makeEdge,makeNode){
    makeEdge = makeEdge ? makeEdge : (frm,to) => {source: frm, target: to}
    makeNode = makeNode ? makeNode : (n) => n

    lookingFor = lookingFor ? lookingFor : (g)=>true
    if(visit && visit.constructor === Bitset){visit = [visit]}
    let size = visit[0].MAX_BIT+1

    let visited = []
    let edges = []
    let nodes = []

    let Acc = accidentals(size)
    while(visit.length > 0) {
        let start = visit.pop()
        if (visited.includes(start.dehydrate())) { continue }
        visited.push(start.dehydrate())
        nodes.push(makeNode(start))
        let goto = Acc.map((a)=>start.xor(a))
        for(let g of goto){
            if(lookingFor(g)){
                edges.push(makeEdge(g))
                if(!visited.includes(g.dehydrate())){
                    visit.push(g)
                }
            }
        }
    }
    return {nodes: nodes, edges: edges}
}


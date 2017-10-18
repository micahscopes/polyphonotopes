import ghops from 'graph-hops'
import Bitset from 'fast-bitset'
import minrepr from 'min-repr'

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
    let sh = shape(bs,true)
    sh['chroma'] = bs.getIndices()
    sh['id'] = String(sh['chroma'])
    sh['bitset'] = bs
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
    if(shapes.getIndices){shapes = [shapes]}
    if(visit && visit.getIndices){visit = [visit]}
    let size = shapes[0].MAX_BIT+1
    visit = visit ? visit : shapes
    shapes = shapes.map((s) => shape(s))
    let lookingFor = (g) => shapes.includes(g['shape'])
    let makeNode = info
    let makeEdge = (f,t) => {return {from: f.id, to: t.id}} 
    return explore(visit,lookingFor,makeEdge,makeNode)
}

export function explore(visit,lookingFor,makeEdge,makeNode){
    makeEdge = makeEdge ? makeEdge : (frm,to) => ({from: frm, to: to})
    makeNode = makeNode ? makeNode : (n) => n

    lookingFor = lookingFor ? lookingFor : (g)=>true
    if(visit && visit.getIndices){visit = [visit]}
    let size = visit[0].MAX_BIT+1

    let visited = []
    let edges = []
    let nodes = []

    let Acc = accidentals(size)
    while(visit.length > 0) {
        let start = visit.pop()
        let startNode = makeNode(start)
        if (visited.includes(start.dehydrate())) { continue }
        visited.push(start.dehydrate())
        nodes.push(startNode)
        let goto = Acc.map((a)=>start.xor(a))
        for(let g of goto){
            let gNode = makeNode(g)
            if(lookingFor(gNode)){
                edges.push(makeEdge(startNode,gNode))
                if(!visited.includes(g.dehydrate())){
                    visit.push(g)
                }
            }
        }
    }
    return {nodes: nodes, edges: edges}
}


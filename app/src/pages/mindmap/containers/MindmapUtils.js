import * as d3 from 'd3';
import {v4 as uuid} from 'uuid'

function unfoldtree(d){
    // d3.select('#node_' + d.id).classed('no-disp', !1).select('.ct-cRight').classed('ct-nodeBubble', !0); 
    if (d.parent && (d.parent.revertChild || d.parent.revertChild1)) d.revertChild1 = true;
    if (d._children) {
        d.children = d._children;
        d._children = null;
        d.revertChild = true;
    }
    if (d.children) d.children.forEach(unfoldtree);
}

function foldtree(d){   
    if (d.children) d.children.forEach(foldtree);
    if (d.revertChild1) delete d.revertChild1;
    if (d.revertChild) {
        d._children = d.children;
        d.children = null;
        delete d.revertChild;
    }
}

const recurseTogChild = (nodeDisplay, linkDisplay, d, v, dLinks) => {
    if (d.children) d.children.forEach(function(e) {
        recurseTogChild(nodeDisplay, linkDisplay, e, v, dLinks);
        nodeDisplay[e.id].hidden = v;
        for (var j = dLinks.length - 1; j >= 0; j--) {
            var lid = 'link-' + dLinks[j].source.id + '-' + dLinks[j].target.id
            if (linkDisplay[lid] && dLinks[j].source.id === d.id) {
                linkDisplay[lid].hidden = v
            } 
        }
    });
    else if (d._children) d._children.forEach(function(e) {
        recurseTogChild(nodeDisplay, linkDisplay, e, !0, dLinks);
        nodeDisplay[e.id].hidden = !0;
        for (var j = dLinks.length - 1; j >= 0; j--) {
            var lid = 'link-' + dLinks[j].source.id + '-' + dLinks[j].target.id
            if (linkDisplay[lid] && dLinks[j].source.id === d.id) {
                linkDisplay[lid].hidden = !0
            }
        }
    });
};

export const generateTree = (tree,sections,count,verticalLayout) =>{
    unfoldtree(tree)
    var translate;
    var nodeDisplay = {}
    var linkDisplay = {}
    var s = d3.select('.mp__canvas_svg');
    let  cSize= [parseFloat(s.style("width")), parseFloat(s.style("height"))];
    var typeNum = {
        'modules': 0,
        'endtoend': 0,
        'scenarios': 1,
        'screens': 2,
        'testcases': 3
    };
    var levelCount = [1]
    function childCounter(l, s) {
        if (levelCount.length <= l) levelCount.push(0);
        if (s.children) {   
            levelCount[l] += s.children.length;
            s.children.forEach(function(d) {
                childCounter(l + 1, d);
            });
        }
    };
    childCounter(1, tree);
    var newHeight = d3.max(levelCount) * 90;
    var d3Tree = d3.layout.tree().size([newHeight * 2, cSize[0]]);
    var dNodes = d3Tree.nodes(tree);
    var dLinks=d3Tree.links(dNodes);
    dNodes.sort(function(a, b) {
        return a.childIndex - b.childIndex;
    });  
    dNodes.forEach((d,ind)=>{
        if (verticalLayout) {
            d.y = cSize[0] * 0.1 * (0.9 + typeNum[d.type]);
            sections[d.type] = d.y;
        } else {
            d.y = d.x;
            d.x = cSize[0] * 0.1 * (0.9 + typeNum[d.type]);
            sections[d.type] = d.x;
        }
        d.id = ind
        count[d.type] += 1; 
        var node = addNode(d);
        nodeDisplay[d.id] = node
        nodeDisplay[d.id].task = false;
        nodeDisplay[d.id].hidden = ((d.parent)? (d.parent.revertChild || d.parent.revertChild1):false) || false;
    })
    dLinks.forEach(function(d) {
        d.id = uuid();
        var lid = 'link-' + d.source.id + '-' + d.target.id
        var link = addLink(d.source, d.target,verticalLayout);
        linkDisplay[lid] = link
        linkDisplay[lid].hidden = (d.source.revertChild || d.source.revertChild1) || false;
    });
    if (verticalLayout){
        translate = [(cSize[0] / 2) - dNodes[0].x, (cSize[1] / 5) - dNodes[0].y]
    } else{
        translate = [(cSize[0] / 3) - dNodes[0].x, (cSize[1] / 2) - dNodes[0].y]
    }
    foldtree(tree)
    return {nodes:nodeDisplay,links:linkDisplay,translate:translate,dNodes,dLinks,sections,count}
}

export const addNode = (n) =>{
    n.display_name = n.name;
    var ch = 15;
    if (n.display_name.length > 15) {
        n.display_name = n.display_name.slice(0, ch) + '...';
    }
    var img_src = 'static/imgs/node-' + n.type + '.png';
    if (n.reuse && (n.type === 'testcases' || n.type === 'screens')) img_src = 'static/imgs/' + n.type + '-reuse.png';

    var nodeDisplay= {
        'type': n.type,
        'transform': "translate(" + (n.x).toString() + "," + (n.y).toString() + ")",
        'opacity': !( n._id === null || n._id === undefined) ? 1 : 0.5,
        'title': n.name,
        'hidden': false,
        'name': n.display_name,
        'img_src': img_src,
        '_id': n._id || null,
        'state':n.state || "created",
        'reuse':n.reuse || false
    };
   
    return nodeDisplay;
}

export const addLink = (p, c,verticalLayout) => {
    var s;
    var t;
    function genPathData(s, t, vl) {
        const pth = (vl)? (s[0] + ',' + (s[1] + t[1]) / 2 + ' ' + t[0] + ',' + (s[1] + t[1]) / 2):((s[0] + t[0]) / 2 + ',' + s[1] + ' ' + (s[0] + t[0]) / 2 + ',' + t[1]);
        return ('M' + s[0] + ',' + s[1] + 'C' + pth + ' ' + t[0] + ',' + t[1]);
    };
    if (verticalLayout) {
        s = [p.x + 20, p.y + 55];
        t = [c.x + 20, c.y - 3];
    } else {
        s = [p.x + 43, p.y + 20];
        t = [c.x - 3, c.y + 20];
    }
    var d = genPathData(s, t, verticalLayout);
    return { 'd': d }
}

export const moveNodeBegin = (idx,linkDisplay,dLinks,temp,pos,verticalLayout) => {
    dLinks.forEach(function(d, i) {
        if (d.source.id === parseInt(idx)) {      
            if(!linkDisplay['link-' + d.source.id + '-' + d.target.id]){
                temp.deleted.push(i)
            }
            else if(linkDisplay['link-' + d.source.id + '-' + d.target.id].hidden === true){
                temp.hidden.push(i)
                temp.s.push(i);
                delete linkDisplay['link-' + d.source.id + '-' + d.target.id];
            }else{
                temp.s.push(i);
                delete linkDisplay['link-' + d.source.id + '-' + d.target.id];
            }
        } else if (d.target.id === parseInt(idx)) {
            temp.t = i;
            delete linkDisplay['link-' + d.source.id + '-' + d.target.id];
        }
    });
    const svg = d3.select(`.mp__canvas_svg`);
    d3.select('#node_' + idx).classed('ct-movable', !0);
    svg.on('mousemove.nodemove', ()=>{
        d3.event.stopImmediatePropagation();
        var t = {} ;
        const cSpan = [pos.x, pos.y];
        const cScale = pos.k;
        const svgOff = document.getElementById('mp__canvas_svg').getBoundingClientRect();
        if(verticalLayout){
            t.x = parseFloat((d3.event.x - svgOff.left - cSpan[0]) / cScale - 20)
            t.y = parseFloat((d3.event.y - svgOff.top - cSpan[1]) / cScale + 2)
        }else{
            t.x = parseFloat((d3.event.x - svgOff.left - cSpan[0]) / cScale + 2)
            t.y = parseFloat((d3.event.y - svgOff.top - cSpan[1]) / cScale - 20)
        }
        d3.select('.ct-movable').attr('transform', "translate(" + t.x + "," + t.y + ")");
    })
    return {linkDisplay,temp}
}

export const moveNodeEnd = (pi,dNodes,dLinks,linkDisplay,temp,verticalLayout) => {
    const svg = d3.select(`.mp__canvas_svg`);
    svg.on('mousemove.nodemove', null);
    // svg.on('zoom', null);
    var p = d3.select("#node_" + pi);
    var l = p.attr('transform').slice(10, -1).split(',');
    dNodes[pi].x = parseFloat(l[0]);
    dNodes[pi].y = parseFloat(l[1]);
    var link = addLink(dLinks[temp.t].source, dLinks[temp.t].target,verticalLayout);
    var lid = 'link-' + dLinks[temp.t].source.id + '-' + dLinks[temp.t].target.id
    linkDisplay[lid] = link
    temp.s.forEach(function(d) {
        // if (deletednode_info.indexOf(dLinks[d].target) == -1) {
            var link = addLink(dLinks[d].source, dLinks[d].target,verticalLayout);
            var lid = 'link-' + dLinks[d].source.id + '-' + dLinks[d].target.id
            linkDisplay[lid] = link
            if(temp.hidden.indexOf(d) !== -1){
                linkDisplay[lid].hidden =  true
            }
        //}
    });
    p.classed('ct-movable', !1);
    return {linkDisplay}
};

export const toggleNode = (nid, nodeDisplay, linkDisplay, dNodes, dLinks) => {
    var id = nid.split("node_")[1]
    if (dNodes[id]._children && dNodes[id]._children.length > 0) {
        // p.select('.ct-cRight').classed('ct-nodeBubble', !0);
        dNodes[id].children = dNodes[id]._children;
        dNodes[id]._children = null;
        recurseTogChild(nodeDisplay, linkDisplay, dNodes[id], !1, dLinks);
    }  else  if (dNodes[id].children && dNodes[id].children.length > 0) {
        // p.select('.ct-cRight').classed('ct-nodeBubble', !1);  //d._childern 
        dNodes[id]._children = dNodes[id].children;
        dNodes[id].children = null;
        recurseTogChild(nodeDisplay, linkDisplay, dNodes[id], !0, dLinks);
    } 
    return {dLinks,dNodes,nodeDisplay,linkDisplay}
}


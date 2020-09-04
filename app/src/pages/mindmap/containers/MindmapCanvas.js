import React, { useRef, useEffect, useState, Fragment } from 'react';
import * as d3 from 'd3';
import {v4 as uuid} from 'uuid'
import SearchBox from '../components/SearchBox'
import NavButton from '../components/NavButton'
import Legends from '../components/Legends'
import ControlBox from '../components/Controlbox'
import InputBox from '../components/InputBox' 
import '../styles/MindmapCanvas.scss';

/*Component Canvas
  use: return mindmap on a canvas
*/
var zoom //global var to store zoom
const types = {
    'modules': 112,
    'scenarios': 237,
    'screens': 363,
    'testcases': 488
};
var temp = {
    s: [],
    t: ""
};
var moving = false
const Canvas = (props) => {
    const [sections,setSection] =  useState({})
    const [ctrlBox,setCtrlBox] = useState(false);
    const [inpBox,setInpBox] = useState(false);
    const [ctScale,setCtScale] = useState({})
    const [links,setLinks] = useState({})
    const [nodes,setNodes] = useState({})
    const [dNodes,setdNodes] = useState([])
    const [dLinks,setdLinks] = useState([])
    const [createnew,setCreateNew] =useState(false)
    const CanvasRef = useRef();
    const verticalLayout = false;
    useEffect(() => {
        var tree;
        if(props.module.createnew){
            //create new mindmap
            tree = createNewMap()
            tree.sections = types
            tree.links = {}
            tree.dLinks = []
            if(zoom){
                zoom.scale(1).translate([0,0]).event(d3.select(`.mp__canvas_svg`))
                zoom.on("zoom",null)
            }
            d3.select('.ct-container').attr("transform", "translate(" + tree.translate[0]+','+tree.translate[1] + ")scale(" + 1 + ")");
            setCreateNew(0)
        }else{
            //load mindmap from data
            tree = generateTree(props.module,types)
        }
        d3.select('.ct-container').attr("transform", "translate(" + tree.translate[0]+','+tree.translate[1] + ")scale(" + 1 + ")");
        zoom = bindZoomListner(setCtScale,tree.translate,moving)
        setLinks(tree.links)
        setdLinks(tree.dLinks)
        setNodes(tree.nodes)
        setdNodes(tree.dNodes)
        setCtScale({x:tree.translate[0],y:tree.translate[1],k:1})
        setSection(tree.sections)
    }, [props.module,props.reload]);
    useEffect((e)=>{
        if(createnew !== false){
            var p = d3.select('#node_'+createnew);
            setCreateNew(false)
            setInpBox(p)
        }
    },[createnew])
    const nodeClick=(e)=>{
        e.preventDefault()
        setInpBox(false)
        setCtrlBox(e.target.parentElement.id)
    }
    const clickAdd=(e)=>{
        var res = createNode(e,{...nodes},{...links},[...dNodes],[...dLinks],{...sections})
        setNodes(res.nodeDisplay)
        setLinks(res.linkDisplay)
        setdLinks(res.dLinks)
        setdNodes(res.dNodes)
    }
    const clickCollpase=(e)=>{
        var id = e.target.parentElement.id;
        var res = toggleNode(id,[...dNodes],[...dLinks])
        setdLinks(res.dLinks)
        setdNodes(res.dNodes)
    }
    const moveNode=(e,type)=>{
        var res;
        var id = e.target.parentElement.id.split('node_')[1];
        if(type==='KeyUp'){
            res = moveNodeEnd(id,[...dNodes],[...dLinks],{...links},{...temp})
            setLinks(res.linkDisplay)
            moving = false
        }
        else{
            moving = true
            res = moveNodeBegin(id,{...links},[...dLinks],{...temp},{...ctScale})
            setLinks(res.linkDisplay)
            temp=res.temp
        }
    }
    return (
        <Fragment>
            {(ctrlBox!==false)?<ControlBox nid={ctrlBox} clickAdd={clickAdd} setCtrlBox={setCtrlBox} setInpBox={setInpBox} ctScale={ctScale}/>:null}
            {(inpBox!==false)?<InputBox node={inpBox} dNodes={[...dNodes]} setInpBox={setInpBox} setCtrlBox={setCtrlBox} ctScale={ctScale}/>:null}
            <SearchBox setCtScale={setCtScale} zoom={zoom}/>
            <NavButton/>
            <Legends/>
            <SaveButton/>
            <svg className='mp__canvas_svg' ref={CanvasRef}>
                <g className='ct-container'>
                {Object.entries(links).map((link)=>{
                return(<path id={link[0]} key={link[0]+'_link'} className="ct-link" d={link[1].d}></path>)
                })}
                {Object.entries(nodes).map((node)=>
                    <g id={'node_'+node[0]}   key={node[0]} className="ct-node" data-nodetype={node[1].type} transform={node[1].transform}>
                        <image  onClick={(e)=>nodeClick(e)} style={{height:'40px',width:'40px',opacity:(node[1].state==="created")?0.5:1}} className="ct-nodeIcon" xlinkHref={node[1].img_src}></image>
                        <text className="ct-nodeLabel" textAnchor="middle" x="20" title={node[1].title} y="50">{node[1].name}</text>
                        <title val={node[0]} className="ct-node-title">{node[1].title}</title>
                        {(node[1].type!=='testcases')?
                        <circle onClick={(e)=>clickCollpase(e)} className={"ct-"+node[1].type+" ct-cRight ct-nodeBubble"} cx={verticalLayout ? 20 : 44} cy={verticalLayout ? 55 : 20} r="4"></circle>
                        :null}
                        {(node[1].type!=='modules')?
                        <circle 
                        onMouseUp={(e)=>moveNode(e,'KeyUp')}
                        onMouseDown={(e)=>moveNode(e,'KeyDown')}
                        className={"ct-"+node[1].type+" ct-nodeBubble"} cx="-3" cy="20" r="4"></circle>
                        :null}
                    </g>)}
                </g>
            </svg>
        </Fragment>
    );
}

const moveNodeBegin = (idx,linkDisplay,dLinks,temp,cScale) => {
    // d3.select('#ct-inpAct').classed('no-disp', !0);
    dLinks.forEach(function(d, i) {
        if (d.source.id === parseInt(idx)) {
            temp.s.push(i);
            delete linkDisplay['link-' + d.source.id + '-' + d.target.id];
        } else if (d.target.id === parseInt(idx)) {
            temp.t = i;
            delete linkDisplay['link-' + d.source.id + '-' + d.target.id];
        }
    });
    const svg = d3.select(`.mp__canvas_svg`);
    d3.select('#node_' + idx).classed('ct-movable', !0);
    // var temp = document.getElementsByClassName('mp__canvas_svg')[0].getBBox()
    svg.on('mousemove', (e)=>{
        d3.select('.ct-movable').attr('transform', "translate(" + parseFloat((d3.event.x - 4 ) /cScale.k  - cScale.x) + "," + parseFloat((d3.event.y - 90) / cScale.k - cScale.y)+ ")");
        // [(parseFloat(l[0]) + 40) * ctScale.k + ctScale.x, (parseFloat(l[1]) + 40) * ctScale.k + ctScale.y];
        d3.event.preventDefault();
    })
    // d3.select('.ct-movable').attr('transform', "translate(" + parseFloat((d3.event.x - cScale.x) / cScale.k - 4 ) + "," + parseFloat((d3.event.y - cScale.y) / cScale.k - 90)+ ")");

    return {linkDisplay,temp}
}

const moveNodeEnd = (pi,dNodes,dLinks,linkDisplay,temp) => {
    const svg = d3.select(`.mp__canvas_svg`);
    svg.on('mousemove', null);
    var p = d3.select("#node_" + pi);
    var l = p.attr('transform').slice(10, -1).split(',');
    dNodes[pi].x = parseFloat(l[0]);
    dNodes[pi].y = parseFloat(l[1]);
    var link = addLink(dLinks[temp.t].source, dLinks[temp.t].target,temp.t);
    var lid = 'link-' + dLinks[temp.t].source.id + '-' + dLinks[temp.t].target.id
    // var v = (dNodes[pi].children) ? !1 : !0;
    linkDisplay[lid] = link
    //Issue fixed #374: 'Mindmap - Blank nodes are retained if we delete the connected nodes'
    temp.s.forEach(function(d) {
        // if (deletednode_info.indexOf(dLinks[d].target) == -1) {
            var link = addLink(dLinks[d].source, dLinks[d].target);
            var lid = 'link-' + dLinks[d].source.id + '-' + dLinks[d].target.id
            linkDisplay[lid] = link
            // d3.select('#ct-link-' + d).classed('no-disp', v);
        //}
    });
    p.classed('ct-movable', !1);
    return {linkDisplay}
};

const toggleNode = (nid, dNodes, dLinks) => {
    var p = d3.select('#' + nid);
    var id = nid.split("node_")[1]
    if (dNodes[id].children && dNodes[id].children.length > 0) {
        p.select('.ct-cRight').classed('ct-nodeBubble', !1);
        dNodes[id]._children = dNodes[id].children;
        dNodes[id].children = null;
        recurseTogChild(dNodes[id], !0, dLinks);
    } else if (dNodes[id]._children && dNodes[id]._children.length > 0) {
        p.select('.ct-cRight').classed('ct-nodeBubble', !0);
        dNodes[id].children = dNodes[id]._children;
        dNodes[id]._children = null;
        recurseTogChild(dNodes[id], !1, dLinks);
    }
    return {dLinks,dNodes}
}

const recurseTogChild = (d , v, dLinks) => {
    if (d.children) d.children.forEach(function(e) {
        recurseTogChild(e, v, dLinks);
        d3.select('#node_' + e.id).classed('no-disp', v);
        for (var j = dLinks.length - 1; j >= 0; j--) {
            if (dLinks[j].source.id === d.id) {
                d3.select('#link-' + dLinks[j].source.id + '-' + dLinks[j].target.id).classed('no-disp', v);
            }
        }
    });
    else if (d._children) d._children.forEach(function(e) {
        recurseTogChild(e, !0, dLinks);
        d3.select('#node_' + e.id).classed('no-disp', !0);
        for (var j = dLinks.length - 1; j >= 0; j--) {
            if (dLinks[j].source.id === d.id) {
                d3.select('#link-' + dLinks[j].source.id + '-' + dLinks[j].target.id).classed('no-disp', !0);
            }
        }
    });
};

const createNewMap = (moduleName) => {
    const verticalLayout = false
    var nodeDisplay = {}
    var dNodes = []
    var s = d3.select('.mp__canvas_svg');
    var  cSize= [parseFloat(s.style("width")), parseFloat(s.style("height"))];
    var node = {
        id: 0,
        childIndex: 0,
        name: moduleName?moduleName:'Module_0',
        type: 'modules',
        y: cSize[1] * 0.4,
        x: cSize[0] * 0.1 * 0.9,
        children: [],
        parent: null,
        state: 'created',
        _id: null
    };
    if (verticalLayout) {
        node.y = s[0] * 0.1 * (0.9);
        node.x = s[1] * 0.4;
    };
    dNodes.push(node);
    nodeDisplay[0] = addNode(dNodes[0]);
    var translate = [(cSize[0] / 3) - dNodes[0].x, (cSize[1] / 2) - dNodes[0].y]
    // nodeDisplay[0].task = false;
    return{nodes:nodeDisplay,dNodes,translate}
}

const SaveButton = (props) => {
    return(
        <svg className="ct-actionBox">
            <g id="ct-saveAction" className="ct-actionButton">
                <rect x="0" y="0" rx="12" ry="12" width="80px" height="25px"></rect>
                <text x="23" y="18">Save</text>
            </g>
        </svg>
    )
}

const createNode = (activeNode,nodeDisplay,linkDisplay,dNodes,dLinks,sections) => {
    const obj = undefined
    const verticalLayout =  false
    var uNix = dNodes.length
    // if ($event !== true && (d3.select('#ct-inpBox').attr('class') == "" || d3.select($event.target).classed('ct-ctrl-inactive'))) return;
    // d3.select('#ct-inpBox').classed('no-disp', !0);
    // d3.select('#ct-ctrlBox').classed('no-disp', !0);
    var pi = activeNode;
    var pt = nodeDisplay[pi].type;
    if (pt === 'testcases') return;
    // SaveCreateED('#ct-createAction', 1, 0);
    if (false && nodeDisplay[pi]._children != null)
        return ;// openDialogMindmap('Error', 'Expand the node');
    if (dNodes[pi].children === undefined) dNodes[pi]['children'] = [];
    var nNext = {
        'modules': ['Scenario', 1],
        'scenarios': ['Screen', 2],
        'screens': ['Testcase', 4]
    };
    var mapSvg = d3.select('.mp__canvas_svg');
    var w = parseFloat(mapSvg.style('width'));
    var h = parseFloat(mapSvg.style('height'));
    var arr_co = [];
    dNodes.forEach(function(d) {
        var objj = {
            x: parseInt(d.x),
            y: parseInt(d.y)
        };
        arr_co.push(objj);
    });
    // switch-layout feature
    var tempName;
    if (obj) {
        tempName = obj.name;
    } else {
        tempName = nNext[pt][0] + '_' + nNext[pt][1];
    }
    var node = {
        id: uNix,
        children: [],
        y: h * (0.15 * (1.34 + nNext[pt][1]) + Math.random() * 0.1),
        x: 90 + 30 * Math.floor(Math.random() * (Math.floor((w - 150) / 80))),
        parent: dNodes[pi],
        state: 'created',
        path: '',
        name: tempName,
        childIndex: '',
        type: (nNext[pt][0]).toLowerCase() + 's'
    };
    getNewPosition(dNodes,node, pi, arr_co,verticalLayout,sections);
    dNodes.push(node);
    dNodes[pi].children.push(dNodes[uNix]);
    dNodes[uNix].childIndex = dNodes[pi].children.length;
    dNodes[uNix].cidxch = 'true'; // child index updated
    var currentNode = addNode(dNodes[uNix]);
    var link = {
        id: uuid(),
        source: dNodes[pi],
        target: dNodes[uNix]
    };
    var lid = 'link-' + link.source.id + '-' + link.target.id
    dLinks.push(link);
    var currentLink = addLink(dNodes[pi], dNodes[uNix]);
    nodeDisplay[uNix] = currentNode;
    linkDisplay[lid] = currentLink;
    return {nodeDisplay,linkDisplay,dNodes,dLinks}

        //By default when a node is created it's name should be in ediatable mode
        // CreateEditFlag = true;
        // if (obj);
        // else {
        //     setTimeout(function() { $scope.editNode(true, node); }, 100);
        // }

}

const getNewPosition = (dNodes,node, pi, arr_co ,layout_vertical,sections) => {
    // Switch_layout functionality
    // **NOTE**
    //dNodes[pi].children are arranged in increasing
    // order of x/y disance depending on layout
    var index;
    var new_one;
    if (dNodes[pi].children.length > 0) { // new node has siblings
        index = dNodes[pi].children.length - 1;
        if (layout_vertical)
            new_one = {
                x: parseInt(dNodes[pi].children[index].x) + 100,
                y: sections[node.type]
            }; // Go beside last sibling node
        else
            new_one = {
                x: sections[node.type],
                y: parseInt(dNodes[pi].children[index].y + 80)
            };
        node = getNonOverlappingPosition(node, arr_co, new_one,layout_vertical);

    } else { //first kid of any node
        if (dNodes[pi].parent != null) { //if kid of scenario/testcase/screen
            // var arr = dNodes[pi].parent.children;
            index = dNodes[pi].parent.children.length - 1; //number of parents siblings - 1
            //new_one={x:parseInt(arr[index].x),y:parseInt(arr[index].y)+125};

            if (layout_vertical) {
                new_one = {
                    x: parseInt(dNodes[pi].x),
                    y: parseInt(sections[node.type])
                }; // go directly below parent
            } else {
                new_one = {
                    x: parseInt(sections[node.type]),
                    y: parseInt(dNodes[pi].y)
                }; // go directly below parent
            }
            node = getNonOverlappingPosition(node, arr_co, new_one,layout_vertical);

        } else { //Module's kid
            //layout_change
            if (layout_vertical) {
                node.x = parseInt(dNodes[pi].x);
                node.y = parseInt(sections[node.type]);
            } else {
                node.y = parseInt(dNodes[pi].y);
                node.x = parseInt(sections[node.type]);
            }
        }

    }
    return node;
}

const getNonOverlappingPosition = (node, arr_co, new_one,verticalLayout) => {
    var dist = 0;
    dist = closestCord(arr_co, new_one);
    while (dist < 60) {
        if (verticalLayout) {
            new_one.x = new_one.x + 80;
        } else {
            new_one.y = new_one.y + 80;
        }
        dist = closestCord(arr_co, new_one);
    }
    node.x = new_one.x;
    node.y = new_one.y;
    return node;
}

function closestCord(arr_co, new_one) {
    var dmin = 1000;
    for (var i = 0; i < arr_co.length; i++) {
        var a = new_one.x - arr_co[i].x;
        var b = new_one.y - arr_co[i].y;
        var c = Math.sqrt(a * a + b * b);
        if (c < dmin)
            dmin = c;
    }
    return dmin;
}

const bindZoomListner = (setCtScale,translate) => {
    const svg = d3.select(`.mp__canvas_svg`);
    const g = d3.select(`.ct-container`);
    const zoom  = d3.behavior.zoom()
        .scaleExtent([0.1, 3])
        .on('zoom', () => {
            if(!moving){
                g.attr('transform', `translate(${d3.event.translate}) scale(${d3.event.scale})`);
                var cScale = d3.event.translate;
                setCtScale({x:cScale[0],y:cScale[1],k:d3.event.scale})
            }
        })
    if(translate)zoom.scale(1).translate([translate[0],translate[1]])
    svg.call(zoom)
    return zoom
}

const generateTree = (tree,sections) =>{
    var nodeDisplay = {}
    var linkDisplay = {}
    var verticalLayout = false;
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
    // var d3Tree = d3.tree().size([newHeight * 2, cSize[0]])
    var d3Tree = d3.layout.tree().size([newHeight * 2, cSize[0]]);
    // const treeRoot = d3.hierarchy(tree)
    // d3Tree(treeRoot)
    // treeRoot.sort(function(a, b) {
    //     return a.data.childIndex - b.data.childIndex;
    // });  
    // const dNodes = treeRoot.descendants()
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
        var node = addNode(d);
        nodeDisplay[d.id] = node
        nodeDisplay[d.id].task = false;
    })
    // const dLinks = treeRoot.links()
    dLinks.forEach(function(d) {
        d.id = uuid();
        var lid = 'link-' + d.source.id + '-' + d.target.id
        var link = addLink(d.source, d.target);
        linkDisplay[lid] = link
    });               
    var translate = [(cSize[0] / 3) - dNodes[0].x, (cSize[1] / 2) - dNodes[0].y]
    return {nodes:nodeDisplay,links:linkDisplay,translate:translate,dNodes,dLinks,sections}
}

const addNode = (n) =>{
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
        'name': n.display_name,
        'img_src': img_src,
        '_id': n._id || null,
        'state':n.state || "created",
        'reuse':n.reuse || false
    };
   
    return nodeDisplay;
}

const addLink = (p, c) => {
    const verticalLayout = false
    var s;
    var t;
    function genPathData(s, t) {
        return ('M' + s[0] + ',' + s[1] + 'C' + (s[0] + t[0]) / 2 + ',' + s[1] + ' ' + (s[0] + t[0]) / 2 + ',' + t[1] + ' ' + t[0] + ',' + t[1]);
    };
    if (verticalLayout) {
        s = [p.x + 20, p.y + 55];
        t = [c.x + 20, c.y - 3];
    } else {
        s = [p.x + 43, p.y + 20];
        t = [c.x - 3, c.y + 20];
    }
    var d = genPathData(s, t);
    return { 'd': d }
}

export default Canvas;
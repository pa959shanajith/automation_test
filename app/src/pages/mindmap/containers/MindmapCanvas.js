import React, { useRef, useEffect, useState, Fragment } from 'react';
import * as d3 from 'd3';
import {v4 as uuid} from 'uuid'
import SearchBox from '../components/SearchBox'
import NavButton from '../components/NavButton'
import Legends from '../components/Legends'
import ControlBox from '../components/Controlbox'
import InputBox from '../components/InputBox' 
import MultiNodeBox from '../components/MultiNodeBox'
import RectangleBox from '../components/RectangleBox'
import SaveMapButton from '../components/SaveMapButton'
import { ScreenOverlay, PopupMsg } from '../../global';
import { useDispatch, useSelector} from 'react-redux';
import * as actionTypes from '../state/action';
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
var count;
var temp = {
    s: [],
    hidden:[],
    deleted:[],
    t: ""
};
var deletednode_info =[]
var nodeMoving = false;

const Canvas = (props) => {
    const dispatch = useDispatch()
    const copyNodes = useSelector(state=>state.mindmap.copyNodes)
    const selectBox = useSelector(state=>state.mindmap.selectBoxState)
    const deletedNodes = useSelector(state=>state.mindmap.deletedNodes)
    const [sections,setSection] =  useState({})
    const [ctrlBox,setCtrlBox] = useState(false);
    const [inpBox,setInpBox] = useState(false);
    const [multipleNode,setMultipleNode] = useState(false)
    const [ctScale,setCtScale] = useState({})
    const [links,setLinks] = useState({})
    const [nodes,setNodes] = useState({})
    const [dNodes,setdNodes] = useState([])
    const [dLinks,setdLinks] = useState([])
    const [createnew,setCreateNew] = useState(false)
    const [verticalLayout,setVerticalLayout] = useState(false)
    const setPopup=props.setPopup
    const setBlockui=props.setBlockui
    const CanvasRef = useRef();
    useEffect(() => {
        var tree;
        count = {
            'modules': 0,
            'scenarios': 0,
            'screens': 0,
            'testcases': 0
        }
        if (props.module.createnew && verticalLayout===props.verticalLayout ) {
            // On Click of Create new button. No tree to be loaded
            //create new mindmap
            tree = createNewMap(props.verticalLayout)
            tree.sections = types
            tree.links = {}
            tree.dLinks = []
            if(zoom){
                zoom.scale(1).translate([0,0]).event(d3.select(`.mp__canvas_svg`))
                zoom.on("zoom",null)
            }
            count['modules'] = 1
            setCreateNew(0)
        } else {
            // To load an existing module. Tree has to be loaded. Possible places, module box / switch layout.
            var tree = props.module
            if(verticalLayout!=props.verticalLayout && dNodes.length>0){
                tree = dNodes[0]
            }
            //load mindmap from data
            tree = generateTree(tree,types,{...count},props.verticalLayout)
            count= {...count,...tree.count}
        }
        d3.select('.ct-container').attr("transform", "translate(" + tree.translate[0]+','+tree.translate[1] + ")scale(" + 1 + ")");
        zoom = bindZoomListner(setCtScale,tree.translate,ctScale)
        setLinks(tree.links)
        setdLinks(tree.dLinks)
        setNodes(tree.nodes)
        setdNodes(tree.dNodes)
        setCtScale({x:tree.translate[0],y:tree.translate[1],k:1})
        setSection(tree.sections)
        setVerticalLayout(props.verticalLayout);
        setBlockui({show:false})
    }, [props.module,props.reload,props.verticalLayout]);
    useEffect((e)=>{
        if(createnew !== false){
            var p = d3.select('#node_'+createnew);
            setCreateNew(false)
            setInpBox(p)
        }
    },[createnew])
    const nodeClick=(e)=>{
        e.stopPropagation()
        if(d3.select('#pasteImg').classed('active-map')){
            var res = pasteNode(e.target.parentElement.id,{...copyNodes},{...nodes},{...links},[...dNodes],[...dLinks],{...sections},{...count},setPopup,verticalLayout)
            if(res){
                setNodes(res.cnodes)
                setLinks(res.clinks)
                setdLinks(res.cdLinks)
                setdNodes(res.cdNodes)
                count = res.count
            }
        }else{
            setInpBox(false)
            setCtrlBox(e.target.parentElement.id)
        }
    }
    const createMultipleNode = (e,mnode)=>{
        setMultipleNode(false)
        if (mnode.length === 0){
            setPopup({show:true,title:'Failure',content:'No nodes to create',submitText:'Ok'})
            return;
        }
        setBlockui({show:true,content:'Creating Nodes...'})
        var cnodes = {...nodes}
        var clinks = {...links}
        var cdNodes = [...dNodes]
        var cdLinks = [...dLinks]
        var csections = {...sections}
        mnode.forEach((name)=>{
            var res = createNode(e,cnodes,clinks,cdNodes,cdLinks,csections,{...count},name,verticalLayout)
            cnodes = res.nodeDisplay
            clinks = res.linkDisplay
            cdNodes = res.dNodes
            cdLinks = res.dLinks
            count= {...count,...res.count}
        })
        setNodes(cnodes)
        setLinks(clinks)
        setdLinks(cdLinks)
        setdNodes(cdNodes)
        setBlockui({show:false})
        setPopup({show:true,title:'Success',content:'Nodes created successfully!',submitText:'Ok'})

    }
    const clickAddNode=(e)=>{
        var res = createNode(e,{...nodes},{...links},[...dNodes],[...dLinks],{...sections},{...count},undefined,verticalLayout)
        setCreateNew(res.dNodes.length-1)
        setNodes(res.nodeDisplay)
        setLinks(res.linkDisplay)
        setdLinks(res.dLinks)
        setdNodes(res.dNodes)
        count= {...count,...res.count}
    }
    const clickDeleteNode=(id)=>{
        var res = deleteNode(id,[...dNodes],[...dLinks],{...links},{...nodes},setPopup)
        if(res){
            dispatch({type:actionTypes.UPDATE_DELETENODES,payload:[...deletedNodes,...res.deletedNodes]})
            setNodes(res.nodeDisplay)
            setLinks(res.linkDisplay)
            setdLinks(res.dLinks)
            setdNodes(res.dNodes)
        }
    }
    const clickCollpase=(e)=>{
        var id = e.target.parentElement.id;
        var res = toggleNode(id,{...nodes},{...links},[...dNodes],[...dLinks])
        setNodes(res.nodeDisplay)
        setLinks(res.linkDisplay)
        setdLinks(res.dLinks)
        setdNodes(res.dNodes)
    }
    const moveNode=(e,type)=>{
        var res;
        var id = e.target.parentElement.id.split('node_')[1];
        if(type==='KeyUp'){
            res = moveNodeEnd(id,[...dNodes],[...dLinks],{...links},{...temp},verticalLayout)
            setLinks(res.linkDisplay)
            nodeMoving = false
            temp = {
                s: [],
                hidden:[],
                deleted:[],
                t: ""
            };
        }
        else{
            nodeMoving = true
            res = moveNodeBegin(id,{...links},[...dLinks],{...temp},{...ctScale},verticalLayout)
            setLinks(res.linkDisplay)
            temp={...temp,...res.temp}
        }
    }
    return (
        <Fragment>
            {(selectBox)?<RectangleBox ctScale={ctScale} dNodes={[...dNodes]} dLinks={[...dLinks]}/>:null}
            {(ctrlBox !== false)?<ControlBox nid={ctrlBox} setMultipleNode={setMultipleNode} clickAddNode={clickAddNode} clickDeleteNode={clickDeleteNode} setCtrlBox={setCtrlBox} setInpBox={setInpBox} ctScale={ctScale}/>:null}
            {(inpBox !== false)?<InputBox setPopup={setPopup} node={inpBox} dNodes={[...dNodes]} setInpBox={setInpBox} setCtrlBox={setCtrlBox} ctScale={ctScale} />:null}
            {(multipleNode !== false)?<MultiNodeBox count={count} node={multipleNode} setMultipleNode={setMultipleNode} createMultipleNode={createMultipleNode}/>:null}
            <SearchBox setCtScale={setCtScale} zoom={zoom}/>
            <NavButton setCtScale={setCtScale} zoom={zoom}/>
            <Legends/>
            <SaveMapButton dNodes={[...dNodes]} setPopup={setPopup} setBlockui={setBlockui}/>
            <svg id="mp__canvas_svg" className='mp__canvas_svg' ref={CanvasRef}>
                <g className='ct-container'>
                {Object.entries(links).map((link)=>{
                return(<path id={link[0]} key={link[0]+'_link'} className={"ct-link"+(link[1].hidden?" no-disp":"")} d={link[1].d}></path>)
                })}
                {Object.entries(nodes).map((node)=>
                    <g id={'node_'+node[0]} key={node[0]} className={"ct-node"+(node[1].hidden?" no-disp":"")} data-nodetype={node[1].type} transform={node[1].transform}>
                        <image  onClick={(e)=>nodeClick(e)} style={{height:'40px',width:'40px',opacity:(node[1].state==="created")?0.5:1}} className="ct-nodeIcon" xlinkHref={node[1].img_src}></image>
                        <text className="ct-nodeLabel" textAnchor="middle" x="20" title={node[1].title} y="50">{node[1].name}</text>
                        <title val={node[0]} className="ct-node-title">{node[1].title}</title>
                        {(node[1].type!=='testcases')?
                        <circle onClick={(e)=>clickCollpase(e)} className={"ct-"+node[1].type+" ct-cRight"+(!dNodes[node[0]]._children?" ct-nodeBubble":"")} cx={verticalLayout ? 20 : 44} cy={verticalLayout ? 55 : 20} r="4"></circle>
                        :null}
                        {(node[1].type!=='modules')?
                        <circle 
                        onMouseUp={(e)=>moveNode(e,'KeyUp')}
                        onMouseDown={(e)=>moveNode(e,'KeyDown')}
                        cx={verticalLayout ? 20 : -3} cy={verticalLayout ? -4 : 20}
                        className={"ct-"+node[1].type+" ct-nodeBubble"} r="4"></circle>
                        :null}
                    </g>)}
                </g>
            </svg>
        </Fragment>
    );
}


const deleteNode = (activeNode,dNodes,dLinks,linkDisplay,nodeDisplay,setPopup) =>{
    var deletedNodes = []
    var sid = activeNode.split('node_')[1]
    var s = d3.select('#'+activeNode);
    // SaveCreateED('#ct-createAction', 1, 0);
    var t = s.attr('data-nodetype');
    if (t == 'modules') return;
    var p = dNodes[sid].parent;
    if(dNodes[sid]['taskexists']!=null){
        setPopup({show:true,title:'Error',content:'Cannot delete node if task is assigned. Please unassign task first.',submitText:'Ok'})
        return; 
    }
    var taskCheck=checkparenttask(dNodes[sid],false);
    if(taskCheck){
        setPopup({show:true,title:'Error',content:'Cannot delete node if parent task is assigned. Please unassign task first.',submitText:'Ok'})
        return;
    }
    taskCheck=checkchildrentask(dNodes[sid],false);
    if(taskCheck){
        setPopup({show:true,title:'Error',content:'Cannot delete node if children task is assigned. Please unassign task first.',submitText:'Ok'})
        return;
    }
    recurseDelChild(dNodes[sid],linkDisplay, nodeDisplay,dNodes,dLinks,undefined,deletedNodes);
    for (var j = dLinks.length - 1; j >= 0; j--) {
        if (dLinks[j].target.id == sid){
            dLinks[j].deleted = !0;
            delete linkDisplay['link-' + dLinks[j].source.id + '-' + dLinks[j].target.id];
            break;
        }
    }
    p.children.some((d, i)=>{
        if (d.id == sid) {
            p.children.splice(i, 1);
            return !0;
        }
        return !1;
    });
    return {dNodes,dLinks,linkDisplay,nodeDisplay,deletedNodes}
}

const recurseDelChild = (d, linkDisplay, nodeDisplay, dNodes, dLinks, tab , deletedNodes) =>{
    if (d.children) d.children.forEach((e)=>{recurseDelChild(e, linkDisplay, nodeDisplay, dNodes, dLinks, tab, deletedNodes)});
    if(d.state=="deleted")return;
    if(d._id){  
        var parentid=dNodes[d.parent.id]._id;
        deletedNodes.push([d._id,d.type,parentid]);
    }
    d.parent = null;
    d.children = null;
    d.task = null;
    delete nodeDisplay[d.id];
    deletednode_info.push(d);
    dNodes[d.id].state = 'deleted';
    var temp = dLinks;
    for (var j = temp.length - 1; j >= 0; j--) {
        if (temp[j].source.id == d.id) {
            delete linkDisplay['link-' + temp[j].source.id + '-' + temp[j].target.id];
            temp[j].deleted = !0;
        }
    }
};

const checkchildrentask = (childNode,children_flag)=>{
    if(children_flag) return children_flag;
    if (childNode.taskexists != null) {
        children_flag=true;
        return children_flag;
    }
    if (childNode.children) {
        childNode.children.forEach((e)=>{children_flag=checkchildrentask(e, children_flag)})
    }
    return children_flag;
}

const checkparenttask = (parentNode,parent_flag)=>{
    if (parent_flag) return parent_flag;
    if(parentNode!=null){
        if (parentNode.taskexists!=null) {
            parent_flag=true;
        }
        parentNode=parentNode.parent || null;
        parent_flag=checkparenttask(parentNode,parent_flag);
    }
    return parent_flag;
}

const pasteNode = (activeNode,copyNodes,cnodes,clinks,cdNodes,cdLinks,csections,count,setPopup,verticalLayout) => {
    var dNodes_c = copyNodes.nodes
    var dLinks_c = copyNodes.links
    var nodetype =  d3.select('.node-selected').attr('data-nodetype');
    if (d3.select('#'+activeNode).attr('data-nodetype') === nodetype) {
        if (nodetype === 'scenarios') {
            activeNode = activeNode.split("node_")[1]
            //paste to scenarios
            dNodes_c.forEach((e) =>{
                if (e.type == 'screens') {
                    var res = createNode(activeNode,cnodes,clinks,cdNodes,cdLinks,csections,count,e.name,verticalLayout)
                    cnodes = res.nodeDisplay
                    clinks = res.linkDisplay
                    cdNodes = res.dNodes
                    cdLinks = res.dLinks
                    count= {...count,...res.count}
                    activeNode = cdNodes.length-1
                    dLinks_c.forEach((f)=>{
                        if (f.source.id == e.id) {
                            var res = createNode(activeNode,cnodes,clinks,cdNodes,cdLinks,csections,count,f.target.name,verticalLayout)
                            cnodes = res.nodeDisplay
                            clinks = res.linkDisplay
                            cdNodes = res.dNodes
                            cdLinks = res.dLinks
                            count= {...count,...res.count}
                        }
                    })
                }
            });
        }else if(nodetype === 'modules'){
            var activenode_scr;
            //paste to module
            //call $scope.createNode for each node
            dNodes_c.forEach((e)=> {
                if (e.type == 'scenarios') {
                    activeNode = 0;
                    var res = createNode(activeNode,cnodes,clinks,cdNodes,cdLinks,csections,count,e.name,verticalLayout)
                    cnodes = res.nodeDisplay
                    clinks = res.linkDisplay
                    cdNodes = res.dNodes
                    cdLinks = res.dLinks
                    count= {...count,...res.count}
                    activeNode = cdNodes.length-1;
                    activenode_scr = activeNode;
                    dLinks_c.forEach((f) =>{
                        if (f.source.id == e.id && f.target.type == 'screens') {
                            activeNode = activenode_scr;
                            var res = createNode(activeNode,cnodes,clinks,cdNodes,cdLinks,csections,count,f.target.name,verticalLayout)
                            cnodes = res.nodeDisplay
                            clinks = res.linkDisplay
                            cdNodes = res.dNodes
                            cdLinks = res.dLinks
                            count= {...count,...res.count}
                            activeNode = cdNodes.length-1;
                            dLinks_c.forEach(function(g, k) {
                                if (g.source.id == f.target.id && g.source.type == 'screens') {
                                    var res = createNode(activeNode,cnodes,clinks,cdNodes,cdLinks,csections,count,g.target.name,verticalLayout)
                                    cnodes = res.nodeDisplay
                                    clinks = res.linkDisplay
                                    cdNodes = res.dNodes
                                    cdLinks = res.dLinks
                                    count= {...count,...res.count}
                                }
                            });
                        }
                    })
                }

            });
        }
    }
    else if (d3.select('.node-selected').attr('data-nodetype') === 'scenarios') {
        setPopup({
            title:'Error',
            content: 'Please select a Scenario to paste to..',
            submitText:'Ok',
            show:true
        })
        return false
    } else if(d3.select('.node-selected').attr('data-nodetype') === 'modules') {
        setPopup({
            title:'Error',
            content: 'Please select a Module to paste to..',
            submitText:'Ok',
            show:true
        })
        return false
    }
    return {cnodes,clinks,cdNodes,cdLinks,csections,count};
}

const moveNodeBegin = (idx,linkDisplay,dLinks,temp,pos,verticalLayout) => {
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

const moveNodeEnd = (pi,dNodes,dLinks,linkDisplay,temp,verticalLayout) => {
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
            if(temp.hidden.indexOf(d) != -1){
                linkDisplay[lid].hidden =  true
            }
        //}
    });
    p.classed('ct-movable', !1);
    return {linkDisplay}
};

const toggleNode = (nid, nodeDisplay, linkDisplay, dNodes, dLinks) => {
    var p = d3.select('#' + nid);
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

const createNewMap = (verticalLayout) => {
    var nodeDisplay = {}
    var dNodes = []
    var s = d3.select('.mp__canvas_svg');
    var  cSize= [parseFloat(s.style("width")), parseFloat(s.style("height"))];
    var node = {
        id: 0,
        childIndex: 0,
        name: 'Module_0',
        type: 'modules',
        y: cSize[1] * 0.4,
        x: cSize[0] * 0.1 * 0.9,
        children: [],
        parent: null,
        state: 'created',
        _id: null
    };
    if (verticalLayout) {
        node.y = cSize[1] * 0.1 * (0.9);
        node.x = cSize[0] * 0.4;
    };
    dNodes.push(node);
    nodeDisplay[0] = addNode(dNodes[0]);
    // nodeDisplay[0].task = false;
    if (verticalLayout){
        var translate = [(cSize[0] / 2) - dNodes[0].x, (cSize[1] / 5) - dNodes[0].y]
    }
    else{
        var translate = [(cSize[0] / 3) - dNodes[0].x, (cSize[1] / 2) - dNodes[0].y]
    }
    return{nodes:nodeDisplay,dNodes,translate}
}



const createNode = (activeNode,nodeDisplay,linkDisplay,dNodes,dLinks,sections,count,obj,verticalLayout) => {
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
        if(d.state !== 'deleted'){
            var objj = {
                x: parseInt(d.x),
                y: parseInt(d.y)
            };
            arr_co.push(objj);
        }
    });
    count[(nNext[pt][0]).toLowerCase() + 's'] += 1
    var tempName;
    if (obj) {
        tempName = obj;
    } else {
        tempName = nNext[pt][0]+'_'+count[(nNext[pt][0]).toLowerCase() + 's'];
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
    var currentLink = addLink(dNodes[pi], dNodes[uNix],verticalLayout);
    nodeDisplay[uNix] = currentNode;
    linkDisplay[lid] = currentLink;
    return {nodeDisplay,linkDisplay,dNodes,dLinks,count}

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
    //need global move
    const svg = d3.select(`.mp__canvas_svg`);
    const g = d3.select(`.ct-container`);
    const zoom  = d3.behavior.zoom()
        .scaleExtent([0.1, 3])
        .on('zoom', () => {
            if(!nodeMoving) {
                g.attr('transform', `translate(${d3.event.translate}) scale(${d3.event.scale})`);
                var cScale = d3.event.translate;
                setCtScale({x:cScale[0],y:cScale[1],k:d3.event.scale})
            } else {
                const x = g.attr("transform").split(/[()]/)[1].split(',')[0];
                const y = g.attr("transform").split(/[()]/)[1].split(',')[1];
                const scale = g.attr("transform").split(/[()]/)[3];
                // const pos = g.attr("transform");
                zoom.scale(scale).translate([x,y]);
            }
        })
    if(translate) zoom.scale(1).translate([translate[0],translate[1]])
    svg.call(zoom)
    return zoom
}

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

const generateTree = (tree,sections,count,verticalLayout) =>{
    // var old = {...tree}
    unfoldtree(tree)
    // d3.selectAll('.ct-node').classed('no-disp', !1).select('.ct-cRight').classed('ct-nodeBubble', !0); 
    // d3.selectAll('.ct-link').classed('no-disp', !1)
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
        var translate = [(cSize[0] / 2) - dNodes[0].x, (cSize[1] / 5) - dNodes[0].y]
    } else{
        var translate = [(cSize[0] / 3) - dNodes[0].x, (cSize[1] / 2) - dNodes[0].y]
    }
    foldtree(tree)
    return {nodes:nodeDisplay,links:linkDisplay,translate:translate,dNodes,dLinks,sections,count}
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
        'hidden': false,
        'name': n.display_name,
        'img_src': img_src,
        '_id': n._id || null,
        'state':n.state || "created",
        'reuse':n.reuse || false
    };
   
    return nodeDisplay;
}

const addLink = (p, c,verticalLayout) => {
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

export default Canvas;
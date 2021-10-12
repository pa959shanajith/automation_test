import React, { useRef, useEffect, useState, Fragment } from 'react';
import * as d3 from 'd3';
import SearchBox from '../components/SearchBox'
import NavButton from '../components/NavButton'
import Legends from '../components/Legends'
import ControlBox from '../components/Controlbox'
import InputBox from '../components/InputBox' 
import MultiNodeBox from '../components/MultiNodeBox'
import RectangleBox from '../components/RectangleBox'
import SaveMapButton from '../components/SaveMapButton'
import ExportMapButton from '../components/ExportMapButton'
import {Messages as MSG, setMsg} from '../../global'
import { useDispatch, useSelector} from 'react-redux';
import {generateTree,toggleNode,moveNodeBegin,moveNodeEnd,createNode,deleteNode,createNewMap} from './MindmapUtils'
import * as actionTypes from '../state/action';
import '../styles/MindmapCanvas.scss';

/*Component Canvas
  use: return mindmap on a canvas
*/
var zoom //global var to store zoom
const types = {
    'modules': 112,
    'scenarios': 237,
    'screens': 362,
    'testcases': 487
};
var count;
var temp = {
    s: [],
    hidden:[],
    deleted:[],
    t: ""
};
var nodeMoving = false;
export var readCtScale

const CanvasNew = (props) => {
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
    const setBlockui=props.setBlockui
    const displayError = props.displayError
    const CanvasRef = useRef();
    readCtScale = () => ctScale

    useEffect(()=>{
        //useEffect to clear redux data selected module on unmount
        return ()=>{
            dispatch({type:actionTypes.SELECT_MODULE,payload:{}})
        }
    },[dispatch])
    useEffect(() => {
        var tree;
        count = {
            'modules': 0,
            'scenarios': 0,
            'screens': 0,
            'testcases': 0
        }
        if (props.module.createnew && verticalLayout===props.verticalLayout) {
            if(props.module.importData){
                var typeo;
                var typen;
                var activeNode=0;
                //setBlockui({show:true,content:'Creating Nodes...'})
                props.module.importData.data.forEach((e,i)=>{
                    if (i === 0) {
                        tree = createNewMap(props.verticalLayout,undefined,e.name,types)
                        tree.links = {}
                        tree.dLinks = []
                        count['modules'] = 1
                        typeo = 1;
                    }else {
                        typen = e.type;
                        if (typen > typeo) {
                            activeNode = tree.dNodes.length - 1;
                        } else if (typen < typeo) {
                            var lvl = typeo - typen;
                            if (lvl === 1) {
                                activeNode = tree.dNodes[tree.dNodes.length - 1].parent.parent.id;
                            }
                            if (lvl === 2) {
                                activeNode = tree.dNodes[tree.dNodes.length - 1].parent.parent.parent.id;
                            }
                        }
                        var res = createNode(activeNode,{...tree.nodes},{...tree.links},[...tree.dNodes],[...tree.dLinks],{...tree.sections},{...count},e.name,verticalLayout)
                        tree.links = res.linkDisplay
                        tree.dLinks = res.dLinks
                        tree.nodes = res.nodeDisplay
                        tree.dNodes = res.dNodes
                        count= {...count,...res.count}
                        typeo = typen;
                    }
                })
                if(props.module.importData.createdby==='pd'|| props.module.importData.createdby==='sel')setCreateNew('save')
            }else{
                //create new mindmap
                tree = createNewMap(props.verticalLayout,undefined,undefined,types)
                tree.links = {}
                tree.dLinks = []
                if(zoom){
                    zoom.scale(1).translate([0,0]).event(d3.select(`.mp__canvas_svg`))
                    zoom.on("zoom",null)
                }
                count['modules'] = 1
                setCreateNew(0)
            }
        } else {
            // To load an existing module. Tree has to be loaded. Possible places, module box / switch layout.
            tree = props.module
            if(verticalLayout !== props.verticalLayout && dNodes.length > 0){
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
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [props.module,props.reload,props.verticalLayout]);
    useEffect(()=>{
        if(createnew === 'save'){
            setCreateNew(false)
        }
        else if(createnew !== false){
            var p = d3.select('#node_'+createnew);
            setCreateNew(false)
            setInpBox(p)
        }
       // eslint-disable-next-line react-hooks/exhaustive-deps
    },[createnew])
    const nodeClick=(e)=>{
        e.stopPropagation()
        if(d3.select('#pasteImg').classed('active-map')){
            var res = pasteNode(e.target.parentElement.id,{...copyNodes},{...nodes},{...links},[...dNodes],[...dLinks],{...sections},{...count},verticalLayout)
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
            displayError(MSG.MINDMAP.ERR_NO_NODES_CREATE);
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
        displayError(MSG.MINDMAP.SUCC_NODE_CREATE);
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
        var res = deleteNode(id,[...dNodes],[...dLinks],{...links},{...nodes})
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
            res = moveNodeBegin(id,{...links},[...dLinks],{...temp},{...ctScale},verticalLayout,'createnew')
            setLinks(res.linkDisplay)
            temp={...temp,...res.temp}
        }
    }
    return (
        <Fragment>
            {(selectBox)?<RectangleBox ctScale={ctScale} dNodes={[...dNodes]} dLinks={[...dLinks]}/>:null}
            {(ctrlBox !== false)?<ControlBox nid={ctrlBox} setMultipleNode={setMultipleNode} clickAddNode={clickAddNode} clickDeleteNode={clickDeleteNode} setCtrlBox={setCtrlBox} setInpBox={setInpBox} ctScale={ctScale}/>:null}
            {(inpBox !== false)?<InputBox setCtScale={setCtScale} zoom={zoom} node={inpBox} dNodes={[...dNodes]} setInpBox={setInpBox} setCtrlBox={setCtrlBox} ctScale={ctScale} />:null}
            {(multipleNode !== false)?<MultiNodeBox count={count} node={multipleNode} setMultipleNode={setMultipleNode} createMultipleNode={createMultipleNode}/>:null}
            <SearchBox setCtScale={setCtScale} zoom={zoom}/>
            <NavButton setCtScale={setCtScale} zoom={zoom}/>
            <Legends/>
            <SaveMapButton createnew={createnew} verticalLayout={verticalLayout} dNodes={[...dNodes]} setBlockui={setBlockui}/>
            <ExportMapButton setBlockui={setBlockui} displayError={displayError}/>
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

const pasteNode = (activeNode,copyNodes,cnodes,clinks,cdNodes,cdLinks,csections,count,verticalLayout) => {
    var dNodes_c = copyNodes.nodes
    var dLinks_c = copyNodes.links
    var nodetype =  d3.select('.node-selected').attr('data-nodetype');
    if (d3.select('#'+activeNode).attr('data-nodetype') === nodetype) {
        if (nodetype === 'scenarios') {
            activeNode = activeNode.split("node_")[1]
            //paste to scenarios
            dNodes_c.forEach((e) =>{
                if (e.type === 'screens') {
                    var res = createNode(activeNode,cnodes,clinks,cdNodes,cdLinks,csections,count,e.name,verticalLayout)
                    if(res){                    cnodes = res.nodeDisplay
                        clinks = res.linkDisplay
                        cdNodes = res.dNodes
                        cdLinks = res.dLinks
                        count= {...count,...res.count}
                    }
                    var LinkactiveNode = cdNodes.length-1
                    dLinks_c.forEach((f)=>{
                        if (f.source.id === e.id) {
                            var res = createNode(LinkactiveNode,cnodes,clinks,cdNodes,cdLinks,csections,count,f.target.name,verticalLayout)
                            if(res){
                                cnodes = res.nodeDisplay
                                clinks = res.linkDisplay
                                cdNodes = res.dNodes
                                cdLinks = res.dLinks
                                count= {...count,...res.count}
                            }
                        }
                    })
                }
            });
        }else if(nodetype === 'modules'){
            var activenode_scr;
            //paste to module
            //call $scope.createNode for each node
            dNodes_c.forEach((e)=> {
                if (e.type === 'scenarios') {
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
                        if (f.source.id === e.id && f.target.type === 'screens') {
                            activeNode = activenode_scr;
                            var res = createNode(activeNode,cnodes,clinks,cdNodes,cdLinks,csections,count,f.target.name,verticalLayout)
                            cnodes = res.nodeDisplay
                            clinks = res.linkDisplay
                            cdNodes = res.dNodes
                            cdLinks = res.dLinks
                            count= {...count,...res.count}
                            activeNode = cdNodes.length-1;
                            dLinks_c.forEach(function(g, k) {
                                if (g.source.id === f.target.id && g.source.type === 'screens') {
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
        setMsg(MSG.MINDMAP.WARN_SELECT_SCENARIO_PASTE)
        return false
    } else if(d3.select('.node-selected').attr('data-nodetype') === 'modules') {
        setMsg(MSG.MINDMAP.WARN_SELECT_MODULE_PASTE)
        return false
    }
    return {cnodes,clinks,cdNodes,cdLinks,csections,count};
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

export default CanvasNew;
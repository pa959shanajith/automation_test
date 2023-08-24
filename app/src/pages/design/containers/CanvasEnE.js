import React, { useRef, useEffect, useState, Fragment } from 'react';
import * as d3 from 'd3';
import SearchBox from '../components/SearchBox'
import NavButton from '../components/NavButton'
import ControlBox from '../components/ControlBox'
import InputBox from '../components/InputBox' 
import SaveMapButton from '../components/SaveMapButton'
import { useDispatch, useSelector} from 'react-redux';
import {Messages as MSG, setMsg} from '../../global';
import {generateTree,toggleNode,moveNodeEnd,moveNodeBegin,createNode,createNewMap,deleteNode} from './MindmapUtils'
import '../styles/CanvasEnE.scss'
import { selectedModule, deletedNodes, scenarioList } from '../designSlice'
import { deleteScenarioETE } from '../api'

const types = {
    'modules': 112,
    'endtoend': 112,
    'scenarios': 237,
    'screens': 363,
    'testcases': 488
};
var count;
var zoom //global var to store zoom
var nodeMoving = false;
var temp = {
    s: [],
    hidden:[],
    deleted:[],
    t: ""
};
export var readCtScale

const CanvasEnE =(props)=>{
    const dispatch = useDispatch()
    const CanvasRef = useRef();
    const setBlockui=props.setBlockui
    const [ctrlBox,setCtrlBox] = useState(false);
    const [inpBox,setInpBox] = useState(false);
    const [links,setLinks] = useState({})
    const [nodes,setNodes] = useState({})
    const [dNodes,setdNodes] = useState([])
    const [dLinks,setdLinks] = useState([])
    const [sections,setSection] =  useState({})
    const [ctScale,setCtScale] = useState({})
    const [verticalLayout,setVerticalLayout] = useState(true)
    const [createnew,setCreateNew] = useState(false)
    const scenarioLists = useSelector(state=>state.design.scenarioList)
    const deletedNoded = useSelector(state=>state.design.deletedNodes)
    const displayError = props.displayError
    readCtScale = () => ctScale

    const clickDeleteNode=(id)=>{
        var res = deleteNode(id,[...dNodes],[...dLinks],{...links},{...nodes})
        if(res){
            dispatch(deletedNodes([...deletedNoded,...res.deletedNoded]))
            setNodes(res.nodeDisplay)
            setLinks(res.linkDisplay)
            setdLinks(res.dLinks)
            setdNodes(res.dNodes)
        }
    }
    useEffect(()=>{
        if(deletedNoded && deletedNoded.length>0){
            var scenarioIds=[]
            var parentIds=[]
            for(let i = 0 ;i<deletedNoded.length; i++){
                if(deletedNoded[i].length>1){
                    if(deletedNoded[i][1]=="scenarios"){
                        scenarioIds.push(deletedNoded[i][0]);
                        parentIds.push(deletedNoded[i][2]);                    
                    }
                }
                
            }
            (async()=>{
                setBlockui({show:true,content:'Loading ...'})
                var res = await deleteScenarioETE({scenarioIds:scenarioIds,parentIds:parentIds})
                if(res.error){displayError(res.error);setBlockui({show:false});return;}  

                dispatch(deletedNodes([]))
                setBlockui({show:false})
                setMsg(MSG.MINDMAP.SUCC_REMOVED_SCENARIO)                
                setCreateNew('autosave')                            
            })()
        }
    },[deletedNoded, dispatch, displayError, setBlockui]
    )
    useEffect(()=>{
        //useEffect to clear redux data selected module on unmount
        return ()=>{
            dispatch(selectedModule({}))
        }
    },[dispatch])
    useEffect(()=>{
        var tree;
        count = {
            'modules': 0,
            'scenarios': 0,
            'screens': 0,
            'testcases': 0
        }
        if(props.module.createnew && verticalLayout===props.verticalLayout){
            tree = createNewMap(props.verticalLayout,'endtoend',undefined,types)
            tree.links = {}
            tree.dLinks = []
            if(zoom){
                const zoom = d3.zoom();
                const svg = d3.select(`.mp__canvas_svg`);
                zoom.scaleTo(svg, 1);
                zoom.translateTo(svg, 0, 0);
                svg.node().dispatchEvent(new Event("zoom")); 
                // zoom.scaleTo(1).translateTo([0,0]).defaltEvent(d3.select(`.mp__canvas_svg`))
                zoom.on("zoom",null)
            }
            count['modules'] = 1
            setCreateNew(0)
        }else{
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
        if(createnew === 'autosave'){
            setCreateNew(false)
        }
        else if(createnew !== false){
            var p = d3.select('#node_'+createnew);
            setCreateNew(false)
            setInpBox(p)
        }
    },[createnew])
    useEffect(()=>{
        if(Object.keys(scenarioLists).length<1)return;
        setBlockui({show:true,content:'Creating Nodes...'})
        var cnodes = {...nodes}
        var clinks = {...links}
        var cdNodes = [...dNodes]
        var cdLinks = [...dLinks]
        var csections = {...sections}
        Object.entries(scenarioLists).forEach(e => {
            var res = createNode(0,{...cnodes},{...clinks},[...cdNodes],[...cdLinks],{...csections},{...count},e[1],verticalLayout,e[0])
            cnodes = res.nodeDisplay
            clinks = res.linkDisplay
            cdNodes = res.dNodes
            cdLinks = res.dLinks
            count= {...count,...res.count}
        });
        setNodes(cnodes)
        setLinks(clinks)
        setdLinks(cdLinks)
        setdNodes(cdNodes)
        dispatch(scenarioList({}))
        setBlockui({show:false})
        // eslint-disable-next-line react-hooks/exhaustive-deps
    },[scenarioLists])
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
            res = moveNodeBegin(id,{...links},[...dLinks],{...temp},{...ctScale},verticalLayout,'endtoend')
            setLinks(res.linkDisplay)
            temp={...temp,...res.temp}
        }
    }
    const nodeClick=(e)=>{
        // e.stopPropagation()
        // setInpBox(false)
        // setCtrlBox(e.target.parentElement.id)
    }
    return (
        <Fragment>
            {/* <Legends isEnE={true}/> */}
            {/* {(inpBox !== false)?<InputBox setCtScale={setCtScale} zoom={zoom} node={inpBox} dNodes={[...dNodes]} setInpBox={setInpBox} setCtrlBox={setCtrlBox} ctScale={ctScale} />:null}
            {(ctrlBox !== false)?<ControlBox isEnE={true} nid={ctrlBox}  clickDeleteNode={clickDeleteNode} setCtrlBox={setCtrlBox} setInpBox={setInpBox} ctScale={ctScale}/>:null} */}
            {/* <SaveMapButton createnew={createnew} isEnE={true} verticalLayout={setVerticalLayout} dNodes={[...dNodes]} setBlockui={setBlockui}/> */}
            <SearchBox setCtScale={setCtScale} zoom={zoom}/>
            {/* <NavButton setCtScale={setCtScale} zoom={zoom}/> */}
            <svg id="mp__canvas_svg" className='mp__canvas_svg' ref={CanvasRef}>
                <g className='ct-container'>
                {Object.entries(links).map((link)=>{
                return(<path id={link[0]} key={link[0]+'_link'} className={"ct-link"+(link[1].hidden?" no-disp":"")} d={link[1].d}></path>)
                })}
                {Object.entries(nodes).map((node)=>
                    <g id={'node_'+node[0]} key={node[0]} className={"ct-node"+(node[1].hidden?" no-disp":"")} data-nodetype={node[1].type} transform={node[1].transform}>
                         <image  onClick={(e)=>nodeClick(e)} style={{height:'45px',width:'45px',opacity:(node[1].state==="created")?0.5:1}} className="ct-nodeIcon" xlinkHref={node[1].img_src}></image>
                        <text className="ct-nodeLabel" textAnchor="middle" x="20" title={node[1].title} y="50">{node[1].name}</text>
                        <title val={node[0]} className="ct-node-title">{node[1].title}</title>
                        {(node[1].type!=='scenarios')?
                        <circle onClick={(e)=>clickCollpase(e)} className={"ct-"+node[1].type+" ct-cRight"+(!dNodes[node[0]]._children?" ct-nodeBubble":"")} cx={verticalLayout ? 20 : 44} cy={verticalLayout ? 55 : 20} r="4"></circle>
                        :null}
                        {(node[1].type!=='modules' && node[1].type!=='endtoend')?
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
    )
}

// const bindZoomListner = (setCtScale,translate) => {
//     //need global move
//     const svg = d3.select(`.mp__canvas_svg`);
//     const g = d3.select(`.ct-container`);
//     const zoom  = d3.zoom()
//         .scaleExtent([0.1, 3])
//         .on('zoom', (event) => {
//             g.attr('transform', event.transform);
//         })
//     svg.call(zoom)
//     return zoom
// }
const bindZoomListner = (setCtScale,translate) => {
    //need global move
    const svg = d3.select(`.mp__canvas_svg`);
    const g = d3.select(`.ct-container`);
    const zoom  = d3.zoom()
        .scaleExtent([0.1, 3])
        .on('zoom', (event) => {
            if(!nodeMoving) {
                g.attr('transform', "translate(" + event.transform.x +','+event.transform.y + ")scale(" +event.transform.k + ")");
                var cScale = event.transform;
                setCtScale({x:cScale.x,y:cScale.y,k:cScale.k})
            } else {
                const x = g.attr("transform").split(/[()]/)[1].split(',')[0];
                const y = g.attr("transform").split(/[()]/)[1].split(',')[1];
                const scale = g.attr("transform").split(/[()]/)[3];
                // const pos = g.attr("transform");
                d3.zoomIdentity.scale(scale).translate([x,y]);
            }
        })
        if(translate) {svg.call(zoom.transform, d3.zoomIdentity.translate(translate[0], translate[1]));}
    svg.call(zoom)
    return zoom
}


export default CanvasEnE
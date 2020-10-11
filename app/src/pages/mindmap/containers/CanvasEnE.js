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
import { useDispatch, useSelector} from 'react-redux';
import {generateTree,toggleNode,moveNodeEnd,moveNodeBegin} from './MindmapUtils'
import * as actionTypes from '../state/action';
import '../styles/CanvasEnE.scss'

const types = {
    'modules': 112,
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

const CanvasEnE =(props)=>{
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
    const [verticalLayout,setVerticalLayout] = useState(false)
    const clickDeleteNode = () => {}
    useEffect(()=>{
        var tree = props.module
        tree = generateTree(tree,types,{...count},props.verticalLayout)
        count= {...count,...tree.count}
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
    const nodeClick=(e)=>{
        e.stopPropagation()
        setInpBox(false)
        setCtrlBox(e.target.parentElement.id)
    }
    return (
        <Fragment>
            <Legends/>
            {(ctrlBox !== false)?<ControlBox isEnE={true} nid={ctrlBox}  clickDeleteNode={clickDeleteNode} setCtrlBox={setCtrlBox} setInpBox={setInpBox} ctScale={ctScale}/>:null}
            <SearchBox setCtScale={setCtScale} zoom={zoom}/>
            <NavButton setCtScale={setCtScale} zoom={zoom}/>
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


export default CanvasEnE
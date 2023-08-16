import React, { useRef, useEffect, useState, Fragment } from 'react';
import * as d3 from 'd3';
import SearchBox from '../components/SearchBox'
import NavButton from '../components/NavButton'
import Legends from '../components/Legends'
import ControlBox from '../components/ControlBox'
import InputBox from '../components/InputBox' 
import MultiNodeBox from '../components/MultiNodeBox'
import RectangleBox from '../components/RectangleBox'
import SaveMapButton from '../components/SaveMapButton'
import ExportMapButton from '../components/ExportMapButton';
import CaptureModal from '../containers/CaptureScreen';
import DesignModal from '../containers/DesignTestStep';
import {Messages as MSG, ModalContainer, setMsg} from '../../global'
import { useDispatch, useSelector} from 'react-redux';
import {generateTree,toggleNode,moveNodeBegin,moveNodeEnd,createNode,deleteNode,createNewMap} from './MindmapUtils'
import '../styles/MindmapCanvas.scss';
import { ConfirmDialog, confirmDialog } from 'primereact/confirmdialog';
import { Dialog } from 'primereact/dialog';
import { Button } from 'primereact/button';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { InputText } from "primereact/inputtext";
import { Checkbox } from "primereact/checkbox";
import { ContextMenu } from 'primereact/contextmenu';
import { deletedNodes } from '../designSlice';
import { showGenuis } from '../../global/globalSlice';
import { deleteScenario } from '../api';


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
    const copyNodes = useSelector(state=>state.design.copyNodes)
    const selectBox = useSelector(state=>state.design.selectBoxState)
    const deletedNoded = useSelector(state=>state.design.deletedNodes)
    const [sections,setSection] =  useState({});
    const [fetchingDetails,setFetchingDetails] = useState(null); // this can be used for fetching testcase/screen/scenario/module details
    const [ctrlBox,setCtrlBox] = useState(false);
    const [taskname, setTaskName] = useState("") 
    const [fetchingDetailsId,setFetchingDetailsId] = useState(null)
    const [inpBox,setInpBox] = useState(false);
    const [multipleNode,setMultipleNode] = useState(false)
    const [ctScale,setCtScale] = useState({})
    const [links,setLinks] = useState({})
    const [nodes,setNodes] = useState({})
    const [dNodes,setdNodes] = useState([])
    const [dLinks,setdLinks] = useState([])
    const [delReuseNodes,setDelReuseNodes] = useState([])
    const [createnew,setCreateNew] = useState(false)
    const [reuseDelConfirm,setReuseDelConfirm] = useState(false)
    const [selectedDelNode,setSelectedDelNode] = useState()
    const [DelConfirm,setDelConfirm] = useState(false)
    const [reuseDelContent,setReuseDelContent] = useState()
    const [endToEndDelConfirm,setEndToEndDelConfirm] = useState(false)
    const [verticalLayout,setVerticalLayout] = useState(true);
    const proj = useSelector(state=>state.design.selectedProj)
    const setBlockui=props.setBlockui
    const setDelSnrWarnPop = props.setDelSnrWarnPop
    const displayError = props.displayError
    const CanvasRef = useRef();
    const menuRef_module= useRef(null);
    const menuRef_scenario =useRef(null);
    const menuRef_screen = useRef(null);
    const menuRef_Teststep = useRef(null);
    readCtScale = () => ctScale
    const [box, setBox] = useState(null);
    const [visibleScenario, setVisibleScenario] = useState(false);
    const [visibleScreen, setVisibleScreen] = useState(false);
    const [visibleTestStep, setVisibleTestStep] = useState(false);
    const [addScenario , setAddScenario] = useState([]);
    const [inputValue, setInputValue] = useState("");
    const [inputValScreen , setinputValScreen]= useState("");
    const [showInput, setShowInput] = useState(false);
    const [addScreen , setAddScreen] = useState([]);
    const[ showInputScreen , setShowInputScreen]= useState(false);
    const [addTestStep , setAddTestStep] = useState([]);
    const [inputValTestStep , setinputValTestStep]= useState("");
    const[ showInputTestStep , setShowInputTestStep]= useState(false);
    const [selectedRowsScenario, setSelectedRowsScenario] = useState([]);
    const [selectedRowsScreen, setSelectedRowsScreen] = useState([]);
    const [selectedRowsTeststep, setSelectedRowsTeststep] = useState([]);
    const [hoveredRow, setHoveredRow] = useState(null);
    const [editingRows, setEditingRows] = useState({});
    const [editValue, setEditValue] = useState("");
    const [editingRowsScreens, setEditingRowsScreens] = useState({});
    const [editingRowsTestCases, setEditingRowsTestCases] = useState({});
    const [visibleCaptureElement, setVisibleCaptureElement] = useState(false);
    const [visibleDesignStep, setVisibleDesignStep] = useState(false);
    const [cardPosition, setCardPosition] = useState({ left: 0, right: 0, top: 0 ,bottom:0});
    const [showTooltip, setShowTooltip] = useState("");
    const NameOfAppType = useSelector((state) => state.landing.defaultSelectProject);
    const typesOfAppType = props.appType;
    const imageRef = useRef(null);
    const appType = typesOfAppType

    const handleTooltipToggle = (nodeType) => {
      const rect = imageRef.current?.getBoundingClientRect();
      setCardPosition({ right: rect?.right, left: rect?.left, top: rect?.top ,bottom:rect?.bottom});
      setShowTooltip(nodeType);
    };
  
    const handleMouseLeave1 = () => {
      setShowTooltip("");
    };
    
    useEffect(()=>{
      if(deletedNodes && deletedNodes.length>0){
          var scenarioIds=[]
          var screenIds=[]
          var testcaseIds=[]
          for(let i = 0 ;i<deletedNodes.length; i++){
              if(deletedNodes[i].length>1){
                  if(deletedNodes[i][1]==="scenarios"){
                      scenarioIds.push(deletedNodes[i][0]);                    
                  }
                  if(deletedNodes[i][1]==="screens"){
                      screenIds.push(deletedNodes[i][0]);                    
                  }
                  if(deletedNodes[i][1]==="testcases"){
                      testcaseIds.push(deletedNodes[i][0]);                    
                  }
              }
              
          } 
          (async()=>{
              setBlockui({show:true,content:'Loading ...'})
              var res = await deleteScenario({scenarioIds:scenarioIds,screenIds:screenIds,testcaseIds:testcaseIds})
              if(res.error){displayError(res.error);return;}                
              setDelSnrWarnPop(false)                
              dispatch(deletedNodes([]))
              setBlockui({show:false})
              setMsg(MSG.MINDMAP.SUCC_DELETE_NODE.CONTENT)
              setCreateNew('autosave')                             
          })()

      }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  },[deletedNodes]
  )
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
                    if(!props.gen){
                        const zoom = d3.zoom();
                        const svg = d3.select(`.mp__canvas_svg`);
                        
                        zoom.scaleTo(svg, 1);
                        zoom.translateTo(svg, 0, 0);
                        svg.node().dispatchEvent(new Event("zoom"));   
                    }
                    else{
                        const zoom = d3.zoom();
                        const svg = d3.select(`.mp__canvas_svg_genius`);
                        
                        zoom.scaleTo(svg, 1);
                        zoom.translateTo(svg, 0, 0);
                        svg.node().dispatchEvent(new Event("zoom"));
                    }
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
        // eslint-disable-next-line no-lone-blocks
        {!props.gen?d3.select('.ct-container').attr("transform", "translate(" + tree.translate[0]+','+tree.translate[1] + ")scale(" + 1 + ")"):d3.select('.ct-container-genius').attr("transform", "translate(" + 50+','+tree.translate[1] + ")scale(" + 1 + ")")}
        // d3.select('.ct-container').attr("transform", "translate(" + tree.translate[0]+','+tree.translate[1] + ")scale(" + 1 + ")")
        zoom = bindZoomListner(setCtScale,tree.translate,ctScale,props.gen)
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
        else if(createnew === 'autosave'){
            setCreateNew(false)
        }
        else if(createnew !== false){
            var p = d3.select('#node_'+createnew);
            setCreateNew(false)
            setInpBox(p)
        }
       // eslint-disable-next-line react-hooks/exhaustive-deps
    },[createnew])
    
    const menuItemsModule = [
        { label: 'Add Testcase',icon:<img src="static/imgs/add-icon.png" alt='add icon' style={{height:"25px", width:"25px",marginRight:"0.5rem" }}/> , command:()=>{clickAddNode(box.split("node_")[1]);d3.select('#'+box).classed('node-highlight',false)}},
        { label: 'Add Multiple Testcases',icon:<img src="static/imgs/addmultiple-icon.png" alt='addmultiple icon' style={{height:"25px", width:"25px",marginRight:"0.5rem" }}/>,command: () =>{setAddScenario([]);setVisibleScenario(true);d3.select('#'+box).classed('node-highlight',false)}},
        {separator: true},
        { label: 'Rename',icon:<img src="static/imgs/edit-icon.png" alt="rename" style={{height:"25px", width:"25px",marginRight:"0.5rem" }}/>,command: ()=>{var p = d3.select('#'+box);setCreateNew(false);setInpBox(p);d3.select('#'+box).classed('node-highlight',false)}},
        { label: 'Delete',icon:<img src="static/imgs/delete-icon.png" alt="delete" style={{height:"25px", width:"25px",marginRight:"0.5rem" }} />,command:()=>{clickDeleteNode(box);d3.select('#'+box).classed('node-highlight',false)} }

    ];
    const menuItemsScenario = [
        { label: 'Add Screen',icon:<img src="static/imgs/add-icon.png" alt='add icon'  style={{height:"25px", width:"25px",marginRight:"0.5rem" }}/>, command:()=>{clickAddNode(box.split("node_")[1]);d3.select('#'+box).classed('node-highlight',false)}},
        { label: 'Add Multiple Screens',icon:<img src="static/imgs/addmultiple-icon.png" alt='add icon'  style={{height:"25px", width:"25px",marginRight:"0.5rem" }}/>,command: () =>{setAddScreen([]);setVisibleScreen(true);d3.select('#'+box).classed('node-highlight',false)}},
        {separator: true},
        { label: 'Avo Genius (Smart Recorder)' ,icon:<img src="static/imgs/genius-icon.png" alt="genius" style={{height:"25px", width:"25px",marginRight:"0.5rem" }}/>,command:()=>{confirm1()}},
        { label: 'Debug',icon:<img src="static/imgs/execute-icon.png" alt="execute" style={{height:"25px", width:"25px",marginRight:"0.5rem" }}/> },
        {separator: true},
        { label: 'Rename',icon:<img src="static/imgs/edit-icon.png" alt='add icon'  style={{height:"25px", width:"25px",marginRight:"0.5rem" }}/>, command: ()=>{var p = d3.select('#'+box);setCreateNew(false);setInpBox(p);d3.select('#'+box).classed('node-highlight',false)} },
        { label: 'Delete',icon:<img src="static/imgs/delete-icon.png" alt='add icon' style={{height:"25px", width:"25px",marginRight:"0.5rem" }} /> ,command:()=>{clickDeleteNode(box);d3.select('#'+box).classed('node-highlight',false)} },
        
    ];
    const menuItemsScreen = [
        { label: 'Add Test steps',icon:<img src="static/imgs/add-icon.png" alt='add icon' style={{height:"25px", width:"25px",marginRight:"0.5rem" }} />, command:()=>{clickAddNode(box.split("node_")[1]);d3.select('#'+box).classed('node-highlight',false) }},
        { label: 'Add Multiple Test steps',icon:<img src="static/imgs/addmultiple-icon.png" alt='add icon' style={{height:"25px", width:"25px",marginRight:"0.5rem" }} />,command: () =>{setAddTestStep([]);setVisibleTestStep(true);d3.select('#'+box).classed('node-highlight',false)}},
        {separator: true},
        { label: 'Capture Elements',icon:<img src="static/imgs/capture-icon.png" alt='add icon'  style={{height:"25px", width:"25px",marginRight:"0.5rem" }}/>, command:()=>{setVisibleCaptureElement(true);d3.select('#'+box).classed('node-highlight',false)} },
        { label: 'Debug',icon:<img src="static/imgs/execute-icon.png" alt="execute" style={{height:"25px", width:"25px",marginRight:"0.5rem" }}/> },
        {separator: true},
        { label: 'Rename',icon:<img src="static/imgs/edit-icon.png" alt='add icon'  style={{height:"25px", width:"25px",marginRight:"0.5rem" }}/>, command: ()=>{var p = d3.select('#'+box);setCreateNew(false);setInpBox(p);d3.select('#'+box).classed('node-highlight',false)} },
        { label: 'Delete',icon:<img src="static/imgs/delete-icon.png" alt='add icon' style={{height:"25px", width:"25px",marginRight:"0.5rem" }} />,command: ()=>{clickDeleteNode(box);d3.select('#'+box).classed('node-highlight',false)}  },
    ];

    const menuItemsTestSteps = [
        { label: 'Design Test steps',icon:<img src="static/imgs/design-icon.png" alt="execute" style={{height:"25px", width:"25px",marginRight:"0.5rem" }}/>, command: ()=>{setVisibleDesignStep(true);d3.select('#'+box).classed('node-highlight',false)} },
        {separator: true},
        { label: 'Rename',icon:<img src="static/imgs/edit-icon.png" alt='add icon' style={{height:"25px", width:"25px",marginRight:"0.5rem" }} /> ,command: ()=>{var p = d3.select('#'+box);setCreateNew(false);setInpBox(p);d3.select('#'+box).classed('node-highlight',false)}},
        { label: 'Delete',icon:<img src="static/imgs/delete-icon.png" alt='add icon' style={{height:"25px", width:"25px",marginRight:"0.5rem" }}/>, command: ()=>{clickDeleteNode(box);d3.select('#'+box).classed('node-highlight',false)} }

    ];
    const nodeClick=(e)=>{
      d3.select('#'+box).classed('node-highlight',false)
    }

    const createMultipleNode = (e,mnode)=>{
        setMultipleNode(false)
        if (mnode.length === 0){
            displayError(MSG.MINDMAP.ERR_NO_NODES_CREATE.CONTENT);
            return;
        }
        setBlockui({show:true,content:'Creating Nodes...'})
        var cnodes = {...nodes}
        var clinks = {...links}
        var cdNodes = [...dNodes]
        var cdLinks = [...dLinks]
        var csections = {...sections}
        mnode.forEach((name)=>{
            var res = createNode(e,cnodes,clinks,cdNodes,cdLinks,csections,{...count},name.value,verticalLayout)
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
        props.toast.current.show({ severity: 'success', summary: 'Success', detail: MSG.MINDMAP.SUCC_NODE_CREATE.CONTENT, life: 3000 });
    }
    const clickAddNode=(e)=>{
        var res = createNode(e,{...nodes},{...links},[...dNodes],[...dLinks],{...sections},{...count},undefined,verticalLayout)
        setCreateNew(res.dNodes.length-1)
        setNodes(res.nodeDisplay)
        setLinks(res.linkDisplay)
        setdLinks(res.dLinks)
        setdNodes(res.dNodes)
        count= {...count,...res.count}
        // setCreateNew('autosave')
    }
    const clickDeleteNode=(id)=>{
        var sid = parseFloat(id.split('node_')[1]);
        var reu=[...dNodes][sid]['reuse'];
        var type =[...dNodes][sid]['type'];
        if (type==='scenarios'){
            if (reu){
                if([...dNodes][sid]['children']){
                    for ( let i=0; i< [...dNodes][sid]['children'].length;i++) {
                        if ([...dNodes][sid]['children'][i]["reuse"]){
                            reusedNode(dNodes,sid,type);
                            setReuseDelContent(<div>Selected Test Scenario has <b>re used Screens and Test cases</b> and is used in <b>End To End flow</b>, By deleting this will impact other Test Scenarios.<br/><br/> Are you sure you want to Delete permenantly?" </div>)
                            setSelectedDelNode(id);
                            setReuseDelConfirm(true);
                            return;
                        }
                        else {
                            continue;
                        }
                }}
                setReuseDelContent("Selected Test Scenario is used in End To End flow.\n \n Are you sure you want to delete it permenantly?")
                setSelectedDelNode(id);
                setEndToEndDelConfirm(true)
                clickDeleteNodeHere(id);
                return;
            }
            else if([...dNodes][sid]['children']){
                for ( let i=0; i< [...dNodes][sid]['children'].length;i++) {
                    if ([...dNodes][sid]['children'][i]["reuse"]){
                        reusedNode(dNodes,sid,type);
                        setReuseDelContent("Selected Test Scenario has re used Screens and Test cases. By deleting this will impact other Test Scenarios.\n \n Are you sure you want to Delete permenantly?" )
                        setSelectedDelNode(id);
                        setReuseDelConfirm(true);
                        return;
                    }
                    else {
                        continue;
                    }
            }} 
            setSelectedDelNode(id);
            setDelConfirm(true);
            clickDeleteNodeHere(id);
            return;
        }        
        else if (type==='screens'){
                if (reu){
                    reusedNode(dNodes,sid,type);
                    setReuseDelContent("Selected Screen is re used. By deleting this will impact other Test Scenarios.\n \n Are you sure you want to Delete permenantly?");
                    setSelectedDelNode(id);
                    setReuseDelConfirm(true);
                    return;
                }
                else{
                    setSelectedDelNode(id);
                    setDelConfirm(true);
                    clickDeleteNodeHere(id);
                    return;
                }

            
        }
        else if (type==='testcases'){
            if (reu){
                reusedNode(dNodes,sid,type);
                setSelectedDelNode(id);
                setReuseDelContent("Selected Test case is re used. By deleting this will impact other Test Scenarios.\n \n Are you sure you want to Delete permenantly?");
                setReuseDelConfirm(true);
                return;
            }
            else{
                setSelectedDelNode(id);
                setDelConfirm(true);
                clickDeleteNodeHere(id);
                return;
            }
        }
        // setReuseList(reusedNames)
        processDeleteNode(id)        
    }
    const reusedNode = (nodes,sid,type) => {
        let reusedNodes = [];
        let reusedScreens = [];
        const selectedNodeChildIds=[];
        const selectedNodeId = nodes[sid]['_id'];
        if(nodes[sid]['children']){
            for ( let i=0; i< nodes[sid]['children'].length;i++) {
                let selectedNodeChildId= nodes[sid]['children'][i]['_id'];
                selectedNodeChildIds.push(nodes[sid]['children'][i]['_id'])
        }}
        nodes.forEach((node) =>{
            if(node['type']=='scenarios' && type=='scenarios'){ 
                if(node['_id'] == selectedNodeId){
                    reusedNodes.push(node.id);
                    
                }else{
                    if(node?.children && node?.children.length>0){
                        for(let i = 0 ;i<node?.children?.length; i++){
                            let tempId=node?.children[i]['_id']
                            if(selectedNodeChildIds.includes(tempId)){
                                reusedNodes.push(node?.children[i].id); }}}
                }                                            
            }
            if(node['type']==='screens' && type==='screens'){
                if(node['_id'] == selectedNodeId){
                    reusedNodes.push(node.id);
                }else{
                    if(node?.children && node?.children.length>0){
                        for(let i = 0 ;i<node?.children?.length; i++){
                            if(node?.children[i]['_id'] == selectedNodeId){
                                reusedNodes.push(node?.children[i].id);
                            }
                        }
                    }
                    
                }
            }
            if(node['type']==='testcases'  && type==='testcases'){
                if(node['_id'] === selectedNodeId){
                    reusedNodes.push(node.id);
                }
            }
            
        });
        let nodesReused=[]
        reusedNodes.sort()
        reusedNodes.reverse()
        for(let i = 0 ;i<reusedNodes.length; i++){
            nodesReused.push('node_'+reusedNodes[i])
        }
        setDelReuseNodes(nodesReused);
    }
    const reusedDelConfirm = () => {
        //processDeleteNode();
        for(let i = 0 ;i<delReuseNodes.length; i++){
            processDeleteNode(delReuseNodes[i]);
        }
    }
    const deleteNodeHere=()=>{
        clickDeleteNodeHere(selectedDelNode)
    }
    const clickDeleteNodeHere=(id)=>{
        var res = deleteNode(id,[...dNodes],[...dLinks],{...links},{...nodes})
        if(res){
            dispatch(deletedNodes([...deletedNoded,...res.deletedNodes]))
            setReuseDelConfirm(true)
            setNodes(res.nodeDisplay)
            setLinks(res.linkDisplay)
            setdLinks(res.dLinks)
            setdNodes(res.dNodes)
        }
    }
    const processDeleteNode = (sel_node) => {        
        var res = deleteNode(sel_node?sel_node:selectedDelNode,[...dNodes],[...dLinks],{...links},{...nodes})
        if(res){
            setNodes(res.nodeDisplay)
            setLinks(res.linkDisplay)
            setdLinks(res.dLinks)
            setdNodes(res.dNodes)
        }
        setReuseDelConfirm(false);
        setDelConfirm(false);
        setEndToEndDelConfirm(false);
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
    const DelReuseMsgContainer = ({message}) => (
        <p style={{color:'red'}}>
            {message}
        </p>
    )

    // const clickUnassign = (res) =>{
    //     setNodes(res.nodeDisplay)
    //     dispatch({type:actionTypes.UPDATE_UNASSIGNTASK,payload:res.unassignTask})
    //     setTaskBox(false)
    // }

    // const clickAddTask = (res) =>{
    //     setNodes(res.nodeDisplay)
    //     setdNodes(res.dNodes)
    //     setTaskBox(false)
    // }

  const confirm1 = () => {
    confirmDialog({
        message: "Recording this scenarios with Avo Genius will override the current scenario. Do you wish to proceed?",
        header: 'Confirmation',
        icon: 'pi pi-exclamation-triangle',
        accept,
        reject,
        acceptClassName:"p-button-rounded",
        rejectClassName:"p-button-rounded"
    });
  };

  const accept = () => {
    dispatch(showGenuis({
      showGenuisWindow:true,
      geniusWindowProps:{
        selectedProject:{key: proj,text: ""},
        selectedModule:{key:fetchingDetails["parent"]["_id"],text:fetchingDetails["parent"]["name"]},
        selectedScenario:{key:fetchingDetails["_id"],text:fetchingDetails["name"]},
        geniusFromMindmap:true
      }
    })) 
  }

  const reject = () => {}
  const handleContext=(e,type)=>{
    setFetchingDetails(dNodes[e.target.parentElement.id.split("_")[1]])
    setBox(e.target.parentElement.id)
    setFetchingDetails(dNodes[e.target.parentElement.id.split("_")[1]])
    const element = d3.select('#'+e.target.parentElement.id)
    if(type==="modules"){ menuRef_module.current.show(e);element.classed('node-highlight',!0)}
    else if(type==="scenarios"){menuRef_scenario.current.show(e);element.classed('node-highlight',!0)}
    else if(type==="screens"){menuRef_screen.current.show(e);element.classed('node-highlight',!0)}
    else {menuRef_Teststep.current.show(e);element.classed('node-highlight',!0)}
    
  }
      const addRowScenario = () => {
        const newRow = { id: addScenario.length + 1, value: inputValue, isEditing: false };
        setAddScenario((prevData) => [...prevData, newRow]);
        setInputValue("");
        setShowInput(true);
      };

        const addRowScreen = () => {
          const newRowScreen = { id: addScreen.length + 1, value : inputValScreen , isEditing:false};
          setAddScreen((prevData) => [...prevData, newRowScreen]);
          setinputValScreen("");
          setShowInputScreen(true);
        };
  
        
        const addRowTestStep = () => {
          const newRowTestStep = { id: addTestStep.length + 1, value : inputValTestStep };
          setAddTestStep([...addTestStep, newRowTestStep]);
          setinputValTestStep("");
          setShowInputTestStep(true);
        };

        const updateRow = (rowData, updatedValue) => {
            const updatedData = addScenario.map((row) => (row.id === rowData.id ? { ...row, value: updatedValue, isHovered:false } : row));
            setAddScenario(updatedData);
          };
          const updateRowScreen = (rowDataScreen, updatedValueScreen) => {
            const updatedDataScreen = addScreen.map((row) => (row.id === rowDataScreen.id ? { ...row, value: updatedValueScreen, isHovered:false } : row));
            setAddScreen(updatedDataScreen);
          };
    
          
          const updateRowTestStep = (rowDataTestStep, updatedValueTestStep) => {
            const updatedDataTestStep = addTestStep.map((row) => (row.id === rowDataTestStep.id ? { ...row, value: updatedValueTestStep ,  isHovered:false } : row));
            setAddTestStep(updatedDataTestStep);
          };
    
    
          const handleEdit = (rowData) => {
            setAddScenario((prevData) => {
              const updatedData = prevData.map((row) => {
                if (row.id === rowData.id) {
                  return { ...row, isEditing: true };
                }
                return row;
              });
              return updatedData;
            });
          };
          const handleEditScreens = (rowDataScreen) => {
            setAddScreen((prevData) => {
              const updatedData = prevData.map((row) => {
                if (row.id === rowDataScreen.id) {
                  return { ...row, isEditing: true };
                }
                return row;
              });
              return updatedData;
            });
          };
    
          const handleEditTestCases = (rowDataTestStep) => {
            setAddTestStep((prevData) => {
              const updatedDataTestStep = prevData.map((row) => {
                if (row.id === rowDataTestStep.id) {
                  return { ...row, isEditing: true };
                }
                return row;
              });
              return updatedDataTestStep;
            });
          };
          
    
          const handleRowInputChange = (rowId, value) => {
            setAddScenario((prevData) =>
              prevData.map((row) => {
                if (row.id === rowId) {
                  return { ...row, value };
                }
                return row;
              })
            );
          };
    
          const handleRowInputChangeScreens = (rowId, value) => {
            setAddScreen((prevData) =>
              prevData.map((row) => {
                if (row.id === rowId) {
                  return { ...row, value };
                }
                return row;
              })
            );
          };
    
          const handleRowInputChangeTestCases = (rowId, value) => {
            setAddTestStep((prevData) =>
              prevData.map((row) => {
                if (row.id === rowId) {
                  return { ...row, value };
                }
                return row;
              })
            );
          };
    
          const handleSave = (rowData) => {
            setAddScenario((prevData) =>
              prevData.map((row) => {
                if (row.id === rowData.id) {
                  return { ...row, value: rowData.value, isEditing: false };
                }
                return row;
              })
            );
            setEditingRows((prevState) => ({
              ...prevState,
              [rowData.id]: false,
            }));
            // setShowInput(false); // Hide the input box after saving
          };
    
          const handleSaveScreens = (rowDataScreen) => {
            setAddScreen((prevData) =>
              prevData.map((row) => {
                if (row.id === rowDataScreen.id) {
                  return { ...row, value: rowDataScreen.value, isEditing: false };
                }
                return row;
              })
            );
            setEditingRowsScreens((prevState) => ({
              ...prevState,
              [rowDataScreen.id]: false,
            }));
          };
    
          const handleSaveTestCases = (rowDataTestStep) => {
            setAddTestStep((prevData) =>
              prevData.map((row) => {
                if (row.id === rowDataTestStep.id) {
                  return { ...row, value: rowDataTestStep.value, isEditing: false };
                }
                return row;
              })
            );
            setEditingRowsTestCases((prevState) => ({
              ...prevState,
              [rowDataTestStep.id]: false,
            }));
          };
          
    
  const headerCheckboxClicked = (event) => {
    if (event.checked) {
      setSelectedRowsScenario(addScenario.map(row => row.id));
    } else {
      setSelectedRowsScenario([]);
    }
  };

  const headerCheckboxClickedScreen = (event) => {
    if (event.checked) {
      setSelectedRowsScreen(addScreen.map(row => row.id));
    } else {
      setSelectedRowsScreen([]);
    }
  };

  const rowCheckboxClickedScreen = (event, rowDataScreen) => {
    if (event.checked) {
      setSelectedRowsScreen([...selectedRowsScreen, rowDataScreen.id]);
    } else {
      setSelectedRowsScreen(selectedRowsScreen.filter(id => id !== rowDataScreen.id));
    }
  };

  const headerCheckboxClickedTestStep = (event) => {
    if (event.checked) {
      setSelectedRowsTeststep(addTestStep.map(row => row.id));
    } else {
      setSelectedRowsTeststep([]);
    }
  };

  const rowCheckboxClickedTestStep = (event, rowDataTestStep) => {
    if (event.checked) {
      setSelectedRowsTeststep([...selectedRowsTeststep, rowDataTestStep.id]);
    } else {
      setSelectedRowsTeststep(selectedRowsTeststep.filter(id => id !== rowDataTestStep.id));
    }
  };

  const rowCheckboxClicked = (event, rowData) => {
    if (event.checked) {
      setSelectedRowsScenario([...selectedRowsScenario, rowData.id]);
    } else {
      setSelectedRowsScenario(selectedRowsScenario.filter(id => id !== rowData.id));
    }
  };

  const handleRowHover = (event, rowData) => {
    setHoveredRow(rowData.id);
  };
  
  const handleRowHoverExit = () => {
    setHoveredRow(null);
  };

  const handleDelete = (rowData) => {
    setAddScenario((prevData) => {
      const updatedData = prevData.filter((row) => row.id !== rowData.id);
      const updatedDataWithIndex = updatedData.map((row, index) => ({
        ...row,
        id: index + 1,
      }));
      return updatedDataWithIndex;
    });
  };
  const handleDeleteScreen = (rowDataScreen) => {
    setAddScreen((prevData) => {
      const updatedDataScreen = prevData.filter((row) => row.id !== rowDataScreen.id);
      const updatedDataWithIndexScreen = updatedDataScreen.map((row, index) => ({
        ...row,
        id: index + 1,
      }));
      return updatedDataWithIndexScreen;
    });
  };
  const handleDeleteTestStep = (rowDataTestStep) => {
    setAddTestStep((prevData) => {
      const updatedDataTestStep = prevData.filter((row) => row.id !== rowDataTestStep.id);
      const updatedDataWithIndexTestStep = updatedDataTestStep.map((row, index) => ({
        ...row,
        id: index + 1,
      }));
      return updatedDataWithIndexTestStep;
    });
  };

  const columns = [
    // {
    //   field: "checkbox",
    //   header: <Checkbox className='scenario-check' onChange={headerCheckboxClicked} checked={selectedRowsScenario.length === addScenario.length && addScenario.length !== 0} />,
    //   body: (rowData) => <Checkbox className='rowdata_check' onChange={(event) => rowCheckboxClicked(event, rowData)} checked={selectedRowsScenario.includes(rowData.id)} />,
    //   headerStyle: { width: '50px' },
    //   bodyStyle: { width: '50px' },
    // },
    {
      field: "addScenario",
      header: "Add Scenario",
      headerClassName: 'scenario-header',
      body: (rowData) => {
        if (showInput && rowData.id === addScenario.length) {
          return (
            <InputText className='scenario_inp' placeholder='Add Scenario Name' value={inputValue} onChange={(e) => setInputValue(e.target.value)}
            onBlur={() => {
              updateRow(rowData, inputValue);
              setShowInput(false);
            }}
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                updateRow(rowData, inputValue);
                setShowInput(false);
              }
            }}
            />
          );
        } 
        else if (rowData.isEditing !== false) {
            return (
             <InputText
             className='scenario_inp'
                value={rowData.value}
                onChange={(e) => handleRowInputChange(rowData.id, e.target.value)}
                onBlur={() => handleSave(rowData)}
                onKeyPress={(e) => {
                  if (e.key === "Enter") {
                    e.target.blur();
                    handleSave(rowData);
                  }
                }}
              />
            );
          } 
       
        else {
          return(
            <div className='row_data'
            onClick={() => setShowInput(rowData.id === addScenario.length)}
            onMouseEnter={(event) => handleRowHover(event,rowData)}
            onMouseLeave={() => handleRowHoverExit()}
          >
           <div className='row_data_align'> {rowData.value}</div>
            {hoveredRow === rowData.id && (
              <div className='icons_class'>
                <i className="pi pi-pencil" onClick={()=>handleEdit(rowData)} style={{position:'relative', left:'10rem', bottom:'1rem',cursor:'pointer'}} />
                <i className="pi pi-trash"  onClick={() => handleDelete(rowData)} style={{position:'relative', left:'11rem',bottom:'1rem',cursor:'pointer' }}/>
              </div>
            )}
          </div>

        )
          }
        }
      
    },
  ];
   
  const columnsScreen = [
    // {
    //   field: "checkbox",
    //   header: <Checkbox className='scenario-check' onChange={headerCheckboxClickedScreen} checked={selectedRowsScreen.length === addScreen.length && addScreen.length !== 0} />,
    //   body: (rowDataScreen) => <Checkbox onChange={(event) => rowCheckboxClickedScreen(event, rowDataScreen)} checked={selectedRowsScreen.includes(rowDataScreen.id)} />,
    //   style: { width: '50px' },
     
    // },
    {
      field: "addScreen",
      header: "Add Screen",
      headerClassName: 'scenario-header',
      body: (rowDataScreen) => {
        if (showInputScreen && rowDataScreen.id === addScreen.length) {
          return (
            // <InputText className='scenario_inp' placeholder='Add Screen Name' value={inputValScreen} onChange={(e) => setinputValScreen(e.target.value)} onBlur={() => updateRowScreen(rowDataScreen, inputValScreen)} />
            <InputText className='scenario_inp' placeholder='Add Screen Name' value={inputValScreen} onChange={(e) => setinputValScreen(e.target.value)}
            onBlur={() => {
              updateRowScreen(rowDataScreen, inputValScreen);
              setShowInputScreen(false);
            }}
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                updateRowScreen(rowDataScreen, inputValScreen);
                setShowInputScreen(false);
              }
            }}
            />
          );
        } 
        else if (rowDataScreen.isEditing !== false) {
          return (
           <InputText
           className='scenario_inp'
              value={rowDataScreen.value}
              onChange={(e) => handleRowInputChangeScreens(rowDataScreen.id, e.target.value)}
              onBlur={() => handleSaveScreens(rowDataScreen)}
              onKeyPress={(e) => {
                if (e.key === "Enter") {
                  e.target.blur();
                  handleSaveScreens(rowDataScreen);
                }
              }}
            />
          );
        } 
        else {
          return(
            <div className='row_data'
            onClick={() => setShowInputScreen(rowDataScreen.id === addScreen.length)}
            onMouseEnter={(event) => handleRowHover(event,rowDataScreen)}
            onMouseLeave={() => handleRowHoverExit()}
            
          >
           <div className='row_data_align'> {rowDataScreen.value}</div>
            {hoveredRow === rowDataScreen.id && (
              <div className='icons_class'>
                <i className="pi pi-pencil" onClick={()=>handleEditScreens(rowDataScreen)} style={{position:'relative', left:'10rem', bottom:'1rem',cursor:'pointer',cursor:'pointer',cursor:'pointer'}} />
                <i className="pi pi-trash"  onClick={() => handleDeleteScreen(rowDataScreen)} style={{position:'relative', left:'11rem',bottom:'1rem',cursor:'pointer',cursor:'pointer',cursor:'pointer' }}/>
              </div>
            )}
          </div>
    
        )
          }
      },
    },
  ];

  const columnsTestStep = [
    // {
    //   field: "checkbox",
    //   header: <Checkbox className='scenario-check' onChange={headerCheckboxClickedTestStep} checked={selectedRowsTeststep.length === addTestStep.length && addTestStep.length !== 0} />,
    //   body: (rowDataTestStep) => <Checkbox onChange={(event) => rowCheckboxClickedTestStep(event, rowDataTestStep)} checked={selectedRowsTeststep.includes(rowDataTestStep.id)} />,
      
    // },
    {
      field: "addTestStep",
      header: "Add Test Step",
      headerClassName: 'scenario-header',
      body: (rowDataTestStep) => {
        if (showInputTestStep && rowDataTestStep.id === addTestStep.length) {
          return (
            // <InputText className='scenario_inp' placeholder='Add Test Step Name' value={inputValTestStep} onChange={(e) => setinputValTestStep(e.target.value)} onBlur={() => updateRowTestStep(rowDataTestStep, inputValTestStep)} />
    <InputText className='scenario_inp' placeholder='Add Test step Name' value={inputValTestStep} onChange={(e) => setinputValTestStep(e.target.value)}
    onBlur={() => {
      updateRowTestStep(rowDataTestStep, inputValTestStep);
      setShowInputTestStep(false);
    }}
    onKeyPress={(e) => {
      if (e.key === 'Enter') {
        updateRowTestStep(rowDataTestStep, inputValTestStep);
        setShowInputTestStep(false);
      }
    }}
    />
    );
     } 
     else if (rowDataTestStep.isEditing !== false) {
      return (
       <InputText
       className='scenario_inp'
          value={rowDataTestStep.value}
          onChange={(e) => handleRowInputChangeTestCases(rowDataTestStep.id, e.target.value)}
          onBlur={() => handleSaveTestCases(rowDataTestStep)}
          onKeyPress={(e) => {
            if (e.key === "Enter") {
              e.target.blur();
              handleSaveTestCases(rowDataTestStep);
            }
          }}
        />
      );
    } 
    else {
      return(
        <div className='row_data'
        onClick={() => setShowInputTestStep(rowDataTestStep.id === addTestStep.length)}
        onMouseEnter={(event) => handleRowHover(event,rowDataTestStep)}
        onMouseLeave={() => handleRowHoverExit()}
      >
       <div className='row_data_align'> {rowDataTestStep.value}</div>
        {hoveredRow === rowDataTestStep.id && (
          <div className='icons_class'>
            <i className="pi pi-pencil" onClick={()=>handleEditTestCases(rowDataTestStep)} style={{position:'relative', left:'10rem', bottom:'1rem',cursor:'pointer'}} />
            <i className="pi pi-trash"  onClick={() => handleDeleteTestStep(rowDataTestStep)} style={{position:'relative', left:'11rem',bottom:'1rem' ,cursor:'pointer'}}/>
          </div>
        )}
      </div>

    )
      }
      },
    },
  ];
  
  const footerContentScenario = (
    <div>
        <Button label="Add Scenarios"  onClick={()=>{setVisibleScenario(false);createMultipleNode(box.split("node_")[1],addScenario);}} className="add_scenario_btn" /> 
    </div> 
);

const footerContentScreen =(
    <div>
              <Button label="Add Screens"  onClick={() => {setVisibleScreen(false);createMultipleNode(box.split("node_")[1],addScreen);}} className="add_scenario_btn" /> 
          </div>
    )
    const footerContentTeststep =(
      <div>
                <Button label="Add Test Step"  onClick={() => {setVisibleTestStep(false);createMultipleNode(box.split("node_")[1],addTestStep);}} className="add_scenario_btn" /> 
            </div>
      )

    return (
        <Fragment>
                    {visibleCaptureElement && <CaptureModal visibleCaptureElement={visibleCaptureElement}  setVisibleCaptureElement={setVisibleCaptureElement} fetchingDetails={fetchingDetails} />}
        {visibleDesignStep && <DesignModal   fetchingDetails={fetchingDetails} appType={appType} visibleDesignStep={visibleDesignStep} setVisibleDesignStep={setVisibleDesignStep}/>}
            <ContextMenu model={menuItemsModule} ref={menuRef_module}/>

             <Dialog  className='Scenario_dialog' visible={visibleScenario} header="Add Multiple Scenario" style={{ width: '45vw', height:'30vw' }} onHide={() => setVisibleScenario(false)}  footer={footerContentScenario}>
        {/* <Toolbar  className="toolbar_scenario" start={startContent}  /> */}
       
        <div style={{ height: '100%', overflow: 'auto' }}>
            <DataTable value={addScenario} tableStyle={{ minWidth: '20rem' }} headerCheckboxSelection={true} scrollable scrollHeight="calc(100% - 38px)" > 
              {columns.map((col)=>(
              <Column field={col.field} header={col.header} body={col.body} headerClassName={col.headerClassName} 
              headerStyle={col.field==='checkbox'?{ justifyContent: "center", width: '10%', minWidth: '4rem', flexGrow: '0.2' }:null} 
              bodyStyle={ col.field==='checkbox'?{textAlign: 'left', flexGrow: '0.2', minWidth: '4rem' }:null}
              style={col.field==='checkbox'?{ minWidth: '3rem' }:null}></Column>
              ))}   
          
            </DataTable>
            <button className='add_row_btn'  disabled={addScenario.length > 0 && inputValue===""} style={(addScenario.length > 0 && inputValue==="") ? {opacity: '0.5', cursor: 'no-drop'} : {opacity: '1', cursor: 'pointer'}} onClick={() =>addRowScenario()} >+ Add Row </button> 
            </div>
            </Dialog>

            <Dialog  className='Scenario_dialog' header="Add Multiple Screens" visible={visibleScreen} style={{ width: '45vw', height:'30vw' }} onHide={() => setVisibleScreen(false)}  footer={footerContentScreen}>
            {/* <Toolbar  className="toolbar_scenario" start={startContent}  /> */}
            <div style={{ height: '100%', overflow: 'auto' }}>
            <DataTable value={addScreen}  tableStyle={{ minWidth: '20rem' }}  headerCheckboxSelection={true} scrollable scrollHeight="calc(100% - 38px)" >
              {columnsScreen.map((col)=>(
              <Column field={col.field} header={col.header} body={col.body} headerClassName={col.headerClassName}  
              headerStyle={col.field==='checkbox'?{ justifyContent: "center", width: '10%', minWidth: '4rem', flexGrow: '0.2' }:null} 
              bodyStyle={ col.field==='checkbox'?{textAlign: 'left', flexGrow: '0.2', minWidth: '4rem' }:null}
              style={col.field==='checkbox'?{ minWidth: '3rem' }:null}></Column>
              ))}    
            </DataTable>
            <button className='add_row_btn' disabled={addScreen.length > 0 && inputValScreen===""} style={(addScreen.length > 0 && inputValScreen==="") ? {opacity: '0.5', cursor: 'no-drop'} : {opacity: '1', cursor: 'pointer'}} onClick={() =>addRowScreen()} >+ Add Row </button> 
            </div>
            </Dialog>

            
            <Dialog  className='Scenario_dialog' header="Add Multiple Test Steps" visible={visibleTestStep} style={{ width: '45vw', height:'30vw' }} onHide={() => setVisibleTestStep(false)}  footer={footerContentTeststep}>
            <div style={{ height: '100%', overflow: 'auto' }}>
            <DataTable value={addTestStep} tableStyle={{ minWidth: '20rem' }} headerCheckboxSelection={true} scrollable scrollHeight="calc(100% - 38px)">
              {columnsTestStep.map((col)=>(
              <Column field={col.field} header={col.header} body={col.body} headerClassName={col.headerClassName} 
              headerStyle={col.field==='checkbox'?{ justifyContent: "center", width: '10%', minWidth: '4rem', flexGrow: '0.2' }:null} 
              bodyStyle={ col.field==='checkbox'?{textAlign: 'left', flexGrow: '0.2', minWidth: '4rem' }:null}
              style={col.field==='checkbox'?{ minWidth: '3rem' }:null}></Column>
              ))}  
            </DataTable>
            <button className='add_row_btn'  disabled={addTestStep.length > 0 && inputValTestStep===""} style={(addTestStep.length > 0 && inputValTestStep==="") ? {opacity: '0.5', cursor: 'no-drop'} : {opacity: '1', cursor: 'pointer'}} onClick={() =>addRowTestStep()} >+ Add Row </button> 
            </div>
            </Dialog>
             <ConfirmDialog />
            {/* {(ctrlBox !== false)?<ControlBox  nid={ctrlBox} taskname ={taskname} setMultipleNode={setMultipleNode}  setCtrlBox={setCtrlBox} setInpBox={setInpBox} Avodialog={confirm1} ctScale={ctScale} clickAddNode={clickAddNode} clickDeleteNode={clickDeleteNode} CanvasRef={CanvasRef}/>:null} */}
            {/* {(ctrlBox !== false)?<ControlBox setShowDesignTestSetup={props.setShowDesignTestSetup} ShowDesignTestSetup={props.ShowDesignTestSetup} setTaskBox={setTaskBox} nid={ctrlBox} taskname ={taskname} setMultipleNode={setMultipleNode} clickAddNode={clickAddNode} clickDeleteNode={clickDeleteNode} setCtrlBox={setCtrlBox} setInpBox={setInpBox} ctScale={ctScale}/>:null} */}
            {(inpBox !== false)?<InputBox setCtScale={setCtScale} zoom={zoom} node={inpBox} dNodes={[...dNodes]} setInpBox={setInpBox} setCtrlBox={setCtrlBox} ctScale={ctScale} />:null}
            {(multipleNode !== false)?<MultiNodeBox count={count} node={multipleNode} setMultipleNode={setMultipleNode} createMultipleNode={createMultipleNode}/>:null}
            <ContextMenu className='menu_items' model={menuItemsModule} ref={menuRef_module}/>
            <ContextMenu model={menuItemsScenario} ref={menuRef_scenario} />
            <ContextMenu model={menuItemsScreen} ref={menuRef_screen} />
            <ContextMenu model={menuItemsTestSteps} ref={menuRef_Teststep}/>
            {props.GeniusDialog?null:<NavButton setCtScale={setCtScale} ctScale={ctScale} zoom={zoom}/>}
            {/* <Legends/> */}
            {props.GeniusDialog?<Legends />:null}
            {props.GeniusDialog?null:<SearchBox  setCtScale={setCtScale} zoom={zoom}/>}
            {props.GeniusDialog ? null :<SaveMapButton createnew={createnew} verticalLayout={verticalLayout} dNodes={[...dNodes]} setBlockui={setBlockui} setDelSnrWarnPop ={setDelSnrWarnPop} toast={props.toast}/>}
            {props.GeniusDialog ? null: <ExportMapButton setBlockui={setBlockui} displayError={displayError}/>}
            {props.gen?<svg id="mp__canvas_svg_genius" className='mp__canvas_svg_genius' ref={CanvasRef}>
                <g className='ct-container-genius'>
                {Object.entries(links).map((link)=>{
                return(<path id={link[0]} key={link[0]+'_link'} className={"ct-link"+(link[1].hidden?" no-disp":"")} style={{stroke:'black',fill: 'none',opacity: 1}} d={link[1].d}></path>)
                })}
                {Object.entries(nodes).map((node)=>
                    <g id={'node_'+node[0]} key={node[0]} className={"ct-node"+(node[1].hidden?" no-disp":"")} data-nodetype={node[1].type} transform={node[1].transform} ref={imageRef} onMouseEnter={() => handleTooltipToggle(node[1].type)} onMouseLeave={() => handleMouseLeave1()}>
                       <image  onClick={(e)=>nodeClick(e)} style={{height:'45px',width:'45px',opacity:(node[1].state==="created")?0.5:1}} className="ct-nodeIcon" xlinkHref={node[1].img_src} title="reused"></image>
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
            </svg>:
            <svg id="mp__canvas_svg" className='mp__canvas_svg' ref={CanvasRef}>
            <g className='ct-container'>
            {Object.entries(links).map((link)=>{
            return(<path id={link[0]} key={link[0]+'_link'} className={"ct-link"+(link[1].hidden?" no-disp":"")} style={{stroke:'black',fill: 'none',opacity: 1}} d={link[1].d}></path>)
            })}
            {Object.entries(nodes).map((node, nodeIdx)=>
                <g id={'node_'+node[0]} key={node[0]} className={"ct-node"+(node[1].hidden?" no-disp":"")} data-nodetype={node[1].type} transform={node[1].transform}>
                   <image onClick={(e)=>nodeClick(e)} onMouseDownCapture={(e)=>{handleContext(e,node[1].type)}} style={{height:'45px',width:'45px',opacity:(node[1].state==="created")?0.5:1}} className="ct-nodeIcon" xlinkHref={node[1].img_src}  ref={imageRef} onMouseEnter={() => handleTooltipToggle(nodeIdx)} onMouseLeave={() => handleMouseLeave1()}  title=  {node[1].name} ></image>
                    <text className="ct-nodeLabel" textAnchor="middle" x="20" y="50">{node[1].name}</text>
                    <title val={node[0]} className="ct-node-title" >
                    {showTooltip !== "" && (
                      ((showTooltip === nodeIdx) && (node[1].type === 'modules') && (
                        <div className="tooltip">
                          <span className="tooltiptext">
                            <span className="tooltip-line">{node[1].title}</span>
                          </span>
                        </div>
                      )) || ((showTooltip === nodeIdx) && (node[1].type === 'scenarios') && (
                        <div className="tooltip">
                          <span className="tooltiptext">{node[1].title} </span>
                        </div> 
                     )) || ((showTooltip === nodeIdx) && (node[1].type === 'screens') && (
                      <div className="tooltip">
                        <span className="tooltiptext">{node[1].title}</span>
                      </div> 
                     )) || ((showTooltip === nodeIdx) && (node[1].type === 'testcases') && (
                      <div className="tooltip">
                        <span className="tooltiptext">{node[1].title}</span>
                      </div> 
                     ))
                    )}</title>         
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
        </svg>}
            {reuseDelConfirm?<ModalContainer 
                title='Confirmation'
                content= {<DelReuseMsgContainer message={reuseDelContent}/>}
                close={()=>setReuseDelConfirm(false)}
                footer={
                    <>
                        <button onClick={()=>{reusedDelConfirm()}}>Delete everywhere</button>
                        <button onClick={()=>{deleteNodeHere()}}>Delete current</button>
                        <button onClick={()=>setReuseDelConfirm(false)}>Cancel</button>        
                    </>}
                modalClass='modal-md'
            />:null}
            {DelConfirm?<ModalContainer 
                title='Confirmation'
                content={"Are you sure, you want to Delete it Permanently?"}         
                close={()=>setDelConfirm(false)}
                footer={
                    <>
                        <button onClick={()=>{processDeleteNode()}}>Yes</button>
                        <button onClick={()=>setDelConfirm(false)}>No</button>        
                    </>}
                modalClass='modal-sm'
            />:null}
            {endToEndDelConfirm?<ModalContainer 
                title='Confirmation'
                content={<DelReuseMsgContainer message={reuseDelContent}/>}                         
                close={()=>setEndToEndDelConfirm(false)}
                footer={
                    <>
                        <button onClick={()=>{processDeleteNode()}}>Yes</button>
                        <button onClick={()=>setEndToEndDelConfirm(false)}>No</button>        
                    </>}
                modalClass='modal-sm'
            />:null}
        </Fragment>
    );
}
const pasteNode = (activeNode,copyNodes,cnodes,clinks,cdNodes,cdLinks,csections,count,verticalLayout) => {
    var dNodes_c = copyNodes.nodes
    var dLinks_c = copyNodes.links
    var nodetype =  d3.select('#'+activeNode).attr('data-nodetype');
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
        setMsg(MSG.MINDMAP.WARN_SELECT_SCENARIO_PASTE.CONTENT)
        return false
    } else if(d3.select('.node-selected').attr('data-nodetype') === 'modules') {
        setMsg(MSG.MINDMAP.WARN_SELECT_MODULE_PASTE.CONTENT)
        return false
    }
    return {cnodes,clinks,cdNodes,cdLinks,csections,count};
}

// const bindZoomListner = (setCtScale,translate,ctScale,geniusMindmap) => {
    
//     //need global move
//     const g = d3.select(`.ct-container`);
//     const svg = d3.select(`.mp__canvas_svg`)
//     const zoom  = d3.zoom()
//         .scaleExtent([0.1, 3])
//         .on('zoom', (event) => {
//             g.attr('transform', event.transform);
//         })
//     svg.call(zoom)
//     return zoom
// }
const bindZoomListner = (setCtScale,translate,ctScale,geniusMindmap) => {
    
    //need global move
    const svg = geniusMindmap?d3.select(`.mp__canvas_svg_genius`):d3.select(`.mp__canvas_svg`)
    const g = geniusMindmap?d3.select(`.ct-container-genius`):d3.select(`.ct-container`);
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

    // zoom.scaleTo(svg,1).translateTo(svg,translate[0],translate[1])
    svg.call(zoom)
    return zoom
}

export default CanvasNew;
import React, { useRef, useEffect, useState, Fragment } from 'react';
import * as d3 from 'd3';
import {generateTree,toggleNode,moveNodeBegin,moveNodeEnd,createNode,createNewMap} from './MindmapUtils'



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

const Canvas = (module) => {
    const [sections,setSection] =  useState({});
    const [ctScale,setCtScale] = useState({});
    const [links,setLinks] = useState({});
    const [nodes,setNodes] = useState({});
    const [dNodes,setdNodes] = useState([]);
    const [dLinks,setdLinks] = useState([]);
    const [createnew,setCreateNew] = useState(false);
    const [verticalLayout,setVerticalLayout] = useState(true);
    const [selectedNode, setSelectedNode] = useState(null);
    const [name, setName] = useState(nodes.name);
    const CanvasRef = useRef();
    readCtScale = () => ctScale
    const menuRef_module= useRef(null);
    const menuRef_scenario =useRef(null);
    const menuRef_screen = useRef(null);
    const menuRef_Teststep = useRef(null);

    useEffect(() => {
        var tree;
        count = {
            'modules': 0,
            'scenarios': 0,
            'screens': 0,
            'testcases': 0
        }
        if ( verticalLayout) {
            if(module.importData){
                var typeo;
                var typen;
                var activeNode=0;
                //setBlockui({show:true,content:'Creating Nodes...'})
              module.importData.data.forEach((e,i)=>{
                    if (i === 0) {
                        tree = createNewMap(verticalLayout,undefined,e.name,types)
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
                if(module.importData.createdby==='pd'|| module.importData.createdby==='sel')setCreateNew('save')
            }
            // To load an existing module. Tree has to be loaded. Possible places, module box / switch layout.
            tree = module.selectedModule
            //load mindmap from data
            tree = generateTree(tree,types,{...count},verticalLayout)
            count= {...count,...tree.count}
          
        }
        d3.select('.ct-container').attr("transform", "translate(" + tree.translate[0]+','+tree.translate[1] + ")scale(" + 1 + ")")
        zoom = bindZoomListner(setCtScale,tree.translate,ctScale)
        setLinks(tree.links)
        setdLinks(tree.dLinks)
        setNodes(tree.nodes)
        setdNodes(tree.dNodes)
        setCtScale({x:tree.translate[0],y:tree.translate[1],k:1})
        setSection(tree.sections)
        setVerticalLayout(verticalLayout);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [module,verticalLayout]);
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
          
              
        }
       // eslint-disable-next-line react-hooks/exhaustive-deps
    },[createnew])
    const nodeClick=(e)=>{
        // e.stopPropagation()
        // if(d3.select('#pasteImg').classed('active-map')){
        //     // eslint-disable-next-line no-undef
        //     var res = pasteNode(e.target.parentElement.id,{...copyNodes},{...nodes},{...links},[...dNodes],[...dLinks],{...sections},{...count},verticalLayout)
        //     if(res){
        //         setNodes(res.cnodes)
        //         setLinks(res.clinks)
        //         setdLinks(res.cdLinks)
        //         setdNodes(res.cdNodes)
        //         count = res.count
        //     }
        // }
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
    const onUpdateNode = (id, newName) => {
        const nodeEntries = Object.entries(nodes)
        setNodes(nodeEntries.map((nodeid) => {
          if (nodeid[0] === id) {
            return {
              ...nodeid[1],
              name: newName
            };
          } else {
            return nodeid[1];
          }
        }));
      };
      
      
      const handleRename = (name,id) => {
        setName(name)
        setSelectedNode(id);
      };
      const handleNameChange = (e, id) => {
        if(id === selectedNode){
          setName(e.target.value);
        } 
      };
    
      const handleKeyDown = (e, id) => {
        if (e.key === 'Enter') {
          onUpdateNode(id, name);
          setSelectedNode(null);
        }
      };
      const menuItemsModule = [
        { label: 'Add Scenario' },
        { label: 'Add Multiple Scenarios'},
        { label: 'Rename'  },
        { label: 'Delete' },
        { label: 'Start Genius'},
        { label: 'Execute' }

    ];
    const menuItemsScenario = [
        { label: 'Add Screen'},
        { label: 'Add Multiple Screens'},
        { label: 'Rename' },
        { label: 'Delete' },
        { label: 'Start Genius' },
        { label: 'Execute' }

    ];
    const menuItemsScreen = [
        { label: 'Add Test step' },
        { label: 'Add Multiple Test step'},
        { label: 'Capture Elements' },
        { label: 'Delete' },
        { label: 'Execute' }

    ];

    const menuItemsTestSteps = [
        { label: 'Design Test steps' },
        { label: 'Rename' },
        { label: 'Delete' }

    ];

    const handleContext=(e,type)=>{
        if(type==="modules") menuRef_module.current.show(e)
        else if(type==="scenarios")menuRef_scenario.current.show(e)
        else if(type==="screens")menuRef_screen.current.show(e)
        else menuRef_Teststep.current.show(e)
       }
  



    return (
        <Fragment>
            <ContextMenu model={menuItemsModule} ref={menuRef_module}/>
            <ContextMenu model={menuItemsScenario} ref={menuRef_scenario} />
            <ContextMenu model={menuItemsScreen} ref={menuRef_screen} />
            <ContextMenu model={menuItemsTestSteps} ref={menuRef_Teststep}/> 
       <svg id="mp__canvas_svg" className='mp__canvas_svg' ref={CanvasRef}>
            <g className='ct-container'>
            {Object.entries(links).map((link)=>{
            return(<path id={link[0]} key={link[0]+'_link'} className={"ct-link"+(link[1].hidden?" no-disp":"")} style={{stroke:'black',fill: 'none',opacity: 1}} d={link[1].d}></path>)
            })}
            {Object.entries(nodes).map((node)=>
                <g id={'node_'+node[0]} key={node[0]} className={"ct-node"+(node[1].hidden?" no-disp":"")} data-nodetype={node[1].type} transform={node[1].transform}>
                   <image  onClick={(e)=>nodeClick(e)} onContextMenu={(e)=>{handleContext(e,node[1].type)}} style={{height:'45px',width:'45px',opacity:(node[1].state==="created")?0.5:1}} className="ct-nodeIcon" xlinkHref={node[1].img_src}></image>
                   {selectedNode === node[0] ?
                        <foreignObject x="10" y="25" width="100" height="20">
                          <input type="text" value={name} onChange={(e)=>handleNameChange(e, node[0])} onKeyDown={(e) => handleKeyDown(e, node[0])} autoFocus />
                        </foreignObject>
                        :<>
                    <text className="ct-nodeLabel" textAnchor="middle" x="20" title={node[1].title} y="50"><tspan onClick={(e) => handleRename(node[1].name,node[0])}>{selectedNode === node[0]?name:node[1].name}</tspan></text>
                    <title val={node[0]} className="ct-node-title">{node[1].title}</title>x
                    </>}
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
      
        return false
    } else if(d3.select('.node-selected').attr('data-nodetype') === 'modules') {
        
        return false
    }
    return {cnodes,clinks,cdNodes,cdLinks,csections,count};
}

const bindZoomListner = (setCtScale,translate,ctScale) => {
    
    //need global move
    
    const g = d3.select(`.ct-container`);
    const svg = d3.select(`.mp__canvas_svg`)
    const zoom  = d3.zoom()
        .scaleExtent([0.1, 3])
        .on('zoom', (event) => {
            g.attr('transform', event.transform);
            
        })
    svg.call(zoom)
    return zoom
}

export default Canvas;
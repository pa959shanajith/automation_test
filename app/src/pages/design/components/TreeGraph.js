import React, { useRef, useEffect,useState } from 'react';
import * as d3 from 'd3';


var readCtScale;
var zoom; //global var to store zoom
var nodeMoving = false;

function TreeGraph({ nodes_arr, links_arr, dNodes_arr }) {
    const [links,setLinks] = useState(links_arr)
    const [nodes,setNodes] = useState(nodes_arr)
    const [dNodes,setdNodes] = useState(dNodes_arr)
    const [dLinks,setdLinks] = useState([])
    const [inpBox,setInpBox] = useState(false);
    const [ctrlBox,setCtrlBox] = useState(false);
    const [taskname, setTaskName] = useState("")
    const [verticalLayout,setVerticalLayout] = useState(true)
    const [ctScale,setCtScale] = useState({})
    const canvasRef = useRef();

    readCtScale = () => ctScale 
    
  let tree = {
    count : {
      modules: 1,
      scenarios:2,
      screens: 2,
      testcases: 2
    },
    translate:[100,10]
    
  }
  let count=20
    useEffect(() => {
      const canvas = d3.select(canvasRef.current);
      var tree;
  
  
      canvas.selectAll('.ct-link')
        .data(Object.entries(links))
        .join('path')
          .attr('id', d => d[0])
          .attr('stroke', 'black')
          .attr('fill', 'none')
          .attr('opacity', 1)
          .classed('ct-link', true)
          .classed('no-disp', d => d[1].hidden)
          .attr('d', d => d[1].d);
  
      const nodeGroups = canvas.selectAll('.ct-node')
        .data(Object.entries(nodes))
        .join('g')
          .attr('id', d => `node_${d[0]}`)
          .attr('class', 'ct-nodeBubble')
          .classed('ct-node', true)
          .classed('no-disp', d => d[1].hidden)
          .attr('data-nodetype', d => d[1].type)
          .attr('transform', d => d[1].transform);
  
      nodeGroups.append('image')
        .attr('class', 'ct-nodeIcon')
        .attr('xlink:href', d => d[1].img_src)
        .attr('opacity', d => d[1].state === 'created' ? 0.5 : 1)
        .attr('height', '45px')
        .attr('width', '45px')
        // .on('click', nodeClick);
  
      nodeGroups.append('text')
        .attr('class', 'ct-nodeLabel')
        .attr('text-anchor', 'middle')
        .attr('x', '20')
        .attr('y', '50')
        .attr('title', d => d[1].title)
        .text(d => d[1].name);
  
      nodeGroups.filter(d => d[1].type !== 'testcases')
        .append('circle')
          .attr('class', d => `ct-${d[1].type} ct-cRight${!dNodes[d[0]]._children ? ' ct-nodeBubble' : ''}`)
          .attr('cx', '20')
          .attr('cy', '55')
          .attr('r', '4')
          .on('click', clickCollapse);
  
          nodeGroups.filter(d => d[1].type !== 'modules')
          .append('circle')
          .attr('class', d => `ct-${d[1].type} ct-nodeBubble`)
          .attr('cx', '20')
          .attr('cy', '-4')
          .attr('r', '4')
      tree = {
        count : {
          modules: 1,
          scenarios:2,
          screens: 2,
          testcases: 2
        },
        translate:[100,10]
        
      }
      d3.select('.ct-container').attr("transform", "translate(" + tree.translate[0]+','+tree.translate[1] + ")scale(" + 1 + ")")
      zoom = bindZoomListner(setCtScale,tree.translate,ctScale,false)
    }, [nodes, links, dNodes]);

  // const nodeClick = (e) => {
   
  //   d3.select('.ct-container').attr("transform", "translate(" + (tree.translate[0]+count)+','+(tree.translate[1]+count) + ")scale(" + 1 + ")")
  //     console.log(nodes);
  //     console.log(e.target.parentElement.id);
  //     setInpBox(false)
  //     setCtrlBox(e.target.parentElement.id)
  //     setTaskName(e.target.parentElement.children[2].innerHTML)
  //     // Handle node click event
  // };

  const bindZoomListner = (setCtScale,translate,ctScale,geniusMindmap) => {
    
    //need global move
    const svg = d3.select(`.mp__canvas_svg`)
    const g = d3.select(`.ct-container`);
    const zoom  = d3.zoom()
        .scaleExtent([0.1, 3])
        .on('zoom', (event) => {
         console.log(event.transform)
            // if(!nodeMoving) {
            g.attr('transform', `${event.transform} scale(${1})`);
           
        })
    // if(translate) zoom.transform(1).translate([translate[0],translate[1]])
    svg.call(zoom)
    return zoom
}


//     const toggleNode = (nid, nodeDisplay, linkDisplay, dNodes, dLinks) => {
//       var id = nid.split("node_")[1]
//       if (dNodes[id]._children && dNodes[id]._children.length > 0) {
//               // p.select('.ct-cRight').classed('ct-nodeBubble', !0);
//               dNodes[id].children = dNodes[id]._children;
//               dNodes[id]._children = null;
//               recurseTogChild(nodeDisplay, linkDisplay, dNodes[id], !1, dLinks);
//       }  else  if (dNodes[id].children && dNodes[id].children.length > 0) {
//               // p.select('.ct-cRight').classed('ct-nodeBubble', !1);  //d._childern 
//               dNodes[id]._children = dNodes[id].children;
//               dNodes[id].children = null;
//               recurseTogChild(nodeDisplay, linkDisplay, dNodes[id], !0, dLinks);
//       } 
//       return {dLinks,dNodes,nodeDisplay,linkDisplay}
// }

// const recurseTogChild = (nodeDisplay, linkDisplay, d, v, dLinks) => {
//   if (d.children) d.children.forEach(function(e) {
//       recurseTogChild(nodeDisplay, linkDisplay, e, v, dLinks);
//       nodeDisplay[e.id].hidden = v;
//       for (var j = dLinks.length - 1; j >= 0; j--) {
//           var lid = 'link-' + dLinks[j].source.id + '-' + dLinks[j].target.id
//           if (linkDisplay[lid] && dLinks[j].source.id === d.id) {
//               linkDisplay[lid].hidden = v
//           } 
//       }
//   });
//   else if (d._children) d._children.forEach(function(e) {
//       recurseTogChild(nodeDisplay, linkDisplay, e, !0, dLinks);
//       nodeDisplay[e.id].hidden = !0;
//       for (var j = dLinks.length - 1; j >= 0; j--) {
//           var lid = 'link-' + dLinks[j].source.id + '-' + dLinks[j].target.id
//           if (linkDisplay[lid] && dLinks[j].source.id === d.id) {
//               linkDisplay[lid].hidden = !0
//           }
//       }
//   });
// };


  const clickCollapse = (event, d) => {
      // Handle collapse/expand click event
  };

 

  return (
    <>
    <div className='whole-Container'>
      <svg id="mp__canvas_svg" className="mp__canvas_svg" ref={canvasRef}>
          {/* <g className="ct-container" /> */}
           <g className='ct-container'>
            {Object.entries(links).map((link)=>{
            return(<path id={link[0]} key={link[0]+'_link'} className={"ct-link"} d={link[1].d}></path>)
            })}
            {Object.entries(nodes).map((node)=>
                <g id={'node_'+node[0]} key={node[0]} className={"ct-node"+(node[1].hidden?" no-disp":"")} data-nodetype={node[1].type} transform={node[1].transform}>
                   {/* <image  style={{height:'45px',width:'45px',opacity:(node[1].state==="created")?0.5:1}} className="ct-nodeIcon" xlinkHref={node[1].img_src}></image> */}
                    {/* <text className="ct-nodeLabel" textAnchor="middle" x="20" title={node[1].title} y="50">{node[1].name}</text>
                    <title val={node[0]} className="ct-node-title">{node[1].title}</title> */}
                </g>)}
            </g>
      </svg>
      </div>
      </>
  )
}

export default TreeGraph;
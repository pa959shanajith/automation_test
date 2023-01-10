import React, { useEffect } from 'react';
import { Rnd } from "react-rnd";
import * as d3 from 'd3';
import { useDispatch} from 'react-redux';
import * as actionTypes from '../state/action';
import '../styles/RectangleBox.scss'

const RectangleBox = (props) =>{
  const dispatch = useDispatch()
  const style = {
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      border: "solid 1px blue",
      background: "rgba(200, 200, 200, 0.3)",
      borderRadius:'5px'
  };
  useEffect(()=>{
    if(d3.select(".ct-container") && d3.select(".ct-container").attr("transform")){
      resize()
    }
    //eslint-disable-next-line react-hooks/exhaustive-deps
  },[props.ctScale])
  const resize = () =>{
    var dNodes = props.dNodes
    var dLinks = props.dLinks
    var dNodes_c = [];
    var dLinks_c = [];
    d3.selectAll('.ct-node').classed('node-error',false);
    var xvp = d3.select(".ct-container").attr("transform").split(/[()]/)[1].split(',')[0];
    var yvp = d3.select(".ct-container").attr("transform").split(/[()]/)[1].split(',')[1];
    var scale = (d3.select(".ct-container").attr("transform").split(/[()]/)[3]);
    dNodes.forEach((e,i)=>{
      if (e.type !== 'modules') {
        var lt = [parseFloat(xvp) + parseFloat(e.x) * parseFloat(scale), parseFloat(yvp) + parseFloat(e.y) * parseFloat(scale)];
        var rctl = parseFloat(d3.select("#rect-copy").node().style.transform.split(/[()]/)[1].split(',')[0].replace("px",""))
        var rctr = rctl + parseFloat(d3.select("#rect-copy").node().style.width.replace('px',''))
        var rctt = parseFloat(d3.select("#rect-copy").node().style.transform.split(/[()]/)[1].split(',')[1].replace("px",""))
        var rctb = rctt + parseFloat(d3.select("#rect-copy").node().style.height.replace('px',''))
        if (((lt[0] > rctl && lt[0] < rctr) || (lt[0]+40* parseFloat(scale) > rctl && lt[0]+40* parseFloat(scale) < rctr)) && 
            ((lt[1] > rctt && lt[1] < rctb) || (lt[1]+40* parseFloat(scale)> rctt && lt[1]+40* parseFloat(scale) < rctb))){
          d3.select('#node_'+i).classed('node-selected',true)
            if (e.type === 'testcases' && (dNodes_c.indexOf(dNodes[e.parent.id]) === -1)) {
              d3.select('#node_'+e.parent.id).classed('node-selected',true)
              dNodes_c.push(dNodes[e.parent.id]);
            }
            if (dNodes_c.indexOf(dNodes[e.id]) === -1) {
              dNodes_c.push(e);
            }
        }else if(dNodes_c.indexOf(dNodes[i]) === -1){
          d3.select('#node_'+i).classed('node-selected',false)
        }
      }
    })
    dLinks.forEach(function(e, i) {
      if (d3.select('#node_' + e.source.id).classed('node-selected') && d3.select('#node_' + e.target.id).classed('node-selected')) {
        var lid = 'link-' + e.source.id + '-' + e.target.id  
        d3.select('#'+lid).classed('link-selected',true);
        dLinks_c.push(e);
      }
    })
    var payload = {nodes:dNodes_c,links:dLinks_c}
    dispatch({type:actionTypes.UPDATE_SELECTNODES,payload})
  }
  return(
    <Rnd id='rect-copy' style={style}
    onDrag={(e)=>{
      resize(e);
    }}
    onResize={()=>resize()}
    default={{
      x: 500,
      y: 22,
      width: 150,
      height: 150
    }}>
    {/* <div id='rect-copy'></div> */}
  </Rnd>
  )
}

export default RectangleBox;
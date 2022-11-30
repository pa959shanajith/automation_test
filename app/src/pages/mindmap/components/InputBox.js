import React, { useEffect, useRef, useState, Fragment } from 'react';
import ClickAwayListener from 'react-click-away-listener';
import {ScrollBar, setMsg, VARIANT, Messages as MSG} from '../../global';
import { useSelector} from 'react-redux';
import * as d3 from 'd3';
import '../styles/InputBox.scss'
var initdata = []

/*Component InputBox
  use: returns a texbox component on a selected node 
*/
const InputBox = (props) => {
    const screenData = useSelector(state=>state.mindmap.screenData)
    const InpBox = useRef()
    const [suggestList,setSuggestList] = useState([])
    const [focus,SetFocus] = useState(true)
    var p = props.node
    var pi = p.attr('id').split('node_')[1];
    var pt = p.select('.ct-nodeLabel');
    var t = p.attr('data-nodetype');
    var dNodes = props.dNodes

    useEffect(()=>{
        document.addEventListener("keydown", (e)=>{if(e.keyCode === 27)props.setInpBox(false)}, false);
        // if (dNodes[pi].taskexists) {
        //     var msg = 'Unassign the task to rename';
        //     if (t === 'screens') {
        //         msg = 'Unassign the task And the corresponding testcases tasks to rename';
        //     }
        //     setMsg(MSG.CUSTOM(msg,t === 'screens'?VARIANT.WARNING:VARIANT.ERROR))
        //     props.setInpBox(false)
        // }
        return () => {
            document.removeEventListener("keydown", (e)=>{if(e.keyCode === 27)props.setInpBox(false)} , false);
          };
        //eslint-disable-next-line react-hooks/exhaustive-deps
    },[])

    useEffect(()=>{
        var nodetype = props.node.attr('data-nodetype');
        if(nodetype === "modules" || nodetype === "scenarios"){
            setSuggestList([]);
            initdata=[]
            filterSuggest()
            return;
        }
        if(nodetype === "testcases"){
            setSuggestList(screenData.testCaseList);
            initdata = screenData.testCaseList.filter((e)=>e.screenid===dNodes[pi].parent._id);
            filterSuggest()
            return;
        }
        if(nodetype === "screens"){
            setSuggestList(screenData.screenList)
            initdata = screenData.screenList;
            filterSuggest()
            return;
        }
        //eslint-disable-next-line react-hooks/exhaustive-deps
    },[screenData])

    useEffect(()=>{
        props.setCtrlBox(false)
        var ctScale = props.ctScale
        var l = p.attr('transform').slice(10, -1).split(',');
        l = [(parseFloat(l[0]) - 20) * ctScale.k + ctScale.x, (parseFloat(l[1]) + 42) * ctScale.k + ctScale.y];
        d3.select('#ct-inpBox').style('top', l[1] + 'px').style('left', l[0] + 'px').classed('no-disp', !1)
        if(focus)focuson(l)
        InpBox.current.focus()
        //eslint-disable-next-line react-hooks/exhaustive-deps
    },[props.ctScale])

    const focuson = (l) => {
        var ctScale = props.ctScale
        var mptf =  d3.select('.ct-container').attr('transform')
        var s = d3.select('.mp__canvas_svg');
        var x_mptf = parseInt(mptf.split(/[()]/)[1].split(',')[0]);
        var y_mptf = parseInt(mptf.split(/[()]/)[1].split(',')[1]);
        var scale_mptf = ctScale.k; 
        var Svgwidth = l[0]  > parseFloat(s.style("width"))-80 ?  parseFloat(s.style("width"))-80: false 
        var Svgheight = l[1] > parseFloat(s.style("height"))-40 ? parseFloat(s.style("height"))-40 : false
        if(!Svgheight&&!Svgwidth){
            return;
        }
        var ccord = [x_mptf + (l[0] / scale_mptf), y_mptf + (l[1] / scale_mptf)];
        var x = ctScale.x
        var y = ctScale.y
        if(Svgheight){
            y = (y_mptf *2) - ccord[1] + Svgheight
        }
        if(Svgwidth){
            x = (x_mptf*2) - ccord[0] + Svgwidth - 80
        }
        props.zoom.scale(ctScale.k).translate([x,y])
        d3.select('.ct-container').attr("transform", "translate(" +x+','+y+ ")scale(" + ctScale.k + ")");
        props.setCtScale({x:x,y:y,k:ctScale.k})
        SetFocus(false)
    }

    const onEnter = (val) =>{
        var reuseDict = getReuseDetails(dNodes);
        if (val === 'Screen_0' || val === 'Scenario_0' || val === 'Testcase_0') {
            d3.select('#ct-inpAct').classed('errorClass',!0);
            return;
        }
        if (!validNodeDetails(val)) return; 
        if (dNodes[pi]._id) {
            dNodes[pi].original_name = pt.attr('title');
            dNodes[pi].rnm = !0;
        }
        dNodes[pi].name = val;
        if (dNodes[pi].original_name !== val) {
            d3.select('.node_' + pi + '>image').attr('style', 'opacity:0.6')
        }
        var tmp = dNodes[pi].name;
        if (tmp.length > 15) tmp = tmp.slice(0, 15) + "...";
        p.select('.ct-node-title').text(val)
        pt.text(tmp);
        function replicateName(pi) {
            //replicate task to reused node
            if (reuseDict[pi].length > 0) {
                reuseDict[pi].forEach(function(e, i) {
                    dNodes[e].name = dNodes[pi].name;
                    dNodes[e].original_name = dNodes[pi].original_name;
                    dNodes[e].rnm = dNodes[pi].rnm;
                    d3.select('#node_' + e + ' > text').text(tmp);
                    d3.select('#node_' + e + ' > title').text(tmp);

                });
            }
        }
        replicateName(pi);
        props.setInpBox(false)
    }

    const filterSuggest = () =>{
        validNodeDetails(InpBox.current.value)
        var filter = initdata.filter((e)=>e.name.startsWith(InpBox.current.value))
        setSuggestList(filter)
        if(filter.length>0)InpBox.current.defaultvalue = filter[0].name;
    }
    return(
        <ClickAwayListener onClickAway={(e)=>{
            onEnter(document.getElementById("ct-inpAct").value)
            if(e.target.className.baseVal !== "ct-nodeIcon")props.setInpBox(false);
            }}>
            <div id="ct-inpBox" className='no-disp'>
                <input  autoComplete="off" autoFocus={true} ref={InpBox} defaultValue={p.select('.ct-node-title').text()} id="ct-inpAct" maxLength="255" className="ct-inp" onChange={(e)=>{filterSuggest(e.target.value)}} onKeyPress={(e)=>{if(e.key==='Enter')onEnter(e.target.value)}}/>
                {(suggestList.length>0)?
                <ul id='ct-inpSugg'>
                    <ScrollBar trackColor={'white'} thumbColor={'grey'} hideXbar={true} verticalbarWidth='3px'>
                        {suggestList.map((e,i)=>{
                            return(
                                <Fragment key={i}>
                                    <li key={i+'_name'} onClick={()=>InpBox.current.value=e.name} ><i>{e.name}</i></li>
                                    <li key={i+'_divider'} className='divider'></li>
                                </Fragment>
                            )
                        })}
                        
                    </ScrollBar>
                </ul>:null}
            </div>
        </ClickAwayListener>
    )
}

function validNodeDetails(value) {
    d3.select('#ct-inpAct').classed('errorClass',!1);
    var nName, flag = !0;
    nName = value;
    var regex = /^[a-zA-Z0-9_]*$/;;
    if (nName.length === 0 || nName.length > 255 || nName.indexOf('_') < 0 || !(regex.test(nName)) || nName === 'Screen_0' || nName === 'Scenario_0' || nName === 'Testcase_0') {
        d3.select('#ct-inpAct').classed('errorClass',!0);
        flag = !1;
    }
    return flag;
};

function getReuseDetails(dNodes) {
    // reuse details within the same module
    var dictTmp = {};
    dNodes.forEach(function(e, i) {
        dictTmp[i] = [];
        if (e.reuse) {
            dNodes.forEach(function(f, j) {
                if (e.type === f.type && e.type === 'screens' && e.name === f.name && i !== j && f.reuse)
                    dictTmp[i].push(j);
                else if (e.type === f.type && e.type === 'testcases' && e.name === f.name && i !== j && e.parent && f.parent && e.parent.name === f.parent.name && f.reuse)
                    dictTmp[i].push(j);
                else if (e.type === f.type && e.type === 'scenarios' && e.name ===f.name && i !== j && f.reuse)
                    dictTmp[i].push(j);
            })
        }
    })
    return dictTmp;
}

export default InputBox;
import React, { useEffect, useRef, useState, Fragment } from 'react';
import ClickAwayListener from 'react-click-away-listener';
import {setMsg, VARIANT, Messages as MSG} from '../../global';
import { useSelector} from 'react-redux';
import * as d3 from 'd3';
import '../styles/InputBox.scss'
import { getScreens } from '../api';
import { Toast } from 'primereact/toast';
var initdata = []


/*Component InputBox
  use: returns a texbox component on a selected node 
*/
const InputBox = (props) => {
    const screenData = useSelector(state=>state.design.screenData)
    const InpBox = useRef()
    const [suggestList,setSuggestList] = useState([])
    const [focus,SetFocus] = useState(true)
    var p = props.node
    var pi = p.attr('id').split('node_')[1];
    var pt = p.select('.ct-nodeLabel');
    var t = p.attr('data-nodetype');
    var dNodes = props.dNodes
    const toast = useRef();
    const reduxDefaultselectedProject = useSelector((state) => state.landing.defaultSelectProject);
  let defaultselectedProject = reduxDefaultselectedProject;

    const localStorageDefaultProject = localStorage.getItem('DefaultProject');
    if (localStorageDefaultProject) {
        defaultselectedProject = JSON.parse(localStorageDefaultProject);
    }

    const toastError = (erroMessage) => {
        if (erroMessage && erroMessage.CONTENT) {
          toast.current.show({ severity: erroMessage.VARIANT, summary: 'Error', detail: erroMessage.CONTENT, life: 5000 });
        }
        else toast.current.show({ severity: 'error', summary: 'Error', detail: JSON.stringify(erroMessage), life: 5000 });
      }

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
        (async ()=>{
           var res = await getScreens(defaultselectedProject.projectId);
           if(res.error){
            toastError(res.error);
            return;
           }
        
        var nodetype = props.node.attr('data-nodetype');
        if(nodetype === "modules" || nodetype === "scenarios"){
            setSuggestList([]);
            initdata=[]
            filterSuggest()
            return;
        }
        if(nodetype === "testcases"){
            setSuggestList(res.testCaseList);
            initdata = res.testCaseList.filter((e)=>e.screenid===dNodes[pi].parent._id);
            filterSuggest()
            return;
        }
        if(nodetype === "screens"){
            setSuggestList(res.screenList)
            initdata = res.screenList;
            filterSuggest()
            return;
        }
    })();
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
        d3.zoomIdentity.scale(ctScale.k).translate([x,y])
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
            if(dNodes[pi].type === 'scenarios'){
                for (var j = 0; dNodes[0].children.length>j; j++){
                    if(dNodes[0].children[j].id === dNodes[pi].id){
                        dNodes[0].children[j].name = dNodes[pi].name;
                    }
                }
            }
            if (dNodes[pi].type === 'teststepsgroups') {
                updateData(dNodes[0])
                function updateData(node) {
                    node.children.forEach(child => {
                        if (child.id === dNodes[pi].id) {
                            child.name = dNodes[pi].name;
                            child.parent.name = dNodes[pi].name;
                            // Use map on child.parent.children to update specific child
                            if(child.parent.children[0].id === dNodes[pi].id){
                                child.parent.children = child.parent.children.map(subChild => {
                                    if (subChild.childIndex === dNodes[pi].childIndex) {
                                        subChild.name = dNodes[pi].name;
                                        if (subChild.parent && subChild.parent.name !== undefined) {
                                            subChild.parent.name = dNodes[pi].name;
                                            subChild.parent.children = subChild.parent.children.map(sub=>{
                                                if (sub.childIndex === dNodes[pi].childIndex) {
                                                    sub.name = dNodes[pi].name;
                                                }else if(sub.id === dNodes[pi].id){
                                                    sub.name = dNodes[pi].name;
                                                }
                                                return sub;
                                            })
                                        }
                                    }else if(subChild.id === dNodes[pi].id){
                                        subChild.name = dNodes[pi].name;
                                        if (subChild.parent && subChild.parent.name !== undefined) {
                                            subChild.parent.name = dNodes[pi].name;
                                            subChild.parent.children = subChild.parent.children.map(sub=>{
                                                if (sub.childIndex === dNodes[pi].childIndex) {
                                                    sub.name = dNodes[pi].name;
                                                }else if(sub.id === dNodes[pi].id){
                                                    sub.name = dNodes[pi].name;
                                                }
                                                return sub;
                                            })
                                        }
                                    }
                                    return subChild;
                                });
                            }else{
                                child.parent.children[0].children = child.parent.children[0].children.map(subChild => {
                                    if (subChild.childIndex === dNodes[pi].childIndex) {
                                        subChild.name = dNodes[pi].name;
                                        if (subChild.parent && subChild.parent.name !== undefined) {
                                            subChild.parent.name = dNodes[pi].name;
                                            subChild.parent.children = subChild.parent.children.map(sub=>{
                                                if (sub.childIndex === dNodes[pi].childIndex) {
                                                    sub.name = dNodes[pi].name;
                                                }else if(sub.id === dNodes[pi].id){
                                                    sub.name = dNodes[pi].name;
                                                }
                                                return sub;
                                            })
                                        }
                                    }else if(subChild.id === dNodes[pi].id){
                                        subChild.name = dNodes[pi].name;
                                        if (subChild.parent && subChild.parent.name !== undefined) {
                                            subChild.parent.name = dNodes[pi].name;
                                            subChild.parent.children = subChild.parent.children.map(sub=>{
                                                if (sub.childIndex === dNodes[pi].childIndex) {
                                                    sub.name = dNodes[pi].name;
                                                }else if(sub.id === dNodes[pi].id){
                                                    sub.name = dNodes[pi].name;
                                                }
                                                return sub;
                                            })
                                        }
                                    }
                                    return subChild;
                                });
                            }
                        } else {
                            node.children.forEach(subChild => updateData(subChild));
                        }
                    });
                    return node;
                }
            }
            if(dNodes[pi].type === 'screens'){
                for (var k = 0; dNodes[0].children.length>k; k++){
                    for (var m =0 ; dNodes[0].children[k].children.length>m; m++){
                        if(dNodes[0].children[k].children[m].id === dNodes[pi].id){
                            dNodes[0].children[k].children[m].name = dNodes[pi].name;
                        }
                    }
                }
            }
            if(dNodes[pi].type === 'testcases'){
                for (var n = 0; dNodes[0].children.length>n; n++){
                    for (var p =0 ; dNodes[0].children[n].children.length>p; p++){
                        for(var s =0; dNodes[0].children[n].children[p].children.length>s; s++){
                            if(dNodes[0].children[n].children[p].children[s].id === dNodes[pi].id){
                                dNodes[0].children[n].children[p].children[s].name = dNodes[pi].name;
                            }
                        }
                    }
                }  
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
                <input  autoComplete="off" autoFocus={true} ref={InpBox} defaultValue={p.select('.ct-node-title').text()} id="ct-inpAct" maxLength="255" className="ct-inp" onChange={(e)=>{filterSuggest(e.target.value)}} onKeyDown={(e)=>{if(e.key==='Enter')onEnter(e.target.value)}}/>
                {(suggestList.length>0)?
                <ul id='ct-inpSugg'>
                    {/* <ScrollBar trackColor={'white'} thumbColor={'grey'} hideXbar={true} verticalbarWidth='3px'> */}
                        {suggestList.map((e,i)=>{
                            return(
                                <Fragment key={i}>
                                    <li key={i+'_name'} onClick={()=>InpBox.current.value=e.name} ><i>{e.name}</i></li>
                                    <li key={i+'_divider'} className='divider'></li>
                                </Fragment>
                            )
                        })}
                        
                    {/* </ScrollBar> */}
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
    if (nName.length === 0 || nName.length > 255 || !(regex.test(nName)) || nName === 'Screen_0' || nName === 'Scenario_0' || nName === 'Testcase_0') {
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
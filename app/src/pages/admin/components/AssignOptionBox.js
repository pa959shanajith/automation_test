import React ,  { Fragment} from 'react';
import '../styles/AssignOptionBox.scss';

/*Component AssignOptionBox
  use: renders 2 Assign Box and buttons to move selection from one to other
  props:rightBox:[],leftBox:[],setRightBox(),setLeftBox(),
  disable:true/false for move buttons,
  FilterComp: component to filter leftbox
*/
    
const AssignOptionBox = ({rightBox,leftBox,setRightBox,setLeftBox,disable,FilterComp}) => {
    const rightArr = rightBox?rightBox:[]
    const leftArr = leftBox?leftBox:[]
    const moveData = (e) => {
        var action =  e.currentTarget ? e.currentTarget.id : undefined
        if(!action)return;
        moveObj(action,rightBox,leftBox,setRightBox,setLeftBox)
    }
    return(
        <Fragment>
            <div className='assign_opt-container'>
                <div className='left-box'>
                    <div className='left-title'>All Projects</div>
                    <select multiple id='opt-box-left'>
                        {leftArr.map((prj) => ( 
                            <option key={prj._id} value={prj._id} >{prj.name} </option>
                        ))}
                    </select>
                </div>
                <div className='middle-box'>
                    <div>
                        <button type="button" id="rightgo" disabled={disable} onClick={moveData} title="Move to right"> &gt; </button>
                        <button type="button" id="rightall" disabled={disable} onClick={moveData} title="Move all to right"> &gt;&gt; </button>
                        <button type="button" id="leftall" disabled={disable} onClick={moveData} title="Move all to left"> &lt;&lt; </button>
                        <button type="button" id="leftgo" disabled={disable} onClick={moveData} title="Move to left"> &lt; </button>
                    </div>
                </div>
                <div className='right-box'>
                    <div>
                        <span className='right-title'>Assign Projects to Pool</span>
                        {FilterComp?FilterComp:null}
                    </div>
                    <select multiple id='opt-box-right'>
                        {rightArr.map((e) => ( 
                            <option key={e._id} value={e._id} >{e.name} </option>
                        ))}
                    </select>
                </div>
            </div>
        </Fragment>
    )
}

const moveObj = (action,rightBox,leftBox,setRightBox,setLeftBox) => {
    var lBox, rBox, el;
    switch(action){
        case "rightall": {
            setRightBox([...leftBox,...rightBox])
            setLeftBox([])
            return;
        }
        case "leftall": {
            setLeftBox([...rightBox,...leftBox])
            setRightBox([])
            return;
        }
        case "rightgo": {
            lBox = [];
            rBox = [];
            el = document.getElementById("opt-box-left").options;
            if(el && el.length>0){
                Array.from(el).forEach((e)=>{
                    var obj = {_id:e.value,name:e.innerText}
                    if(e.selected){
                        rBox.push(obj)
                    }else{
                        lBox.push(obj)
                    }
                })
                setRightBox([...rightBox,...rBox])
                setLeftBox(lBox)
            }
            return;
        }
        case "leftgo": {
            lBox = [];
            rBox = [];
            el = document.getElementById("opt-box-right").options;
            if(el && el.length>0){
                Array.from(el).forEach((e)=>{
                    var obj = {_id:e.value,name:e.innerText}
                    if(e.selected){
                        lBox.push(obj)
                    }else{
                        rBox.push(obj)
                    }
                })
                setLeftBox([...leftBox,...lBox])
                setRightBox(rBox)
            }
            return;
        }
        default: return;
    }
}

export default AssignOptionBox;
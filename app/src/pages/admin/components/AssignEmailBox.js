import React ,  { Fragment, useState} from 'react';
import '../styles/AssignEmailBox.scss';
import { ModalContainer } from '../../global';

/*Component AssignEmailBox
  use: renders 2 Assign Box and buttons to move selection from one to other with add option in right box
  props:rightBox:[],leftBox:[],setRightBox(),setLeftBox(),setNewBox(),setModal(),newEmail[],setDeleteModal()
  disable:true/false for move buttons,
  FilterComp: component to filter leftbox
*/
    
const AssignEmailBox = ({rightBox,leftBox,setRightBox,setLeftBox,setNewBox,disable,FilterComp,setModal,newEmail,setDeleteModal}) => {
    const rightArr = rightBox?rightBox:[]
    const leftArr = leftBox?leftBox:[]
    const [delNewSelected,setDelNewSelected] = useState(false) 
    const moveData = (e) => {
        var action =  e.currentTarget ? e.currentTarget.id : undefined
        if(!action)return;
        moveObj(action,rightBox,leftBox,setRightBox,setLeftBox,newEmail,setDeleteModal,setDelNewSelected)
    }
    const DeleteLeftShift = () => (
        <ModalContainer
            modalClass='modal-sm'
            title={"Delete Email"}
            content={"Delete following email ID(s) from the group:"+ delNewSelected.newEmails}
            close={()=>setDelNewSelected(false)}
            footer={
                <>
                    <button onClick={()=>{moveLeft(true);setDelNewSelected(false);}}>Yes</button>
                    <button onClick={()=>setDelNewSelected(false)}>No</button>        
                </>}
        />
    )
    const moveLeft = (del) => {
        let eBox = []
        var el = document.getElementById("opt-box-right").options;
        if(el && el.length>0){
            Array.from(el).forEach((e)=>{
                var obj = {_id:e.value,name:e.innerText}
                if(e.id!=="addEmailOption" && e.id.slice(0,3)==="new") {
                    if(e.selected && del===false ) eBox.push(obj);
                    else if(!e.selected) eBox.push(obj);
                }
            })
            setNewBox(eBox)
        }
    }
    return(
        <Fragment>
            {delNewSelected && DeleteLeftShift()}
            <div className='assign_opt-box'>
                <div className='left-box'>
                    <div className='left-title'>{`All Users`}</div>
                    <select multiple id='opt-box-left'>
                        {leftArr.map((item) => ( 
                            <option key={item._id} value={item._id} >{item.name} </option>
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
                        <span className='right-title'>{`Assigned Users to Group`}</span>
                        {FilterComp?FilterComp:null}
                    </div>
                    <select multiple id='opt-box-right'>
                        <option id="addEmailOption" onClick={()=>{setModal(true)}} >
                            Add Email ID
                        </option>
                        {newEmail.map((e) => ( 
                            <option key={`new-${e._id}`} id={`new-${e._id}`} value={e._id} >{e.name} </option>
                        ))}
                        {rightArr.map((e) => ( 
                            <option key={e._id} value={e._id} >{e.name} </option>
                        ))}
                    </select>
                </div>
            </div>
        </Fragment>
    )
}

const moveObj = (action,rightBox,leftBox,setRightBox,setLeftBox,newEmail,setDeleteModal,setDelNewSelected) => {
    var lBox, rBox, el;
    switch(action){
        case "rightall": {
            setRightBox([...leftBox,...rightBox])
            setLeftBox([])
            return;
        }
        case "leftall": {
            if(newEmail.length>0) setDeleteModal(true);
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
                var containNew = ""; 
                Array.from(el).forEach((e)=>{
                    var obj = {_id:e.value,name:e.innerText}
                    if(e.id!=="addEmailOption"){
                        if(e.selected && e.id.slice(0,3)==="new" ) {
                            containNew+=" "+e.innerText;
                        } else if (e.selected && e.id.slice(0,3)!=="new" ) {
                            lBox.push(obj)
                        } else if(e.id.slice(0,3)!=="new") rBox.push(obj)
                    }
                })
                setLeftBox([...leftBox,...lBox])
                setRightBox(rBox)
                if(containNew!=="") setDelNewSelected({newEmails:containNew})
            }
            return;
        }
        default: return;
    }
}

export default AssignEmailBox;
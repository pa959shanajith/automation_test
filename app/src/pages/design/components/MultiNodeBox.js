import React, { Fragment, useState, useEffect, useMemo } from 'react';
import { ModalContainer, setMsg, Messages as MSG, VARIANT } from '../../global'
import '../styles/MultiNodeBox.scss'
import PropTypes from 'prop-types';

/*Component MultiNodeBox
  use: return MultiNodeBox popup to add nodes
*/
const MultiNodeBox = (props) =>{
    const [reset,setReset] = useState(false)
    const [submit,setSubmit] = useState(false)
    const [errMsg,setErrMsg] = useState('')
    return(
        <Fragment>
            <ModalContainer 
                title='Add Node'
                close={()=>props.setMultipleNode(false)}
                footer={<Footer errMsg={errMsg} setReset={setReset} setSubmit={setSubmit} {...props}/>}
                content={<AddnodeContainer setErrMsg={setErrMsg} submit={submit} setSubmit={setSubmit} setReset={setReset} reset={reset} {...props}/>} 
            />
        </Fragment>
    )
}

/*Component Footer
  use: return Footer for MultiNodeBox
*/

const Footer = (props) =>{
    return(
        <Fragment>
            <label data-test="errorMessageLabel" className='err-message'>{props.errMsg}</label>
            <div className='mnode__buttons'>
                <button data-test="reset" onClick={()=>{props.setReset(true)}}>Reset</button>
                <button data-test="submit" onClick={()=>{props.setSubmit(true)}}>Create</button>
            </div>
        </Fragment>
    )
}

/*Component AddnodeContainer
  use: return content part for MultiNodeBox
*/

const AddnodeContainer = (props) =>{
    const [mnode,setMnode] =  useState([])
    const [errList,setErrList] = useState([])
    const [count,setCount] = useState(1)
    const type = useMemo(()=>{
        var ntype;
        var nd = document.getElementById('node_'+props.node)
        var type =  nd.dataset.nodetype
        var i = 0;
        switch(type){
            case 'endtoend':
                i = props.count['scenarios']+1
                setMnode(['Scenario_'+i,'Scenario_'+(i+1)]);
                ntype = 'Scenario_';
                break;
            case 'modules':
                i = props.count['scenarios']+1
                setMnode(['Scenario_'+i,'Scenario_'+(i+1)]);
                ntype = 'Scenario_';
                break;
            case 'scenarios':
                i = props.count['screens']+1
                setMnode(['Screen_'+i,'Screen_'+(i+1)]);
                ntype = 'Screen_';
                break;
            case 'screens':
                i = props.count['testcases']+1
                setMnode(['Testcase_'+i,'Testcase_'+(i+1)]);
                ntype = 'Testcase_';
                break;
            default:
                break;
        }
        setCount(i+2)
        return ntype;
    },[props.node,props.count])
    useEffect(()=>{
        if(props.reset===true){
            reset()
            props.setReset(false)
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    },[props.reset])
    useEffect(()=>{
        if(props.submit===true){
            props.setSubmit(false)
            submit()
        }
        // eslint-disable-next-line 
    },[props.submit])
    useEffect(()=>{
        if(errList.length===0){
            props.setErrMsg("")
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    },[errList])
    const reset = () =>{
        var arr = Array(mnode.length).fill("")
        setMnode(arr)
    }
    const submit = () =>{
        var err = []
        if(mnode.length > 10){
            setMsg(MSG.CUSTOM('At a time only 10 nodes can be added',VARIANT.ERROR))
            return;
        }
        mnode.forEach((e,i)=>{
            if(!ValidateNode(e)){
                err.push(i)
            }
        })
        if(err.length === 0){
            props.createMultipleNode(props.node,mnode);
        }else{
            setErrList(err)
            props.setErrMsg('Please provide a valid name!')
        }
    }
    return(
        <Fragment>
            <div data-test="addButtonDiv"onClick={()=>{
                var arr = [...mnode]
                arr.push(type+count)
                setCount(count+1)
                setMnode(arr)
                }} className='mnode__addbutton'> 
                <img src={"static/imgs/ic-add.png"} alt='module'/>
                <label>Add</label>
            </div>
            <div className='mnode__list'>
            {/* <ScrollBar trackColor={'rgb(211, 211, 211)'} hideXbar={true} thumbColor={'#321e4f'}> */}
            {mnode.map((e,i)=>{
                return(
                    <div className='row mnode__row' key={i}>
                        <div data-test="index" className='col-sm-3'>{i+1}</div>
                        <div data-test="scenarioName" className='col-sm-6 mnode__input'>
                            <input className={(errList.includes(i))?'err-border':''} id={'mnode_'+i} value={e} maxLength={255} placeholder={'Enter node name'} onChange={(e)=>{
                                var arr = [...mnode]
                                arr[e.target.id.split('mnode_')[1]] = e.target.value
                                setMnode(arr)
                            }}></input>
                        </div>
                        <div data-test="deleteButton" className='col-sm-3'>
                            <img onClick={(e)=>{
                                var arr=[...mnode]
                                var errArr=[...errList]
                                errArr.splice(mnode.indexOf(e.target.attributes.value.value),1)
                                arr.splice(e.target.attributes.value.value,1)
                                setErrList(errArr)
                                setMnode(arr)}} value={i} className='mnode__delete' src={"static/imgs/ic-delete.png"} alt='module'/>
                        </div>
                    </div>
                )})}
            {/* </ScrollBar> */}
            </div>
        </Fragment>
    )
}

/*function ValidateNode
  use: validate node name and return boolean
  props : node name
*/

const ValidateNode = (nName) => {
    var regex = /^[a-zA-Z0-9_]*$/;;
    if (nName.length === 0 || nName.length > 255 || nName.indexOf('_') < 0 || !(regex.test(nName)) || nName === 'Screen_0' || nName === 'Scenario_0' || nName === 'Testcase_0') {
        return false
    }
    return true
}
MultiNodeBox.propTypes={
    count:PropTypes.object.isRequired,
    setMultipleNode:PropTypes.func.isRequired,
    createMultipleNode:PropTypes.func.isRequired
}
export default MultiNodeBox;
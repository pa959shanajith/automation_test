import React, { useState ,Fragment, useRef } from 'react';
import {ScrollBar ,PopupMsg} from '../../global';
import '../styles/UtilityCenter.scss'
import {Encrypt_ICE } from '../api';

const UtilityCenter=(props)=>{
    const factref = useRef()
    const levelref = useRef()
    const [encyptMethod , setEncyptMethod]= useState(null);
    const [encyptValue , setEncyptValue]= useState(null);
    const [encyptBtn , setEncyptBtn] = useState(false)
    const [encryptedData , setEncryptedData] = useState("");
    const [btnName , setBtnName] = useState("");
    const [factor , setFactor] = useState(0);
    const [level , setLevel] = useState(0);
    const [emptyCall , setEmptyCall] = useState(false);
    const [gererateClick , setGenerateClick] = useState(false);
    const FactorTable = [];
    const LevelTable = [];
    const encryptionType = encyptMethod;
    const encryptionValue = encyptValue;
    const onDropChange =(e)=>{
        if(e.target.value==="SelectMethod"){
            setEncyptBtn(false)
            setEncyptMethod(e.target.value)
            setEncryptedData("");
            setEncyptValue("");
        }
        else{
            setEncyptMethod(e.target.value);
            setEncyptBtn(true);
            if(e.target.value==="AES"){
                setBtnName("Encrypt")
                setEncryptedData("");
                setEncyptValue("");
                setEmptyCall(false);
            }
            else if(e.target.value==="MD5"){
                setBtnName("Generate")
                setEncryptedData("");
                setEncyptValue("");
                setEmptyCall(false);
            }
            else{
                setBtnName("Encode")
                setEncryptedData("");
                setEncyptValue("");
                setEmptyCall(false);
            }
        }
    }
    const ontextchange =(e)=>{
        setEncyptValue(e.target.value);
    }
    const callEncrypt = async(encryptionType ,encryptionValue)=>{
        if(encyptValue ===""){
            setEmptyCall(true);
        }
        else{
            const items = await Encrypt_ICE(encryptionType ,encryptionValue);
            setEncryptedData(items)
        }
    }
    const callReset =()=>{
        setEncryptedData("");
        setEncyptValue("");
        setEmptyCall(false);
    }
    const callPairwise =()=>{
        props.setPairwiseClicked(true);
    }
    const updateInputFactorTable=(e,i)=>{
        FactorTable.splice(i , 1 , e.target.value)
        console.log(FactorTable);
    }
    const updateInputLevelTable =(e,i)=>{
        LevelTable.splice(i,1,e.target.value)
        console.log(LevelTable);
    }
    const callGenerate =()=>{
        if(FactorTable.length && LevelTable.length){
            console.log("APi will be called");
        }
        else{
            setGenerateClick(true);
        }
    }

    return (
        
        <div className="middleContent">
            {/* <ScrollBar> */}
            <div className="middle_holder">
            {(props.screenType ==="encryption")?
            <Fragment>
                <div className="page-taskName" >
                    <span className="taskname">
                        Encryption
                    </span>
                </div>
                <div>
                    <select value={encyptMethod} onChange={(e)=>onDropChange(e)} id = "dropdown">
                        <option className="options" value="SelectMethod">Select Method</option>
                        <option className="options" value="AES">AES</option>
                        <option className="options" value="MD5">MD5</option>
                        <option className="options" value="Base64">Base64</option>
                    </select>
                </div>
                
                <div >
                    <div className={ emptyCall? "encryptionData-body emptycall" :"encryptionData-body"}>
                        {/* <ScrollBar> */}
                        <textarea value={encyptValue} id= "encryptData" placeholder="Enter Data For Encryption" onChange={(e)=>ontextchange(e)}/>
                        {/* </ScrollBar> */}
                    </div>

                {encyptBtn && 
                <div id="encryption_btns">
                    <button className="btn-utl" onClick={()=>callEncrypt(encryptionType ,encryptionValue)}>
                        {btnName}
                    </button>
                    <button onClick={()=>callReset()} className="btn-reset">Reset</button>
                </div>}
                <div className="encryptionData-body">
                {/* <ScrollBar> */}
                    <textarea id="encryptedData" readOnly placeholder="Encrypted Data" value={encryptedData}/>
                {/* </ScrollBar> */}
                </div>
                </div>
                
            </Fragment>: null}

            {(props.screenType==="optimization")?
            <Fragment>
                {(props.pairwiseClicked)?
                <Fragment>
                    <div className="page-taskName" >
                        <span className="taskname">
                            Pairwise
                        </span>
                    </div> 
                    <div className="pairwise_scr">
                        <span>Factor</span>
                        <input 
                            type="number" 
                            placeholder="Enter Factor" 
                            ref={factref}
                        />
                        <span>Level</span>
                        <input 
                            type="number"  
                            placeholder="Enter Level" 
                            ref={levelref}
                        />
                        <button  className="btn-create" onClick={()=>{setLevel(parseInt(levelref.current.value));setFactor(parseInt(factref.current.value))}}>Create</button>
                        <button className="btn-utl" onClick={()=>callGenerate()}>Generate</button>
                    </div>
                    <br/>
                        {gererateClick && <PopupMsg 
                                            content={"Table values cannot be empty"} 
                                            title={"Pairwise"} 
                                            submit={()=>setGenerateClick(false) } 
                                            submitText={"Ok"} 
                                            close={()=>setGenerateClick(false)}
                                            />}
                        <div className="pairwise_array" >
                        <ScrollBar thumbColor ={"#311d4e"} trackColor ={"rgb(211, 211, 211);"}>
                            {Array.from(Array(factor)).map((e,i)=>(
                                    <div className='factor__row' key={i} >
                                        <input  key={i} onChange={(e)=>updateInputFactorTable(e,i)} type="text"/>
                                        {Array.from(Array(level)).map((e,i)=>
                                            <input onChange={(e)=>updateInputLevelTable(e,i)} key={i} type="text"/>
                                        )}
                                    </div>
                            ))}
                            
                        </ScrollBar>
                        </div>
                    
                </Fragment> :
                <Fragment>
                    <div className="page-taskName">
                        <span className="taskname">
                            Optimization
                        </span>
                    </div>
                    <div id="optimization-fn">
                        <div>
                            <div onClick={()=>callPairwise()} className="pairwise">
                                <img src='static/imgs/ic-pairwise.png' alt="Pairwise_img"/>
                                <div>Pairwise</div>
                            </div>
                            <div className="pairwise">
                                <img src='static/imgs/ic-orthogonal-array.png' alt="Orthogonal_img"/>
                                <div>Orthogonal Array</div>
                            </div>
                        </div>
                    </div>
                </Fragment>}
            </Fragment>
            :null}
        </div>
        {/* </ScrollBar> */}
        </div>
    )
}

export default UtilityCenter;

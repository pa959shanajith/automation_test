import React, { useState ,Fragment, useRef } from 'react';
import Encryption from '../components/Encryption.js';
import Pairwise from '../components/Optimization.js'
import {ScrollBar ,PopupMsg ,ScreenOverlay} from '../../global';
import '../styles/UtilityCenter.scss'
import {Encrypt_ICE } from '../api';

const UtilityCenter=(props)=>{
    const factref = useRef() //ref for input in factor in optimization screen
    const levelref = useRef() //ref for input in level in optimization screen
    const [encyptMethod , setEncyptMethod]= useState(null); //state to manage the vaue of method selection dropdown
    const [encyptValue , setEncyptValue]= useState(null);//state to manage user's value in encrypttion value input
    const [encyptBtn , setEncyptBtn] = useState(false) //to show encrypt button on selection of any encrypt method
    const [encryptedData , setEncryptedData] = useState("");
    const [btnName , setBtnName] = useState("");
    const [factor , setFactor] = useState(0);
    const [level , setLevel] = useState(0);
    const [emptyCall , setEmptyCall] = useState(false);
    const [gererateClick , setGenerateClick] = useState(false);
    const [blockui,setBlockui] = useState({show:false});
    const [popup ,setPopup]= useState({show:false});
    const FactorTable = [];
    const LevelTable = [];
    const encryptionType = encyptMethod;
    const encryptionValue = encyptValue;
    const onDropChange =(e)=>{ //function to manage dropdown change set values to show encryption buttons , select method
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
    const ontextchange =(e)=>{ //set encrytion query data raised from user 
        setEncyptValue(e.target.value);
    }
    const callEncrypt = async(encryptionType ,encryptionValue)=>{ //API call and fetch and render encrypted data by changing state 
        setBlockui({show:true,content:'Encrypting...'})
        if(encyptValue ===""){
            setEmptyCall(true);
            setBlockui({show:false})
        }
        else{
            const items = await Encrypt_ICE(encryptionType ,encryptionValue);
            if(items.error){displayError(items.error);return;}
            setEmptyCall(false);
            setEncryptedData(items);
            setBlockui({show:false});
        }
    }
    const displayError = (error) =>{
        setPopup({
          title:'ERROR',
          content:error,
          submitText:'Ok',
          show:true
        })
      }
    const callReset =()=>{ // Reset button , resets states
        setEncryptedData("");
        setEncyptValue("");
        setEmptyCall(false);
    }
    const callPairwise =()=>{ //pairwise icon clicked changes states
        props.setPairwiseClicked(true);
    }
    const updateInputFactorTable=(e,i)=>{ //updates user input in Factor in the table
        FactorTable.splice(i , 1 , e.target.value)
        console.log(FactorTable);
    }
    const updateInputLevelTable =(e,i)=>{ //updates user input in level in the table
        LevelTable.splice(i,1,e.target.value)
        console.log(LevelTable);
    }
    const callGenerate =()=>{ // Genrate API will be called here rightnow Dummy
        if(FactorTable.length && LevelTable.length){
            console.log("APi will be called");
        }
        else{
            setGenerateClick(true);
        }
    }

    return (
        <Fragment>
        {(blockui.show)?<ScreenOverlay content={blockui.content}/>:null}
        {(popup.show)?<PopupMsg submit={()=>setPopup({show:false})} close={()=>setPopup({show:false})} title={popup.title} content={popup.content} submitText={popup.submitText}/>:null}
        <div className="UtlmiddleContent">
            <div className="middle_holder">
            {(props.screenType ==="encryption")?
            <Encryption onDropChange={onDropChange}
                        encyptMethod={encyptMethod}
                        emptyCall={emptyCall}
                        encyptValue={encyptValue}
                        ontextchange={ontextchange}
                        encyptBtn={encyptBtn}
                        callEncrypt={callEncrypt}
                        btnName={btnName}
                        callReset={callReset}
                        encryptedData={encryptedData}
                        encryptionType={encryptionType}
                        encryptionValue={encryptionValue}
            />: null}

            {(props.screenType==="optimization")?
                <Pairwise 
                    factref={factref}
                    levelref={levelref}
                    setLevel={setLevel}
                    setFactor={setFactor}
                    callGenerate={callGenerate}
                    setGenerateClick={setGenerateClick}
                    updateInputFactorTable={updateInputFactorTable}
                    updateInputLevelTable={updateInputLevelTable}
                    callPairwise={callPairwise}
                    factor={factor}
                    level={level}
                    gererateClick={gererateClick}
                />
            : null}
                
        </div>
        </div>
        </Fragment>
    )
}

export default UtilityCenter;

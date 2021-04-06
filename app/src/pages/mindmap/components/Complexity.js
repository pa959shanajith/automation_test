import React, { createRef, useEffect, useState } from 'react';
import {ModalContainer, ScrollBar} from '../../global'
import '../styles/Complexity.scss'
import PropTypes from 'prop-types';

/*Component Complexity
  use: returns ComplexityBox near module
*/

const Complexity = (props) => {
    const setShowcomplexity = props.setShowcomplexity
    const setComplexity = props.setComplexity
    const complexity = props.complexity
    const type = props.type
    const [nclist,setNclist] = useState(complexity.clist?complexity.clist:[])
    const [refs,setRefs] = useState([])
    const submitComplexity = (e) => {
        var err =  false
        var clist_tmp = [nclist[0]];
        refs.forEach((e)=>{
            var value = e.current.value
            if(value === "Select Option"){
                err = true;
                e.current.style.borderColor = 'red';
            }else{
                clist_tmp.push(value)
            }
        })
        if(!err){
            var val =  getComplexityLevel(type,clist_tmp[0])
            setComplexity({show:true,clist:clist_tmp,val:val})
            setShowcomplexity(false)
        }
    }
    return(
        <div data-test="complexButton" className='complx_btn'>
        <ModalContainer
        title='Complexity'
        close={()=>setShowcomplexity(false)}
        footer={<Footer type={type} submitComplexity={submitComplexity} nclist={nclist}/>}
        content={<Container nclist={nclist} refs={refs} setRefs={setRefs} setNclist={setNclist} type={type}/>} 
      /></div>
    )
}

const Container = ({type,nclist,refs,setRefs,setNclist}) => {
    const arr = cTableData[type]
    useEffect(()=>{
        setRefs((refs)=>Object.keys(arr).map((_,i)=>refs[i]||createRef()))
    },[arr,setRefs])
    const onFormChange = (e) => {
        var cscore_tmp = 0;
        refs.forEach((e)=>{
            var label = e.current.attributes["label"].textContent
            var value = e.current.value
            if(value !== "Select Option")e.current.style.borderColor = '';
            var cw = cx_weightage[label]? cx_weightage[label] : 0;
            var cs = cx_scale[value]? cx_scale[value] : 0;
            cscore_tmp = cscore_tmp + (cs * cw);
        })
        var a = [...nclist]
        a.splice(0,1,cscore_tmp)
        setNclist(a)
    }
    return(
        <div data-test="complexityContainer" className='complx_container'>
            <ScrollBar>
            {Object.entries(arr).map((e,i)=>(
                <div data-test="complexRows" key={i+'_cmplx'} className='complx_row'>
                    <label>{e[0]}</label>  
                    <select ref={refs[i]} label={e[0]} defaultValue={nclist?nclist[i+1]:undefined} onChange={onFormChange}>
                        <option  selected disabled={true}>Select Option</option>
                        {e[1].map(k=><option key={k+"_cr"} value={k}>{k}</option>)} 
                    </select>
                </div>
            ))}
            </ScrollBar>
        </div>
    )
}

const Footer = ({nclist,type,submitComplexity}) =>{
    var val = nclist.length>0?getComplexityLevel(type,nclist[0]):'Not Set'
    return(
    <div data-test="complexityFooter"className='complx_footer'>
        <label data-test="complexityLabel">{'complexity : ' +val}</label>
        <button data-test="okButton"className='complx_btn' onClick={submitComplexity}>OK</button>
    </div>
)}

const getComplexityLevel = (nType, csc)=>{
    if (nType === 'scenarios') {
        if (csc <= 20) {
            return 'Low';
        } else if (csc <= 30) {
            return 'Medium';
        } else {
            return 'High';
        }
    }
    if (nType === 'screens') {
        if (csc <= 20) {
            return 'Low';
        } else if (csc <= 30) {
            return 'Medium';
        } else {
            return 'High';
        }
    }
    if (nType === 'testcases') {
        if (csc <= 20) {
            return 'Low';
        } else if (csc <= 35) {
            return 'Medium';
        } else {
            return 'High';
        }
    } else return undefined;
}

const cx_weightage = { //scale , weightage
    'Application Type': 3,
    'Domain knowledge factor': 1,
    'Requirement Complexity': 2,
    'Test Data Requirement/complexity': 3,
    'Test Management Tool being used': 1,

    'Multi-lingual support': 5,
    '# of Objects': 5,

    'Analytical & Logical Reasoning': 1,
    'Team Capability': 1,
    '# of steps': 1,
    '# of Verification Points': 2,
    'Multi-browser support': 1,
    'Re-usability/Re-#': 2,
    'Database Check points': 1
}
const cx_scale = {
    //apptype
    'DW ETL (H)': 5,
    'Desktop (H)': 5,
    'Oracle (H)': 5,
    'SAP (H)': 5,
    'Mainframe Application (H)': 5,
    'Mobile Application - IOS (H)': 5,
    'Mobile Web - IOS (H)': 5,
    'Webservices - REST (M)': 3,
    'Mobile Web - Android (M)': 3,
    'Database Application (M)': 3,
    'Web Application (L)': 1,
    'Webservices - SOAP (L)': 1,
    'Mobile Application - Android (L)': 1,
    //Domain knowledge
    'Limited': 5,
    'Fair': 3,
    'Good': 1,
    'H': 5,
    'M': 3,
    'L': 1,
    //Test Management Tool
    'Yes': 5,
    'No': 3,
    //Multi-lingual support Multi-browser support
    '1': 1,
    '2 to 3': 3,
    '>3': 5,
    //# of objects
    '<11': 1,
    '11-25': 3,
    '>25': 5,
    //Analytical & Logical Reasoning + Team Capability
    'Very Low': 5,
    'Low': 4,
    'Nominal': 3,
    'High': 2,
    'Very High': 1,
    //# of Steps
    '< 15': 1,
    '15-30': 3,
    '>30': 5,
    //# of Verification Points Database Check points
    '< 2': 1,
    '3-8': 3,
    '>8': 5,
    //Re-usability/Re-#
    'Reused': 1,
    'Rehashed': 3,
    'NA': 5
};

const cTableData = {
    'scenarios' : {
        'Application Type': ['DW ETL (H)', 'Desktop (H)', 'Oracle (H)', 'SAP (H)', 'Mainframe Application (H)', 'Mobile Application - IOS (H)', 'Mobile Web - IOS (H)', 'Webservices - REST (M)', 'Mobile Web - Android (M)', 'Database Application (M)', 'Web Application (L)', 'Webservices - SOAP (L)', 'Mobile Application - Android (L)'],
        'Domain knowledge factor': ['Limited', 'Fair', 'Good'],
        'Requirement Complexity': ['H', 'M', 'L'],
        'Test Data Requirement/complexity': ['H', 'M', 'L'],
        'Test Management Tool being used': ['Yes', 'No']
    },
    'screens' : {
        'Multi-lingual support': ['1', '2 to 3', '>3'],
        '# of Objects': ['<11', '11-25', '>25']
    },
    'testcases' : {
        'Analytical & Logical Reasoning': ['Very Low', 'Low', 'Nominal', 'High', 'Very High'],
        'Team Capability': ['Very Low', 'Low', 'Nominal', 'High', 'Very High'],
        '# of steps': ['<15', '15-30', '>30'],
        '# of Verification Points': ['<3', '3-8', '>8'],
        'Multi-browser support': ['<1', '2-3', '>3'],
        'Re-usability/Re-#': ['NA', 'Reused', 'Rehashed'],
        'Database Check points': ['2', '3-8', '>8']
    }
};
Complexity.propTypes={
    "complexity":PropTypes.object.isRequired,
    "setComplexity":PropTypes.func,
    "setShowcomplexity":PropTypes.func
}
export {getComplexityLevel};
export default Complexity;
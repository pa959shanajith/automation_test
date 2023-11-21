import React ,{Fragment,useEffect,useState } from 'react';
import {ScrollBar , Messages as MSG, setMsg, ValidationExpression } from '../../global';

const Pairwise=(props)=>{
    const [optimizationType , SetOptimizationType]=useState(null);   
    
    useEffect(()=>{
        if (!props.pairwiseClicked) {
            SetOptimizationType(null);
            props.setLevel(0)
            props.setFactor(0)
        }
    }, [props.pairwiseClicked])

    useEffect(()=>{
        props.setLevel(0)
        props.setFactor(0)
       // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])
    const callKeyDown=(type)=>{   
        type ==="factor"?
        props.factref.current.value = ValidationExpression(props.factref.current.value,"optimazationInput"):
        props.levelref.current.value = ValidationExpression(props.levelref.current.value,"optimazationInput")

    }
return(
    <Fragment>
        {(optimizationType==="pairwise")?
                    <Fragment>
                        <div className="page-taskName" >
                            <span data-test="utl_pairwise_scr_name" className="taskname">
                                Pairwise
                            </span>
                        </div> 
                        <div className="pairwise_scr">
                            <span>Factor</span>
                            <input 
                                data-test="utl_pairwise_factor_inp"
                                placeholder="Enter Factor" 
                                ref={props.factref}
                                id={props.emptyCreateCall==="factor"?"EmptyCall":""}  
                                onChange={()=>{callKeyDown('factor')}}  
                                //value={props.factor}
                            />                            
                            <span>Level</span>
                            <input 
                                data-test="utl_pairwise_level_inp"
                                placeholder="Enter Level" 
                                ref={props.levelref}
                                id={props.emptyCreateCall==="level"?"EmptyCall":""}
                                onChange={()=>{callKeyDown("level")}}  

                            />
                            <button 
                                    className="btn-create"
                                    onClick={()=>props.callCreate()}
                                    data-test="utl_pairwise_create_btn"
                            >
                                Create
                            </button>
                            <button 
                                    className="btn-utl" 
                                    onClick={()=>props.callGenerate()}
                                    data-test="utl_pairwise_generate_btn"
                            >
                                Generate
                            </button>
                        
                        <br/>
                            {props.gererateClick && setMsg(MSG.UTILITY.ERR_EMPTY_TABLE)}                        
                        </div>
                    <div className="pairsie_array_container">
                    <div className="pw__ab">
                    <div className="pw__min">
                    <div className="pw__con" id="scrapeObjCon">
                        <ScrollBar thumbColor ={"#311d4e"} trackColor ={"rgb(211, 211, 211);"}>                        
                            <div className="pairwise_array">
                            {/* <ScrollBar thumbColor ={"#311d4e"} trackColor ={"rgb(211, 211, 211);"}> */}
                                {Array.from(Array(props.factor)).map((e,i)=>(
                                        <div className='factor__row' key={i} >
                                            <input  key={i} onChange={(e)=>props.updateInputFactorTable(e,i)} type="text"/>
                                            {Array.from(Array(props.level)).map((e,i)=>
                                                <input onChange={(e)=>props.updateInputLevelTable(e,i)} key={i} type="text"/>
                                            )}
                                        </div>
                                ))}
                                
                            {/* </ScrollBar> */}
                            </div>
                        </ScrollBar>
                        </div></div></div></div>
                    </Fragment> :
                    <Fragment>
                        <div className="page-taskName">
                            <span data-test="utl_optimization_scr_name" className="taskname">
                                Optimization
                            </span>
                        </div>
                        <div id="optimization-fn">
                            <div>
                                <div data-test="utl_optimization_pairwise_div" onClick={()=>{SetOptimizationType("pairwise"); props.setPairwiseClicked(true);}} className="pairwise">
                                    <img data-test="utl_optimization_pairwise_logo" src='static/imgs/ic-pairwise.png' alt="Pairwise_img"/>
                                    <div>Pairwise</div>
                                </div>
                                <div data-test="utl_optimization_orthogonal_div" className="pairwise">
                                    <img data-test="utl_optimization_orthogonal_logo" src='static/imgs/ic-orthogonal-array.png' alt="Orthogonal_img"/>
                                    <div>Orthogonal Array</div>
                                </div>
                            </div>
                        </div>
                    </Fragment>}
                    </Fragment>
)
}

export default Pairwise;
import React ,{Fragment,useState } from 'react';
import {ScrollBar ,PopupMsg} from '../../global';

const Pairwise=(props)=>{
    const [optimizationType , SetOptimizationType]=useState(null);
return(
    <Fragment>
        {(optimizationType==="pairwise")?
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
                                ref={props.factref}
                            />
                            <span>Level</span>
                            <input 
                                type="number"  
                                placeholder="Enter Level" 
                                ref={props.levelref}
                            />
                            <button  className="btn-create" onClick={()=>{props.setLevel(parseInt(props.levelref.current.value));props.setFactor(parseInt(props.factref.current.value))}}>Create</button>
                            <button className="btn-utl" onClick={()=>props.callGenerate()}>Generate</button>
                        </div>
                        <br/>
                            {props.gererateClick && <PopupMsg 
                                                content={"Table values cannot be empty"} 
                                                title={"Pairwise"} 
                                                submit={()=>props.setGenerateClick(false) } 
                                                submitText={"Ok"} 
                                                close={()=>props.setGenerateClick(false)}
                                                />}
                            <div className="pairwise_array">
                            <ScrollBar thumbColor ={"#311d4e"} trackColor ={"rgb(211, 211, 211);"}>
                                {Array.from(Array(props.factor)).map((e,i)=>(
                                        <div className='factor__row' key={i} >
                                            <input  key={i} onChange={(e)=>props.updateInputFactorTable(e,i)} type="text"/>
                                            {Array.from(Array(props.level)).map((e,i)=>
                                                <input onChange={(e)=>props.updateInputLevelTable(e,i)} key={i} type="text"/>
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
                                <div onClick={()=>SetOptimizationType("pairwise")} className="pairwise">
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
)
}

export default Pairwise;
import React, { useState } from 'react';
import "../styles/MappedLabel.scss";

const MappedLabel = props => {

    const [show, setShow] = useState(false);

    return (
        <div className="mlalm__container" data-type={props.type}>
            <div className="mlalm_topLabel" data-selected={props.selected.includes(`${props.mapIdx}-0`)}>
                <div className="mlalm_label" 
                    onClick={props.handleClick ? (e)=>props.handleClick(e, props.type, `${props.mapIdx}-0`) : null}
                >
                {typeof(props.list) === "object" ? props.list[0] : props.list}</div>
                
                { props.selected.includes(`${props.mapIdx}-0`) && !props.unSynced &&
                    <button><img className="mlalm__syncBtn" alt="s-ic" onClick={props.handleUnSync ? ()=>props.handleUnSync(props.type) : null} src="static/imgs/ic-qcUndoSyncronise.png" /></button>
                }
                { typeof(props.list) === "object" && props.list.length>1 && <button onClick={()=>setShow(!show)}>
                    <img alt="mappedScrArrow" src={`static/imgs/alm_arrow_${show?"up":"down"}.svg`}/>
                </button> }
            </div>
            { show &&
                props.list.slice(1).map((item, idx) => 
                    <div className="mlalm_topLabel" key={idx} data-selected={props.selected.includes(`${props.mapIdx}-${idx+1}`)}>
                        <div className="mlalm_label" 
                            onClick={props.handleClick ? (e)=>props.handleClick(e, props.type, `${props.mapIdx}-${idx+1}`) : null}
                        >
                            {item}
                        </div>
                        { props.selected.includes(`${props.mapIdx}-${idx+1}`) && !props.unSynced &&
                            <button><img className="mlalm__syncBtn" alt="s-ic" onClick={props.handleUnSync ? ()=>props.handleUnSync(props.type) : null} src="static/imgs/ic-qcUndoSyncronise.png" /></button>
                        }
                    </div>
                )
            }
            
        </div>
    );
}

export default MappedLabel;
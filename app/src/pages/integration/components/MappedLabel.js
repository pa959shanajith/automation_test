import React, { useState, Fragment} from 'react';
import "../styles/MappedLabel.scss";
import { updateScrollBar } from '../../global';
import InfoPopup from './InfoPopup';

const MappedLabel = props => {
    const [info, setInfo] = useState(false);
    const [testId, settestId] = useState(0);
    const [show, setShow] = useState(false);
    const type = props.type
    const screenType = props.screenType
    const reqDetails = props.reqDetails
    const displayError = props.displayError

    return (
        <Fragment>
            { typeof(props.list) === "object" && props.list.length>1}
                {info?<InfoPopup reqDetails={reqDetails[testId]} displayError={displayError} screenType={screenType} setInfo={setInfo}/>:null}
            <div className="mlalm__container" data-type={props.type}>
                <div className="mlalm_topLabel" data-selected={props.selected.includes(`${props.mapIdx}-0`)}>
                    <div className="mlalm_label" 
                        onClick={props.handleClick ? (e)=>props.handleClick(e, props.type, `${props.mapIdx}-0`) : null}
                    >
                        {typeof(props.list) === "object" ? props.list[0] : props.list}{(props.summary) ? ' : '+props.summary : ''}
                    </div>
                    {(type==='testcase' && screenType==='Zephyr')?
                        <i onClick={()=>setInfo(true)} className="fa fa-info" title="Requirement mapping info" aria-hidden="true" style={{fontSize:'15px',margin:'3px',color:'#633691',cursor:'pointer'}}/>:null
                    }
                    { props.selected.includes(`${props.mapIdx}-0`) && !props.unSynced &&
                        <button><img className="mlalm__syncBtn" alt="s-ic" title="UnSync" onClick={props.handleUnSync ? ()=>props.handleUnSync(props.type) : null} src="static/imgs/ic-qcUndoSyncronise.png" /></button>
                    }
                    { typeof(props.list) === "object" && props.list.length>1 && <button onClick={()=>{setShow(!show); updateScrollBar()}}>
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
                            {(type==='testcase' && (screenType==='Zephyr' || screenType==='Jira' || screenType==='Azure'))?
                                <i onClick={()=>{setInfo(true); settestId(idx+1);}} className="fa fa-info" title="Requirement mapping info" aria-hidden="true" style={{fontSize:'15px',margin:'3px',color:'#633691',cursor:'pointer'}}/>:null
                            }
                            { props.selected.includes(`${props.mapIdx}-${idx+1}`) && !props.unSynced &&
                                <button><img className="mlalm__syncBtn" alt="s-ic" title="UnSync" onClick={props.handleUnSync ? ()=>props.handleUnSync(props.type) : null} src="static/imgs/ic-qcUndoSyncronise.png" /></button>
                            }
                        </div>
                    )
                }
            </div>
        </Fragment>
    );
}

export default MappedLabel;
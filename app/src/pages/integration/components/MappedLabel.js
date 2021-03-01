import React, { useState } from 'react';
import "../styles/MappedLabel.scss";

const MappedLabel = props => {

    const [show, setShow] = useState(false);

    return (
        <div className="mlalm__container" style={{backgroundColor:props.type==="scenario"?"#E1CAFF":"rgba(250, 215, 241, 0.984)"}}>
            <div className="mlalm_topLabel">
                <div className="mlalm_label">{props.list[0]}</div>
                { props.list.length>1 && <button onClick={()=>setShow(!show)}>
                    <img src={`static/imgs/alm_arrow_${show?"up":"down"}.svg`}/>
                </button> }
            </div>
            { show &&
                props.list.slice(1).map((item, idx) => <div key={idx} className="mlalm_label">
                    {item}
                </div>)
            }
            
        </div>
    );
}

export default MappedLabel;
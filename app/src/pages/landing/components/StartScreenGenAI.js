import React from 'react';
import "../styles/GenAi.scss";

const StartScreenGenAI = () => {
    return (
        <div className='flexRow parentDiv'>
            <div className='flexColumn centerContent'>
                <div className='flexColumn centerContent imgDiv'>
                    <img src={"static/imgs/thunder.svg"} style={{ padding: "3px", width: "44px", height: "44px" }} />
                    <span>Capabilities</span>
                </div>
                <div className='blockCard'>
                    <p>Allows user to provide follow-up corrections</p>
                </div>
                <div className='blockCard'>
                    <p>Trained to decline inappropriate requests</p>
                </div>
            </div>

            <div className='flexColumn centerContent'>
                <div className='flexColumn centerContent imgDiv'>
                    <img src={"static/imgs/caution.svg"} width={"48px"} height={"48px"} />
                    <span>Limitations</span>
                </div>
                <div className='blockCard'>
                    <p>May occasionally generate incorrect information</p>
                </div>
                <div className='blockCard'>
                    <p>May occasionally produce biased content</p>
                </div>
            </div>
        </div>
    )
}

export default StartScreenGenAI;
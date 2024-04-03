import React from 'react';
import "../styles/GenAi.scss";

const BlankScreenGenAI = () => {
    return (
        <div className="flexColumn parentDiv">
            <img className='imgDiv' src={"static/imgs/emptyTestcase.svg"} width="180px" />
            <p>Select any one of the three methods mentioned above</p>
        </div>
    )
};

export default BlankScreenGenAI;
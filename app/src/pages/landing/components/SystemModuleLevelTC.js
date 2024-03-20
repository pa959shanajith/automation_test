import React from 'react';
import '../styles/GenAi.scss';
import { Button } from 'primereact/button';

export const BlankScreenGenAI = () => {
    return (
        <div className='flexColumn parentDiv'>
            <img className='imgDiv' src={'static/imgs/emptyTestcase.svg'} width='180px' />
            <p>Select any one of the three methods mentioned above</p>
            <Button label='Generate' style={{ marginTop: '20px' }} onClick={() => { }}></Button>
        </div>
    )
};
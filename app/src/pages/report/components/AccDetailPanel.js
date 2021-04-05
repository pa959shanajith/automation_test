import React, { useState , useEffect } from 'react';
import { useSelector } from 'react-redux'
import { ScrollBar } from '../../global';
import '../styles/ExecPanel.scss';
import { reportStatusScenarios_ICE } from '../api';
import { Fragment } from 'react';

const AccDetailPanel = ({scDetails}) => {
    if (scDetails.length < 1){
        return null;
    }
    return(
        <Fragment>
            <div id='ar__detail-panel' className='panel rp__detail'>
                <div className='ar__panel-head'>Scenario Details</div>
            </div>
        </Fragment>
    )
}

export default AccDetailPanel;
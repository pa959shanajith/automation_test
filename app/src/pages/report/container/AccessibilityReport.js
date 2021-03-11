import React, { useState, Fragment, useEffect } from 'react';
import ModuleList from '../components/ModuleList';
import ToolbarMenu from '../components/ToolbarMenu';
import { ScreenOverlay ,PopupMsg, ScrollBar} from '../../global';
import { useDispatch } from 'react-redux';
import ExecutionPanel from '../components/ExecutionPanel';
import ScStatusPanel from '../components/ScStatusPanel';
import ScDetailPanel from '../components/ScDetailPanel';
import * as actionTypes from '../state/action';
import '../styles/TestingReport.scss';

/*Component AccessibilityReport
  use: renders AccessibilityReport is a container for report layout
*/

const AccessibilityReport = ({setBlockui,displayError}) =>{
    return(
        <Fragment></Fragment>
    )
}

export default AccessibilityReport;
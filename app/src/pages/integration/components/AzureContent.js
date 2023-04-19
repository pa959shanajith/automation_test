import { NormalDropDown } from '@avo/designcomponents';
import React, { useRef,useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
// import '../styles/Solman.scss';
import { parseProjList } from '../../mindmap/containers/MindmapUtils';
import * as pluginApi from "../api";
import { getDetails_ICE } from "../../plugin/api";
import { useSelector, useDispatch } from 'react-redux';

import { useHistory, Redirect } from 'react-router-dom';
// import { useHistory } from 'react-router-dom';
import { getProjectList, getModules, getScreens, saveMindmap } from '../../mindmap/api';
import { ScreenOverlay, setMsg, ReferenceBar, ResetSession, Messages as MSG, RedirectPage } from '../../global';
import { ListBox } from 'primereact/listbox';
import LeftPanel from '../../admin/containers/LeftPanel';
import { Checkbox } from 'primereact/checkbox';
import LoginModal from './LoginModal';
import * as actionTypes from '../state/action.js';

import { Dialog } from 'primereact/dialog';
import {TextField} from '@avo/designcomponents'
import * as actionTypesGlobal from "../../global/state/action"
import * as actionTypesMindmap from '../../mindmap/state/action';
import { SearchBox } from '@avo/designcomponents';
import Leftbar from '../../utility/components/Leftbar';

const AzureContent = ({props }) => {
    // const [testScenarioCheck, settestScenarioCheck] = useState(true);
    // const [testScenario, settestScenario] = useState(true);
    // const [selectedModule, setSelectedModule] = useState(null);
    // const [selectedProject, setSelectedProject] = useState(null);
    // const [displayCreateModule, setDisplayCreateModule] = useState(false);
    // const [projModules, setProjModules] = useState([]);
    // const [allProjects, setAllProjects] = useState([]);
    // const history = useHistory();
    // // const [selectedScenario, setSelectedScenario] = useState(null);
    // // const [appType, setAppType] = useState(null);
    // // const history = useHistory();
    // const [blockui, setBlockui] = useState({ show: false })
    // const [loading, setLoading] = useState(false);
    // const moduleSelect = useSelector(state => state.mindmap.selectedModule);
    // const [selectedScenario, setSelectedScenario] = useState(null);
    // const [modScenarios, setModScenarios] = useState([]);

    
   
    // const [redirectTo, setRedirectTo] = useState("");
    // const [selectedScenarios,setSelectedScenarios]=useState([]);

    // const dispatch = useDispatch();
    // const screenType = useSelector(state=>state.integration.screenType);
    // const [displayBasic, setDisplayBasic] = useState(false);
    // const [position, setPosition] = useState('center');
    // const [projectNames, setProjectNames] = useState(null);

    // const handleLinkChange = () => {
    //     settestScenarioCheck(true);


    // };
    // const handleCancleChange = () => {
    //     settestScenarioCheck(false);
    // }
    
   
    // const ChangeToGenius = () => {
    //     settestScenario(true);
    // }

    // const ChangeToMindmap = (e) => {
    //     window.localStorage['navigateScreen'] = "mindmap";
    //     setRedirectTo(`/mindmap`);
    
    //     settestScenario(false);
    // }
    // const onScenarioSelection = (e) => {
    //     let Selscenarios= [...selectedScenarios];

    //     if (e.checked)
    //         Selscenarios.push(e.value);
    //     else
    //     Selscenarios.splice(Selscenarios.indexOf(e.value), 1);

    //     setSelectedScenarios(Selscenarios);
    // }
    // const dialogFuncMap = {
    //     'displayBasic': setDisplayBasic,
    // }
    // const onHide = (name) => {
    //     dialogFuncMap[`${name}`](false);
    // }
    
    // useEffect(() => {
    //     (async () => {
    //         let res = await getDetails_ICE(["domaindetails"], ["Banking"]);
    //         if (res === "Invalid Session") return RedirectPage(history);
    //         if (res.error) { displayError(res.error); return; }
    //         const arraynew = res.projectIds.map((element, index) => {
    //             return (
    //                 {
    //                     key: element,
    //                     text: res.projectNames[index],
    //                     title: res.projectNames[index],
    //                     index: index
    //                 }
    //             )
    //         });
    //         setAllProjects(arraynew);
    //     })()
    // }, [])

    // useEffect(() => {
    //     (async () => {
    //         if (selectedProject && selectedProject.key) {
    //             setSelectedModule(null);
    //             setSelectedScenario(null);
    //             // setAppType(null);
    //             var modulesdata = await getModules({ "tab": "tabCreate", "projectid": selectedProject ? selectedProject.key : "", "moduleid": null });
    //             if (modulesdata === "Invalid Session") return RedirectPage(history);
    //             if (modulesdata.error) { displayError(modulesdata.error); return; }
    //             setProjModules(modulesdata);
    //         }
    //     })()
    // }, [selectedProject])

    // useEffect(() => {
    //     (async () => {
    //       if (selectedModule && selectedModule.key) {
    //         setSelectedScenario(null);
    //         var moduledata = await getModules({ "tab": "tabCreate", "projectid": selectedProject ? selectedProject.key : "", "moduleid": [selectedModule.key], cycId: null })
    //         if (moduledata === "Invalid Session") return RedirectPage(history);
    //         if (moduledata.error) { displayError(moduledata.error); return; }
    //         setModScenarios(moduledata.children);
    //       }
    //     })()
    //   }, [selectedModule])

    // const displayError = (error) => {
    //     console.log(error)
    //     setBlockui({ show: false })
    //     setLoading(false)
    //     setMsg(typeof error === "object" ? error : MSG.CUSTOM(error, "error"))
    // }
    
    // const callIconClick = iconType => {
    //     let clickedScreen = null;
    //     if(["qTest","ALM","Zephyr","Azure"].includes(iconType)) clickedScreen = iconType;
    //     else if(iconType === "Import") 
    //     {   clickedScreen = "Zephyr";
    //         props.setImportPop(true)
    //     }

    //     window.localStorage['integrationScreenType'] = clickedScreen;
    //     dispatch({ type: actionTypes.INTEGRATION_SCREEN_TYPE, payload: clickedScreen });
    //     dispatch({ type: actionTypes.VIEW_MAPPED_SCREEN_TYPE, payload: null });
    // }
    // const onClick = (name, position) => {
    //     dialogFuncMap[`${name}`](true);

    //     if (position) {
    //         setPosition(position);
    //     }
    // }

    return (
        <div className='Header' >
            <span className='header-title'>
                <div className='headeing'>
                    <span>Solman Integration</span>
                </div>
               
            </span>
            


    
     </div>
            );
}

export default AzureContent;
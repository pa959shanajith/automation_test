import React, { useState, useEffect } from 'react';
import {ScreenOverlay, ScrollBar, setMsg} from '../../global' 
import {getPreferences} from '../api';
import '../styles/Preferences.scss'


/*Component Preferences
  use: defines Admin middle Section for Preferences Sections
  ToDo:
*/

const Preferences = (props) => {
    const [loading,setLoading] = useState(false)
    const [resultList,setResultList] = useState([])
    var rows = ["ALM","Mindmap","Reports","Utility"];

    useEffect(()=>{
        setLoading("Loading...");
        (async()=>{
            const response = await getPreferences()
            if(response.error){displayError(response.error);return;}
            setResultList(response);
        })()
        setLoading(false);
        // eslint-disable-next-line
    },[props.resetMiddleScreen["Preferences"],props.MiddleScreen])

    const displayError = (error) =>{
        setLoading(false)
        setMsg(error)
    }

    return (
        <ScrollBar thumbColor="#929397">
        <div className="preferences_container">
            {loading?<ScreenOverlay content={loading}/>:null}
            <div id="page-taskName"><span>Preferences</span></div>
            
            <div className="container preferencesTbl">
				<table id="preferencesTable" className=" customtblWidth table">
					<thead>
						<tr id="head">
							<th>Plugins/Modules</th>
							<th>Admin</th>
							<th>Test Manager</th>
							<th>Test Lead</th>
							<th>Test Engineer</th>
                            {/* {
                                Object.keys(resultList).forEach((data, index) => (
                                    <th key={index} value={data} >{resultList[data]}</th>
                                ))
                            } */}
                            {/* {resultList.map((data,index)=>(
                                <th key={index} value={data.name} >{data.name}</th>
                            ))} */}
						</tr>
					</thead>
					<tbody id="pref">
                    <tr>
                        <td>Admin</td>
                        <td><input type='checkbox' value='' checked={true} className='module_admin' disabled/></td>
                        <td><input type='checkbox' value='' className='module_admin' disabled/></td>
                        <td><input type='checkbox' value='' className='module_admin' disabled/></td>
                        <td><input type='checkbox' value='' className='module_admin' disabled/></td>
                    </tr>
                    <tr id="rows">
                        <td>Manage Project</td>
                        <td><input type='checkbox' value='' className='module_admin' disabled/></td>
                        <td><input type='checkbox' value='' checked={true} className='module_admin' disabled/></td>
                        <td><input type='checkbox' value='' className='module_admin' disabled/></td>
                        <td><input type='checkbox' value='' className='module_admin' disabled/></td>
                        {/* {Object.keys(resultList).forEach((data,index)=>(
                            <td key={index}><input disabled key={index} type='checkbox' value='' checked={(['Test Lead', 'Test Engineer'].indexOf(resultList[data]) > -1)? true:false} className='module_admin'/></td>
                        ))} */}
                    </tr>
                    {Object.keys(resultList).map((data,index)=>{
                        if(resultList[data] && (data === "alm" || data === "mindmap")){
                        return(
                        <tr key={index} >
                            <td>{(data === "alm") ? 'Integration' : 'Create Mindmap'}</td>
                            <td><input type='checkbox' value='' className='module_admin' disabled/></td>
                            <td><input type='checkbox' value='' checked={true} className='module_admin' disabled/></td>
                            <td><input type='checkbox' value='' checked={true} className='module_admin' disabled/></td>
                            <td><input type='checkbox' value='' className='module_admin' disabled/></td>
                            {/* {Object.keys(resultList).forEach((data1,index)=>(
                                <tdkey={index}><input disabled key={index} type='checkbox' value='' checked={(data1.plugins[data.toLowerCase()]===true)? true:false} className='module_admin'/></td>
                            ))} */}
                        </tr>
                        )} else if(resultList[data] && (data === "reports" || data === "utility" || data === "apg" || data === "dashboard" || data === "seleniumtoavo")){
                            return(
                            <tr key={index} >
                                <td>{(data === "reports") ? 'Reports' : (data === "utility") ? 'Utility' : (data === "apg") ? 'APG' : (data === "dashboard") ? 'Dashboard' : (data === "seleniumtoavo") ? 'Selenium To Avo' : ''}</td>
                                <td><input type='checkbox' value='' className='module_admin' disabled/></td>
                                <td><input type='checkbox' value='' checked={true} className='module_admin' disabled/></td>
                                <td><input type='checkbox' value='' checked={true} className='module_admin' disabled/></td>
                                <td><input type='checkbox' value='' checked={["utility","reports","seleniumtoavo"].includes(data)?true:false} className='module_admin' disabled/></td>
                            </tr>
                        )}
                    })}
                    </tbody>
				</table>
			</div>
        </div>
        </ScrollBar>    
    );
}

export default Preferences;
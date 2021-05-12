import React, { useState, useEffect } from 'react';
import {ScreenOverlay, PopupMsg, ScrollBar} from '../../global' 
import {getPreferences} from '../api';
import '../styles/Preferences.scss'


/*Component Preferences
  use: defines Admin middle Section for Preferences Sections
  ToDo:
*/

const Preferences = (props) => {
    const [loading,setLoading] = useState(false)
    const [resultList,setResultList] = useState([])
    const [popup,setPopup] = useState({show:false})
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
        setPopup({
            title:'ERROR',
            content:error,
            submitText:'Ok',
            show:true
        })
    }

    return (
        <ScrollBar thumbColor="#929397">
        <div className="preferences_container">
            {(popup.show)?<PopupMsg submit={()=>setPopup({show:false})} close={()=>setPopup({show:false})} title={popup.title} content={popup.content} submitText={popup.submitText}/>:null}
            {loading?<ScreenOverlay content={loading}/>:null}
            <div id="page-taskName"><span>Preferences</span></div>
            
            <div className="container preferencesTbl">
				<table id="preferencesTable" className=" customtblWidth table">
					<thead>
						<tr id="head">
							<th>Plugins/Modules</th>
                            {resultList.map((data,index)=>(
                                <th key={index} value={data.name} >{data.name}</th>
                            ))}
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
                        <td>ICE</td>
                        {resultList.map((data,index)=>(
                            <td key={index}><input disabled key={index} type='checkbox' value='' checked={(['Test Lead', 'Test Engineer'].indexOf(data.name) > -1)? true:false} className='module_admin'/></td>
                        ))}
                    </tr>
                    {rows.map((data,index)=>{
                        if(data==="ALM"){
                        return(
                        <tr key={index} >
                            <td >Integration</td>
                            {resultList.map((data1,index)=>(
                                <td key={index}><input disabled key={index} type='checkbox' value='' checked={(data1.plugins[data.toLowerCase()]===true)? true:false} className='module_admin'/></td>
                            ))}
                        </tr>
                        )}else{
                            return(
                            <tr key={index} >
                                <td >{data}</td>
                                {resultList.map((data1,index)=>(
                                    <td key={index}><input disabled key={index} type='checkbox' value='' checked={(data1.plugins[data.toLowerCase()]===true)? true:false} className='module_admin'/></td>
                                ))}
                            </tr>
                            )
                        }
                    })}
                    </tbody>
				</table>
			</div>
        </div>
        </ScrollBar>    
    );
}

export default Preferences;
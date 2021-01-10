import React, { Fragment, useState, useEffect } from 'react';
import {ScreenOverlay, PopupMsg, ScrollBar} from '../../global' 
import {manageCIUsers} from '../api';
import '../styles/TokenMgmtList.scss'


/*Component TokenMgmtList
  use: Token Mgmt CI Tokens Table 
  ToDo:
*/

const TokenMgmtList = (props) => {

    const [loading,setLoading] = useState(false)
	const [popupState,setPopupState] = useState({show:false,title:"",content:""}) 
	const [searchTasks,setSearchTasks] = useState("")
	const [allTokensModify,setAllTokensModify] = useState(props.allTokens)
    const [firstStop,setFirstStop] = useState(false)

    useEffect(()=>{
        if(firstStop) setFirstStop(!firstStop);
        else setAllTokensModify(props.allTokens);
    },[props.allTokens])

    const closePopup = () =>{
        setPopupState({show:false,title:"",content:""});
	}
	
	const searchList = (val) =>{
		const items = props.allTokens.filter((e)=>e.name.toUpperCase().indexOf(val.toUpperCase())!==-1)
        setAllTokensModify(items);
    }
    
    const deactivate = async (entry) => {
        const CIUser = {
			'userId': props.targetid,
			'tokenName': entry.name
        };
		const data = await manageCIUsers("deactivate", CIUser);
        if(data.error){displayError(data.error);return;}
        setLoading(false);
        setPopupState({show:true,title:"Token Management",content: "Token '"+CIUser.tokenName+"' has been Deactivated"});
        data.sort((a,b)=>a.deactivated.localeCompare(b.deactivated));
        data.forEach(e=>e.expiry=new Date(e.expiry).toString().slice(0,-22))
        props.setAllTokens(data);
    }

    const displayError = (error) =>{
        setLoading(false)
        setPopupState({
            title:'ERROR',
            content:error,
            submitText:'Ok',
            show:true
        })
    }

    return (
        <Fragment>
            {popupState.show?<PopupMsg content={popupState.content} title={popupState.title} submit={closePopup} close={closePopup} submitText={"Ok"} />:null}
            {loading?<ScreenOverlay content={loading}/>:null}
            
            <div className="col-xs-9 adminForm-tkn-mgmt" style={{paddingTop:"0",width:"83%"}}>
                <div className="tkn-mgmt-Wrap">
                    <div  className="sessionHeading-tkn-mgmt" data-toggle="collapse" data-target="#activeUsersToken-x">
						<h4 onClick={()=>{props.setShowList(!props.showList);}} >CI Tokens</h4>
						<div  className="search-tkn-mgmt search-list-tkn-mgmt">
							<span className="searchIcon searchIcon-list" >
								<img src={"static/imgs/ic-search-icon.png"} className="search-img-list" />
							</span>
							<input value={searchTasks} autoComplete="off" onChange={(event)=>{ setSearchTasks(event.target.value);searchList(event.target.value)}} type="text" id="searchTasks"  className="searchInput searchInput-list-tkn-mgmt" />
						</div>
					</div>
                    {props.showList ?
                        <div id="activeUsersToken" className="wrap active-users-token" >
                            <ScrollBar scrollId='activeUsersToken' thumbColor="#929397" >
                            <table className = "table table-hover sessionTable" id="tokensDetail">
                                <tbody >
                                <tr>
                                    <th> Token Name </th>
                                    <th> Status </th>
                                    <th> Expiry </th>
                                    <th> Action </th>
                                </tr>
                                {allTokensModify.map((token,index)=>(
                                    <tr key={index} className='provisionTokens'>
                                        <td> {token.name} </td>
                                        <td> {token.deactivated} </td>
                                        <td> {token.expireson} </td>
                                        {token.deactivated === 'active'? <td><button className="btn btn-list-tkn-mgmt" onClick={()=>{deactivate(token)}} > Deactivate </button></td>:null}
                                        {token.deactivated !== 'active'?<td ></td> :null}
                                    </tr> 
                                ))}
                                </tbody>
                            </table>
                            </ScrollBar>
                        </div>
                    :null}
                </div>
            </div>
        </Fragment>
  );
}

export default TokenMgmtList;
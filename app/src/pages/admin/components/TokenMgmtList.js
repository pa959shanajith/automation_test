import React, { Fragment, useState, useEffect, useRef } from 'react';
import {ScreenOverlay, ScrollBar, VARIANT, Messages as MSG, setMsg } from '../../global'
import { useSelector } from 'react-redux';
import {manageCIUsers} from '../api';
import '../styles/TokenMgmtList.scss'


/*Component TokenMgmtList
  use: Token Mgmt CI Tokens Table 
  ToDo:
*/

const TokenMgmtList = (props) => {
    const dateFormat = useSelector(state=>state.login.dateformat);
    const [loading,setLoading] = useState(false)
	const [allTokensModify,setAllTokensModify] = useState(props.allTokens)
    const [firstStop,setFirstStop] = useState(false)
    const searchRef =  useRef();

    useEffect(()=>{
        if(firstStop) setFirstStop(!firstStop);
        else updateTokenList();
        // eslint-disable-next-line
    },[props.allTokens])

	
	const updateTokenList = () =>{
		const items = props.allTokens.filter((e)=>e.name.toUpperCase().indexOf(searchRef.current.value.toUpperCase())!==-1)
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
        setMsg(MSG.CUSTOM("Token '"+CIUser.tokenName+"' has been Deactivated",VARIANT.SUCCESS));
        data.sort((a,b)=>a.deactivated.localeCompare(b.deactivated));
        data.forEach(e=>e.expiry=new Date(e.expiry).toString().slice(0,-22))
        props.setAllTokens(data);
    }

    const displayError = (error) =>{
        setLoading(false)
        setMsg(error)
    }
    const formatDate = (date) => {
        var d = new Date(date),
            month = '' + (d.getMonth() + 1),
            day = '' + d.getDate(),
            year = d.getFullYear(),
            hour = '' + d.getHours(),
            minute = '' + d.getMinutes();
    
        if (month.length < 2) 
            month = '0' + month;
        if (day.length < 2) 
            day = '0' + day;
        if (hour.length < 2)
            hour = '0' + hour
        if (minute.length < 2)
            minute = '0' + minute 

        let map = {"MM":month,"YYYY": year, "DD": day};
        let def = [day,month,year];
        let format = dateFormat.split("-");
        let arr = []
        let used = {}
        for (let index in format){
            if (!(format[index] in map) || format[index] in used){
                return def.join('-') + " " + [hour,minute].join(':');
            }
            arr.push(map[format[index]]) 
            used[format[index]] = 1
        }

        return arr.join('-') + " " + [hour,minute].join(':');
    }


    return (
        <Fragment>
            {loading?<ScreenOverlay content={loading}/>:null}
            
            <div className="col-xs-9 adminForm-tkn-mgmt" style={{paddingTop:"0",width:"83%"}}>
                <div className="tkn-mgmt-Wrap">
                    <div  className="sessionHeading-tkn-mgmt" data-toggle="collapse" data-target="#activeUsersToken-x">
						<h4 onClick={()=>{props.setShowList(!props.showList);}} >CI Tokens</h4>
						<div  className="search-tkn-mgmt search-list-tkn-mgmt">
							<span className="searchIcon searchIcon-list" >
								<img src={"static/imgs/ic-search-icon.png"} className="search-img-list" alt={"Search Icon"}/>
							</span>
							<input ref={searchRef} autoComplete="off" onChange={()=>{updateTokenList()}} type="text" id="searchTasks"  className="searchInput searchInput-list-tkn-mgmt" />
						</div>
					</div>
                    {props.showList ?
                        <div id="activeUsersToken" className="wrap active-users-token" >
                            <table className = "table table-hover sessionTable" id="tokensDetail">
                                <tbody >
                                <tr className="tkn-table__row">
                                    <th className="tkn-table__name"> Token Name </th>
                                    <th className="tkn-table__status"> Status </th>
                                    <th className="tkn-table__exp"> Expiry </th>
                                    <th className="tkn-table__action"> Action </th>
                                </tr>
                                {allTokensModify.map((token,index)=>(
                                    <tr key={index} className='tkn-table__row provisionTokens'>
                                        <td className="tkn-table__name"> {token.name} </td>
                                        <td className="tkn-table__status"> {token.deactivated} </td>
                                        <td data-test="token_expiry_date" className="tkn-table__exp"> {formatDate(token.expireson)} </td>
                                        {token.deactivated === 'active'? <td className="tkn-table__action"><button className="btn btn-list-tkn-mgmt tkn-table__button" onClick={()=>{deactivate(token)}} > Deactivate </button></td>:null}
                                        {token.deactivated !== 'active'?<td className="tkn-table__action"></td> :null}
                                    </tr> 
                                ))}
                                </tbody>
                            </table>
                        </div>
                    :null}
                </div>
            </div>
        </Fragment>
  );
}

export default TokenMgmtList;
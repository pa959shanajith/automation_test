import React, { Fragment, useState, useEffect } from 'react';
import {ScreenOverlay, PopupMsg, ScrollBar} from '../../global' 
import {manageCIUsers} from '../api';
import { useSelector } from 'react-redux';
import TokenMgmtForm from '../components/TokenMgmtForm';
import TokenMgmtList from '../components/TokenMgmtList';
import '../styles/TokenManagement.scss'

/*Component TokenManagement
  use: defines Admin middle Section for Token Management
  ToDo:
*/

const TokenManagement = (props) => {

    const userInfo = useSelector(state=>state.login.userinfo);

    const [loading,setLoading] = useState(false)
    const [popupState,setPopupState] = useState({show:false,title:"",content:""}) 
    const [op,setOp] = useState("normal")
    const [name,setName] = useState("")
    const [token,setToken] = useState("")
    const [targetid,setTargetid] = useState(" ")
    const [allTokens,setAllTokens] = useState([])
    const [allICE,setAllICE] = useState([{'_id':' ', 'icename':'Select ICE', 'icetype':'ci-cd'}])
    const [dateVal,setdateVal] = useState("")
    const [timeVal,setTimeVal] = useState("")
    const [nameErrBorder,setNameErrBorder] = useState(false)
    const [selAssignUser2ErrBorder,setSelAssignUser2ErrBorder] = useState(false)
    const [runLoadData,setRunLoadData] = useState(true)
	const [refresh,setRefresh] = useState(false)
	const [showList,setShowList] = useState(false)

    useEffect(()=>{
		setOp("normal");
		setdateVal("");
		setTimeVal("");
    },[props.resetMiddleScreen["tokenTab"],props.MiddleScreen])

	const displayError = (error) =>{
        setLoading(false)
        setPopupState({
            title:'ERROR',
            content:error,
            submitText:'Ok',
            show:true
        })
    }

    const generateCIusertokens = async () =>{
        setNameErrBorder(false);
		setSelAssignUser2ErrBorder(false);
		const icetype = op;
		const userId = targetid.trim();
		const tokenname = name.trim();
		if (userId === "") {
			setSelAssignUser2ErrBorder(true);
			return false;
		}
		if (tokenname === "") {
			setNameErrBorder(true);
			return false;
        }
        let tokendetails;
        if (Object.keys(userInfo).length !== 0){
            tokendetails = userInfo.token;
        }
		var expdate=dateVal;
		var exptime=timeVal;
		var today = new Date();
		var td = new Date();
		var expiry = "";
		if (expdate === "") {
			td.setHours(today.getHours()+parseInt(tokendetails));
			var dt = td.getDate();
			var mon = td.getMonth()+1;
			if(td.getDate().toString().length == 1) dt = "0"+dt;
			if((td.getMonth()+1).toString().length == 1) mon = "0"+mon;
			expdate = dt+"-"+(mon)+"-"+td.getFullYear()
			setdateVal(expdate);
		}
		if (exptime === "") {
			var sldate = timeVal;
			var sldate_2 = sldate.split("-");
			if(parseInt(sldate_2[0])===today.getDate() && (parseInt(sldate_2[1]))===today.getMonth()+1 && parseInt(sldate_2[2])===today.getFullYear()){
				td.setHours(today.getHours()+8);
				var hr = td.getHours();
                var min = td.getMinutes;
                if( td.getHours().toString().length == 1) hr = "0"+hr;
                if(td.getMinutes.toString().length == 1) min = "0"+min;
				exptime=""+hr+":"+min;
                setTimeVal(exptime);
			}
			else{
				var hr = today.getHours();
                var min = today.getMinutes();
                if( today.getHours().toString().length == 1) hr = "0"+hr;
                if(today.getMinutes().toString().length == 1) min = "0"+min;
				exptime=""+hr+":"+min
				setTimeVal(exptime);
			}	
		}
		sldate_2 = expdate.split("-");
		var sltime_2 = exptime.split(":");
		expiry = expdate+" "+exptime;
		var now = new Date(sldate_2[2],sldate_2[1]-1,sldate_2[0],sltime_2[0],sltime_2[1]);
		td = today;
		td.setHours(today.getHours()+8);
		if (now < today || (now >= today && now < td)) {
            setPopupState({show:true,title:"Token Management",content:"Expiry time should be 8 hours more than current time"});
			return false;
		} else if(allTokens.length>=10){
            setPopupState({show:true,title:"Token Management",content:"User can have max 10 active tokens. Please Deactivate old tokens"});
            return false;
		}
		const CIUser = {
			'userId': userId,
			'expiry': expiry,
			'tokenname': tokenname,
			'icetype': icetype
		};
        setLoading('Generating Token. Please Wait...');
		const data = await manageCIUsers("create", CIUser);
		if(data.error){displayError(data.error);return;}
		setLoading(false);
		if (data === 'duplicate') setPopupState({show:true,title:"Token Management",content:"Failed to generate token, Token Name already exists"});
		else {
			setToken(data.token);
			setRunLoadData(!runLoadData);
			setPopupState({show:true,title:"Token Management",content:"Token generated successfully"});
		}
    }

    const closePopup = () =>{
        setPopupState({show:false,title:"",content:""});
    }

    return (
        <Fragment>
            {popupState.show?<PopupMsg content={popupState.content} title={popupState.title} submit={closePopup} close={closePopup} submitText={"Ok"} />:null}
			{loading?<ScreenOverlay content={loading}/>:null}
			<div className="tkn-mgmt_container">
				<div id="page-taskName"><span>Token Management</span></div>
				<div className="adminActionBtn">
					<button className="btn-md pull-right adminBtn-tkn-mgmt" onClick={()=>{generateCIusertokens();}}  title="Generate New Token">Generate</button>
					<button className="btn-md pull-right adminBtn-tkn-mgmt btn-right-cust-tkn" onClick={()=>{setRefresh(!refresh);setOp("normal")}} title="Refresh">Refresh</button>            
				</div>
				<div className="content_wrapper-tkn-mgmt">
					<ScrollBar thumbColor="#929397">
						<TokenMgmtForm setShowList={setShowList} showList={showList} runLoadData={runLoadData} op={op} setOp={setOp} dateVal={dateVal} setSelAssignUser2ErrBorder={setSelAssignUser2ErrBorder} setNameErrBorder={setNameErrBorder} nameErrBorder={nameErrBorder} refresh={refresh} selAssignUser2ErrBorder={selAssignUser2ErrBorder} timeVal={timeVal} setTimeVal={setTimeVal} setdateVal={setdateVal} setAllTokens={setAllTokens} setTargetid={setTargetid} targetid={targetid} name={name} allICE={allICE} setAllICE={setAllICE} setName={setName} token={token} allTokens={allTokens} setToken={setToken} />
						<TokenMgmtList showList={showList} setShowList={setShowList} allTokens={allTokens} setAllTokens={setAllTokens} targetid={targetid} />  
					</ScrollBar>
				</div>
			</div>
		</Fragment>
  );
}

export default TokenManagement;
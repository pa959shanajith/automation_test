import React, { Fragment, useState, useEffect } from 'react';
import { ScreenOverlay, ScrollBar, Messages, setMsg } from '../../global'
import { manageCIUsers } from '../api';
import { useSelector } from 'react-redux';
import TokenMgmtForm from '../components/TokenMgmtForm';
import TokenMgmtList from '../components/TokenMgmtList';
import '../styles/TokenManagement.scss'
import { Button } from 'primereact/button';

/*Component TokenManagement
  use: defines Admin middle Section for Token Management
  UserConfig:for User Settings
  ToDo:
*/

const TokenManagement = (props) => {

	const userInfo = useSelector(state => state.landing.userinfo);

	const [loading, setLoading] = useState(false)
	const [op, setOp] = useState("normal")
	const [name, setName] = useState("")
	const [token, setToken] = useState("")
	const [targetid, setTargetid] = useState(" ")
	const [allTokens, setAllTokens] = useState([])
	const [allICE, setAllICE] = useState([{ '_id': ' ', 'icename': 'Select ICE', 'icetype': 'ci-cd' }])
	const [dateVal, setdateVal] = useState("")
	const [timeVal, setTimeVal] = useState("")
	const [nameErrBorder, setNameErrBorder] = useState(false)
	const [selAssignUser2ErrBorder, setSelAssignUser2ErrBorder] = useState(false)
	const [runLoadData, setRunLoadData] = useState(true)
	const [refresh, setRefresh] = useState(false)
	const [showList, setShowList] = useState(false)
	const userConfig = props.userConfig //User Settings
	const [userId, setUserId] = useState('');

	useEffect(() => {
		setOp("normal");
		setdateVal("");
		setTimeVal("");
		setName("");
		setRefresh((prevState) => !prevState)
		// eslint-disable-next-line
	}, []);

	const displayError = (error) => {
		setLoading(false)
		setMsg(error)
	}

	const generateCIusertokens = async () => {
		setNameErrBorder(false);
		setSelAssignUser2ErrBorder(false);
		const icetype = op;
		const newUserId = userId.trim();
		const tokenname = name.trim();
		const activeTokens = allTokens.filter((e) => e.deactivated === 'active');
		if (newUserId === "") {
			setSelAssignUser2ErrBorder(true);
			return false;
		}
		if (tokenname === "") {
			setNameErrBorder(true);
			return false;
		}
		let tokendetails ="720";
		if (Object.keys(userInfo).length !== 0) {
			tokendetails = userInfo.token;
		}
		var expdate = dateVal;
		var exptime = timeVal;
		var today = new Date();
		var td = new Date();

		if (expdate === "") {
			td.setHours(today.getHours() + parseInt(tokendetails));
			var dt = td.getDate();
			var mon = td.getMonth() + 1;
			if (td.getDate().toString().length === 1) dt = "0" + dt;
			if ((td.getMonth() + 1).toString().length === 1) mon = "0" + mon;
			expdate = dt + "-" + (mon) + "-" + td.getFullYear()
			setdateVal(expdate);
		}
		if (exptime === "") {
			var sldate = timeVal;
			var sldate_2 = sldate.split("-");
			var hr, min;
			if (parseInt(sldate_2[0]) === today.getDate() && (parseInt(sldate_2[1])) === today.getMonth() + 1 && parseInt(sldate_2[2]) === today.getFullYear()) {
				td.setHours(today.getHours() + 8);
				hr = td.getHours();
				min = td.getMinutes;
				if (td.getHours().toString().length === 1) hr = "0" + hr;
				if (td.getMinutes.toString().length === 1) min = "0" + min;
				exptime = "" + hr + ":" + min;
				setTimeVal(exptime);
			}
			else {
				hr = today.getHours();
				min = today.getMinutes();
				if (today.getHours().toString().length === 1) hr = "0" + hr;
				if (today.getMinutes().toString().length === 1) min = "0" + min;
				exptime = "" + hr + ":" + min
				setTimeVal(exptime);
			}
		}
		sldate_2 = expdate.split("-");
		var sltime_2 = exptime.split(":");
		var now = new Date(sldate_2[2], sldate_2[1] - 1, sldate_2[0], sltime_2[0], sltime_2[1]);
		td = today;
		td.setHours(today.getHours() + 8);
		if (now < today || (now >= today && now < td)) {
			displayError(Messages.ADMIN.ERR_EXPIRY_TOKEN);
			return false;
		} else if (activeTokens.length >= 10) {
			displayError(Messages.ADMIN.WARN_TOKEN_LIMIT);
			return false;
		}
		const CIUser = {
			'userId': newUserId,
			'expiry': now,
			'tokenname': tokenname,
			'icetype': icetype ? icetype : 'normal'
		};
		setLoading('Generating Token. Please Wait...');
		const data = await manageCIUsers("create", CIUser);
		if (data.error) { displayError(data.error); return; }
		setLoading(false);
		if (data === 'duplicate') displayError(Messages.ADMIN.WARN_TOKEN_EXIST);
		else {
			setToken(data.token);
			setRunLoadData(!runLoadData);
			displayError(Messages.ADMIN.SUCC_TOKEN_GENERATE);
		}
	}

	return (
		<Fragment>
			{loading ? <ScreenOverlay content={loading} /> : null}
			<div className="tkn-mgmt_container">
				<div className="content_wrapper-tkn-mgmt">
					<TokenMgmtForm username={props.username} setUserId={setUserId} generateCIusertokens={generateCIusertokens} userConfig={userConfig} userInfo={userInfo} setShowList={setShowList}
						showList={showList} runLoadData={runLoadData} op={op} setOp={setOp}
						dateVal={dateVal} setSelAssignUser2ErrBorder={setSelAssignUser2ErrBorder} setNameErrBorder={setNameErrBorder}
						nameErrBorder={nameErrBorder} refresh={refresh} selAssignUser2ErrBorder={selAssignUser2ErrBorder}
						timeVal={timeVal} setTimeVal={setTimeVal} setdateVal={setdateVal} setAllTokens={setAllTokens}
						setTargetid={setTargetid} targetid={targetid} name={name} allICE={allICE} setAllICE={setAllICE}
						setName={setName} token={token} allTokens={allTokens} setToken={setToken} />
					{/* <TokenMgmtList showList={showList} setShowList={setShowList} allTokens={allTokens} setAllTokens={setAllTokens} targetid={targetid} /> */}
				</div>
			</div>
		</Fragment>
	);
}

export default TokenManagement;
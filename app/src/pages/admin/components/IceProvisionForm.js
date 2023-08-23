import React, { Fragment, useState, useEffect } from 'react';
import { ScreenOverlay, RedirectPage, Messages, VARIANT, ValidationExpression, setMsg } from '../../global'
import { getUserDetails, provisions } from '../api';
import { useNavigate } from 'react-router-dom';
import '../styles/IceProvisionForm.scss'
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { InputTextarea } from 'primereact/inputtextarea';
import { Tooltip } from 'primereact/tooltip';


/*Component IceProvisionForm
  use: Form to add ICE Provision
  ToDo:
*/

const IceProvisionForm = (props) => {

	const navigate = useNavigate();
	const [loading, setLoading] = useState(false)
	const [firstStop, setFirstStop] = useState(false)
	const [copyToolTip, setCopyToolTip] = useState("Click To Copy")
	const [downloadToolTip, setDownloadToolTip] = useState("Download Token")
	const [icenameErrBorder, setIcenameErrBorder] = useState(false)
	const [selAssignUser2ErrBorder, setSelAssignUser2ErrBorder] = useState(false)
	const [users, setUsers] = useState([['Select User', ' ', '', '']])
	const isUsrSetting = props.userConfig //for user settings


	useEffect(() => {
		setUsers([['Select User', ' ', '', '']]);
		props.setTokeninfoIcename("");
		props.setTokeninfoToken("");
		// refreshForm();
		// eslint-disable-next-line
	}, [props.selectProvisionType])

	// useEffect(() => {
	// 	if (firstStop === false) setFirstStop(true);
	// 	else provisionsIce();
	// 	// eslint-disable-next-line
	// }, [props.runProvisionsIce])

	const provisionsIce = async () => {
		setIcenameErrBorder(false);
		setSelAssignUser2ErrBorder(false);
		const icetype = props.op;
		props.setToken("");
		if (props.icename.trim() === "") {
			setIcenameErrBorder(true);
			return false;
		}
		if (icetype === "normal" && (!props.userid[1] || props.userid[1].trim() === "")) {
			setSelAssignUser2ErrBorder(true);
			return false;
		}

		var tokeninfo = {
			userid: props.edit?props.edit.userId:props.userid[1],
			icename: props.icename.trim(),
			icetype: icetype,
			action: "provision",
			email:props.edit?props.edit.email:props.userid[6],
			username:props.edit?props.edit.userName:props.userid[0],
			firstName: props.edit?props.edit.firstName:props.userid[4],
			lastName: props.edit?props.edit.lastName:props.userid[5],
			url:new URL(window.location.href).origin,
		};
		setLoading("Provisioning Token...");
		const data = await provisions(tokeninfo);
		setLoading(false);
		if (data.error) { props.toastError(data.error); return; }
		if (data === "Invalid Session") return RedirectPage(navigate);
		else if (data === 'fail') props.toastError(Messages.ADMIN.ERR_PROVISION_ICE);
		else if (data === 'DuplicateIceName'){
			props.toastError(Messages.ADMIN.ERR__ICE_EXIST) ;
		    setLoading(false);
		} else {
			props.setIcename(props.icename);
			props.setTokeninfoToken(data);
			props.setToken(data);
			// props.setRefreshIceList(!props.refreshIceList);
			props.toastSuccess(Messages.CUSTOM("Token generated Successfully for Avo Assure Client- '" + props.icename + "'.  Copy or Download the token", VARIANT.SUCCESS));
		}
	}

	// const refreshForm = async () => {
	// 	setIcenameErrBorder(false);
	// 	setSelAssignUser2ErrBorder(false);
	// 	props.setToken("Click on Provision/Reregister to generate token");
	// 	if (props.userConfig) props.setToken("Click on Reprovision/Reregister to generate token");
	// 	props.setIcename("");
	// 	props.setUserid(" ");
	// 	if (props.op === "normal" && !isUsrSetting) {
	// 		const data = await getUserDetails("user");
	// 		if (data.error) { displayError(data.error); return; }
	// 		data.sort((a, b) => a[0].localeCompare(b[0]));
	// 		data.splice(0, 0, ['Select User', ' ', '', '']);
	// 		setUsers(data.filter((e) => (e[3] !== "Admin")));
	// 	}
	// }

	const updateIceName = (value) => {
		value = ValidationExpression(value, "iceName")
		props.setIcename(value);
		verifyName(value)
	}

	const copyTokenFunc = () => {
		const data = props.tokeninfoToken;
		if (!data) {
			setCopyToolTip("Nothing to Copy!");
			setTimeout(() => {
				setCopyToolTip("Click to Copy");
			}, 1500);
			return;
		}
		const x = document.getElementById('iceToken');
		x.select();
		document.execCommand('copy');
		setCopyToolTip("Copied");
		setTimeout(() => {
			setCopyToolTip("Click to Copy");
		}, 1500);
	}

	const downloadToken = () => {
		const data = props.tokeninfoToken;
		if (!data) {
			setDownloadToolTip("Nothing to Download!");
			setTimeout(() => {
				setDownloadToolTip("Download Token");
			}, 1500);
			return;
		}
		const filename = props.icename + "_icetoken.txt";
		var blob = new Blob([data], { type: 'text/json' });
		var e = document.createEvent('MouseEvents');
		var a = document.createElement('a');
		a.download = filename;
		a.href = window.URL.createObjectURL(blob);
		a.dataset.downloadurl = ['text/json', a.download, a.href].join(':');
		e.initMouseEvent('click', true, true, window,
			0, 0, 0, 0, 0, false, false, false, false, 0, null);
		a.dispatchEvent(e);

		setDownloadToolTip("Downloaded!");
		setTimeout(() => {
			setDownloadToolTip("Download Token");
		}, 1500);
	}

	const verifyName = (iceName) => {
		const name = iceName;
		const icelist1 = props.icelist.map(e => e.icename);
		if (icelist1.indexOf(name) > -1) setIcenameErrBorder(true);
		else setIcenameErrBorder(false);
	}

	const displayError = (error) => {
		setLoading(false)
		setMsg(error)
	}

	return (
		<Fragment>
			{loading ? <ScreenOverlay content={loading} /> : null}

			<div className="col-xs-9" style={{ width: "83%" }}>
				<div className='flex flex-column pb-4'>
					<label className="pb-2 font-medium" title="Token Name">Avo Assure Client Name</label>
					<div className="flex flex-row">
					<InputText
						type="text"
						autoComplete="off"
						id="icename"
						name="icename"
						value={props.icename}
						onChange={(event) => { updateIceName(event.target.value) }} maxLength="100"
						placeholder="Avo Assure Client Name"
						className={`w-full md:w-20rem ${icenameErrBorder ? "p-invalid" : ''}`}
					/>
				{/* </div> */}
				
					<Button className="a__btn pull-right ml-3" size='small' onClick={() => { provisionsIce() }} label="Generate" title="Generate"></Button>
				</div>
				</div>
				{/* {!isUsrSetting
					&& <div data-test="ice-type-test" className={'adminControl-ip adminControl-ip-cust'} ><div>
						<span className="leftControl-ip" title="ICE Type">ICE Type</span>
						<label className="adminFormRadio">
							<input type="radio" checked={props.op === "normal"} value="normal" name="provisionType" onChange={() => { props.setOp("normal"); props.setSelectProvisionType(!props.selectProvisionType); refreshForm() }} />
							<span>Normal</span>
						</label>
						<label className="adminFormRadio">
							<input type="radio" checked={props.op === "ci-cd"} value="ci-cd" name="provisionType" onChange={() => { props.setRefreshIceList(!props.refreshIceList); props.setOp("ci-cd"); refreshForm() }} />
							<span>CI/CD</span>
						</label>
					</div></div>}
				<div className='adminControl-ip'><div>
					<span className="leftControl-ip" title={isUsrSetting ? "Default ICE" : "ICE Name"}>{isUsrSetting ? "Default ICE" : "ICE Name"}</span>
					{!isUsrSetting ?
						<input type="text" autoComplete="off" id="icename" name="icename" value={props.icename} onChange={(event) => { updateIceName(event.target.value) }} maxLength="100" className={icenameErrBorder ? "inputErrorBorder border_input-ip form-control-ip form-control-custom-ip" : "border_input-ip form-control-ip form-control-custom-ip"} placeholder="ICE Name" />
						: <span>{props.defaultICE !== "" ? props.defaultICE : "No Default ICE"}</span>
					}
				</div></div>


				{!isUsrSetting && <div data-test="user-test" className='userForm adminControl-ip' ><div>
					<span className="leftControl-ip" title="User">User</span>
					<select value={props.userid} onChange={(event) => { props.setUserid(event.target.value) }} disabled={props.op !== 'normal'} id="selAssignUser2" className={selAssignUser2ErrBorder ? 'selectErrorBorder adminSelect-ip form-control-ip' : 'adminSelect-ip form-control-ip'}>
						{users.map((entry, index) => (
							<option disabled={entry[0] === 'Select User' ? true : false} key={index} value={entry[1]}>{entry[0]}</option>
						))}
					</select>
				</div></div>}

				<div data-test="token-test" className='adminControl-ip' id="icetokenarea"><div>
					<span className="leftControl-ip" title="Token">Token</span>
					<textarea autoComplete="off" id="iceToken" value={props.token} name="iceToken" readOnly="readonly"></textarea>
					<label className="lable-cust-ip" >
						<ReactTooltip id="copy" effect="solid" backgroundColor="black" getContent={[() => { return copyToolTip }, 0]} />
						<ReactTooltip id="download" effect="solid" backgroundColor="black" getContent={[() => { return downloadToolTip }, 0]} />
						<span className="fa fa-files-o action-cust-ip" data-for="copy" data-tip={copyToolTip} onClick={() => { copyTokenFunc() }}></span>
						<span className="fa fa-download action-cust-ip" data-for="download" data-tip={downloadToolTip} onClick={() => { downloadToken() }} ></span>
					</label>
				</div></div> */}

				<div className='flex flex-row'>
					<InputTextarea
						autoResize
						id="iceToken"
						name="iceToken"
						value={props.token}
						rows={4} cols={70}
						placeholder="Click on Provision/ Register to generate token" 
						readOnly
					/>
					<label className='pl-3 flex flex-column justify-content-between '>
						<span
							className="pi pi-copy token_copy"
							style={{ fontSize: '1.5rem', cursor: 'pointer' }}
							data-for="copy"
							onClick={() => copyTokenFunc()}>
						</span>
						<Tooltip target=".token_copy" content={copyToolTip} position="right" />
						<span
							className="pi pi-download downlod_token"
							style={{ fontSize: '1.5rem', cursor: 'pointer' }}
							data-for="download"
							onClick={() => downloadToken()}>
						</span>
						<Tooltip target=".downlod_token" content={downloadToolTip} position="right" />
					</label>
				</div>
			</div>
		</Fragment>
	);
}

export default IceProvisionForm;
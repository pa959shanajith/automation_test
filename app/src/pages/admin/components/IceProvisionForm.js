import React, { Fragment, useState, useEffect } from 'react';
import { ScreenOverlay, RedirectPage, Messages, VARIANT, ValidationExpression, setMsg } from '../../global'
import { getUserICE } from '../../global/api';

import { getUserDetails, provisions, fetchICE, manageSessionData } from '../api';
import { useNavigate } from 'react-router-dom';
import '../styles/IceProvisionForm.scss'
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { InputTextarea } from 'primereact/inputtextarea';
import { Tooltip } from 'primereact/tooltip';
import { useSelector } from 'react-redux';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';



/*Component IceProvisionForm
  use: Form to add ICE Provision
  ToDo:
*/

const IceProvisionForm = (props) => {

	const navigate = useNavigate();
	const [loading, setLoading] = useState(false)
	const [copyToolTip, setCopyToolTip] = useState("Click To Copy")
	const [downloadToolTip, setDownloadToolTip] = useState("Download Token")
	const [icenameErrBorder, setIcenameErrBorder] = useState(false)
	const [selAssignUser2ErrBorder, setSelAssignUser2ErrBorder] = useState(false)
	const [selectUsersForIceProvision, setSelectUsersForIceProvision] = useState(null);
	const isUsrSetting = props.userConfig //for user settings
	const editUser = useSelector(state => state.admin.editUser);
	const [editUserICEData, setEditUserICEData] = useState({});
	const type = useSelector(state => state.admin.type);


	useEffect(() => {
		props.setTokeninfoIcename("");
		props.setTokeninfoToken("");
		console.log(props.ldapIceProvisionUserList)
	}, [props.selectProvisionType])


	const provisionsIce = (rowData) => {
		if (type === 'ldap' && rowData !== '') {
			(async () => {
				let tokeninfo = {
					userid: rowData?.userid,
					icename: rowData?.username?.trim(),
					icetype: 'normal',
					action: "provision",
					email: rowData?.email,
					username: rowData?.username,
					firstName: rowData?.firstname,
					lastName: rowData?.lastname,
					url: new URL(window.location.href).origin,
				};
				setLoading("Provisioning Token...");
				const data = await provisions(tokeninfo);
				setLoading(false);
				if (data.error) { props.toastError(data.error); return; }
				if (data === "Invalid Session") return RedirectPage(navigate);
				else if (data === 'fail') props.toastError(Messages.ADMIN.ERR_PROVISION_ICE);
				else if (data === 'DuplicateIceName') {
					props.toastError(Messages.ADMIN.ERR__ICE_EXIST);
					setLoading(false);
				} else {
					props.toastSuccess(Messages.CUSTOM("Token generated Successfully for Avo Assure Client - " + rowData.username, VARIANT.SUCCESS));
				}
			})();
		}
		else if (type === 'ldap' && rowData === '') {
			(async () => {
				let iceProvisionUserList = [];
				props.ldapIceProvisionUserList.map(userData => {
					let tokeninfo = {
						userid: userData.userid,
						icename: userData.username.trim(),
						icetype: 'normal',
						email: userData.email,
						username: userData.username,
						firstName: userData.firstname,
						lastName: userData.lastname,
						url: new URL(window.location.href).origin,
					}
					iceProvisionUserList.push(tokeninfo);
				});
				let ldapIceProvisionUserData = { action: "multipleProvisionIce", userList: iceProvisionUserList }
				setLoading("Provisioning Token...");
				const data = await provisions(ldapIceProvisionUserData);
				setLoading(false);
				let errMsg = '';
				let failErrMsg = '';
				let duplicateErrorMsg = '';
				let successMsg = '';
				data.map((token, index) => {
					if (token.error) { errMsg = token.error }
					if (token === "Invalid Session") return RedirectPage(navigate);
					else if (token === 'fail') failErrMsg = failErrMsg +" " + iceProvisionUserList[index].username
					else if (token === 'DuplicateIceName') {
						duplicateErrorMsg = duplicateErrorMsg + " " + iceProvisionUserList[index].username;
						setLoading(false);
					} else {
						successMsg = successMsg + " " + iceProvisionUserList[index].username;
					}
				})
				if (successMsg !== '')  props.toastSuccess(Messages.CUSTOM("User created and token generated successfully for these users -->" + successMsg, VARIANT.SUCCESS));
				if (errMsg !== '') props.toastError(Messages.CUSTOM(errMsg, VARIANT.ERROR));
				if (failErrMsg !== '') props.toastError(Messages.CUSTOM("ICE provision is failed for " + failErrMsg , VARIANT.ERROR));
				if (duplicateErrorMsg !== '') props.toastError(Messages.CUSTOM('ICE name already exists for these users ' + duplicateErrorMsg, VARIANT.ERROR));
				props.createUserDialogHide();
			})();
		}
		else if (type === 'inhouse' || type === "saml") {
			(async () => {
				props.toast.current.clear()
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

				let tokeninfo = {
					userid: props.userid[1],
					icename: props.icename.trim(),
					icetype: icetype,
					action: "provision",
					email: props.userid[6],
					username: props.userid[0],
					firstName: props.userid[4],
					lastName: props.userid[5],
					url: new URL(window.location.href).origin,
				};
				setLoading("Provisioning Token...");
				const data = await provisions(tokeninfo);
				setLoading(false);
				if (data.error) { props.toastError(data.error); return; }
				if (data === "Invalid Session") return RedirectPage(navigate);
				else if (data === 'fail') props.toastError(Messages.ADMIN.ERR_PROVISION_ICE);
				else if (data === 'DuplicateIceName') {
					props.toastError(Messages.ADMIN.ERR__ICE_EXIST);
					setLoading(false);
				} else {
					props.setIcename(props.icename);
					props.setTokeninfoToken(data);
					props.setToken(data);
					props.setRefreshIceList(!props.refreshIceList);
					props.toastSuccess(Messages.CUSTOM("Token generated Successfully for Avo Assure Client- '" + props.icename + "'.  Copy or Download the token", VARIANT.SUCCESS));
				}
			})();
		}
	}


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

	// const displayError = (error) => {
	// 	setLoading(false)
	// 	setMsg(error)
	// }

	const iceProvisionTokenGeneration = (rowData) => (
		<Button label='Generate' onClick={() => provisionsIce(rowData)} size='small'></Button>
	);

	return (
		<Fragment>
			{loading ? <ScreenOverlay content={loading} /> : null}
			{(type === 'ldap' && !editUser) && <div className='flex flex-column'>
				<div className='pt-2 pb-2' style={{ alignSelf: 'self-end' }}>
					<Button label='Generate to all' onClick={() => provisionsIce('')} size='small'></Button>
				</div>
				<div className='ldap_ice_provision'>
					<DataTable value={props.ldapIceProvisionUserList} editMode="row" size='normal'
						selectionMode={null}
						// loading={loading}
						// globalFilter={globalFilter}
						// header={header}
						emptyMessage="No users found"
						scrollable
						selection={selectUsersForIceProvision}
						onSelectionChange={(e) => setSelectUsersForIceProvision(e.value)} dataKey="userid"
					// scrollHeight='60vh'
					>
						{/* <Column selectionMode="multiple" headerStyle={{ width: '2%' }}></Column> */}
						<Column field="username" header="User Name" style={{ width: '5%' }} bodyClassName={"ellipsis-column"}></Column>
						<Column field="roleName" header="Role" style={{ width: '5%' }} bodyClassName={"ellipsis-column"} ></Column>
						<Column header="" body={iceProvisionTokenGeneration} headerStyle={{ width: '3%' }} ></Column>
					</DataTable>
				</div>
			</div>}
			{(type === 'inhouse'|| type === "saml" || (type === "ldap" && editUser)) && <div className="col-xs-9" style={{ width: "83%" }}>
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

						<Button className="a__btn pull-right ml-3" size='small' onClick={() => { provisionsIce() }} label="Generate" title="Generate"></Button>
					</div>
				</div>
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
			</div>}
		</Fragment>
	);
}

export default IceProvisionForm;
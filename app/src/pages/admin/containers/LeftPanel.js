import React ,  { Fragment} from 'react';
import { ActionBar } from '../../global'
import '../styles/LeftPanel.scss'


/*Component LeftPanel
  use: Admin Screen-Left Panel with multiple options
  todo: Scrollbar add 
*/

const LeftPanel = (props) => {

	const resetScreen = (screen) =>{
		var change = {...props.resetMiddleScreen};
		var value = change[screen];
		change[screen] = !value;
		props.setResetMiddleScreen(change);
	}

    return (
    <Fragment>
		<ActionBar>
			<div id="left-top-section" className='left-top-section-div'>
				<ul>
					<li><span><i id='managePanel' className='scrapeOnTxt'>Manage</i></span></li>
                    <li><i id='userTab' title="Manage Users" onClick={()=>{props.setShowEditUser(false);props.setMiddleScreen("createUser");}} className="selectBrowser">
						<span><span className={"fa fa-user" + ((props.middleScreen==="createUser") ? "  selected-icon" : "")}  ></span></span>User</i></li>
                    <li><i id='tokenTab'  title="Manage Tokens" onClick={()=>{props.setMiddleScreen("tokenTab");resetScreen("tokenTab")}} className="selectBrowser" >
						<span><span className={"fa fa-tags" + ((props.middleScreen==="tokenTab") ? " selected-icon" : "")} ></span></span>Tokens</i></li>
					<li><i id='provisionTab' title="Manage Provision" onClick={()=>{props.setMiddleScreen("provisionTa");resetScreen("provisionTa")}} className="selectBrowser">
						<span><span className={'fa fa-cogs'+ ((props.middleScreen==="provisionTa") ? " selected-icon" : "")} ></span></span>ICE Provision</i></li>
					<li><i id='projectTab' title="Create/Update Project" onClick={()=>{props.setMiddleScreen("projectTab");resetScreen("projectTab")}} className="selectBrowser">
						<span><span className={'fa fa-briefcase'+ ((props.middleScreen==="projectTab") ? " selected-icon" : "")} ></span></span>Project</i></li>
					<li className='userDivider'><i id='assignProjectTab' title="Assign Project" onClick={()=>{props.setMiddleScreen("assignProjectTab");resetScreen("assignProjectTab");}} className="selectBrowser">
						<span><span className={'fa fa-link'+ ((props.middleScreen==="assignProjectTab") ? " selected-icon" : "")} ></span></span>Assign Projects</i></li>
					{/* <li><i id='ldapConfigTab' title="Manage LDAP Configuration" onClick={()=>props.setMiddleScreen("ldapConfigTab")} className="selectBrowser" >
						<span><span className='fa fa-address-book'></span></span>LDAP Configuration</i></li> */}
					<li><i id='samlConfigTab' title="Manage SAML Configuration" onClick={()=>{props.setMiddleScreen("samlConfigTab");resetScreen("samlConfigTab")}} className="selectBrowser" >
						<span><span className={'fa fa-lock'+ ((props.middleScreen==="samlConfigTab") ? " selected-icon" : "")}  ></span></span>SAML Configuration</i></li>
					<li><i id='oidcConfigTab' title="Manage OpenID Connect Configuration" onClick={()=>{props.setMiddleScreen("oidcConfigTab");resetScreen("oidcConfigTab")}} className="selectBrowser" >
						<span><span className={'fa fa-openid'+ ((props.middleScreen==="oidcConfigTab") ? " selected-icon" : "")}></span></span>OpenID Connect Configuration</i></li>
					<li><i id='sessionTab' title="Session Management" onClick={()=>{props.setMiddleScreen("sessionTab");resetScreen("sessionTab");}} className="selectBrowser" >
						<span><span className={'fa fa-users'+ ((props.middleScreen==="sessionTab") ? " selected-icon" : "")} ></span></span>Session Management</i></li>
					<li className='left-top-section__preferencesTab'><i id='Preferences' title="Preferences" onClick={()=>{props.setMiddleScreen("Preferences");resetScreen("Preferences")}} className="selectBrowser" >
						<span><span className={'fa fa-sliders'+ ((props.middleScreen==="Preferences") ? " selected-icon" : "")} ></span></span>Preferences</i></li>
                    </ul> 
			</div>
		</ActionBar>
    </Fragment>
  );
}

export default LeftPanel;
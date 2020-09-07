import React ,  { Fragment} from 'react';
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
      <div id="left-nav-section">
		<div className="scrollbar-macosx">
			<div id="left-top-section" className='left-top-section-div'>
				<ul>
					<li><span><i href="/Admin" id='managePanel' className='scrapeOnTxt'>Manage</i></span></li>
                    <li><i id='userTab' title="Manage Users" onClick={()=>{props.setShowEditUser(false);props.setMiddleScreen("createUser");}} className="selectBrowser" data-name="3">
						<span><span className="fa fa-user" style={(props.middleScreen==="createUser")? {background: "#331d4c",borderRadius: "6px"}:{}} ></span></span>User</i></li>
                    {/* <li><i id='tokenTab'  title="Manage Tokens" onClick={()=>props.setMiddleScreen("tokenTab")} className="selectBrowser" data-name="1">
						<span><span className='fa fa-tags'></span></span>Tokens</i></li> */}
					{/* <li><i id='provisionTab' title="Manage Provision" onClick={()=>props.setMiddleScreen("provisionTa")} className="selectBrowser" data-name="1">
						<span><span className='fa fa-cogs'></span></span>ICE Provision</i></li> */}
					<li><i id='projectTab' title="Create/Update Project" onClick={()=>{props.setMiddleScreen("projectTab");resetScreen("projectTab")}} className="selectBrowser" data-name="1">
						<span><span className='fa fa-briefcase' style={(props.middleScreen==="projectTab")? {background: "#331d4c",borderRadius: "6px"}:{}}></span></span>Project</i></li>
					<li className='userDivider'><i id='assignProjectTab' title="Assign Project" onClick={()=>{props.setMiddleScreen("assignProjectTab");resetScreen("assignProjectTab");}} className="selectBrowser" data-name="1">
						<span><span className='fa fa-link' style={(props.middleScreen==="assignProjectTab")? {background: "#331d4c",borderRadius: "6px"}:{}}></span></span>Assign Projects</i></li>
					{/* <li><i id='ldapConfigTab' title="Manage LDAP Configuration" onClick={()=>props.setMiddleScreen("ldapConfigTab")} className="selectBrowser" data-name="4">
						<span><span className='fa fa-address-book'></span></span>LDAP Configuration</i></li>
					<li><i id='samlConfigTab' title="Manage SAML Configuration" onClick={()=>props.setMiddleScreen("samlConfigTab")} className="selectBrowser" data-name="4">
						<span><span className='fa fa-lock'></span></span>SAML Configuration</i></li>
					<li><i id='oidcConfigTab' title="Manage OpenID Connect Configuration" onClick={()=>props.setMiddleScreen("oidcConfigTab")} className="selectBrowser" data-name="4">
						<span><span className='fa fa-openid'></span></span>OpenID Connect Configuration</i></li>
					<li><i id='sessionTab' title="Session Management" onClick={()=>props.setMiddleScreen("sessionTab")} className="selectBrowser" data-name="5">
						<span><span className='fa fa-users'></span></span>Session Management</i></li>
					<li className='left-top-section__preferencesTab'><i id='preferencesTab' title="Preferences" onClick={()=>props.setMiddleScreen("Preferences")} className="selectBrowser" data-name="2">
						<span><span className='fa fa-sliders'></span></span>Preferences</i></li> */}
                    
                    </ul> 
			</div>
			<div className='clear-both'></div>
		</div>
	</div>



    </Fragment>
  );
}

export default LeftPanel;
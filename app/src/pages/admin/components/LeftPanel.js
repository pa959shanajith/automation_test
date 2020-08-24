import React ,  { Fragment} from 'react';
import '../styles/LeftPanel.scss'


/*Component LeftPanel
  use: Admin Screen-Left Panel with multiple options
  todo: Scrollbar add 
*/

const LeftPanel = (props) => {

  return (
    <Fragment>

      <div id="left-nav-section">
		<div className="scrollbar-macosx">
			<div id="left-top-section" className='left-top-section-div'>
				<ul>
					<li><span><a href="#/Admin" id='managePanel' className='scrapeOnTxt'>Manage</a></span></li>
                    <li><a href="#/Admin" id='userTab' title="Manage Users" onClick={()=>props.setMiddleScreen("createUser")} className="selectBrowser" data-name="3">
						<span><span className='fa fa-user'></span></span>User</a></li>
                    <li><a href="#/Admin" id='tokenTab'  title="Manage Tokens" onClick={()=>props.setMiddleScreen("tokenTab")} className="selectBrowser" data-name="1">
						<span><span className='fa fa-tags'></span></span>Tokens</a></li>
					<li><a href="#/Admin" id='provisionTab' title="Manage Provision" onClick={()=>props.setMiddleScreen("provisionTa")} className="selectBrowser" data-name="1">
						<span><span className='fa fa-cogs'></span></span>ICE Provision</a></li>
					<li><a href="#/Admin" id='projectTab' title="Create/Update Project" onClick={()=>props.setMiddleScreen("projectTab")} className="selectBrowser" data-name="1">
						<span><span className='fa fa-briefcase'></span></span>Project</a></li>
					<li className='userDivider'><a href="#/Admin" id='assignProjectTab' title="Assign Project" onClick={()=>props.setMiddleScreen("assignProjectTab")} className="selectBrowser" data-name="1">
						<span><span className='fa fa-link'></span></span>Assign Projects</a></li>
					<li><a href="#/Admin" id='ldapConfigTab' title="Manage LDAP Configuration" onClick={()=>props.setMiddleScreen("ldapConfigTab")} className="selectBrowser" data-name="4">
						<span><span className='fa fa-address-book'></span></span>LDAP Configuration</a></li>
					<li><a href="#/Admin" id='samlConfigTab' title="Manage SAML Configuration" onClick={()=>props.setMiddleScreen("samlConfigTab")} className="selectBrowser" data-name="4">
						<span><span className='fa fa-lock'></span></span>SAML Configuration</a></li>
					<li><a href="#/Admin" id='oidcConfigTab' title="Manage OpenID Connect Configuration" onClick={()=>props.setMiddleScreen("oidcConfigTab")} className="selectBrowser" data-name="4">
						<span><span className='fa fa-openid'></span></span>OpenID Connect Configuration</a></li>
					<li><a href="#/Admin" id='sessionTab' title="Session Management" onClick={()=>props.setMiddleScreen("sessionTab")} className="selectBrowser" data-name="5">
						<span><span className='fa fa-users'></span></span>Session Management</a></li>
					<li className='left-top-section__preferencesTab'><a href="#/Admin" id='preferencesTab' title="Preferences" onClick={()=>props.setMiddleScreen("Preferences")} className="selectBrowser" data-name="2">
						<span><span className='fa fa-sliders'></span></span>Preferences</a></li>
                    
                    </ul> 
			</div>
			<div className='clear-both'></div>
		</div>
	</div>



    </Fragment>
  );
}

export default LeftPanel;
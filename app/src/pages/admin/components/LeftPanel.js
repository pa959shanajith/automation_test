import React ,  { Fragment, useState } from 'react';
import '../styles/LeftPanel.scss'


/*Component LeftPanel
  use: Admin Screen-Left Panel with multiple options
  todo: Scrollbar add 
*/

const LeftPanel = (props) => {

  return (
    <Fragment>

      <div id="left-nav-section">
		<div class="scrollbar-macosx">
			<div id="left-top-section" className='left-top-section-div'>
				<ul>
					<li><span><a className='scrapeOnTxt'>Manage</a></span></li>
                    <li><a id='userTab' title="Manage Users" onClick={()=>props.setMiddleScreen("createUser")} className="selectBrowser" data-name="3">
						<span><span className='fa fa-user'></span></span>User</a></li>
                    <li><a id='tokenTab'  title="Manage Tokens" onClick={()=>props.setMiddleScreen("tokenTab")} className="selectBrowser" data-name="1">
						<span><span className='fa fa-tags'></span></span>Tokens</a></li>
					<li><a id='provisionTab' title="Manage Provision" onClick={()=>props.setMiddleScreen("provisionTa")} className="selectBrowser" data-name="1">
						<span><span className='fa fa-cogs'></span></span>ICE Provision</a></li>
					<li><a id='projectTab' title="Create/Update Project" onClick={()=>props.setMiddleScreen("projectTab")} className="selectBrowser" data-name="1">
						<span><span className='fa fa-briefcase'></span></span>Project</a></li>
					<li className='userDivider'><a id='assignProjectTab' title="Assign Project" onClick={()=>props.setMiddleScreen("assignProjectTab")} className="selectBrowser" data-name="1">
						<span><span className='fa fa-link'></span></span>Assign Projects</a></li>
					<li><a id='ldapConfigTab' title="Manage LDAP Configuration" onClick={()=>props.setMiddleScreen("ldapConfigTab")} className="selectBrowser" data-name="4">
						<span><span className='fa fa-address-book'></span></span>LDAP Configuration</a></li>
					<li><a id='samlConfigTab' title="Manage SAML Configuration" onClick={()=>props.setMiddleScreen("samlConfigTab")} className="selectBrowser" data-name="4">
						<span><span className='fa fa-lock'></span></span>SAML Configuration</a></li>
					<li><a id='oidcConfigTab' title="Manage OpenID Connect Configuration" onClick={()=>props.setMiddleScreen("oidcConfigTab")} className="selectBrowser" data-name="4">
						<span><span className='fa fa-openid'></span></span>OpenID Connect Configuration</a></li>
					<li><a id='sessionTab' title="Session Management" onClick={()=>props.setMiddleScreen("sessionTab")} className="selectBrowser" data-name="5">
						<span><span className='fa fa-users'></span></span>Session Management</a></li>
					<li className='left-top-section__preferencesTab'><a id='preferencesTab' title="Preferences" onClick={()=>props.setMiddleScreen("Preferences")} className="selectBrowser" data-name="2">
						<span><span className='fa fa-sliders'></span></span>Preferences</a></li>
                    
                    {/* <li><a id='userTab' ng-click="tab = 'tabUser';userConf.click()" title="Manage Users" class="selectBrowser" data-name="3">
						<span><span class='fa fa-user'></span></span>User</a></li>
					<li><a id='tokenTab' ng-click="tab = 'tabToken';tokens.click()" title="Manage Tokens" class="selectBrowser" data-name="1">
						<span><span class='fa fa-tags'></span></span>Tokens</a></li>
					<li><a id='provisionTab' ng-click="tab = 'tabProvision';provision.click($event)" title="Manage Provision" class="selectBrowser" data-name="1">
						<span><span class='fa fa-cogs'></span></span>ICE Provision</a></li>
					<li><a id='projectTab' ng-click="tab = 'tabProject'" title="Create/Update Project" class="selectBrowser" data-name="1">
						<span><span class='fa fa-briefcase'></span></span>Project</a></li>
					<li class='userDivider'><a id='assignProjectTab' ng-click="tab='tabAssignProject';assignProj.click()" title="Assign Project" class="selectBrowser" data-name="1">
						<span><span class='fa fa-link'></span></span>Assign Projects</a></li>
					<li><a id='ldapConfigTab' title="Manage LDAP Configuration" ng-click="tab = 'tabldapConfig';ldapConf.click()" class="selectBrowser" data-name="4">
						<span><span class='fa fa-address-book'></span></span>LDAP Configuration</a></li>
					<li><a id='samlConfigTab' title="Manage SAML Configuration" ng-click="tab = 'tabsamlConfig';samlConf.click()" class="selectBrowser" data-name="4">
						<span><span class='fa fa-lock'></span></span>SAML Configuration</a></li>
					<li><a id='oidcConfigTab' title="Manage OpenID Connect Configuration" ng-click="tab = 'taboidcConfig';oidcConf.click()" class="selectBrowser" data-name="4">
						<span><span class='fa fa-openid'></span></span>OpenID Connect Configuration</a></li>
					<li><a id='sessionTab' title="Session Management" ng-click="tab = 'tabSession';sessionConf.click()" class="selectBrowser" data-name="5">
						<span><span class='fa fa-users'></span></span>Session Management</a></li>
					<li style="margin-bottom: 30px"><a id='preferencesTab' title="Preferences" ng-click="tab='tabPreferences';preferences.click()" class="selectBrowser" data-name="2">
						<span><span class='fa fa-sliders'></span></span>Preferences</a></li>
				*/}</ul> 
			</div>
			<div class='clear-both'></div>
		</div>
	</div>



    </Fragment>
  );
}

export default LeftPanel;
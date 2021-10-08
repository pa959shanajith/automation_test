import React from 'react'
import { ActionBar } from '../../global'

import classes from '../styles/LeftPanelBar.module.scss'


/*Component LeftPanelBar
  use: Settings Screen-Left Panel with multiple options
  props: setMiddleScreen resetMiddleScreen setResetMiddleScreen middleScreen
*/

const LeftPanelBar = (props) => {

	const resetScreen = (screen) => {
		var change = { ...props.resetMiddleScreen };
		var value = change[screen];
		change[screen] = !value;
		props.setResetMiddleScreen(change);
	}
	return (
		<ActionBar  >
			<div id="left-section-settings" className={classes['left-section-div']}>
				<ul>
					<li><span><i id='managePanel' className='scrapeOnTxt'>Manage</i></span></li>
					<li><i id='userTab' title="Edit User Data" onClick={() => { props.setMiddleScreen("editUser"); resetScreen("editUser") }} className={classes["selectBrowser"]}>
						<span><span className={`${classes.fa} fa fa-user ${props.middleScreen === "editUser" ? classes["selected-icon"] : ""}`}  ></span></span><div>Edit User</div></i></li>
					<li><i id='tokenTab' title="Manage Tokens" onClick={() => { props.setMiddleScreen("tokenTab"); resetScreen("tokenTab") }} className="selectBrowser" >
						<span><span className={`${classes.fa} fa fa-tags ${props.middleScreen === "tokenTab" ? classes["selected-icon"] : ""}`} ></span></span><div>Tokens</div></i></li>
					<li><i id='provisionTab' title="Manage Provision" onClick={() => { props.setMiddleScreen("provisionTa"); resetScreen("provisionTa") }} className={classes["selectBrowser"]}>
						<span><span className={`${classes.fa} fa fa-cogs ${props.middleScreen === "provisionTa" ? classes["selected-icon"] : ""}`} ></span></span><div>ICE Provision</div></i></li>
					<li><i id='projectTab' title="View Assigned Project" onClick={() => { props.setMiddleScreen("projectTab"); resetScreen("projectTab") }} className={classes["selectBrowser"]}>
						<span><span className={`${classes.fa} fa fa-briefcase ${props.middleScreen === "projectTab" ? classes["selected-icon"] : ""}`} ></span></span><div>Project</div></i></li>
					<li><i id='gitConfigure' title="Manage Git Configuration" onClick={() => { props.setMiddleScreen("gitConfigure"); resetScreen("gitConfigure") }} className={classes["selectBrowser"]} >
						<span><img style={{ height: '47px' }} src={"static/imgs/GitIcon.png"} alt={"Create Git Configuration"} className={((props.middleScreen === "gitConfigure") ? ` ${classes["selected-icon"]}` : "")} ></img></span><div>Git Configuration</div></i></li>
					<li style={{display:"none"}}><i id='jiraConfigure' title="Manage Jira Configuration" onClick={() => { props.setMiddleScreen("jiraConfigure"); resetScreen("jiraConfigure") }} className={classes["selectBrowser"]} >
						<span><img style={{ height: '47px' }} src={"static/imgs/GitIcon.png"} alt={"Create Jira Configuration"} className={((props.middleScreen === "jiraConfigure") ? ` ${classes["selected-icon"]}` : "")} ></img></span><div>Jira Configuration</div></i></li>
				</ul>
			</div>
		</ActionBar>
	);
}

export default LeftPanelBar;
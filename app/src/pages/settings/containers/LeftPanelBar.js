import React from 'react'
import { ActionBar } from '../../global'
import { useSelector } from 'react-redux';
import classes from '../styles/LeftPanelBar.module.scss'


/*Component LeftPanelBar
  use: Settings Screen-Left Panel with multiple options
  props: setMiddleScreen resetMiddleScreen setResetMiddleScreen middleScreen
*/

const LeftPanelBar = (props) => {
  const userInfo = useSelector(state=>state.login.userinfo);

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
					<li><i id='tokenTab' className={`${classes["selectBrowser"]} ${userInfo.isTrial ? classes["disable-thumbnail-settings"]:""}`} title="Manage Tokens" onClick={() => { props.setMiddleScreen("tokenTab"); resetScreen("tokenTab") }}>
						<span><span className={`${classes.fa} fa fa-tags ${props.middleScreen === "tokenTab" ? classes["selected-icon"] : ""}`} ></span></span><div>Tokens</div></i></li>
					<li><i id='provisionTab' className={`${classes["selectBrowser"]} ${userInfo.isTrial ? classes["disable-thumbnail-settings"]:""}`} title="Manage Provision" onClick={() => { props.setMiddleScreen("provisionTa"); resetScreen("provisionTa") }}>
						<span><span className={`${classes.fa} fa fa-cogs ${props.middleScreen === "provisionTa" ? classes["selected-icon"] : ""}`} ></span></span><div>ICE Provision</div></i></li>
					<li><i id='projectTab' className={`${classes["selectBrowser"]} ${userInfo.isTrial ? classes["disable-thumbnail-settings"]:""}`} title="View Assigned Project" onClick={() => { props.setMiddleScreen("projectTab"); resetScreen("projectTab") }}>
						<span><span className={`${classes.fa} fa fa-briefcase ${props.middleScreen === "projectTab" ? classes["selected-icon"] : ""}`} ></span></span><div>Project</div></i></li>
					<li><i id='gitConfigure' className={`${classes["selectBrowser"]} ${userInfo.isTrial ? classes["disable-thumbnail-settings"]:""}`} title="Manage Git Configuration" onClick={() => { props.setMiddleScreen("gitConfigure"); resetScreen("gitConfigure") }}>
						<span><img style={{ height: '47px' }} src={"static/imgs/GitIcon.png"} alt={"Create Git Configuration"} className={((props.middleScreen === "gitConfigure") ? ` ${classes["selected-icon"]}` : "")} ></img></span><div>Git Configuration</div></i></li>
					<li><i id='jiraConfigure' className={`${classes["selectBrowser"]} ${userInfo.isTrial ? classes["disable-thumbnail-settings"]:""}`} title="Manage Jira Configuration" onClick={() => { props.setMiddleScreen("jiraConfigure"); resetScreen("jiraConfigure") }}>
						<span><img style={{ height: '47px' }} src={"static/imgs/jira.png"} alt={"Create Jira Configuration"} className={((props.middleScreen === "jiraConfigure") ? ` ${classes["selected-icon"]}` : "")} ></img></span><div>Jira Configuration</div></i></li>
					<li><i id='zephyrConfigure' className={`${classes["selectBrowser"]} ${userInfo.isTrial ? classes["disable-thumbnail-settings"]:""}`} title="Manage Zephyr Configuration" onClick={() => { props.setMiddleScreen("zephyrConfigure"); resetScreen("zephyrConfigure") }}>
						<span><img style={{ height: '47px' }} src={"static/imgs/zephyr.png"} alt={"Create Zephyr Configuration"} className={((props.middleScreen === "zephyrConfigure") ? ` ${classes["selected-icon"]}` : "")} ></img></span><div>Zephyr Configuration</div></i></li>
						<li><i id='AzureConfigure' className={`${classes["selectBrowser"]} ${userInfo.isTrial ? classes["disable-thumbnail-settings"]:""}`} title="Manage Azure DevOps Configuration" onClick={() => { props.setMiddleScreen("AzureConfigure"); resetScreen("AzureConfigure") }}>
						<span><img style={{ height: '47px' }} src={"static/imgs/Azure.png"} alt={"Create Azure DevOps Configuration"} className={((props.middleScreen === "AzureConfigure") ? ` ${classes["selected-icon"]}` : "")} ></img></span><div>Azure DevOps Configuration</div></i></li>
				</ul>
			</div>
		</ActionBar>
	);
}

export default LeftPanelBar;
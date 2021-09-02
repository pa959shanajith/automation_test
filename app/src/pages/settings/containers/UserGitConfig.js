import React from 'react'
import { useSelector } from 'react-redux'
import {GitConfig} from '../../admin/index'

/*Component UserGitConfig
  use: Settings middle screen for User Git Configeration. 
  props: resetMiddleScreen, setMiddleScreen
*/ 

const UserGitConfig = (props) => {
    const userInfo = useSelector(state => state.login.userinfo);
    return (
        <>
             <GitConfig userConfig={true} userID={userInfo['user_id']} username={userInfo.username} resetMiddleScreen={props.resetMiddleScreen} setMiddleScreen={props.setMiddleScreen} />
        </>
    )
}
export default UserGitConfig;
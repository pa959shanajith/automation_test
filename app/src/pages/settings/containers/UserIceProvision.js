import React from 'react'
import { useSelector } from 'react-redux'
import { IceProvision } from '../../admin/index'

/*Component UserIceProvision
  use: Settings middle screen for User Ice Provision. 
  props: resetMiddleScreen and setMiddleScreen
*/ 

const UserIceProvision = (props) => {
    const userInfo = useSelector(state => state.login.userinfo);
    return (
        <>
            <IceProvision userConfig={true} userID={userInfo['user_id']} username = {userInfo.username} resetMiddleScreen={props.resetMiddleScreen} setMiddleScreen={props.setMiddleScreen} setPopupState={props.setPopupState} />
        </>
    )
}
export default UserIceProvision;

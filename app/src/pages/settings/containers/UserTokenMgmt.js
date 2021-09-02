import React from 'react'
import { useSelector } from 'react-redux'
import {TokenManagement} from '../../admin/index'

/*Component UserTokenMgmt
  use: Settings middle screen for User Token Management.
  props: resetMiddleScreen and setMiddleScreen 
*/ 

const UserTokenMgmt = (props) => {
    const userInfo = useSelector(state => state.login.userinfo);
    return (
        <>
             <TokenManagement userConfig={true} userInfo={userInfo['user_id']} resetMiddleScreen={props.resetMiddleScreen} setMiddleScreen={props.setMiddleScreen} />
        </>
    )
}
export default UserTokenMgmt;

import React, { useState, useEffect } from 'react';
import { ScrollBar } from '../../global';
import '../styles/IceProvision.scss';
import { useDispatch, useSelector } from 'react-redux';
import { getUserDetails } from '../api';
import IceProvisionForm from '../components/IceProvisionForm';
import IceProvisionList from '../components/IceProvisionList';

/*Component IceProvision
  use: defines Admin middle Section for Ice Provision
  props: resetMiddleScreen and setMiddleScreen (for admin), resetMiddleScreen, setMiddleScreen, userConfig, userID, username (for settings home)
  ToDo:
*/

const IceProvision = (props) => {

  const [icelist, setIcelist] = useState([])
  const [selectProvisionType, setSelectProvisionType] = useState(true)
  const [runProvisionsIce, setRunProvisionsIce] = useState(true)
  const [refreshIceList, setRefreshIceList] = useState(true)
  const [op, setOp] = useState('normal')
  const [token, setToken] = useState("Click on Provision/Reregister to generate token")
  const [icename, setIcename] = useState("")
  const [userid, setUserid] = useState([])
  const [tokeninfoToken, setTokeninfoToken] = useState("")
  const [tokeninfoIcename, setTokeninfoIcename] = useState("")
  const [defaultICE, setDefaultICE] = useState('');
  const editUser = useSelector(state => state.admin.editUser);
  const userName = useSelector(state => state.admin.userName);
  const type = useSelector(state => state.admin.type);

  useEffect(() => {
    setOp('normal');
    // setRefreshIceList((prevRefreshIceList)=>(!prevRefreshIceList))
    // eslint-disable-next-line
    (async () => {
      var data = await getUserDetails("user");
      if (data.error) { props.toastError(data.error); return; }
      else {
        data.sort();
        data.map(user => {
          if (userName === user[0]) {
            setUserid(user)
          }
        })
      }
    })()
  }, []);


  const refreshIceProvision = () => {
    setIcelist([]);
    setIcename('');
    setRefreshIceList((prevRefreshIceList) => (!prevRefreshIceList))
    setSelectProvisionType(!selectProvisionType);
  }
  return (
    <div className="ip_container">
      <div className="ip-content_wrapper">
        {(type === "inhouse"|| type === 'ldap') && <IceProvisionForm defaultICE={defaultICE} refreshIceList={refreshIceList} setRefreshIceList={setRefreshIceList}
          op={op} setOp={setOp} runProvisionsIce={runProvisionsIce} selectProvisionType={selectProvisionType}
          setSelectProvisionType={setSelectProvisionType} icelist={icelist} setIcelist={setIcelist} token={token}
          setToken={setToken} icename={icename} setIcename={setIcename} userid={userid} setUserid={setUserid}
          tokeninfoIcename={tokeninfoIcename} setTokeninfoIcename={setTokeninfoIcename} tokeninfoToken={tokeninfoToken}
          setTokeninfoToken={setTokeninfoToken} toastError={props.toastError} toastSuccess={props.toastSuccess}
          toast={props.toast} ldapIceProvisionUserList={props.ldapIceProvisionUserList} createUserDialogHide={props.createUserDialogHide}/>}
        {(type === "inhouse" && editUser) ? <IceProvisionList defaultICE={defaultICE} setDefaultICE={setDefaultICE}
          userConfig={props.userConfig}
          refreshIceList={refreshIceList} selectProvisionType={selectProvisionType} setOp={setOp}
          setSelectProvisionType={setSelectProvisionType} icelist={icelist} setIcelist={setIcelist}
          token={token} setToken={setToken} icename={icename} setIcename={setIcename} userid={userid}
          setUserid={setUserid} tokeninfoIcename={tokeninfoIcename} setTokeninfoIcename={setTokeninfoIcename}
          tokeninfoToken={tokeninfoToken} setTokeninfoToken={setTokeninfoToken} edit={props.editUserIceProvision}
          toastError={props.toastError} toastSuccess={props.toastSuccess} toast={props.toast}
        /> : null}
        
      </div>
    </div>
  );
}

export default IceProvision;
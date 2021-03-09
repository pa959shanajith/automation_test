import React, { useState, useEffect } from 'react';
import {ScrollBar} from '../../global' 
import '../styles/IceProvision.scss'
import IceProvisionForm from '../components/IceProvisionForm';
import IceProvisionList from '../components/IceProvisionList';

/*Component IceProvision
  use: defines Admin middle Section for Ice Provision
  ToDo:
*/

const IceProvision = (props) => {

    const [icelist,setIcelist] = useState([])
    const [selectProvisionType,setSelectProvisionType] = useState(true)
    const [runProvisionsIce,setRunProvisionsIce] = useState(true)
    const [refreshIceList,setRefreshIceList] = useState(true)
    const [op,setOp] = useState('normal')
    const [token,setToken] = useState("Click on Provision/Reregister to generate token")
    const [icename,setIcename] = useState("")
    const [userid,setUserid] = useState(" ")
    const [tokeninfoToken,setTokeninfoToken] = useState("")
    const [tokeninfoIcename,setTokeninfoIcename] = useState("")

    useEffect(()=>{
      setOp('normal');
      // eslint-disable-next-line
    },[props.resetMiddleScreen["provisionTa"],props.MiddleScreen])

    const refreshIceProvision = () =>{
        setIcelist([]);
        setSelectProvisionType(!selectProvisionType);
    }

    return (
        <div className="ip_container">
            <div id="page-taskName"><span>ICE Provision</span></div>
            <div className="adminActionBtn">
                <button className="btn-md pull-right adminBtn-ice-prov" onClick={()=>{setRunProvisionsIce(!runProvisionsIce)}}  title="Provision">Provision</button>
                <button className="btn-md pull-right adminBtn-ice-prov adminBtn-ice-provision " onClick={()=>{refreshIceProvision()}} title="Refresh">Refresh</button>            
            </div>
            <div className="ip-content_wrapper">
                <ScrollBar thumbColor="#929397">
                  <IceProvisionForm refreshIceList={refreshIceList} setRefreshIceList={setRefreshIceList} op={op} setOp={setOp} runProvisionsIce={runProvisionsIce} selectProvisionType={selectProvisionType} setSelectProvisionType={setSelectProvisionType} icelist={icelist} setIcelist={setIcelist} token={token} setToken={setToken} icename={icename} setIcename={setIcename} userid={userid} setUserid={setUserid} tokeninfoIcename={tokeninfoIcename} setTokeninfoIcename={setTokeninfoIcename} tokeninfoToken={tokeninfoToken} setTokeninfoToken={setTokeninfoToken} />
                  <IceProvisionList refreshIceList={refreshIceList} selectProvisionType={selectProvisionType} setOp={setOp} setSelectProvisionType={setSelectProvisionType}  icelist={icelist} setIcelist={setIcelist} token={token} setToken={setToken} icename={icename} setIcename={setIcename} userid={userid} setUserid={setUserid} tokeninfoIcename={tokeninfoIcename} setTokeninfoIcename={setTokeninfoIcename} tokeninfoToken={tokeninfoToken} setTokeninfoToken={setTokeninfoToken}/>
                </ScrollBar>
            </div>
        </div>
  );
}

export default IceProvision;
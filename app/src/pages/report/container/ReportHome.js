import React from 'react';
import { Header, FooterTwo as Footer,ActionBar,ReferenceBar} from '../../global';
import ReportContainer from './ReportContainer';
import '../styles/ReportHome.scss';

/*Component ReportHome
  use: renders ReportHome is a entry point for report layout
  can be used here to create multiple childrent entries ex: accessibility
*/

const ReportHome = () =>{
    return(
        <div className='rp__container'>
            <Header/>
            <div className='rp__body-main'>
                <ActionBar collapsible={true} collapse={true} collapsible={false}/>
                <div className='rp__middle_container'>
                    <ReportContainer/>
                </div>
                <ReferenceBar taskTop={true} collapsible={true}  collapse={true}/>
            </div>
            <div className='rp__footer'><Footer/></div>
        </div>
    )
}

export default ReportHome;
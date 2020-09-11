import React from 'react'
import '../styles/RightBarItems.scss'
function Rightbar() {
    return (
        <div className="rightnav container" >
            <div className="rightnav-container row">
                <span className='rightdep col-sm' ><span><img src="static/imgs/ic-screenshot.png" alt="screenshot"/></span><br/><span className="caption">Screenshot</span></span>
                <span className='rightdep col-sm' ><span><img src="static/imgs/ic-filter.png" alt="fliter"/></span><br/><span className="caption">Filter</span></span>
                <span className="col-sm" ><span ><img src="static/imgs/ic-task.png" alt="tasks"/></span><br/><span className="caption">Tasks</span></span>
                <span className='rightdep col-sm' ><span><img src="static/imgs/ic-info.png" alt="info"/></span><br/><span className="caption">Info</span></span>
                <span className='rightdep col-sm last '><span><img src="static/imgs/ic-assist.png" alt="profj"/></span><br/><span className="caption">Prof J</span></span>
            </div>
        </div>
    )
}

export default Rightbar

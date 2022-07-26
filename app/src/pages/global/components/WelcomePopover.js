import React from "react";
import "../styles/WelcomePopover.scss"

/*
    Component: Welcome Popover
    Uses: Provides header functionality to the page
    Props: title -> displayed on the top of the popover
          items-> list of items to be rendererd (imageName & content)
          handleWPEvent -> custom function to handle skip and next functionalities
          WP_STEPNO -> to identify which step we are currently on (ideally should be a state var.)

*/

const WelcomePopover = ({title, items, handleWPEvents, WP_STEPNO}) => {
  return (
  <div className="welcome_popover">
      <div className="tip"></div>
      <div className="wp_container">
          <div className="title">{title}</div>
          <div className="image">
              <img src={"static/imgs/"+items[WP_STEPNO].imageName} alt="Training Image" />
          </div>
          <div className="content">{items[WP_STEPNO].content}</div>
          <div className="footer">
              <button className="wp_button" data-type={"bordered"} onClick={()=>{handleWPEvents(true)}}>Skip</button>
              <div className="wp_indicator">
                  {items.map((item,idx)=>{
                      return <div key={idx+item.imageName} className="circle" data-type={WP_STEPNO===idx} onClick={()=>{handleWPEvents(idx)}}></div>
                  })}
              </div>
              <button className="wp_button" onClick={handleWPEvents}>Next</button>
          </div>
      </div>
  </div>);
}

export default WelcomePopover;
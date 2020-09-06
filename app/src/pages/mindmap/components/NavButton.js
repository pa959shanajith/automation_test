import React from 'react';
import Draggable from 'react-draggable';
import '../styles/NavButton.scss'

/*Component NavButton
  use: returns floating NavButton with 4 directional movement and zoom +/-
*/

const NavButton = () => {
    return(
        <Draggable bounds="parent">
            <div id="navigate-widget">
                <div className="arrow-box">
                        <p><i className="arrow-box-ic up"></i></p>
                        <p><i className="arrow-box-ic left"></i><i className="arrow-box-ic right"></i></p>
                        <p><i className="arrow-box-ic down"></i></p>
                </div>   
                <div className="zoom-box">
                    <div><button className="zoom-btn" id="zoom_in"><span>+</span></button></div>
                    <div><button className="zoom-btn" id="zoom_out"><span>-</span></button></div>
                </div>     
            </div>
        </Draggable>
    )
}

export default NavButton;
import React from 'react';
import { Rnd } from "react-rnd";
import '../styles/NavButton.scss'

/*Component NavButton
  use: returns floating NavButton with 4 directional movement and zoom +/-
*/

const NavButton = () => {
    return(
        <Rnd bounds="parent">
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
        </Rnd>
    )
}

export default NavButton;
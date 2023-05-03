import React from 'react';
import '../styles/SideBarTiles.scss';

const  SideBarTiles = (props) => {
    return (
        <div className="container_tiles">
            <img src={props.background_tile_color} alt="Snow" style={{width:"100%",height:"8rem"}}></img>
                <div className="top-left">
                    <span className='tile_header flex flex-row'>
                        <img className="top_image mt-1 mr-2" alt="logo" src={props.header_icon} style={{width:"2rem"}} />
                        <h4 className='mt-2'>{props.header_txt}</h4>
                    </span>
                    <h6 className='tile_text'>{props.text}</h6>
                    <span className='tile_footer flex flex-row'>
                        <img className="mt-1 mr-2 " alt="logo" src={props.footer_icon} style={{width:"2rem", height:"1.7rem"}} />
                        <h4 className='mt-2'>{props.footer_txt}</h4>
                    </span>
                </div>
        </div>
    );
}

export default SideBarTiles;
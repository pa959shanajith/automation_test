import React from 'react';
import SideBarTiles from '../components/SideBarTiles';
import  DisplayProject from '../components/DisplayProject';
import '../styles/SidePanel.scss';


const SidePanel = (props) => {

    return(
            <div className="sidePanel_container h-full">
                <DisplayProject toastError={props.toastError} toastSuccess={props.toastSuccess}/>
                  {/*<div className="sidebar_tiles">
                    <div>
                        <h2> Do more with AVO !</h2>
                        <div className="ml-2 mr-2 "><SideBarTiles background_tile_color={"static/imgs/light_blue_tile.png"} header_txt={"Services Virtualization"} header_icon={"static/imgs/service_tree_icon.png"} text={"kjwekje wekh3eiubiueih13iu 1iueuie 1eudg 1idg4ui 1]f3ug"} footer_icon={"static/imgs/lock_icon.png"} footer_txt={"Get Familiar"}/></div>
                        <div className="ml-2 mr-2"><SideBarTiles background_tile_color={"static/imgs/green_tile.png"} header_txt={"TestData Visualizatin"} header_icon={"static/imgs/library_icon.png"} text={"kjwekje wekh3eiubiueih13iu 1iueuie 1eudg 1idg4ui 1]f3ug"} footer_icon={"static/imgs/unlock_icon.png"} footer_txt={"Get Familiar"}/></div>
                        <div className="ml-2 mr-2"><SideBarTiles background_tile_color={"static/imgs/light_blue_tile.png"} header_txt={"Services Virtualization"} header_icon={"static/imgs/service_tree_icon.png"} text={"kjwekje wekh3eiubiueih13iu 1iueuie 1eudg 1idg4ui 1]f3ug"} footer_icon={"static/imgs/lock_icon.png"} footer_txt={"Get Familiar"}/></div>
                    </div>
                </div>  */}
            </div> 
    )
}

export default SidePanel;
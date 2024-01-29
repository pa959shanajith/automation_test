import React, { useEffect, useState } from "react";
import { Dialog } from "primereact/dialog";
import { useDispatch, useSelector } from "react-redux";
import { showSapGenius } from "../globalSlice";
import GeniusSap from "../../landing/components/GeniusSap";
import "../styles/GeniusSapDialog.scss";




const GeniusSapDialog = () => {
    const showSapGeniusDialog = useSelector((state) => state.progressbar.showSapGeniusWindow);
    const geniusSapWindowProps = useSelector((state) => state.progressbar.geniusSapWindowProps);
    const showSmallPopup = useSelector((state) => state.progressbar.showSmallPopup);
    const userInfo = useSelector((state) => state.landing.userinfo);
    const [small, setSmall] = useState(false);
    const dispatch = useDispatch();


    useEffect(() => {

        if (showSmallPopup) {
            setSmall(true);
        }
        else {
            setSmall(false);
        }
    });

    return <>
        <Dialog style={small ? { width: '45vw', height: '30vh' } : { width: '80vw', height: '97vh' }} header={small ? null : "Avo Genius for SAP"} visible={showSapGeniusDialog} draggable={false} className="geniusMindmapDialog" onHide={() => { dispatch(showSapGenius({ showSapGeniusWindow: false, geniusSapWindowProps: {} })); }}>
            <GeniusSap {...geniusSapWindowProps}></GeniusSap>
        </Dialog>

    </>;
};
export default GeniusSapDialog;
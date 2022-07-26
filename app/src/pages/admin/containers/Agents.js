import React, { useState, useEffect } from 'react';
import {Messages as MSG, VARIANT, setMsg, ModalContainer, ScrollBar, ScreenOverlay} from '../../global';
import { SearchBox, DetailsList, Tab } from '@avo/designcomponents';
import '../styles/Agents.scss';
import ReactTooltip from 'react-tooltip';
import AgentsList from './AgentsList';
import GridList from './GridList';

/* Component Agents */

const Agents = () => {
    const [loading,setLoading] = useState(false);
    const [selectedTab, setSelectedTab] = useState('grids');
    const [showConfirmPop, setShowConfirmPop] = useState(false);


    const ConfirmPopup = () => (
        <ModalContainer 
            title={showConfirmPop.title}
            content={showConfirmPop.content}
            close={()=>setShowConfirmPop(false)}
            footer={
                <>
                <button onClick={showConfirmPop.onClick}>Yes</button>
                <button onClick={()=>setShowConfirmPop(false)}>No</button>
                </>
            }
        />
    );
    const showMessageBar = (message, selectedVariant) => (
        setMsg(MSG.CUSTOM(message,VARIANT[selectedVariant]))
    );


    return (<>
        {loading?<ScreenOverlay content={loading}/>:null}
        { showConfirmPop && <ConfirmPopup /> }
        <div className='agent-container'>
            <Tab options={[
                { key: 'grids', text: 'Grids' },
                { key: 'agents', text: 'Agents' }
            ]} selectedKey={selectedTab} onLinkClick = {(item) => item && setSelectedTab(item.props.itemKey)} />
            { selectedTab === 'agents' ? <AgentsList setShowConfirmPop={setShowConfirmPop} showMessageBar={showMessageBar} /> : 
                <GridList setShowConfirmPop={setShowConfirmPop} showMessageBar={showMessageBar} />
            }
        </div>
    </>);
}

export default Agents;
import React, { useState } from 'react';
import { Messages as MSG, VARIANT, setMsg, ModalContainer, ScreenOverlay } from '../../global';
import '../styles/Grid.scss';
import GridList from '../components/GridList';
import { Button } from 'primereact/button';
import CreateGrid from '../components/CreateGrid';

/* Component Agents */

const Grid = () => {
    const [loading, setLoading] = useState(false);
    const [showConfirmPop, setShowConfirmPop] = useState(false);
    const [createDialog, setCreateDialog] = useState(false);

    const ConfirmPopup = () => (
        <ModalContainer
            title={showConfirmPop.title}
            content={showConfirmPop.content}
            close={() => setShowConfirmPop(false)}
            footer={
                <>
                    <Button onClick={showConfirmPop.onClick}>Yes</Button>
                    <Button onClick={() => setShowConfirmPop(false)}>No</Button>
                </>
            }
        />
    );
    const showMessageBar = (message, selectedVariant) => (
        setMsg(MSG.CUSTOM(message, VARIANT[selectedVariant]))
    );



    return (<>
        {loading ? <ScreenOverlay content={loading} /> : null}
        {showConfirmPop && <ConfirmPopup />}
        {/*  list*/} <GridList  setCreateDialog={setCreateDialog}  setShowConfirmPop={setShowConfirmPop} showMessageBar={showMessageBar} setLoading={setLoading} />
        {/* creategrid */}<CreateGrid createDialog={createDialog} setCreateDialog={setCreateDialog} />

    </>);
}

export default Grid;
import React from 'react';
import  { AnimatePresence, motion } from 'framer-motion';
import "../styles/AnimatePage.scss";
const animateVariants = {
    hiddenLeft: { x: "-100vw", transition: { duration: 1 } },
    hiddenRight: { x: "100vw", transition: { duration: 1 } },
    visible: { x: 0, transition: { duration: 1 }}
}
export const AnimatePageWrapper = props => (
    <div className="apw_presence" >
        <AnimatePresence>
            { props.children }
        </AnimatePresence>
    </div>
);

export const AnimateDiv = props => (
    <motion.div
        className="ad_motiondiv"
        variants={ animateVariants }
        initial={props.firstRender ? "" : props.firstPage ? "hiddenLeft" : "hiddenRight"}
        animate="visible"
        exit={props.firstRender ? "" : props.firstPage ? "hiddenLeft" : "hiddenRight"}
    >
        { props.children }
    </motion.div>
);

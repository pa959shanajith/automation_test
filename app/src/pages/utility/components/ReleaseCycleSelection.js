import React from 'react';
import { SearchDropdown } from '@avo/designcomponents';
import "../styles/ModuleSelection.scss";

const ReleaseCycleSelection = ({ selectValues, handleSelect, isEditing }) => {
    
    return (
        <div className="devOps__module_sel_container">
            {
                selectValues.map((selectValue, fieldIndex) => (
                    <SearchDropdown
                        key={selectValue.type}
                        calloutMaxHeight="30vh"
                        label={selectValue.label}
                        disabled={isEditing}
                        noItemsText={selectValue.emptyText}
                        onChange={handleSelect(fieldIndex)}
                        options={selectValue.list}
                        placeholder=""
                        selectedKey={selectValue.selected}
                        width={selectValue.width}
                    />
                ))
            }
        </div>
    );
}

export default ReleaseCycleSelection;
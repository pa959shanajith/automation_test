import React ,  { Fragment, useEffect, useState, useRef} from 'react';
import ClickAwayListener from 'react-click-away-listener';
import { ScrollBar } from '../../global';
import '../styles/ComboBox.scss'

/*Component ComboBox
  use: renders searchable available ice dropdown
*/

const ComboBox = ({ errorBorder,index,rules,setRules,groupList,allUsers, ruleid, updateRules, setUpdateRules}) => {
    const inputRef = useRef()
    const [list1,setList1] =  useState([])
    const [list2,setList2] =  useState([])
    const [dropDown,setDropDown] = useState(false)
    useEffect(()=>{
        setList1([...groupList])
        setList2([...allUsers])
        inputRef.current.value = ""
        // eslint-disable-next-line
    },[allUsers,groupList])
    const inputFilter = () =>{
        var val = inputRef.current.value
        var itemsList1 = [...list1].filter((e)=>e.groupname.toUpperCase().indexOf(val.toUpperCase())!==-1)
        var itemsList2 = [...list2].filter((e)=>e.name.toUpperCase().indexOf(val.toUpperCase())!==-1)
        setList1(itemsList1)
        setList2(itemsList2);
    }
    const resetField = () => {
        inputRef.current.value = ""
        setList1([...groupList])
        setList2([...allUsers])
        setDropDown(true)
    }

    const selectList1Option = (value, event) =>{
        let selectedGroupIds = [...rules[index].groupids];
        if(selectedGroupIds.includes(value)){
            var i = selectedGroupIds.indexOf(value);
			selectedGroupIds.splice(i, 1);
        }
        else {
            selectedGroupIds.push(value);
        }
        event.currentTarget.getElementsByTagName('input')[0].checked = !event.currentTarget.getElementsByTagName('input')[0].checked
        let ruleList = [...rules]
        ruleList[index].groupids = selectedGroupIds;
        setRules(ruleList);
        if(updateRules!==undefined){
            updateOldRules(ruleList[index]);
        }
    }

    const updateOldRules = (data) => {
        let updateRulesData= {...updateRules};
        if(updateRulesData[ruleid]===undefined) updateRulesData[ruleid] = {};
        updateRulesData[ruleid] = data;
        setUpdateRules(updateRulesData);
    }

    const selectList2Option = (value, event) =>{
        let selectedAddRecepients = [...rules[index].additionalrecepients];
        if(selectedAddRecepients.includes(value)){
            var i = selectedAddRecepients.indexOf(value);
			selectedAddRecepients.splice(i, 1);
        }
        else {
            selectedAddRecepients.push(value);
        }
        event.currentTarget.getElementsByTagName('input')[0].checked = !event.currentTarget.getElementsByTagName('input')[0].checked
        let ruleList = [...rules]
        ruleList[index].additionalrecepients = selectedAddRecepients;
        setRules(ruleList);
        if(updateRules!==undefined && ruleid!==undefined){
            updateOldRules(ruleList[index]);
        }
    }

    const selectOptionCheckBox = (value) => {
        document.getElementById(value).checked = !document.getElementById(value).checked
    }

    return(
        <Fragment>
            <ClickAwayListener onClickAway={()=>setDropDown(false)}>
            <div>
                <input autoComplete={"off"} ref={inputRef} className={" cb__input"+(errorBorder?" advOption__error_field":"")} onChange={inputFilter} onClick = {resetField} placeholder={"Select Recipients"}/>
                <div className="cb__dropdown" role="menu" style={{display: (dropDown?"block":"none")}}>
                    <ScrollBar thumbColor="#929397" >
                    {list1.map((item,i) => (  
                        <ul key={i} role="presentation" className={(rules[index].groupids.includes(item._id)?" cb__selectedCheckBox":"")}  onClick={()=>{selectOptionCheckBox(item._id)}} >
                            <li value={item.groupname} onClick={(event)=>{selectList1Option(item._id,event)}} title={item.groupname} className={"cb__list-item " } >
                                <input id={item._id} checked={rules[index].groupids.includes(item._id)} type="checkbox" className="cb_checkbox"/>
                                {"  "}{item.groupname}
                            </li>
                        </ul>
                    ))}
                    {list2.map((item,i) => (  
                        <ul key={i} role="presentation" className={(rules[index].additionalrecepients.includes(item._id)?" cb__selectedCheckBox":"")}  onClick={()=>{selectOptionCheckBox(item._id)}} >
                            <li value={item.name} onClick={(event)=>{selectList2Option(item._id,event)}} title={item.name} className={"cb__list-item " } >
                                <input id={item._id} checked={rules[index].additionalrecepients.includes(item._id)} type="checkbox" className="cb_checkbox"/>
                                {"  "}{item.name}
                            </li>
                        </ul>
                    ))}
                    </ScrollBar>
                </div>
            </div>
            </ClickAwayListener>
        </Fragment>
    )
}

export default ComboBox;

//+((selectedICE[ice.icename]!==undefined && selectedICE[ice.icename]===true)?" cb__selectedCheckBox":"")
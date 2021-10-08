import React ,  { Fragment, useEffect, useState, useRef} from 'react';
import ClickAwayListener from 'react-click-away-listener';
import { ScrollBar } from '..';
import '../styles/SelectRecipients.scss'

/*Component SelectRecipients
  use: renders searchable available Select Recipients
*/

const SelectRecipients = ({ recipients,setRecipients,groupList,allUsers}) => {
    const inputRef = useRef()
    const [list1,setList1] =  useState([])
    const [list2,setList2] =  useState([])
    const [dropDown,setDropDown] = useState(false)
    useEffect(()=>{
        setList1([...groupList])
        setList2([...allUsers])
        inputRef.current.value = " Select Recipient"
        // eslint-disable-next-line
    },[allUsers,groupList])
    useEffect(()=>{
        inputRef.current.value = " Select Recipient"
        if((recipients.groupids).length>0 || (recipients.additionalrecepients).length>0 )
        inputRef.current.value = recipients.groupids.length + recipients.additionalrecepients.length +" Recipient Selected";
    },[])
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
        let selectedGroupIds = [...recipients.groupids];
        if(selectedGroupIds.includes(value)){
            var i = selectedGroupIds.indexOf(value);
			selectedGroupIds.splice(i, 1);
        }
        else {
            selectedGroupIds.push(value);
        }
        event.currentTarget.getElementsByTagName('input')[0].checked = !event.currentTarget.getElementsByTagName('input')[0].checked
        let recipientsData = {...recipients}
        recipientsData.groupids = selectedGroupIds;
        setRecipients(recipientsData);
        inputRef.current.value = " Select Recipient"
        if((recipientsData.groupids).length>0 || (recipientsData.additionalrecepients).length>0 )
        inputRef.current.value = recipientsData.groupids.length + recipientsData.additionalrecepients.length +" Recipient Selected";
    }

    const selectList2Option = (value, event) =>{
        let selectedAddRecepients = [...recipients.additionalrecepients];
        if(selectedAddRecepients.includes(value)){
            var i = selectedAddRecepients.indexOf(value);
			selectedAddRecepients.splice(i, 1);
        }
        else {
            selectedAddRecepients.push(value);
        }
        event.currentTarget.getElementsByTagName('input')[0].checked = !event.currentTarget.getElementsByTagName('input')[0].checked
        let recipientsData = {...recipients}
        recipientsData.additionalrecepients = selectedAddRecepients;
        setRecipients(recipientsData);
        inputRef.current.value = " Select Recipient"
        if((recipientsData.groupids).length>0 || (recipientsData.additionalrecepients).length>0 )
        inputRef.current.value = recipientsData.groupids.length + recipientsData.additionalrecepients.length +" Recipient Selected";
    }

    const selectOptionCheckBox = (value) => {
        document.getElementById(value).checked = !document.getElementById(value).checked
    }

    const setPlaceholder = () => {
        inputRef.current.value = " Select Recipient"
        if((recipients.groupids).length>0 || (recipients.additionalrecepients).length>0 )
        inputRef.current.value = recipients.groupids.length + recipients.additionalrecepients.length +" Recipient Selected";
    } 

    return(
        <Fragment>
            <ClickAwayListener onClickAway={()=>{setPlaceholder();setDropDown(false)}}>
            <div>
                <input autoComplete={"off"} ref={inputRef} className={" sr__input"} onChange={inputFilter} onClick = {resetField} placeholder={"Search Recipients.."}/>
                {dropDown && <div className="sr__dropdown" role="menu">
                    <ScrollBar thumbColor="#929397" >
                    {list1.map((item,i) => (  
                        <ul key={i} role="presentation" className={(recipients.groupids.includes(item._id)?" sr__selectedCheckBox":"")}  onClick={()=>{selectOptionCheckBox(item._id)}} >
                            <li value={item.groupname} onClick={(event)=>{selectList1Option(item._id,event)}} title={item.groupname} className={"sr__list-item " } >
                                <input id={item._id} checked={recipients.groupids.includes(item._id)} type="checkbox" className="sr_checkbox"/>
                                {"  "}{item.groupname}
                            </li>
                        </ul>
                    ))}
                    {list2.map((item,i) => (  
                        <ul key={i} role="presentation" className={((recipients.additionalrecepients).includes(item._id)?" sr__selectedCheckBox":"")}  onClick={()=>{selectOptionCheckBox(item._id)}} >
                            <li value={item.name} onClick={(event)=>{selectList2Option(item._id,event)}} title={item.name} className={"sr__list-item " } >
                                <input id={item._id} checked={(recipients.additionalrecepients).includes(item._id)} type="checkbox" className="sr_checkbox"/>
                                {"  "}{item.name}
                            </li>
                        </ul>
                    ))}
                    </ScrollBar>
                </div>}
            </div>
            </ClickAwayListener>
        </Fragment>
    )
}

export default SelectRecipients;
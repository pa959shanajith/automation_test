import React,{ useState, useEffect} from 'react';
import { InputText } from 'primereact/inputtext';
import { Button } from 'primereact/button';
import { Checkbox } from 'primereact/checkbox';
import { useSelector} from 'react-redux';


const GitCommit = (props) => {
    const moduleLists = useSelector(state=>state.design.moduleList);
    const [versionName, setVersionName] = useState('');
    const [commitMsg, setCommitMsg] = useState('');
    const [allModuleList, setAllModuleList] = useState([]);
    const [LhsModuleList, setLhsModuleList] = useState([]);
    const [RhsModuleList, setRhsModuleList] = useState([]);
    const [leftSideCheckedModuleList, setLeftSideCheckedModuleList] = useState([]);
    const [rightSideCheckedModuleList, setRightSideCheckedModuleList] = useState([]);

    useEffect(() => {
        if(moduleLists.length > 0){
            let moduleList = moduleLists.filter((e) => e.type === "basic")
            setAllModuleList(moduleList);
            setLhsModuleList(moduleList);
        }
        else setAllModuleList(''); 
    },[]);

    const onLeftSideModuleListChecked = (e) => {
        if(e.checked){
            setLeftSideCheckedModuleList([...leftSideCheckedModuleList, e.target.value]);
        }
        else {
            const newModuleList =  leftSideCheckedModuleList.filter(element => element !== e.target.value);
            setLeftSideCheckedModuleList(newModuleList);
        }
    }
    const onRightSideModuleListChecked = (e) => {
        if(e.checked){
            setRightSideCheckedModuleList([...rightSideCheckedModuleList, e.target.value]);
        }
        else {
            const newModuleList =  rightSideCheckedModuleList.filter(element => element !== e.target.value);
            setRightSideCheckedModuleList(newModuleList);
        }
    }
    function arrayEquals(arr1, arr2){
        return arr1 === arr2
    }

    const transferLeftToRight = () => {
        let newLeftSideModuleList = LhsModuleList.filter(arr1 => !leftSideCheckedModuleList.some(arr2 => arrayEquals(arr1._id, arr2)));
        let newCheckedModuleList = LhsModuleList.filter(arr1 => leftSideCheckedModuleList.some(arr2 => arrayEquals(arr1._id, arr2)));
        setLhsModuleList(newLeftSideModuleList);
        let rhsList = [...RhsModuleList, ...newCheckedModuleList]
        let moduleIdList = rhsList.map(element =>  { return element._id })
        setRhsModuleList(rhsList);
        props.moduleListChange(moduleIdList);
        setLeftSideCheckedModuleList([]);
    }

    const transferRightToLeft = () => {
        let rightSideModuleList = RhsModuleList.filter(arr1 => !rightSideCheckedModuleList.some(arr2 => arrayEquals(arr1._id, arr2)));
        let leftSideModuleList = RhsModuleList.filter(arr1 => rightSideCheckedModuleList.some(arr2 => arrayEquals(arr1._id, arr2)));
        let lhsList = [...LhsModuleList, ...leftSideModuleList];
        let moduleIdList = lhsList.map(element =>  { return element._id })
        setLhsModuleList(lhsList);
        setRhsModuleList(rightSideModuleList);
        props.moduleListChange(moduleIdList);
        setRightSideCheckedModuleList([]);   
    }
      
   
    return (
    <div className='flex flex-column gap-3'>
        <div className='flex flex-column'>
            <label>Version <span className='text-red-500'>*</span></label>
            <InputText
                value={versionName}
                onChange={(e) => {props.versionChange(e.target.value.trim()); setVersionName(e.target.value.trim());}}
                className='w-full md:w-20rem p-inputtext-sm mb-2'
                placeholder="Enter version name"
            ></InputText>
        </div>

        <div className='flex flex-row gap-3'>
            <div className='commit_testcase_list card'>
                <label>Unstaged Changes</label>
                <div className="test_list pl-4 pt-3 pb-2">
                    <div className="pb-3">
                        {LhsModuleList.length > 0 ? LhsModuleList.map(element => (
                            <div key={element._id} className="flex align-items-center pb-3">
                                <Checkbox inputId={element._id}
                                    name={element._id}
                                    value={element._id}
                                    onChange={onLeftSideModuleListChecked}
                                    checked={leftSideCheckedModuleList.includes(element._id)}
                                />
                                <label htmlFor={element.name} className="ml-2">
                                    {element.name}
                                </label>
                            </div>)
                        ) : "No test cases Found"
                        }
                    </div>
                </div>

            </div>

            <div className='flex flex-column justify-content-center gap-2'>
                <Button label=">" size="small" onClick={transferLeftToRight} disabled={!leftSideCheckedModuleList.length > 0} outlined> </Button>
                <Button label="<" size="small" onClick={transferRightToLeft} disabled={!rightSideCheckedModuleList.length > 0} outlined> </Button>
            </div>

            <div className='commit_testcase_list card'>
                <label>Staged Changes</label>
                <div className="pb-3">
                    {RhsModuleList.length > 0 ? RhsModuleList.map(element => (
                            <div key={element._id} className="flex align-items-center pb-3">
                                <Checkbox inputId={element._id}
                                    name={element._id}
                                    value={element._id}
                                    onChange={onRightSideModuleListChecked}
                                    checked={rightSideCheckedModuleList.includes(element._id)}
                                />
                                <label htmlFor={element.name} className="ml-2">
                                    {element.name}
                                </label>
                            </div>)
                        ) : "No test cases Found"
                    }
                </div>
            </div>
        </div>

        <div className='flex flex-column'>
            <label>Comment</label>
            <InputText
                value={commitMsg}
                onChange={(e) => {props.commitMsgChange(e.target.value); setCommitMsg(e.target.value)}}
                className='w-full md:w-19rem p-inputtext-sm mb-2'
                placeholder="Enter your comment here"
            ></InputText>
        </div>

    </div>)
}
export default GitCommit;
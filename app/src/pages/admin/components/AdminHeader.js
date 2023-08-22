import { useSelector } from "react-redux";
import {Button} from 'primereact/button';
import "../styles/AdminHeader.scss";
import { AdminActions } from '../adminSlice';
import { useDispatch } from 'react-redux';


const AdminHeader = (props) => {
    const currentTab = useSelector(state => state.admin.screen);
    const dispatch = useDispatch();
    
    return (
        <div className="Create_Header">
            <h3>{currentTab}</h3>
            {currentTab === "users" && <Button className="Create_btn" label ="create" onClick={() => {props.setCreateUserDialog(true); dispatch(AdminActions.RESET_VALUES(""))}}> </Button>}
        </div>
    )
}
export default AdminHeader;
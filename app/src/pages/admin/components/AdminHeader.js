import { useSelector } from "react-redux";
import {Button} from 'primereact/button';
import "../styles/AdminHeader.scss"

const AdminHeader = (props) => {
    const currentTab = useSelector(state => state.admin.screen);
    
    return (
        <div className="Create_Header">
            <h3>{currentTab}</h3>
            {currentTab === "users" && <Button className="Create_btn" label ="create" onClick={() => props.setCreateUserDialog(true)}></Button>}
        </div>
    )
}
export default AdminHeader;
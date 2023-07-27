import { useSelector } from "react-redux";

const AdminHeader = () => {
    const tabName = useSelector(state => state.admin.header);
    return (
        <div>
            <h3>{tabName}</h3>
        </div>
    )
}
export default AdminHeader;
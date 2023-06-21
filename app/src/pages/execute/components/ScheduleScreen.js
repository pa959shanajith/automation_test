import { useState } from "react";
import { Tree } from "primereact/tree";
import { RadioButton } from "primereact/radiobutton";
import ExecutionCard from "./ExecutionCard";
import AvoDropdown from "../../../globalComponents/AvoDropdown";
import "../styles/ScheduleScreen.scss";
import { schedulePeriod } from "../../utility/mockData";

const ScheduleScreen = ({ cardData }) => {
  const [selectedSchedule, setSelectedSchedule] = useState(schedulePeriod[1]);

  const nodes = [
    {
      key: "0",
      label: (
        <div className="grid">
          <div className="col-12">Schedule Options</div>
          <div className="col-12 lg:col-6 xl:col-6 md:col-6 sm:col-12">
            <AvoDropdown />
          </div>
          <div className="col-12 lg:col-6 xl:col-6 md:col-6 sm:col-12">
            <AvoDropdown />
          </div>
          <div className="col-12 lg:col-6 xl:col-6 md:col-6 sm:col-12">
            <AvoDropdown />
          </div>
          <div className="col-12 lg:col-6 xl:col-6 md:col-6 sm:col-12">
            <AvoDropdown />
          </div>
        </div>
      ),
      data: "Documents Folder",
      icon: "pi pi-fw pi-inbox",
      children: [
        {
          key: "0-0",
          label: (
            <div>
              {schedulePeriod.map((el) => (
                <div key={el.key}>
                  <RadioButton
                    inputId={el.key}
                    name="schedule"
                    value={el}
                    onChange={(e) => setSelectedSchedule(e.value)}
                    checked={selectedSchedule.key === el.key}
                  />
                  <label htmlFor={el.key} className="ml-2">
                    {el.name}
                  </label>
                </div>
              ))}
            </div>
          ),
          data: "Work Folder",
          icon: "pi pi-fw pi-cog",
        },
      ],
    },
  ];

  return (
    <div>
      <ExecutionCard cardData={cardData} />
      <Tree value={nodes} className="schedule_tree" />
    </div>
  );
};

export default ScheduleScreen;

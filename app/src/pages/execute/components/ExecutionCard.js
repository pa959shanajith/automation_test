import { Card } from "primereact/card";
import "../styles/ExecutionCard.scss";
import { getBrowser } from "../../utility/utilityFunctions";

const ExecutionCard = ({ cardData }) => {
  console.log(getBrowser(cardData?.executionRequest?.browserType));

  return (
    <Card className="card_execute">
      <div className="grid">
        <div className="col-12 lg:col-6 xl:col-6 md:col-12 sm:col-12">
          <div>Avo Agent: {cardData?.executionRequest?.avoagents[0] ? cardData?.executionRequest?.avoagents[0] : 'Any Agent'}</div>
        </div>
        <div className="col-12 lg:col-6 xl:col-6 md:col-12 sm:col-12">
          <div>
            Execution Mode :{" "}
            {cardData?.executionRequest?.isHeadless
              ? "Headless"
              : "Non - Headless"}
          </div>
        </div>
        <div className="col-12 lg:col-6 xl:col-6 md:col-12 sm:col-12">
          <div>Selected Browser  : {getBrowser(cardData?.executionRequest?.browserType).join(", ")}</div>
        </div>
        <div className="col-12 lg:col-6 xl:col-6 md:col-12 sm:col-12">
          <div>Integration(s) : ALM, Qtest, Zephyr</div>
        </div>
      </div>
    </Card>
  );
};

export default ExecutionCard;

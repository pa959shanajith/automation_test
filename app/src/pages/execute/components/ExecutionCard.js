import { Card } from "primereact/card";
import "../styles/ExecutionCard.scss";
import { getBrowser } from "../../utility/utilityFunctions";

const ExecutionCard = ({ cardData, configData }) => {
  console.log(getBrowser(cardData?.executionRequest?.browserType));

  const determineIntegration = (integrationData) => {
    if (integrationData.alm.url) {
      return 'ALM';
    } else if (integrationData.qtest.url) {
      return 'qTest';
    } else if (integrationData.zephyr.url) {
      return 'Zephyr';
    } else if (integrationData?.azure?.url) {
      return 'Azure';
    } else if (integrationData?.testrail?.url) {
      return 'TestRail';
    }
    else {
      return 'NA';
    }
  };
  
  const integrationType = determineIntegration(cardData?.executionRequest?.integration);  

  return (
    <Card className="card_execute">
      <div className="grid">
        <div className="col-12 lg:col-6 xl:col-6 md:col-12 sm:col-12">
          {
            cardData?.executionRequest?.avogridId ?
            <div>Avo Grid: {configData?.avoAgentAndGrid?.avogrids?.filter((item) => item?._id === cardData?.executionRequest?.avogridId)[0]?.name}</div> :
            <div>Avo Agent: {cardData?.executionRequest?.avoagents[0] ? cardData?.executionRequest?.avoagents[0] : 'Any Agent'}</div>
          }
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
        <div>
            Selected Browser: {cardData?.executionRequest?.browserType ? getBrowser(cardData.executionRequest.browserType).join(", ") : "NA"}
        </div>
        </div>
        <div className="col-12 lg:col-6 xl:col-6 md:col-12 sm:col-12">
        <div>Integration Type: {integrationType}</div>

        </div>
      </div>
    </Card>
  );
};

export default ExecutionCard;

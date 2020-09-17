import React, { useState} from 'react';
import { Link } from 'react-router-dom';
const PluginBox = ({plugin}) => {

    const [dataName, setDataName] = useState("");


    const onPluginPress = () => {
        console.log("pressed");
	// 	var name = $(this).attr('data-name');
	// 	var pluginDetails = [];
	// 	var selectedPlugin ='';
	// 	var selectedPluginTxt = '';
	// 	var encodedVal =  Encrypt.encode(name);
	// 	var pluginVal = $(this).next('input[type=hidden]').attr('title').split("_")[1];
	// 	var pluginPath = "p_"+ $(this).next('input[type=hidden]').attr('title').split("_")[0];
	// 	$(".plugins").each(function() {
	// 		var id = $(this).attr('title').split("_")[1];
	// 		if (id == encodedVal) {
	// 			$scope.pluginFunction(pluginPath,event);
	// 			return;
	// 		}
	//   });
    };
    

    // $scope.pluginFunction = function(name,event){
	// 	if(name == "p_Mindmap") name = 'mindmap';
	// 	else if(name == "p_NeuronGraphs") name = 'neuronGraphs';
	// 	else if(name == "p_PerformanceTesting") name = 'performancetesting';
	// 	else if(name == "p_Dashboard") name = 'dashboard';
	// 	window.localStorage['navigateScreen'] = name;
	// 	$timeout(function () {
	// 		if (['p_Reports', 'performancetesting', 'dashboard'].indexOf(name) > -1) {
	// 			window.location.href = "/"+ name;
	// 		} else{
	// 			$location.path('/'+ name);
	// 		}
	//    	}, 100);
	// };

    return (
        <div >
            <Link to={`/${plugin.pluginName}`} className="plugin-block">
                <img className="plugin-ic" alt="plugin-ic" src={`static/imgs/${plugin.pluginName}.png`} />
                <span className="plugin-text">{plugin.pluginName}</span>
            </Link>
        </div>
    );
}

export default PluginBox;
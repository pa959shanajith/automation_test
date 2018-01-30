// /*
// function replicationHandler()
// Purpose : displaying pop up for replication of project
// */

// function replicationHandler() {
//   console.log('Inside..')
//   var userInfo = JSON.parse(window.localStorage['_UI']);
//   var user_id = userInfo.user_id;
//   blockUI('Loading....')
//   dataSender({ user_name: userInfo.username, userRole: window.localStorage['_SR'], userid: user_id, task: 'getProjectIDs_Nineteen68', versioning: 1 }, function (status, result) {
//     if (status) {
//       console.log('err');
//       unblockUI();
//     }
//     else {
//       result1 = JSON.parse(result);
//       var project_type=$('.project-list').find(':selected').attr('app-type')
//       dataSender({ user_name: userInfo.username, userRole: window.localStorage['_SR'],userid: user_id,task: 'listOfProjectsNeo4j', versioning: 1 }, function (status, data) {
//         if (status) { console.log('err'); unblockUI(); }
//         else {
//           parse_data = JSON.parse(data);
//           var flag=0;
//           $('.versioningOption').remove()
//           var parsed_project_id = [];
//           for (var i = 0; i < parse_data[0].data.length; i++) {
//             parsed_project_id.push(parse_data[0].data[i].row[0])
//           }

//           var new_projectsList = {
//             projectId: [],
//             projectName: [],
//             appType: []
// 	        };
//           for(var i=0;i<result1['projectName'].length;i++)
//           {
//             if(project_type==result1['appType'][i]){
//               new_projectsList.projectId.push(result1['projectId'][i]);
//               new_projectsList.projectName.push(result1['projectName'][i]);
//               new_projectsList.appType.push(result1['appType'][i]);
//             }

//           }
//           if(parsed_project_id.indexOf($('.project-list').val())!=-1){
//               for (var i = 0; i < new_projectsList['projectName'].length; i++) {
//                 if (parsed_project_id.indexOf(new_projectsList['projectId'][i]) != -1) {
//                   console.log('Available in Neo4j')
//                 } else {
//                   flag=1;
//                   $('#destProjects').append($('<option>').attr({ value: new_projectsList['projectId'][i], class: 'versioningOption' }).text(new_projectsList['projectName'][i]));
//                 }
//               }
//               $('#ProjectReplicationPopUp').modal("show");
//                $('#replicateVersionButton').removeClass('disableButton').removeAttr('disabled','disabled');
//               if(!flag)
//                 $('#replicateVersionButton').addClass('disableButton').attr('disabled','disabled');
//           }
//           else{
//             openDialogMindmap('Mindmap', "Empty Projects cannot be replicated.")
//           }
//           unblockUI();
//         }
//       });
//     }
//   });

// }

// /*
//   function replicationController()
//   Purpose : Invoking replication project
// */

// function replicationController() {

//   replicate_project($('.version-list').val(), '0.0', $('#destProjects').val())
// }

// /*
// function replicate_project()
// Purpose:Invoking the node service for replication of project
// */

// function replicate_project(from_v, to_v, pid) {
//   var userInfo = JSON.parse(window.localStorage['_UI']);
//   var user_id = userInfo.user_id;
//   console.log("inside replicate project");
//   blockUI('Loading....')
//   dataSender({ user_name: userInfo.username, userRole: window.localStorage['_SR'], task: 'createVersion', srcprojectId: $(".project-list").val(), dstprojectId: pid, versioning: 1, vn_from: from_v, vn_to: to_v, action: "project_replicate", write: 10 }, function (err, result) {
//     if (err) {
//       console.log(err);
//       openDialogMindmap('Mindmap', "Project Replication Failed.")
//       unblockUI();
//     }
//     else {
//       openDialogMindmap('Mindmap', "Project Replicated Successfully.")
//       unblockUI();
//     }
//   });

// }


// /*
// function : loadMindmapData()
// Purpose : loading mindmap data for default version.
// */

// function loadMindmapData_V() {
//   loadMindmapData(1);
// }

// /*
// function : addVersioning(vn)
// Purpose : Adding versioning UI in the mindmap UI.
// params : versions : list of all versions of the selected project
// */

// function addVersioning(versions) {
//   versions = JSON.parse(versions);
//   console.log("versioning enabled");
//   $('.replicate').remove()
//   $('.selectVersion').remove();
//   $('.ct-project-tab').append($('<span>').attr({
//     class: 'selectVersion'
//   }).append($('<label>').attr({
//     class: 'selectVersionLabel'
//   }).text('Version: ')
//     ).append($('<select>').attr({
//       class: 'version-list',
//       onchange: 'loadModules()'
//     })).append($('<i>').attr({
//       class: 'fa fa-plus-circle fa-lg plus-icon',
//       title: "Create New Version",
//       onclick: "versionInputDialogShow(event)"
//     })).append($('<i>').attr({
//       class: 'fa fa-window-restore fa-lg plus-icon',
//       title: "Replicate project",
//       onclick: 'replicationHandler()'
//     })
//     ).append($('<i>').attr({
//       class: 'glyphicon glyphicon-export plus-icon',
//       title: "Export Version",
//       onclick: 'exportData(1)'
//     })));
//   for (i = 0; i < versions.length; i++) {
//     $('.version-list').append($('<option>').attr({
//       value: versions[i]
//     }).text(versions[i]))
//   }
//   //setCookie('mm_pvid', $('.version-list').children()[0].value, 15);
//   $('.version-list').val($('.version-list').children()[0].value);

//   // if (getCookie('mm_pvid') != '') {
//   //   $('.version-list').val(getCookie('mm_pvid'));
//   // }
//   loadMindmapData1(1);
//   //loadModules(versions)
//   $('.version-list').attr({title:$('.version-list').val()});
//   $('.selectProject').addClass('selectProjectPosition')
//   if (window.localStorage['tabMindMap'] == "tabAssign") {
//     $('.plus-icon').remove();
//     $('.selectVersion').css('margin-left', '2%');
//   }
// }

// /*
// function : loadModules()
// Purpose : Loads modules for the active project Version.
// params : None
// */

// function loadModules() {
//   var active_version = $('.version-list').val();
//   $('.version-list').attr({title:active_version});
//   blockUI('Loading...');
//   var svgTileG = d3.select('.ct-tile').append('svg').attr('class', 'ct-svgTile').attr('height', '150px').attr('width', '150px').append('g');
//   var svgTileLen = $(".ct-svgTile").length;
//   if (svgTileLen == 0) {
//     $('#ct-mapSvg, #ct-canvas').empty();
//     $('#ct-canvas').append('<div class="ct-tileBox"><div class="ct-tile" title="Create Mindmap"><svg class="ct-svgTile" height="150px" width="150px"><g><circle cx="75" cy="75" r="30"></circle><path d="M75,55L75,95"></path><path d="M55,75L95,75"></path></g></svg></div><span class="ct-text">Create Mindmap</span></div>');

//   }
//   dataSender({ task: 'getModules', tab: window.localStorage['tabMindMap'], prjId: $(".project-list").val(), versioning: 1, version: parseFloat(active_version) }, function (err, result) {
//     if (err) {
//       console.log(result);
//       unblockUI();
//     }
//     else {
//       var nodeBox = d3.select('.ct-nodeBox');
//       $(nodeBox[0]).empty();
//       allMMaps = JSON.parse(result);
//       allMMaps.forEach(function (e, i) {
//         var t = $.trim(e.name);
//         var img_src = 'images_mindmap/node-modules-no.png';
//         if (e.type == 'modules_endtoend') img_src = 'images_mindmap/MM5.png';
//         var node = nodeBox.append('div').attr('class', 'ct-node fl-left').attr('data-mapid', i).attr('title', t).on('click', loadMap);
//         node.append('img').attr('class', 'ct-nodeIcon').attr('src', img_src).attr('alt', 'Module').attr('aria-hidden', true);
//         node.append('span').attr('class', 'ct-nodeLabel').html(t);
//       });
//       populateDynamicInputList();
//       setModuleBoxHeight();
//       unblockUI();
//     }
//   });
//   // setCookie('mm_pvid', active_version, 15);

// }


// /*
// function : createNewTab(from_v,to_v)
// Purpose : Creates a New project version in the Neo4j db and creates a new tab for that.
// params : from_v : from the version (Source version), to_v : Version number provided by the user.
// */
// function createNewTab(from_v, to_v) {

//   var userInfo = JSON.parse(window.localStorage['_UI']);
//   var user_id = userInfo.user_id;
//   if ($('.ct-nodeBox')[0].children !== undefined && $('.ct-nodeBox')[0].children.length == 0) {
//     openDialogMindmap('Error', "Cannot Create Empty Version");
//     return;
//   }
//   blockUI('Loading...');
//   dataSender({ task: 'createVersion', user_name: userInfo.username, userRole: window.localStorage['_SR'], projectId: $(".project-list").val(), versioning: 1, vn_from: from_v, vn_to: to_v, write: 10 }, function (err, result) {
//     if (err) { console.log(err); unblockUI(); openDialogMindmap('Mindmap', "New Version Creation Failed.") }
//     else {
//       result1 = JSON.parse(result);
//        $('.version-list').val(to_v);
//        unblockUI();
//     }
//     // $('.version-list').append($('<option>').attr({
//     //   value: to_v
//     // }).text(to_v))
//     loadModules();
//     openDialogMindmap('Mindmap', "New Version Created Successfully.");
//   });

// }

// /*

//   function : versionInputDialogClose()
//   Purpose : Closes the dialog box for version Number input.

// */

// function versionInputDialogClose() {

//   $('#versionNumInputPopUp').modal('toggle');
// }

// /*

//   function : clearInputData()
//   Purpose : Clears the data in  dialog box for version Number input.

// */

// function clearInputData() {
//   $('#versionNumberInput').val('');
// }

// /*

//   function : versionInputDialogShow(e)
//   Purpose : Shows the dialog to add version number.
//   param: e : event to get the source version number tab
// */
// function versionInputDialogShow() {
//   var from_v = $('.version-list').val();
//   console.log(from_v)
//   $('#createNewVersionButton').attr('onclick', 'createNewVersion(' + from_v + ')');

//   dataSender({task:'getVersions',projectId:$(".project-list").val(),versioning:1},function(err,result){
// 				if(err){ console.log(err);openDialogMindmap('Error','Error in creating versions')}
// 				else{
//               result=JSON.parse(result);
//               maxVersionNumber=result[result.length-1];
// 							 $('#versionNumInputPopUp').modal("show");
//               $('#versionNumberInput').val((parseFloat(maxVersionNumber) + 0.1).toFixed(1));
// 				}
// 			});

// }

// /*
// function : createNewVersion(from_v)
// Purpose : This function calls isValidVersionToCreate to verify the version number
// provided by the user in the dialog box and calls createNewTab to create new version in the database
// param : from_v : source version
// */

// function createNewVersion(from_v) {
//   console.log(from_v);
//   inputVersion = parseFloat($('#versionNumberInput').val());
//     dataSender({task:'getVersions',projectId:$(".project-list").val(),versioning:1},function(err,result){
// 				if(err){ console.log(err);openDialogMindmap('Error','Error in creating versions')}
// 				else{
//               result=JSON.parse(result);
//               maxVersionNumber=result[result.length-1];
//               if(inputVersion>parseFloat(maxVersionNumber)){
//                 createNewTab(from_v, inputVersion);
//               }else{
//                 if (result.includes(inputVersion.toString()))
//                   openDialogMindmap('Error', "Version Number already exists");

//                   else {
//                     openDialogMindmap('Error', "Invalid Version Number");
//                   }
//               }
// 				}
// 			});
// }

// /*
// function : validateFloatKeyPress(el, evt)
// Purpose : This function restricts user to add only float number and to keep float as one decimal point.
// param : el, evt
// */

// function validateFloatKeyPress(el, evt) {
//   var charCode = (evt.which) ? evt.which : event.keyCode;
//   var number = el.value.split('.');
//   if (charCode != 46 && charCode > 31 && (charCode < 48 || charCode > 57)) {
//     return false;
//   }
//   //just one dot
//   if (number.length > 1 && charCode == 46) {
//     return false;
//   }
//   //get the carat position
//   var caratPos = getSelectionStart(el);
//   var dotPos = el.value.indexOf(".");
//   if (caratPos > dotPos && dotPos > -1 && (number[1].length > 0)) {
//     return false;
//   }
//   return true;
// }

// /*
// function : getSelectionStart(o)
// Purpose : Helper function for validateFloatKeyPress
// param : o
// */
// function getSelectionStart(o) {
//   if (o.createTextRange) {
//     var r = document.selection.createRange().duplicate()
//     r.moveEnd('character', o.value.length)
//     if (r.text == '') return o.value.length
//     return o.value.lastIndexOf(r.text)
//   } else return o.selectionStart
// }
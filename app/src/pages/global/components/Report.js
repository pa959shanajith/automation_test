// import React from 'react';
// import "../styles/Report.scss";

// const Report = () => {
//     let name = [{"testcasename": ": DIR_GST_String_Ops"}];
//     let testcases = [
//         {
//           "addTestCaseDetails": "",
//           "addTestCaseDetailsInfo": "{\"actualResult_fail\":\"\",\"actualResult_pass\":\"\",\"testcaseDetails\":\"\"}",
//           "appType": "Web",
//           "cord": "",
//           "custname": "@Browser",
//           "inputVal": [
//             ""
//           ],
//           "keywordVal": "openBrowser",
//           "objectName": "",
//           "outputVal": "",
//           "remarks": "New text (From: demo vivek On: 5/10/2020 15:56:23) ; Latest remark (From: demo vivek On: 5/10/2020 15:57:42)",
//           "stepNo": "1",
//           "url": ""
//         },
//         {
//           "addTestCaseDetails": "",
//           "addTestCaseDetailsInfo": "",
//           "appType": "Web",
//           "cord": "",
//           "custname": "@Browser",
//           "inputVal": [
//             "https://www.google.com/"
//           ],
//           "keywordVal": "navigateToURL",
//           "objectName": "",
//           "outputVal": "##",
//           "remarks": "",
//           "stepNo": "2",
//           "url": ""
//         },
//         {
//           "addTestCaseDetails": "",
//           "addTestCaseDetailsInfo": "",
//           "appType": "Web",
//           "cord": "b''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''",
//           "custname": "feeling_lucky",
//           "inputVal": [
//             ""
//           ],
//           "keywordVal": "verifyExistsIris",
//           "objectName": "iris;const_img_object_677_460_829_507;677;460;829;507;constant",
//           "outputVal": "",
//           "remarks": "",
//           "stepNo": "3",
//           "url": ""
//         },
//         {
//           "addTestCaseDetails": "",
//           "addTestCaseDetailsInfo": "{\"actualResult_fail\":\"fsfdsfdsf\",\"actualResult_pass\":\"dfsfsd\",\"testcaseDetails\":\"dsfdfdf\"}",
//           "appType": "Web",
//           "cord": "b''iVBORw0KGgoAAAANSUhEUgAAAmwAAABKCAIAAACJnZ9wAAAJ+ElEQVR4Ae3BW2xbdx0H8O//OOfmYyexncRJLxs96zKBgMGmTUVd1aEAnUS5btK2F/bEAxpPXIRUpAl46Asab3vYI0iAJm1DGkXbNAIda6FQraIaQtpKTxld5ziJY8f2sc8l9o9NUyci5C0nttvU+n4+SkRAREREySkRARERESWnRARERESUnBIREBERUXJKREBERETJKREBERERJadEBERERJScEhEQERFRckpEQERERMkpEQERERElp0QERERElJwSERAREVFySkRAREREySkRARERESWnRARERESUnBIRDE4QhEEYRXHc6XQ77+qKCIiIiPqjlEqltNS7NEPXLdOwLBPXmxIR9M1vtVutoNUODEPPpG1N01IpLfUu7R0gIiLqT7fb7XS6nXd1O92u32rHUWynrbRtOWkb14kSEfSh1Q6qtbptmoapp21L0zQQERENX7fbbbWCKIrbYZibHE/bFq45JSLYliCMqrW6plRuctwwdBAREV0PURRXa/WuSH5y3DQNXENKRJBcveFHYZTJpC3LBBER0fUWBGGj2bIsI5txcK0oEUFClbUagEJ+EkRERDvJaqWmFAr5SVwTSkSQRHm5YtvWeNYBERHRzlNv+EEQzkznMXxKRLBl5eVKOm1lMw6IiIh2qkbDbwVBcbqAIVMigq2prNV0XR/POiAiItrZ6o1mHHcK+QkMkxIRbEG94cdxXMhPgoiI6EawWqmZpp7NOBgaJSL4MEEYNZv+VCEHIiKiG8fKanU865imgeFQIoIPUyqv5iaylmWCiIjoxtEOwvX1xmxxCsOhRAQfqNUOGg2/OFMAERHRjWZpuTKRdWzbwhAoEcEHulJani7kDEMHERHRMDUD/OKV6NQbGwDu+6T+jUM6+hZF8UqluntuBkOgRAS9+X47iKJCbgI7gOu6nueBiIhG1BMvRc+ejXHVNw7pjxwy0LfKWs2yTCdtY9CUiKC3ldWqbZsZJ43kSkvLlWrVMIxsxpkrzqBvrut6ngciIhpRX37c90O8rzihfvVoGn1rNltBGE4Vchg0JSLo7c3Lpb27i5qmIYnKWvXl02cqazVcNTc7c/jggWzGQR9c1/U8D0RENKIWjvvYbPGYg751Ot0rpfJNe+YwaEpE0EMQhNX1xlxxCklU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''",
//           "custname": "search_box",
//           "inputVal": [
//             "selenium"
//           ],
//           "keywordVal": "setTextIris",
//           "objectName": "iris;img_object_381_375_1001_449;381;375;1001;449;relative",
//           "outputVal": "",
//           "remarks": "",
//           "stepNo": "4",
//           "url": ""
//         },
//         {
//           "addTestCaseDetails": "",
//           "addTestCaseDetailsInfo": "",
//           "appType": "Web",
//           "cord": "b''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''",
//           "custname": "search_btn",
//           "inputVal": [
//             ""
//           ],
//           "keywordVal": "clickIris",
//           "objectName": "iris;img_object_533_457_675_509;533;457;675;509;relative",
//           "outputVal": "",
//           "remarks": "",
//           "stepNo": "5",
//           "url": ""
//         },
//         {
//           "addTestCaseDetails": "",
//           "addTestCaseDetailsInfo": "{\"actualResult_fail\":\"\",\"actualResult_pass\":\"\",\"testcaseDetails\":\"\"}",
//           "appType": "Web",
//           "cord": "",
//           "custname": "@Browser",
//           "inputVal": [
//             " "
//           ],
//           "keywordVal": "openBrowser",
//           "objectName": "",
//           "outputVal": "",
//           "remarks": "New text (From: demo vivek On: 5/10/2020 15:56:23) ; Latest remark (From: demo vivek On: 5/10/2020 15:57:42)",
//           "stepNo": "6",
//           "url": ""
//         }
//       ]

//     return(
//         <div className="r__page">
//             {name.map(testcase=>{
//                 return(
//                     <div className="r__summary">
//                         <h3>Details</h3>
//                         <label>Testcase Name</label>
//                         <span>{testcase.testcasename}</span>
//                     </div>
//                 )
//             })}

//             <div className="r__table">
//                 <div className="r__tb_head">
//                     <span className="s_no__col_head s_no__col">S. No.</span>
//                     <span className="obj__col_head obj__col">Object Name</span>
//                     <span className="key__col_head key__col">Keyword</span>
//                     <span className="inp__col_head inp__col">Input</span>
//                     <span className="out__col_head out__col">Output</span>
//                 </div>
//                 <div>
//                 {
//                     testcases.map((testcase, idx)=>{
//                         return (
//                         <div className={"r__tb_row" + (idx%2? " r__even_row" : "")}>
//                             <span className="s_no__col">{testcase.stepNo}</span>
//                             <span className="obj__col">{testcase.custname}</span>
//                             <span className="key__col">{testcase.keywordVal}</span>
//                             <span className="inp__col">{testcase.inputVal[0]}</span>
//                             <span className="out__col">{testcase.outputVal}</span>
//                         </div>                
//                         )
//                     })
//                 }
//                 </div>

//             </div>
//         </div>
//     );
// }

// export default Report;



const Report = `<style>
        body{font-family: 'LatoWeb', sans-serif; height: 98%; margin: 0;}
        .mainContainer{
                float: left;
                padding: 5px;
                width: calc(100% - 12px);
        }
        .leftSummary{width: 50%; float: left; padding: 25px 0 25px 25px; font-size: 14px;}
        .leftSummary label{
                text-align: left;
                float: left;
                width: 29%;
                padding-right: 5px;
                padding-bottom: 5px;
        }
        .leftSummary span{
                float: left;
                width: 64%;
                padding-bottom: 5px;
                font-weight: bold;
        }
        .midContainer{
                border-collapse: collapse;
                border: 1px solid #cfcfcf;
                width: 100%;
                float: left;
                margin: 1% 0;
                font-size: 14px;
        }
        .midContainer td{padding-top: 5px; border: 1px solid #cfcfcf;float: left;}
        .midContainer td label{
                text-align: right;
                float: left;
                width: 35%;
                font-family: 'LatoWeb',sans-serif;
                padding-right: 5px;
                padding-bottom: 5px;
        }
        .reportsDetails{border: 1px solid #cfcfcf;     background-color: #dfd0fa; font-size: 15px;}
        .reportsDetails th:nth-child(1),.rDid{width: 4%;  word-break: break-word; }
        .reportsDetails th:nth-child(2),.rDstep{width: 5%;  word-break: break-word;}
        .reportsDetails th:nth-child(3),.rDstepDes{width: 12%; word-break: break-word; text-align:left}
        .reportsDetails th:nth-child(4),.rDstatus{width: 5%; word-break: break-word; text-align:left}
        .reportsDetails th:nth-child(5),.rDellaps{width: 5.5%; word-break: break-word; text-align:left}
        .reportsDetails th:nth-child(6),.rDcomments{width: 9%; word-break: break-word; text-align:left}
        .reportsDetails th:nth-child(7),.rDremarks{width: 9%; word-break: break-word; text-align:left}
        .reportsDetails th:nth-child(8),.rDActualRes{width: 9%; word-break: break-word; text-align:left}
        .reportsDetails th:nth-child(9),.rDExpectedRes{width: 7%; word-break: break-word; text-align:left}
        .maintabCont{float: left; width: 100%; border: 1px solid #dcdcdc;}
        .tabCont{display: table-cell; border-bottom: 1px solid #ececec; border-right: 1px solid #ececec;word-wrap:break-word}
        .reportsDetail{line-height: 2; text-align: center; height: calc(100% - 35px); overflow: auto;font-size: 14px;}
        .reportsDetail tr { page-break-inside: avoid; }
        .rDstepDes{text-align: left; word-break: break-word;}
        .reportsDetail tr.reportdetailsrow:nth-child(even){background: #d9d9d9;}
        .reportdetailsrow td{padding-top: 9px;}
        @media screen and (max-height: 675px) {
                .reportsDetail{
                        height: 174px;
                }
        }
        .reportsDetails th
        {
                text-align: center !important;
                padding: 8px;
                width: 10%;
        }
        .reportsDetails td
        {
                text-align: left !important;
                padding: 2px;
                width: 10%;
        }	
        .pdfReport{
                float:left;
                width: 100%;
                table-layout: table;
        }
        .latobold{
                font-weight: bold;
        }
</style>


<div class="mainContainer" >
        {{#each name}}

        <div class="leftSummary">
                <h3>Details</h3>
                <label>Testcase Name</label><span>: {{testcasename}}</span><br/>
        </div>
        {{/each}}
        <div class="maintabCont">
                <table class='pdfReport' style="width: 100%;" >
                        <thead class="reportsDetails">
                                <tr><th>Sl. No.</th>
                                        <th>Object Name</th>
                                        <th>Keyword</th>
                                        <th>Input</th>
                                        <th>Output</th></tr>
                        </thead>
                        <tbody class="reportsDetail" >
                                {{#each rows}}
                                    <tr style="width: 100%;" class="reportdetailsrow">
                                        <td>{{stepNo}}</td>
                                        <td>{{custname}}</td>
                                        <td>{{keywordVal}}</td>
                                        <td>{{inputVal}}</td>
                                        <td>{{outputVal}}</td>
                                    </tr>                

                                {{/each}}
                        </tbody>
                </table>

        </div>
</div>`

export default Report;
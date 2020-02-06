mySPA.factory('reportService', ['$http', '$q', function($http, $q) {
    return {
        renderReport_ICE: function(finalReports, reportType, scrPath) {
            if (reportType == "html") {
                return $http.post('/renderReport_ICE', {
                        param: 'renderReport_ICE',
                        finalreports: finalReports,
                        reporttype: reportType
                    })
                    .then(function(response) {
                            return response.data
                        },
                        function(response) {
                            return $q.reject(response.data)
                        })
            } else {
                return $http.post('/renderReport_ICE', {
                        param: 'renderReport_ICE',
                        finalreports: finalReports,
                        reporttype: reportType,
                        absPath: scrPath
                    }, {
                        responseType: 'arraybuffer'
                    })
                    .then(function(response) {
                            return response.data
                        },
                        function(response) {
                            return $q.reject(response.data)
                        }, {
                            responseType: 'arraybuffer'
                        })
            }
        },
        getMainReport_ICE: function() {
            return $http.post('/getMainReport_ICE', {
                    param: 'getMainReport_ICE'
                })
                .then(function(response) {
                        return response.data
                    },
                    function(response) {
                        return $q.reject(response.data)
                    })
        },
        //Get all Testsuites 
        getAllSuites_ICE: function(userID, getData) {
            return $http.post('/getAllSuites_ICE', {
                    param: 'getAllSuites_ICE',
                    userId: userID,
                    projectId: userID,
                    readme: getData
                })
                .then(function(response) {
                        return response.data
                    },
                    function(response) {
                        return $q.reject(response.data)
                    })
        },
        //Get Testsuites start end details
        getSuiteDetailsInExecution_ICE: function(testsuiteId) {
            return $http.post('/getSuiteDetailsInExecution_ICE', {
                    param: 'getSuiteDetailsInExecution_ICE',
                    testsuiteid: testsuiteId
                })
                .then(function(response) {
                        return response.data
                    },
                    function(response) {
                        return $q.reject(response.data)
                    })
        },
        //Get Testsuites start end details
        reportStatusScenarios_ICE: function(executionid, testsuiteid) {
            return $http.post('/reportStatusScenarios_ICE', {
                    param: 'reportStatusScenarios_ICE',
                    executionId: executionid,
                    testsuiteId: testsuiteid
                })
                .then(function(response) {
                        return response.data
                    },
                    function(response) {
                        return $q.reject(response.data)
                    })
        },
        //Get Final Reports
        getReport_Nineteen68: function(reportID, testsuiteId, testsuitename) {
            return $http.post('/getReport_Nineteen68', {
                    param: 'getReport_Nineteen68',
                    reportId: reportID,
                    testsuitename: testsuitename,
                    testsuiteId: testsuiteId
                })
                .then(function(response) {
                        return response.data
                    },
                    function(response) {
                        return $q.reject(response.data)
                    })
        },
        //Export To JSON Reports
        exportToJson_ICE: function(repId) {
            return $http.post('/exportToJson_ICE', {
                    param: 'exportToJson_ICE',
                    reportId: repId
                })
                .then(function(response) {
                        return response.data
                    },
                    function(response) {
                        return $q.reject(response.data)
                    })
        },
        //Get screenshots dataURLs
        getScreenshotDataURL_ICE: function(paths) {
            return $http.post('/openScreenShot', {
                    param: 'getScreenshotDataURL_ICE',
                    absPath: paths
                })
                .then(function(response) {
                        return response.data
                    },
                    function(response) {
                        return $q.reject(response.data)
                    })
        },
        getReportsData_ICE: function(reportsInputData) {
            return $http.post('/getReportsData_ICE', {
                    param: 'getReportsData_ICE',
                    reportsInputData: reportsInputData
                })
                .then(function(response) {
                        return response.data
                    },
                    function(response) {
                        return $q.reject(response.data)
                    })
        }
    }
}]);
@echo off
@echo ...
call  %1 --db avoassure --username avoassure --password %2 --collection Export_mindmap -o %3//%4//Modules.json  --jsonArray
call  %1 --db avoassure --username avoassure --password %2 --collection Export_screens -o %3//%4//screens.json  --jsonArray
call  %1 --db avoassure --username avoassure --password %2 --collection Export_testcases -o %3//%4//Testcases.json  --jsonArray
call  %1 --db avoassure --username avoassure --password %2 --collection Export_dataobjects -o %3//%4//Dataobjects.json  --jsonArray
call  %1 --db avoassure --username avoassure --password %2 --collection Export_testscenarios -o %3//%4//Testscenarios.json  --jsonArray
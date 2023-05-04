@echo off

@echo ...
call  %1 --db avoassure --username avoassure --password %2 --collection Dataobjects_Import --file %3\\%4 --jsonArray
@echo done
@echo ...
call  %1 --db avoassure --username avoassure --password %2 --collection Module_Import --file %3\\%5 --jsonArray
@echo done
@echo ...
call  %1 --db avoassure --username avoassure --password %2 --collection Scenario_Import --file %3\\%6 --jsonArray
@echo done
@echo ...
call  %1 --db avoassure --username avoassure --password %2 --collection Screen_Import --file %3\\%7 --jsonArray
@echo done
@echo ...
call  %1 --db avoassure --username avoassure --password %2 --collection Testcase_Import --file %3\\%8 --jsonArray
@echo done




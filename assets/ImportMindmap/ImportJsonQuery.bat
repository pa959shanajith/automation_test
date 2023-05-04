@echo off

@echo ...
call  %1 --db avoassure --username avoassure --password %2 --collection %3 --file %4\\%5.json --jsonArray
@echo done




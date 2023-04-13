@echo off

@echo  extracting data
call  %1 %2:27017/avoassure --eval "var pwd='%3'; var idlistId = '%4'" "%5" 

@echo done




@ECHO OFF

SET SERVICE=%1
SET COMMAND=%2

2>NUL CALL :%COMMAND%_%SERVICE% # jump to :QUERY_0, :START_0, :RESTART_0, :RESTART_1, etc.
IF ERRORLEVEL 1 CALL :DEFAULT_CASE # if service doesn't exist
EXIT /B

:QUERY_0
  sc query AvoAssureLS
  GOTO END_CASE
:RESTART_0
  sc stop AvoAssureLS
:START_0
  for /f "tokens=*" %%i in ('sc query AvoAssureLS ^| FIND "STOPPED"') do SET SVC_STATUS=%%i
  @if "%SVC_STATUS%"=="STATE              : 1  STOPPED " (
    sc start AvoAssureLS
    GOTO END_CASE
  ) else (
    @ping localhost -n 3 > nul
	GOTO :START_0
  )
:QUERY_1
  sc query AvoAssureDAS
  GOTO END_CASE
:RESTART_1
  sc stop AvoAssureDAS
:START_1
  for /f "tokens=*" %%i in ('sc query AvoAssureDAS ^| FIND "STOPPED"') do SET SVC_STATUS=%%i
  @if "%SVC_STATUS%"=="STATE              : 1  STOPPED " (
    sc start AvoAssureDAS
    GOTO END_CASE
  ) else (
    @ping localhost -n 3 > nul
	GOTO :START_1
  )
:QUERY_2
  sc query avoassurewebserver.exe
  GOTO END_CASE
:RESTART_2
  sc stop avoassurewebserver.exe
:START_2
  for /f "tokens=*" %%i in ('sc query avoassurewebserver.exe ^| FIND "STOPPED"') do SET SVC_STATUS=%%i
  @if "%SVC_STATUS%"=="STATE              : 1  STOPPED " (
    sc start avoassurewebserver.exe
    GOTO END_CASE
  ) else (
    @ping localhost -n 3 > nul
	GOTO :START_2
  )
:DEFAULT_CASE
  ECHO Unknown service id "%SERVICE%"
  GOTO END_CASE
:END_CASE
  VER > NUL # reset ERRORLEVEL
  GOTO :EOF # return from CALL

@ECHO OFF

SET SERVICE=%1
SET COMMAND=%2

2>NUL CALL :%COMMAND%_%SERVICE% # jump to :QUERY_0, :START_0, :RESTART_0, :RESTART_1, etc.
IF ERRORLEVEL 1 CALL :DEFAULT_CASE # if service doesn't exist
EXIT /B

:QUERY_0
  sc query nineteen68LS
  GOTO END_CASE
:RESTART_0
  sc stop nineteen68LS
:START_0
  for /f "tokens=*" %%i in ('sc query nineteen68LS ^| FIND "STOPPED"') do SET SVC_STATUS=%%i
  @if "%SVC_STATUS%"=="STATE              : 1  STOPPED " (
    sc start nineteen68LS
    GOTO END_CASE
  ) else (
    @ping localhost -n 3 > nul
	GOTO :START_0
  )
:QUERY_1
  sc query nineteen68NDAC
  GOTO END_CASE
:RESTART_1
  sc stop nineteen68NDAC
:START_1
  for /f "tokens=*" %%i in ('sc query nineteen68NDAC ^| FIND "STOPPED"') do SET SVC_STATUS=%%i
  @if "%SVC_STATUS%"=="STATE              : 1  STOPPED " (
    sc start nineteen68NDAC
    GOTO END_CASE
  ) else (
    @ping localhost -n 3 > nul
	GOTO :START_1
  )
:QUERY_2
  sc query nineteen68webserver.exe
  GOTO END_CASE
:RESTART_2
  sc stop nineteen68webserver.exe
:START_2
  for /f "tokens=*" %%i in ('sc query nineteen68webserver.exe ^| FIND "STOPPED"') do SET SVC_STATUS=%%i
  @if "%SVC_STATUS%"=="STATE              : 1  STOPPED " (
    sc start nineteen68webserver.exe
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

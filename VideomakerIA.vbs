Set WshShell = CreateObject("WScript.Shell")
strPath = WshShell.CurrentDirectory
' Executa o iniciar.bat de forma 100% invisivel (sem janela preta de terminal)
WshShell.Run """" & strPath & "\iniciar.bat""", 0, False

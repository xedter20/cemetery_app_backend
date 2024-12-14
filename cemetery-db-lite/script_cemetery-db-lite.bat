@echo off	
set config_file="C:\Users\machr\CEMETERY\cemetery-be\cemetery-db-lite\application.yaml"
"C:\Program Files\Eclipse Adoptium\jre-17.0.12.7-hotspot\bin\java" -jar "C:\Users\machr\CEMETERY\cemetery-be\cemetery-db-lite\cemetery-db-lite.jar" --spring.config.location=file:%config_file%  --server.port=8080
#!/bin/bash
java -jar "/home/opc/cemetery-be-main/cemetery-db-lite/cemetery-db-lite.jar" --spring.config.location=file:/home/opc/cemetery-be-main/cemetery-db-lite/cemetery-db-lite.yaml --server.port=8080 & 2>&1 >/dev/null

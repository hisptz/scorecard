#!/bin/bash
ng build --prod
cp src/manifest.webapp dist/
rm -rf /home/mpande/dhis/config/apps/scorecard/*
cp -rf dist/* /home/mpande/dhis/config/apps/scorecard/

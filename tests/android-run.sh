#!/usr/bin/env bash
# Rulează testele în Chrome din emulatorul Android (apelat din android-emulator-runner). Folosire: tests/android-run.sh <api>
set -uo pipefail
cd "$(dirname "$0")"
API="${1:-34}"
mkdir -p results
node serve.js 8765 & SRV=$!
trap 'kill $SRV 2>/dev/null || true' EXIT
sleep 2
adb wait-for-device
adb root >/dev/null 2>&1 || true
sleep 2; adb wait-for-device
adb reverse tcp:8765 tcp:8765
adb shell "echo 'chrome --disable-fre --no-first-run --no-default-browser-check --autoplay-policy=no-user-gesture-required' > /data/local/tmp/chrome-command-line" || true
adb shell chmod 755 /data/local/tmp/chrome-command-line || true
adb shell am set-debug-app --persistent com.android.chrome || true
adb shell am force-stop com.android.chrome || true
LABEL="android-api${API}"
adb shell am start -a android.intent.action.VIEW -d "http://localhost:8765/__runner.html?name=${LABEL}\&skipocr=1" com.android.chrome
node wait-report.js "$LABEL" 1500
RC=$?
adb exec-out screencap -p > "results/${LABEL}.png" || true
adb shell dumpsys package com.android.chrome | grep -m1 versionName || true
exit $RC

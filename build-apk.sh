#!/bin/bash
# 企业记账报税 - APK 构建脚本
set -e
export JAVA_HOME=/usr/lib/jvm/java-21-openjdk
export ANDROID_HOME=/opt/android-sdk
export PATH=$JAVA_HOME/bin:$ANDROID_HOME/cmdline-tools/latest/bin:$ANDROID_HOME/platform-tools:$PATH

cd "$(dirname "$0")"
npm run build
npm run cap:sync
cd android
./gradlew assembleDebug --no-daemon

echo ""
echo "APK 已生成: android/app/build/outputs/apk/debug/app-debug.apk"

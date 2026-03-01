# 安卓 APK 构建配置指南

## 一、环境要求

| 组件 | 版本 | 说明 |
|------|------|------|
| Node.js | 18+ | 已安装 |
| Java JDK | 8 或 11 | 已安装 |
| Android Studio | 最新版 | 需安装 |
| Android SDK | - | 随 Android Studio 安装 |

## 二、安装 Android Studio

1. 下载：https://developer.android.com/studio
2. 安装后打开，按向导完成 **SDK** 安装
3. 勾选：Android SDK、Android SDK Platform、Android Virtual Device

## 三、配置环境变量

在 `~/.bashrc` 或 `~/.profile` 中添加：

```bash
# Android SDK（本机已安装于 /opt/android-sdk）
export ANDROID_HOME=/opt/android-sdk
export PATH=$PATH:$ANDROID_HOME/cmdline-tools/latest/bin:$ANDROID_HOME/platform-tools

# 构建需 Java 21
export JAVA_HOME=/usr/lib/jvm/java-21-openjdk
export PATH=$JAVA_HOME/bin:$PATH
```

保存后执行：`source ~/.bashrc`

验证：
```bash
echo $ANDROID_HOME
# 应输出 SDK 路径，如 /home/xxx/Android/Sdk
```

## 四、项目配置

### 1. API 地址（config.js）

```javascript
// 模拟器
BASE_URL: 'http://10.0.2.2:8083'

// 真机（公网）
BASE_URL: 'http://1.117.47.129:8083'

// 真机（局域网）
BASE_URL: 'http://192.168.x.x:8083'
```

### 2. 同步并构建

```bash
cd /opt/baoshui
npm run build
npm run cap:sync
npm run cap:open
```

在 Android Studio 中：**Build → Build Bundle(s) / APK(s) → Build APK(s)**

### 3. APK 输出路径

```
/opt/baoshui/android/app/build/outputs/apk/debug/app-debug.apk
```

## 五、Gradle 国内镜像（可选，加速下载）

编辑 `android/build.gradle`，在 `repositories` 块最前面添加：

```gradle
repositories {
    maven { url 'https://maven.aliyun.com/repository/google' }
    maven { url 'https://maven.aliyun.com/repository/central' }
    google()
    mavenCentral()
}
```

## 六、常见问题

- **ANDROID_HOME 未设置**：按第三节配置后重启终端
- **Gradle 下载慢**：按第五节配置国内镜像
- **构建失败**：确保 Android Studio 已安装 SDK 且 `ANDROID_HOME` 正确

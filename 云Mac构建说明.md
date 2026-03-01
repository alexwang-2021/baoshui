# 云 Mac 构建 iOS 安装包

使用云 Mac 服务在无 Mac 环境下构建可在 iPhone 上安装的 IPA。

## 方案一：GitHub Actions（推荐，免费额度）

### 1. 将项目推送到 GitHub

```bash
cd /opt/baoshui
git init
git add .
git commit -m "init"
git remote add origin https://github.com/你的用户名/baoshui.git
git push -u origin main
```

### 2. 自动构建

项目已包含 `.github/workflows/build-ios.yml`，推送后会自动触发构建。

- **模拟器版本**：无需签名，可直接构建，产物为 .app（仅模拟器用）
- **真机 IPA**：需配置 Apple 证书，见下方

### 3. 下载构建产物

GitHub 仓库 → Actions → 选择运行记录 → Artifacts 下载

### 4. 生成真机可安装的 IPA（需 Apple 开发者账号）

在 GitHub 仓库 Settings → Secrets 添加：

| Secret 名称 | 说明 |
|-------------|------|
| APPLE_DEVELOPER_ID | Apple ID 邮箱 |
| APPLE_APP_SPECIFIC_PASSWORD | 应用专用密码 |
| CERTIFICATE_BASE64 | 证书 .p12 的 base64 |
| PROVISIONING_PROFILE_BASE64 | 描述文件 base64 |

然后修改 workflow 增加 Archive 和导出 IPA 步骤（需 Fastlane 或 xcodebuild archive）。

---

## 方案二：Codemagic（免费层 500 分钟/月）

1. 注册 https://codemagic.io
2. 连接 GitHub 仓库
3. 选择 iOS 模板，配置签名
4. 构建后自动生成 IPA，可下载或上传 TestFlight

---

## 方案三：MacinCloud / MacStadium（按小时租用）

1. 租用云 Mac（约 $1/小时起）
2. 远程桌面连接
3. 安装 Xcode，按「构建iOS说明.md」本地构建

---

## 当前 workflow 说明

- 构建目标：**iOS 模拟器**（验证项目可编译）
- 产物：`App.app`（模拟器用，不能装真机）
- 真机 IPA：需在 workflow 中增加 Archive + 导出，并配置上述 Secrets

## 成本对比

| 方案 | 成本 | 真机 IPA |
|------|------|----------|
| GitHub Actions | 免费 200 分钟/月 | 需自配证书 |
| Codemagic | 免费 500 分钟/月 | 支持 |
| MacinCloud | ~$1/小时 | 支持 |

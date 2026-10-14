# V0.61 跨專案權限同步部署（尚未部署）

## 注意
- 目前只有程式碼，GitHub Pages 不會自動部署 Firebase Functions。
- 必須先確認主專案 Blaze 計費方案，部署 Cloud Functions 可能產生費用。
- 部署前，Client / Server Firestore 規則保持 Owner-only；不要先開放 Editor / Viewer。
- 三專案 UID 不可混用；次專案 Auth 帳號必須先透過 Google 登入建立。
- 此版本的網頁會在 Google 三專案登入成功後呼叫 `syncMySecondaryAccess`，若後端尚未部署，只記錄警告，不阻止 Owner。
- Owner 在主專案 `admins` 文件目前缺少 `email`，後端對這類舊資料會跳過事件同步；Owner 原有次專案授權不受影響。

## 部署前置
1. 在電腦安裝 Node.js 22、Firebase CLI（`npm install -g firebase-tools`），執行 `firebase login`。
2. 確認 Firebase CLI 對主專案 `taoyuancyd-asset-mgmt` 有部署權限。
3. 確認 Cloud Functions 2nd gen / Eventarc / Cloud Build / Artifact Registry 所需 API 已啟用。
4. 找出 **實際執行 Cloud Functions 的服務帳號**（通常為主專案的預設運算服務帳號，視專案設定而異）。
5. 在 **Client 與 Server 兩個專案**分別對該服務帳號授予：
   - Firebase Authentication Admin（用於查詢次專案 Auth 使用者）。
   - Cloud Datastore User（用於寫入次專案 Firestore admins）。
   請以最小必要權限為原則，部署後驗證 IAM。
6. 在 repo 根目錄執行：
   ```sh
   cd firebase-functions
   npm install
   cd ..
   firebase deploy --only functions:access-sync --project taoyuancyd-asset-mgmt
   ```
7. 在主專案 Functions 日誌確認 `syncAdminOnChange` 與 `syncMySecondaryAccess` 執行成功。

## 正式開放前
- 先以測試 Google 帳號申請並由 Owner 核准，確認兩個次專案的 `admins/{secondaryUid}` 正確建立。
- 確認角色變更、停用、刪除均能撤銷兩個次專案授權。
- 只有通過上述測試後，才部署 Client / Server 的 Editor / Viewer 讀寫規則，並解鎖前端 Editor / Viewer 財產存取。
- 主專案的 `validRepair` 仍參照備份 `assets`；需另外調整，不屬於本次部署。

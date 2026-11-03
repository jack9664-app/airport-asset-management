# 公告功能開發狀態

2026-11-03

## 已確認規格
- 頂端標題列下方放公告跑馬燈，登入且帳號有效才能讀取；無有效公告隱藏。
- 公告管理為獨立選單，Owner 與指定帳號可見，無須開放系統管理。
- Owner 在既有已授權帳號清單勾選「可管理公告」。Viewer 可單獨獲得此權限。
- 純文字公告，最多 1000 字；設定台灣時間開始、結束（可留空）、啟用或停用。
- 多則依開始時間新至舊播放；懸停或鍵盤焦點暫停；點擊查看完整內容；減少動態效果偏好採靜態文字。
- 登入載入公告一次，管理儲存或手動重新載入才重讀；每 15 秒本機更新有效時間，不輪詢 Firestore。

## 已提供測試頁
- preview-v13-announcements.html，基於 2026-10-27 正式 index.html；正式入口未改。
- 語法檢查及公告權限、刊登狀態、台灣時間轉換檢查通過；未執行 Firestore 寫入或完整瀏覽器驗收。

## 後端合併前必要核對
目前儲存庫沒有線上完整 Firestore Rules，需取得主專案目前發布的完整規則，再針對以下新增路徑及 admins 欄位合併，避免猜測或覆蓋現有權限。未發布後端規則前，測試頁的公告讀寫可能顯示 permission-denied。

- admins/{uid}.canManageAnnouncements: boolean；僅現有 Owner 可修改。被授權者不得自行授權、修改角色或啟用狀態。現有 admins 規則若有欄位白名單需要擴充。
- announcements/{id}: content、startsAt（ISO UTC 字串）、endsAt（ISO UTC 字串或 null）、enabled、createdBy、createdAt（server timestamp）、updatedBy、updatedAt（server timestamp）。有效且已核准帳號可讀；有效 Owner 或 canManageAnnouncements == true 帳號可新增修改，禁止刪除。驗證欄位、內容長度、起訖先後、createdBy/createdAt 不可變及 updatedBy 等於本人。
- announcementAudit/{id}: announcementId、action、before、after、actorUid、timestamp。公告寫入 transaction 同時新增稽核；禁止修改刪除。需確保 actorUid 本人及合法公告管理者才可新增，閱讀權限依核對後決策。
- announcementPermissionAudit/{id}: targetUid、before、after、actorUid、timestamp。權限調整 transaction 同時新增；僅 Owner 可新增讀取，禁止修改刪除。
- 注意 Firestore 重疊 allow 規則採 OR；須核對現有 wildcard 規則，不能靠新增較嚴格規則覆蓋既有寬鬆授權。

## 待完成
取得完整現行主專案 Rules 後合併、驗證後端拒絕未授權與已停用帳號，並完成 Owner 授權、Viewer 公告編輯及撤銷的實機驗收。確認後才更新正式 index.html。

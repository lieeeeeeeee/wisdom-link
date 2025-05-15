```mermaid
graph TD
    %% ユーザー状態 / 初期アクセスからの遷移
    UserNotLoggedIn["未ログインユーザー"] -- "初期アクセス" --> AudioListPage
    UserLoggedIn["ログイン済みユーザー"]
    LoginAction["ログイン操作 (Googleサインイン)"]
    LogoutAction["ログアウト操作"]

    AudioListPage -- "未ログイン時: [ログイン]ボタンなど >" --> LoginAction
    LoginAction -- "Googleでサインイン成功" --> AudioListPage

    UserLoggedIn -- "Navbar ロゴ >" --> AudioListPage
    UserLoggedIn -- "Navbar [オーディオ] >" --> AudioListPage
    UserLoggedIn -- "Navbar ユーザーメニュー [アップロード] >" --> UploadPage
    UserLoggedIn -- "Navbar ユーザーメニュー [ログアウト] >" --> LogoutAction
    LogoutAction -- "ログアウト完了" --> AudioListPage

    %% ページノード定義
    HomePage["ホームページ (/) (現在未使用)"]
    LoginPage["ログインページ (AuthContext経由、直接アクセスは想定しない)"]
    AudioListPage["オーディオ一覧 (/audios)<br>未ログイン時はログインを促すUIを表示"]
    UploadPage["アップロードページ (/audios/upload)"]
    AudioPlayerPage["オーディオプレーヤー (/player)"]
    ToastDemoPage["トーストデモ (/toast-demo)"]

    %% 各ページからの遷移
    AudioListPage -- "ページ内 [オーディオをアップロード] >" --> UploadPage
    AudioListPage -- "オーディオタイルクリック (再生目的)" --> AudioPlayerPage

    UploadPage -- "フォーム送信 (成功) >" --> AudioListPage
    UploadPage -- "[キャンセル]ボタン >" --> AudioListPage

    %% デモページなどへの直接アクセスや目立たないリンク
    AdminOrDevAccess1["(開発者アクセスなど)"] -.-> AudioPlayerPage
    AdminOrDevAccess2["(開発者アクセスなど)"] -.-> ToastDemoPage

    %% スタイル定義
    classDef page fill:#f0f8ff,stroke:#4682b4,stroke-width:2px,color:#000;
    classDef action fill:#fff0f5,stroke:#db7093,stroke-width:2px,color:#000;
    classDef userstate fill:#f5fffa,stroke:#3cb371,stroke-width:2px,color:#000;
    classDef access fill:#fafad2,stroke:#b8860b,stroke-width:1px,linestyle:dashed;

    class HomePage,AudioListPage,UploadPage,AudioPlayerPage,ToastDemoPage,LoginPage page;
    class LoginAction,LogoutAction action;
    class UserNotLoggedIn,UserLoggedIn userstate;
    class AdminOrDevAccess1,AdminOrDevAccess2 access;

    %% サブグラフ定義
    subgraph "主要ページ"
        AudioListPage
        UploadPage
        AudioPlayerPage
    end

    subgraph "認証フロー"
        UserNotLoggedIn
        LoginPage
        UserLoggedIn
        LoginAction
        LogoutAction
    end

    subgraph "デモ・その他"
        ToastDemoPage
        AdminOrDevAccess1
        AdminOrDevAccess2
        HomePage
    end
``` 
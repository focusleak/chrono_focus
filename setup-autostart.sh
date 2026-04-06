#!/bin/bash
# macOS 开机自启动脚本
# 使用方法: ./setup-autostart.sh

APP_URL="http://localhost:5173"
PLIST_NAME="com.pomodoro.app"
PLIST_PATH="$HOME/Library/LaunchAgents/${PLIST_NAME}.plist"

echo "设置番茄钟开机自启动..."

# 创建 LaunchAgent plist
cat > "$PLIST_PATH" << EOF
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>Label</key>
    <string>${PLIST_NAME}</string>
    <key>ProgramArguments</key>
    <array>
        <string>open</string>
        <string>-a</string>
        <string>Chrome</string>
        <string>--args</string>
        <string>--app=${APP_URL}</string>
    </array>
    <key>RunAtLoad</key>
    <true/>
    <key>LaunchOnlyOnce</key>
    <true/>
</dict>
</plist>
EOF

# 加载 LaunchAgent
launchctl load "$PLIST_PATH"

echo "✅ 开机自启动已设置完成！"
echo "plist 文件位置: $PLIST_PATH"
echo "重启电脑后会自动打开番茄钟应用。"
echo ""
echo "如需取消自启动，运行："
echo "launchctl unload $PLIST_PATH && rm $PLIST_PATH"

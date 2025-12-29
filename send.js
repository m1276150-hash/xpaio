<!DOCTYPE html>
<html lang="ko">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>XPAIO - 파이 네트워크 연동</title>
    <script src="https://sdk.minepi.com/pi-sdk.js"></script>
    <style>
        body { background-color: #0d1117; color: #c9d1d9; font-family: 'Malgun Gothic', sans-serif; text-align: center; padding-top: 80px; }
        .container { border: 2px solid #30363d; display: inline-block; padding: 40px; border-radius: 20px; background-color: #161b22; max-width: 400px; }
        .status-box { background-color: #238636; color: white; padding: 15px; border-radius: 10px; font-weight: bold; margin: 20px 0; }
        .instruction { text-align: left; background: #0d1117; padding: 15px; border-radius: 10px; font-size: 0.9em; color: #8b949e; }
        .highlight { color: #f1e05a; font-weight: bold; }
    </style>
</head>
<body>
    <div class="container">
        <h1>XPAIO 시스템</h1>
        <div id="loading">파이 네트워크 연결 대기 중...</div>
        
        <div id="auth-success" style="display:none;">
            <div class="status-box">✅ 파이 SDK 연동 완료</div>
            <p><span id="user-id" style="color:#58a6ff;"></span> 리더님 반갑습니다.</p>
            
            <div class="instruction">
                <strong>[다음 단계 안내]</strong><br>
                1. 파이 지갑 앱을 엽니다.<br>
                2. <span class="highlight">Manage Tokens</span> 메뉴로 이동합니다.<br>
                3. 목록에서 <span class="highlight">XPAIO</span>를 찾아 활성화하세요.<br>
                4. 완료 후 관리자에게 알려주세요.
            </div>
        </div>
    </div>

    <script>
        const Pi = window.Pi;
        async function startSystem() {
            try {
                // 전송 기능 없이 초기화만 수행
                await Pi.init({ version: "2.0", sandbox: true });
                
                // 사용자 인증 (유저 정보를 확인하여 연결 확립)
                const auth = await Pi.authenticate(['username'], (payment) => {});

                document.getElementById('loading').style.display = 'none';
                document.getElementById('auth-success').style.display = 'block';
                document.getElementById('user-id').innerText = auth.user.username;
                
                console.log("SDK 연동 완료:", auth.user.username);
            } catch (err) {
                document.getElementById('loading').innerHTML = 
                    "<p style='color:#f85149;'>파이 브라우저에서 접속이 필요합니다.</p>";
            }
        }
        window.onload = startSystem;
    </script>
</body>
</html>
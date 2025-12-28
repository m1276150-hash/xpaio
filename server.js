const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');
const path = require('path');

const app = express();

// 1. 미들웨어 설정: JSON 본문을 읽고 정적 파일을 제공합니다.
app.use(bodyParser.json());
// 리더님의 index.html 파일이 있는 폴더를 지정합니다 (현재 폴더 기준)
app.use(express.static(path.join(__dirname))); 

// 🔐 Pi Secret Key: 개발자 포털 맨 아래 발급본을 반드시 입력하세요!
const PI_API_KEY = "6zyujyo7kwm6i3ae1qrwkyktdzuksafabjc6zpwdjamurqkpe0oy0v7yphnb9mle";

// 2. 루트 경로 처리: index.html을 사용자에게 보여줍니다.
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

/**
 * 3. [핵심] 결제 승인 및 완료 통합 처리 엔드포인트
 * 리더님이 지정한 정석 경로: /xpaio-token/app/adi/payment
 */
app.post('/xpaio-token/app/adi/payment', async (req, res) => {
    const { paymentId } = req.body;
    
    if (!paymentId) {
        return res.status(400).json({ error: "결제 ID가 누락되었습니다." });
    }

    console.log(`\n[결제 요청 수신] ID: ${paymentId}`);

    try {
        // 1단계: Pi 서버에 승인(Approve) 요청
        console.log("1단계: 승인(Approve) 시도 중...");
        await axios.post(
            `https://api.minepi.com/v2/payments/${paymentId}/approve`,
            {},
            { headers: { Authorization: `Key ${PI_API_KEY}` } }
        );
        console.log("-> 승인 성공!");

        // 2단계: Pi 서버에 완료(Complete) 요청
        console.log("2단계: 최종 완료(Complete) 시도 중...");
        const completeResponse = await axios.post(
            `https://api.minepi.com/v2/payments/${paymentId}/complete`,
            {},
            { headers: { Authorization: `Key ${PI_API_KEY}` } }
        );
        console.log("-> 최종 완료 성공!");

        // 모든 절차가 끝나면 클라이언트에 성공 알림
        res.json({ success: true, txid: completeResponse.data.transaction?.txid });

    } catch (e) {
        // 에러 발생 시 상세 내용을 터미널에 출력합니다.
        const errorDetail = e.response?.data || e.message;
        console.error("❌ 결제 처리 오류:", errorDetail);
        
        res.status(500).json({ 
            error: "결제 승인 과정에서 오류가 발생했습니다.",
            detail: errorDetail 
        });
    }
});

// 4. 서버 구동
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`================================================`);
    console.log(`🚀 XPAIO 하이브리드 서버 가동 완료!`);
    console.log(`👉 접속 주소: http://localhost:${PORT}/?sandbox=1`);
    console.log(`📁 현재 폴더: ${__dirname}`);
    console.log(`================================================`);
});
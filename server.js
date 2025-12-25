const StellarSDK = require('@stellar/stellar-sdk');
const SDK = StellarSDK.default || StellarSDK;

// 🚨 1. 네트워크 설정 (파이 테스트넷)
const server = new SDK.Horizon.Server("https://api.testnet.minepi.com");
const NETWORK_PASSPHRASE = "Pi Testnet";

// 🚨 2. 지갑 설정 (은하수님이 준비하신 B 지갑)
const DISTRIBUTOR_SECRET = 'SAFCGPAIWQVXOO2QFK2GIJAFD7MEP4NHRKQ3GGAOAXLQGUTTMIZG2AYV'; 
const bKeypair = SDK.Keypair.fromSecret(DISTRIBUTOR_SECRET);
const bPublicKey = bKeypair.publicKey();

// 🚨 3. 토큰 설정 (XPAIO)
const ISSUER_ADDRESS = 'GCSFHPOHQKWEDUW2YQ3YNVROWHYBGGPVWAZN6CWMLDTVVSLAEBHMF3JG'; // A 발행자 지갑
const xpaioAsset = new SDK.Asset('xpaio', ISSUER_ADDRESS);

/**
 * [함수] 유저에게 XPAIO 토큰을 전송하는 로직
 * @param {string} userAddress 유저의 파이 지갑 주소
 * @param {string} amount 보낼 토큰 수량
 */
async function sendXpaioToken(userAddress, amount) {
    try {
        console.log(`⏳ ${userAddress}님에게 ${amount} XPAIO 전송 시작...`);

        // B 지갑 상태 로드
        const sourceAccount = await server.loadAccount(bPublicKey);

        // 트랜잭션 빌드 (B지갑 -> 유저지갑)
        const transaction = new SDK.TransactionBuilder(sourceAccount, {
            fee: SDK.BASE_FEE,
            networkPassphrase: NETWORK_PASSPHRASE,
            timebounds: await server.fetchTimebounds(100)
        })
        .addOperation(SDK.Operation.payment({
            destination: userAddress,
            asset: xpaioAsset,
            amount: amount
        }))
        .build();

        // B 지갑의 비밀키로 서명
        transaction.sign(bKeypair);

        // 네트워크에 전송
        const result = await server.submitTransaction(transaction);
        console.log("✅ 전송 성공! 트랜잭션 해시:", result.hash);
        return result;

    } catch (e) {
        console.error("❌ 전송 실패:", e.message);
        if (e.response && e.response.data) {
            console.error("상세 에러:", e.response.data.extras.result_codes);
        }
    }
}

// 테스트 실행 (필요할 때만 주석 해제 후 사용)
// sendXpaioToken('유저_지갑_주소', '10');
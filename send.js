const {
  Horizon,
  Keypair,
  Asset,
  TransactionBuilder,
  Networks,
  Operation
} = require("@stellar/stellar-sdk");

const server = new Horizon.Server("https://horizon-testnet.stellar.org");

// 유통자 비밀키 입력
const DISTRIBUTOR_SECRET = "SAFCGPAIWQVXOO2QFK2GIJAFD7MEP4NHRKQ3GGAOAXLQGUTTMIZG2AYV";
const distributor = Keypair.fromSecret(DISTRIBUTOR_SECRET);

// 발행자 주소
const ISSUER_PUBLIC = "GCSFHPOHQKWEDUW2YQ3YNVROWHYBGGPVWAZN6CWMLDTVVSLAEBHMF3JG";

// 전송할 자산
const XPAIO = new Asset("XPAIO", ISSUER_PUBLIC);

// 받는 사람 주소
const RECEIVER = "GDDY4VDYKAIQ6SU2QQDJEBTMBMCUJW2NKW6Y46L6FFPYKQ5RWFG73EXK";

async function send() {
  try {
    console.log("1. 유통 지갑 정보를 불러오는 중...");
    const account = await server.loadAccount(distributor.publicKey());

    // 서버에서 최소 수수료 자동 조회
    const feeStats = await server.feeStats();
    const minFee = feeStats.fee_charged.p90;

    console.log(`2. 서버 최소 수수료(${minFee})로 전송 시도 중...`);

    const tx = new TransactionBuilder(account, {
      fee: minFee,
      networkPassphrase: Networks.TESTNET
    })
      .addOperation(
        Operation.payment({
          destination: RECEIVER,
          asset: XPAIO,
          amount: "10"
        })
      )
      .setTimeout(60)
      .build();

    tx.sign(distributor);

    const result = await server.submitTransaction(tx);
    console.log("🎉 전송 성공:", result);

  } catch (err) {
    console.error("❌ 전송 실패:", err.response?.data || err);
  }
}

send();
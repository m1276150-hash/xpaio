const StellarSdk = require('@stellar/stellar-sdk');

// 1. 네트워크 설정 (테스트넷)
const server = new StellarSdk.Server('https://horizon-testnet.stellar.org');
StellarSdk.Network.useTestNetwork();

// 2. 리더님의 지갑 정보 세팅
const issuerKeys = StellarSdk.Keypair.fromSecret('SAR6QHU2KGE2Q4TJGV3B3DNVPJDB2EDIAWSZUAQ3ZGB5KVWEYVJ66RWA'); // A지갑 비밀번호
const distributorKeys = StellarSdk.Keypair.fromSecret('SBP3BYOH4X3ZNAX72MUMIKF7HNFJVH7WPPNDFSLMNAU4KZD4WJJWG6D4'); // B지갑 비밀번호

const assetCode = 'XPAIO';
const amount = '50000000'; // 5,000만 개

async function issueToken() {
  try {
    console.log('--- XPAIO 발행 프로세스 시작 ---');
    
    // 유통자(B지갑) 계정 정보 불러오기
    const distributorAccount = await server.loadAccount(distributorKeys.publicKey());

    // [Step 1] 신뢰선(Trustline) 형성: B지갑이 A지갑의 XPAIO를 받겠다고 승인
    const transaction = new StellarSdk.TransactionBuilder(distributorAccount, { fee: StellarSdk.BASE_FEE })
      .addOperation(StellarSdk.Operation.changeTrust({
        asset: new StellarSdk.Asset(assetCode, issuerKeys.publicKey())
      }))
      .setTimeout(30)
      .build();

    transaction.sign(distributorKeys);
    await server.submitTransaction(transaction);
    console.log('1. 신뢰선 생성 완료!');

    // [Step 2] 토큰 전송 (A -> B): 5,000만 개 발행
    const issuerAccount = await server.loadAccount(issuerKeys.publicKey());
    const paymentTx = new StellarSdk.TransactionBuilder(issuerAccount, { fee: StellarSdk.BASE_FEE })
      .addOperation(StellarSdk.Operation.payment({
        destination: distributorKeys.publicKey(),
        asset: new StellarSdk.Asset(assetCode, issuerKeys.publicKey()),
        amount: amount
      }))
      .setTimeout(30)
      .build();

    paymentTx.sign(issuerKeys);
    await server.submitTransaction(paymentTx);
    
    console.log(`2. 성공! XPAIO ${amount}개가 B지갑으로 발행되었습니다.`);
    console.log('리더님, XPAIO 탄생을 축하드립니다!');

  } catch (e) {
    console.error('에러 발생:', e.response ? e.response.data : e);
  }
}

issueToken();
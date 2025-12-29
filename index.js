const StellarSdk = require('@stellar/stellar-sdk');

// 1. 네트워크 설정 (테스트넷)
const server = new StellarSdk.Server('https://horizon-testnet.stellar.org');
StellarSdk.Network.useTestNetwork();

// 2. 지갑 정보 (A = 발행자, B = 유통자)
const issuerKeys = StellarSdk.Keypair.fromSecret('SAR6QHU2KGE2Q4TJGV3B3DNVPJDB2EDIAWSZUAQ3ZGB5KVWEYVJ66RWA'); 
const distributorKeys = StellarSdk.Keypair.fromSecret('SBP3BYOH4X3ZNAX72MUMIKF7HNFJVH7WPPNDFSLMNAU4KZD4WJJWG6D4');

const assetCode = 'XPAIO';
const amount = '50000000'; // 5천만 개

async function issueToken() {
  try {
    console.log('--- XPAIO 발행 프로세스 시작 ---');

    // STEP 1: 유통자(B지갑) 계정 로드
    const distributorAccount = await server.loadAccount(distributorKeys.publicKey());

    // STEP 2: 신뢰선 생성 (B → A)
    const trustTx = new StellarSdk.TransactionBuilder(distributorAccount, {
      fee: StellarSdk.BASE_FEE,
      networkPassphrase: StellarSdk.Networks.TESTNET
    })
      .addOperation(StellarSdk.Operation.changeTrust({
        asset: new StellarSdk.Asset(assetCode, issuerKeys.publicKey())
      }))
      .setTimeout(30)
      .build();

    trustTx.sign(distributorKeys);
    await server.submitTransaction(trustTx);
    console.log('1. 신뢰선 생성 완료!');

    // STEP 3: 발행자(A지갑) 계정 로드
    const issuerAccount = await server.loadAccount(issuerKeys.publicKey());

    // STEP 4: A → B 토큰 발행(전송)
    const paymentTx = new StellarSdk.TransactionBuilder(issuerAccount, {
      fee: StellarSdk.BASE_FEE,
      networkPassphrase: StellarSdk.Networks.TESTNET
    })
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
    console.log('🎉 XPAIO 토큰 탄생을 축하드립니다!');

  } catch (e) {
    console.error('에러 발생:', e.response?.data || e);
  }
}

issueToken();
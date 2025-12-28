// pages/api/complete-payment.ts 예시
export default async function handler(req, res) {
  const { paymentId } = req.body;
  const PI_API_KEY = "6zyujyo7kwm6i3ae1qrwkyktdzuksafabjc6zpwdjamurqkpe0oy0v7yphnb9mle"; // 개발자 포털에서 가져온 키

  // 1. 파이 서버에 결제 승인(Approve) 요청
  await fetch(`https://api.minepi.com/v2/payments/${paymentId}/approve`, {
    method: 'POST',
    headers: { 'Authorization': `Key ${PI_API_KEY}` }
  });

  // 2. 파이 서버에 결제 완료(Complete) 요청
  await fetch(`https://api.minepi.com/v2/payments/${paymentId}/complete`, {
    method: 'POST',
    headers: { 'Authorization': `Key ${PI_API_KEY}` }
  });

  res.status(200).json({ message: "결제 완료 성공!" });
}
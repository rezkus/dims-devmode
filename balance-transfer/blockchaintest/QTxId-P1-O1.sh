echo "GET query Transaction by TransactionID"
echo
curl -s -X GET http://localhost:4000/channels/mychannel/transactions/568fc09717dce5b0fe129cf6585773a88e2a118b021d4dd7c5334005c51e55b8?peer=peer1.org1.example.com \
  -H "authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJleHAiOjE1MzQ3MTk2MjgsInVzZXJuYW1lIjoiSmltIiwib3JnTmFtZSI6Ik9yZzEiLCJpYXQiOjE1MzQ2ODM2Mjh9.DsA4oA2ATOi8piaWN9c_qB4X36sXZ3l1XgkZYCH4KBE" \
  -H "content-type: application/json"
echo
echo

echo "GET query Transaction by TransactionID"
echo
curl -s -X GET http://localhost:4000/channels/mychannel/transactions/568fc09717dce5b0fe129cf6585773a88e2a118b021d4dd7c5334005c51e55b8?peer=peer0.org2.example.com \
  -H "authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJleHAiOjE1MzQ3MTk2MjksInVzZXJuYW1lIjoiQmFycnkiLCJvcmdOYW1lIjoiT3JnMiIsImlhdCI6MTUzNDY4MzYyOX0.GohiKXyjM97BGdH0Le1qLIsSX0gPXpBIOTldV_H6EWc" \
  -H "content-type: application/json"
echo
echo

echo "POST invoke <init_owner> chaincode on peers of Org1"
echo
TRX_ID=$(curl -s -X POST \
  http://localhost:4000/channels/mychannel/chaincodes/mycc \
  -H "authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJleHAiOjE1MzQ3MDIzMjYsInVzZXJuYW1lIjoiSmltIiwib3JnTmFtZSI6Ik9yZzEiLCJpYXQiOjE1MzQ2NjYzMjZ9.Nhx64gSMpkvU-9nnwGWlzZMcGTSNNTbrT9p9oedOw8Q" \
  -H "content-type: application/json" \
  -d '{
	"peers": ["peer0.org1.example.com","peer0.org2.example.com"],
	"fcn":"init_owner",
	"args":["o1234","Mary Briggins" ,"ITB", "xx"]
}')
echo "Transaction ID is $TRX_ID"
echo

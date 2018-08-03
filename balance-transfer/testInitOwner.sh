echo "POST invoke <init_owner> chaincode on peers of Org1"
echo
TRX_ID=$(curl -s -X POST \
  http://localhost:4000/channels/mychannel/chaincodes/mycc \
  -H "authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJleHAiOjE1MzMyMTU4NDgsInVzZXJuYW1lIjoiSmltIiwib3JnTmFtZSI6Ik9yZzEiLCJpYXQiOjE1MzMxNzk4NDh9.z8KgGFogvVdNPH1_kfJ-Pazz9gxnvPDDvk_B4ILO8cw" \
  -H "content-type: application/json" \
  -d '{
	"peers": ["peer0.org1.example.com","peer1.org1.example.com"],
	"fcn":"init_owner",
	"args":["o3w5","aa rezha" ,"ITB", "qweqwe"]
}')
echo "Transaction ID is $TRX_ID"
echo
echo

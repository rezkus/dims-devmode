echo "POST invoke <init_owner> chaincode on peers of Org1"
echo
TRX_ID=$(curl -s -X POST \
  http://localhost:4000/channels/mychannel/chaincodes/mycc \
  -H "authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJleHAiOjE1MzI5NzI4ODcsInVzZXJuYW1lIjoicmV6aGEiLCJvcmdOYW1lIjoiT3JnMSIsImlhdCI6MTUzMjkzNjg4N30.qEmvYxvltcIta0uQ4ZUWWDbuSIpg438H4zrvzAQgD60" \
  -H "content-type: application/json" \
  -d '{
	"peers": ["peer0.org1.example.com","peer1.org1.example.com"],
	'fcn':"init_owner",
	"args":["o123","rezha" ,"ITB"]
}')
echo "Transaction ID is $TRX_ID"
echo
echo

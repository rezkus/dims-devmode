echo "POST invoke <init_identity> chaincode on peers of Org1"
echo
TRX_ID=$(curl -s -X POST \
  http://localhost:4000/channels/mychannel/chaincodes/mycc \
  -H "authorization: Bearer <token>" \
  -H "content-type: application/json" \
  -d '{
	"peers": ["peer0.org1.example.com","peer0.org2.example.com"],
	"fcn":"init_identity",
	"args":["i1", "o1", "ITB", "isStudent", "true", "isAgeOver18", "false", "isGPAOver3", "true"]
}')
echo "Transaction ID is $TRX_ID"
echo

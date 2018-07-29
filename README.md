
RUNTUTAN UNTUK BYFN

==OPEN /DIMS/FIRST-NETWORK


1)
./byfn.sh -m up

2)
docker exec -it cli bash

3)
peer chaincode install -n mydimscc -v 1 -p github.com/chaincode/dimstest/

4)
peer chaincode instantiate -o orderer.example.com:7050 --tls --cafile /opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/ordererOrganizations/example.com/orderers/orderer.example.com/msp/tlscacerts/tlsca.example.com-cert.pem -C mychannel -n mydimscc -v 1 -c '{"Args":["init","a", "123"]}' -P "OR ('Org1MSP.peer','Org2MSP.peer')"

init_owner
peer chaincode invoke -o orderer.example.com:7050  --tls --cafile /opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/ordererOrganizations/example.com/orderers/orderer.example.com/msp/tlscacerts/tlsca.example.com-cert.pem  -C mychannel -n mydimscc -c '{"Args":["init_owner","o123", "Rezha", "ITB"]}'


init_identity
peer chaincode invoke -o orderer.example.com:7050  --tls --cafile /opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/ordererOrganizations/example.com/orderers/orderer.example.com/msp/tlscacerts/tlsca.example.com-cert.pem  -C mychannel -n mydimscc -c '{"Args":["init_identity","i123", "o123", "ITB", "isStudent", "true", "isAgeOver18", "false", "isGPAOver3", "true"]}'


get_attribute
peer chaincode invoke -o orderer.example.com:7050  --tls --cafile /opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/ordererOrganizations/example.com/orderers/orderer.example.com/msp/tlscacerts/tlsca.example.com-cert.pem  -C mychannel -n mydimscc -c '{"Args":["get_attribute","i123", "isAgeOver18"]}'


=========================================================

RUNTUTAN UNTUK CC DEV MODE

cd fabric-samples/chaincode-docker-devmode
=========================================================

TERMINAL 1 - START NETWORK
docker-compose -f docker-compose-simple.yaml up

TERMINAL 2 - BUILD & START CHAINCODE
docker exec -it chaincode bash
cd sacc
go build
CORE_PEER_ADDRESS=peer:7052 CORE_CHAINCODE_ID_NAME=mycc:0 ./sacc


TERMINAL 3 - INVOKE CHAINCODE
docker exec -it cli bash

peer chaincode install -p chaincodedev/chaincode/sacc -n mycc -v 0

peer chaincode instantiate -n mycc -v 0 -C myc -c '{"Args":["init","a", "123"]}'

<init_owner>
peer chaincode invoke -n mycc -c '{"Args":["init_owner", "o123", "Rezha", "ITB"]}' -C myc

<init_identity>
peer chaincode invoke -n mycc -c '{"Args":["init_identity","i123", "o123", "ITB", "isStudent", "true", "isAgeOver18", "false", "isGPAOver3", "true"]}' -C myc

<read_everything>
peer chaincode invoke -n mycc -c '{"Args":["read_everything"]}' -C myc

<read_attribute>
peer chaincode invoke -n mycc -c '{"Args":["read_attribute", "i123", "isAgeOver18"]}' -C myc

<set_owner>
peer chaincode invoke -n mycc -c '{"Args":["set_owner", "i123", "o124", "ITB"]}' -C myc

<update_attribute>
peer chaincode invoke -n mycc -c '{"Args":["update_attribute", "i123", "isAgeOver18", "xxx", "true"]}' -C myc

<sign_attribute>
peer chaincode invoke -n mycc -c '{"Args":["sign_attribute", "i123", "isAgeOver18", "Pak Dadang", "STEI ITB"]}' -C myc

<read_identity_by_owner_id>
peer chaincode invoke -n mycc -c '{"Args":["read_identity_by_owner_id", "o321"]}' -C myc




====CLEARING UP====

docker rm -f $(docker ps -aq)
docker network prune

MOST UPDATED CC: devmode-dims/chaincode/sacc/sacc.go

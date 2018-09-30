/*
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */


package main

import (
	"encoding/json"
	"errors"
	"fmt"
	"strconv"
	"strings"
//	"math"

	"github.com/hyperledger/fabric/core/chaincode/shim"
	pb "github.com/hyperledger/fabric/protos/peer"
)

type SimpleChaincode struct {
}

// ----- Identity ----- //
type Identity struct {
	ObjectType  	string 					`json:"docType"`     //field for couchdb
	Id          	string 					`json:"id"`          //Primary key dari type Identity
	Owner       	OwnerRelation 	`json:"owner"`
	IDAttribute   []IDAttribute   `json:"IDAttribute"`   //The zero knowledge identity claim
}

// ----- Owners ----- //
type Owner struct {
	ObjectType string `json:"docType"` 						 //field for couchdb
	Id         string `json:"id"`									 //Primary key dari type Owner
	Username   string `json:"username"`
	Company    string `json:"company"`
}

// ---- Identity Attributes ---- //
type IDAttribute struct {
	ObjectType				string	`json:"docType"`
	IDKey							string	`json:"IDKey"`				//key of the attribute
	IDValue						string  `json:"IDValue"`			//value of the attributes
	IDSignature 			string  `json:"IDSignature"`	//issuer signature of the attribute
}

type OwnerRelation struct {
	Id       string `json:"id"`
	Username string `json:"username"` //this is mostly cosmetic/handy, the real relation is by Id not Username
	Company  string `json:"company"`  //this is mostly cosmetic/handy, the real relation is by Id not Username
}

// ============================================================================================================================
// Main
// ============================================================================================================================
func main() {
	err := shim.Start(new(SimpleChaincode))
	if err != nil {
		fmt.Printf("Error starting Simple chaincode - %s", err)
	}
}

// ============================================================================================================================
// Init - initialize the chaincode
//
// Run a simple test instead. The DIMS doesnt require any initialization
//
// Shows off PutState() and how to pass an input argument to chaincode.
// Shows off GetFunctionAndParameters() and GetStringArgs()
// Shows off GetTxID() to get the transaction ID of the proposal
//
// Inputs - Array of strings
//  ["314"]
//
// Returns - shim.Success or error
// ============================================================================================================================

func (t *SimpleChaincode) Init(stub shim.ChaincodeStubInterface) pb.Response {
	fmt.Println("DIMS Is Starting Up")
	funcName, args := stub.GetFunctionAndParameters()
	var number int
	var err error
	txId := stub.GetTxID()

	fmt.Println("Init() is running")
	fmt.Println("Transaction ID:", txId)
	fmt.Println("  GetFunctionAndParameters() function:", funcName)
	fmt.Println("  GetFunctionAndParameters() args count:", len(args))
	fmt.Println("  GetFunctionAndParameters() args found:", args)


	// fmt.Println("Initiating IDAttribute List")
	// fmt.Println("Creating IDAttribute[1].IDKey")

	// expecting 1 arg for instantiate or upgrade
	if len(args) == 1 {
		fmt.Println("  GetFunctionAndParameters() arg[0] length", len(args[0]))

		// expecting arg[0] to be length 0 for upgrade
		if len(args[0]) == 0 {
			fmt.Println("  Uh oh, args[0] is empty...")
		} else {
			fmt.Println("  Great news everyone, args[0] is not empty")

			// convert numeric string to integer
			number, err = strconv.Atoi(args[0])
			if err != nil {
				return shim.Error("Expecting a numeric string argument to Init() for instantiate")
			}

			err = stub.PutState("selftest", []byte(strconv.Itoa(number)))
			if err != nil {
				return shim.Error(err.Error()) //self-test fail
			}
		}
	}

	// showing the alternative argument shim function
	alt := stub.GetStringArgs()
	fmt.Println("  GetStringArgs() args count:", len(alt))
	fmt.Println("  GetStringArgs() args found:", alt)

	fmt.Println("Ready for action") //self-test pass
	return shim.Success(nil)
}

// ============================================================================================================================
// Invoke - Our entry point for Invocations
// ============================================================================================================================
func (t *SimpleChaincode) Invoke(stub shim.ChaincodeStubInterface) pb.Response {
	function, args := stub.GetFunctionAndParameters()
	fmt.Println(" ")
	fmt.Println("starting invoke, for - " + function)

	// Handle different functions
	if function == "init" { //initialize the chaincode state, used as reset
		return t.Init(stub)
	} else if function == "read" { //generic read ledger
		return read(stub, args)
	} else if function == "write" { //generic writes to ledger
		return write(stub, args)
	} else if function == "init_identity" { //create a new identity
		return init_identity(stub, args)
	} else if function == "set_owner" { //change owner of a identity
		return set_owner(stub, args)
	} else if function == "init_owner" { //create a new identity owner
		return init_owner(stub, args)
	} else if function == "read_everything" { //read everything, (owners  + identitie]es + companies)
		return read_everything(stub)
	} else if function == "read_attribute" {
		return read_attribute(stub, args)
	} else if function == "update_attribute" {
		return update_attribute(stub, args)
	} else if function == "sign_attribute" {
		return sign_attribute(stub, args)
	} else if function == "read_identity_by_owner_id" {
		return read_identity_by_owner_id(stub, args)
	}

	// error out
	fmt.Println("Received unknown invoke function name - " + function)
	return shim.Error("Received unknown invoke function name - '" + function + "'")
}

////////////////////////////////////////////////////COPY OF READ_LEDGER.GO///////////////////////////////////////////////////////

// ============================================================================================================================
// Read - read a generic variable from ledger
//
// Shows Off GetState() - reading a key/value from the ledger
//
// Inputs - Array of strings
//  0
//  key
//  "abc"
//
// Returns - string
// ============================================================================================================================
func read(stub shim.ChaincodeStubInterface, args []string) pb.Response {
	var key, jsonResp string
	var err error
	fmt.Println("starting read")

	if len(args) != 1 {
		return shim.Error("Incorrect number of arguments. Expecting key of the var to query")
	}

	// input sanitation
	err = sanitize_arguments(args)
	if err != nil {
		return shim.Error(err.Error())
	}

	key = args[0]
	valAsbytes, err := stub.GetState(key) //get the var from ledger
	if err != nil {
		jsonResp = "{\"Error\":\"Failed to get state for " + key + "\"}"
		return shim.Error(jsonResp)
	}

	fmt.Println("- end read")
	return shim.Success(valAsbytes) //send it onward
}

// ============================================================================================================================
// Get everything we need (owners + identities + companies)
//
// Inputs - none
//
// ============================================================================================================================
func read_everything(stub shim.ChaincodeStubInterface) pb.Response {
	type Everything struct {
		Owners     []Owner    `json:"owners"`
		Identities []Identity `json:"identities"`
	}
	var everything Everything

	// ---- Get All Identity ---- //
	resultsIterator, err := stub.GetStateByRange("i0", "i9999999999999999999")
	if err != nil {
		return shim.Error(err.Error())
	}
	defer resultsIterator.Close()

	for resultsIterator.HasNext() {
		aKeyValue, err := resultsIterator.Next()
		if err != nil {
			return shim.Error(err.Error())
		}
		queryKeyAsStr := aKeyValue.Key
		queryValAsBytes := aKeyValue.Value
		fmt.Println("on identity id - ", queryKeyAsStr)
		var identity Identity
		json.Unmarshal(queryValAsBytes, &identity)           //func Unmarshal(data []byte, v interface{}) error. un stringify it aka JSON.parse()
		everything.Identities = append(everything.Identities, identity) //add this identity to the list
	}
	fmt.Println("identity array - ", everything.Identities)

	// ---- Get All Owners ---- //
	ownersIterator, err := stub.GetStateByRange("o0", "o9999999999999999999")
	if err != nil {
		return shim.Error(err.Error())
	}
	defer ownersIterator.Close()

	for ownersIterator.HasNext() {
		aKeyValue, err := ownersIterator.Next()
		if err != nil {
			return shim.Error(err.Error())
		}
		queryKeyAsStr := aKeyValue.Key
		queryValAsBytes := aKeyValue.Value
		fmt.Println("on owner id - ", queryKeyAsStr)
		var owner Owner
		json.Unmarshal(queryValAsBytes, &owner) //un stringify it aka JSON.parse()

		everything.Owners = append(everything.Owners, owner) //add this identity owner to the list
	}
	fmt.Println("owner array - ", everything.Owners)

	//change to array of bytes
	everythingAsBytes, _ := json.Marshal(everything) //convert to array of bytes
	return shim.Success(everythingAsBytes)
}

// ============================================================================================================================
// read Attribute By Identity - read 1 specific attribute of 1 identity (based on Identity.id). No return output, just read
// args[0] = identity.id
// args[1] = identity.IDAttribute.IDKey
// ============================================================================================================================

func read_attribute(stub shim.ChaincodeStubInterface, args []string) pb.Response {
	fmt.Println("starting read_attribute")

	if len(args) != 2 {
		return shim.Error("Incorrect number of arguments. Expecting 2")
	}

	identityId := args[0]
	idKey := args[1]

	funcArgs := []string{identityId, idKey}
	var idAttribute IDAttribute
	var err error
	idAttribute, err = get_attribute(stub, funcArgs)
	if err != nil {
		fmt.Println("Failed to find attribute of identityId: " + identityId + ", and idKey: " + idKey )
		return shim.Error(err.Error())
	}

	fmt.Println("Printing results ...")
	fmt.Println(idAttribute)

	fmt.Println()
	fmt.Println("Converting fetched IDAttribute to bytes")
	idAttributeAsBytes, _ := json.Marshal(idAttribute)

	//end function
	fmt.Println()
	fmt.Println("- end read_attribute identity, return payload success")
	return shim.Success(idAttributeAsBytes)
}

// ============================================================================================================================
// read Identity By Owner.Id - read 1 identity based on the owner ID
// args[0] = owner_id
//
// Output: JSON of Identity
// ============================================================================================================================

func read_identity_by_owner_id(stub shim.ChaincodeStubInterface, args []string) pb.Response {

	fmt.Println("Starting read_identity_by_owner_id")

	if len(args) != 1 {
		return shim.Error("Incorrect number of arguments, expecting 1")
	}

	var fetchedIdentity Identity
	owner_id := args[0]
	ownerFound := false
	fetchedIdentityID := ""

	// ---- Get Identity ---- //
	resultsIterator, err := stub.GetStateByRange("i0", "i9999999999999999999")
	if err != nil {
		return shim.Error(err.Error())
	}
	defer resultsIterator.Close()

	for resultsIterator.HasNext() {
		aKeyValue, err := resultsIterator.Next()
		if err != nil {
			return shim.Error(err.Error())
		}
		queryValAsBytes := aKeyValue.Value
		var identity Identity
		json.Unmarshal(queryValAsBytes, &identity)           //func Unmarshal(data []byte, v interface{}) error. un stringify it aka JSON.parse()

		if (identity.Owner.Id == owner_id) {
			fetchedIdentityID = identity.Id
			ownerFound = true
		}
	}

	if !ownerFound {
		return shim.Error("Owner with ID = " + owner_id + " doesn't have identity or doesnt exist")
	} else { //owner exists

		fmt.Println("Owner ID " + owner_id + " possess Identity with ID: " + fetchedIdentityID)
		//getting requested identity
		fetchedIdentity, err = get_identity(stub, fetchedIdentityID)
		if err!=nil {
		 	fmt.Println("Error on get_identity")
		 	return shim.Error(err.Error())
	 	}
	}

	fmt.Print("Fetched Identity of " + owner_id + " - ")
	fmt.Println(fetchedIdentity)

	identityAsBytes, _ := json.Marshal(fetchedIdentity)

	return shim.Success(identityAsBytes)
}



////////////////////////////////////////////////////COPU OF WRITE_LEDGER.GO///////////////////////////////////////////////////

// ============================================================================================================================
// write() - genric write variable into ledger
//
// Shows Off PutState() - writting a key/value into the ledger
//
// Inputs - Array of strings
//    0   ,    1
//   key  ,  value
//  "abc" , "test"
// ============================================================================================================================
func write(stub shim.ChaincodeStubInterface, args []string) pb.Response {
	var key, value string
	var err error
	fmt.Println("starting write")

	if len(args) != 2 {
		return shim.Error("Incorrect number of arguments. Expecting 2. key of the variable and value to set")
	}

	// input sanitation
	err = sanitize_arguments(args)
	if err != nil {
		return shim.Error(err.Error())
	}

	key = args[0] //rename for funsies
	value = args[1]
	err = stub.PutState(key, []byte(value)) //write the variable into the ledger
	if err != nil {
		return shim.Error(err.Error())
	}

	fmt.Println("- end write")
	return shim.Success(nil)
}

// ============================================================================================================================
// Init identity - create a new identity, store into chaincode state
//
// Shows off building a key's JSON value manually
//
// Inputs - Array of strings (1. identityid)(2. owner id) (3. auth company) (4. isStudent)(5. true)(6.isAgeOver18)(7. false)(8. isGPAOver3)(9. true)
//      0      ,      1	  ,     2       	 ,      3      		 ,       4       ,        5
//     id      ,   IDAttribute[1] , IDAttribute[2] , IDAttribute[3]  ,   Owner ID    ,  Authing company
// "i999999999",     true    			,    true    		 ,   false         , "o999999999"  ,      "ITB"
// ============================================================================================================================
func init_identity(stub shim.ChaincodeStubInterface, args []string) pb.Response {
	var err error
	//var err2 error
	//var idAttribute []IDAttribute
	fmt.Println("starting init_identity")

	if len(args) < 9 {
		return shim.Error("Incorrect number of arguments. Expecting 6")
	}

	//input sanitation
	err = sanitize_arguments(args)
	if err != nil {
		return shim.Error(err.Error())
	}

	var identity Identity

	identity.ObjectType = "identity"
	identity.Id = args[0]
	identity.Owner.Id = args[1]
	identity.Owner.Company = args[2]
	//fmt.Println("tes before loop")

	var attr IDAttribute
	attr.ObjectType = "identity_attribute"
	attr.IDSignature = "noSig"
	for i := 3; i < 9; i++ {
		//fmt.Println("masuk loop, i = ", + i)
		if i%2 != 0 {
			//fmt.Println("i ganjil")
			attr.IDKey = args[i]
		} else {
			//fmt.Println("i genap")
			attr.IDValue = args[i]
			identity.IDAttribute = append(identity.IDAttribute, attr)
		}
	}

	//check if new owner exists
	owner, err := get_owner(stub, identity.Owner.Id)
	if err != nil {
		fmt.Println("Failed to find owner - " + identity.Owner.Id)
		return shim.Error(err.Error())
	}

	//check authorizing company (see note in set_owner() about how this is quirky)
	if owner.Company != identity.Owner.Company {
		return shim.Error("The company '" + identity.Owner.Company + "' cannot authorize creation for '" + owner.Company + "'.")
	}

	//check if identity id already exists
	identityX, err := get_identity(stub, identity.Id)
	if err == nil {
		fmt.Println("This identity already exists - " + identity.Id)
		fmt.Println(identityX)
		return shim.Error("This identity already exists - " + identity.Id) //all stop a identity by this id exists
	}

	//build the identity json string manually
	identityAsBytes, _ := json.Marshal(identity)
	//---
	err = stub.PutState(identity.Id, identityAsBytes) //store identity with id as key
	if err != nil {
		return shim.Error(err.Error())
	}

	fmt.Println("- end init_identity")
	return shim.Success(nil)
}

// ============================================================================================================================
// Init Owner - create a new owner aka end user, store into chaincode state
//
// Shows off building key's value from GoLang Structure
//
// Inputs - Array of Strings
//           0     ,    1    ,    2
//      owner id   , username , company
// "o9999999999999",  "bob"   , "ITB"
// ============================================================================================================================
func init_owner(stub shim.ChaincodeStubInterface, args []string) pb.Response {
	var err error
	fmt.Println("starting init_owner")

	if len(args) != 3 {
		return shim.Error("Incorrect number of arguments. Expecting 3")
	}

	//input sanitation
	err = sanitize_arguments(args)
	if err != nil {
		return shim.Error(err.Error())
	}

	var owner Owner
	owner.ObjectType = "identity_owner"
	owner.Id = args[0]
	owner.Username = strings.ToLower(args[1])
	owner.Company = args[2]
	fmt.Println(owner)

	//check if user already exists
	_, err = get_owner(stub, owner.Id)
	if err == nil {
		fmt.Println("This owner already exists - " + owner.Id)
		return shim.Error("This owner already exists - " + owner.Id)
	}

	//store user
	ownerAsBytes, _ := json.Marshal(owner)      //convert to array of bytes
	err = stub.PutState(owner.Id, ownerAsBytes) //store owner by its Id
	if err != nil {
		fmt.Println("Could not store user")
		return shim.Error(err.Error())
	}

	fmt.Println("- end init_owner identity")
	return shim.Success(nil)
}

// ============================================================================================================================
// Set Owner on Identity
//
// Shows off GetState() and PutState()
//
// Inputs - Array of Strings
//       0     ,        1      ,        2
//  identity id,  to owner id  , company that auth the transfer
// "m999999999", "o99999999999", "united_mables"
// ============================================================================================================================
func set_owner(stub shim.ChaincodeStubInterface, args []string) pb.Response {
	var err error
	fmt.Println("starting set_owner")

	if len(args) != 3 {
		return shim.Error("Incorrect number of arguments. Expecting 3")
	}

	// input sanitation
	err = sanitize_arguments(args)
	if err != nil {
		return shim.Error(err.Error())
	}

	var identity_id = args[0]
	var new_owner_id = args[1]
	var authed_by_company = args[2]
	fmt.Println(identity_id + "->" + new_owner_id + " - |" + authed_by_company)

	// check if owner already exists
	owner, err := get_owner(stub, new_owner_id)
	if err != nil {
		return shim.Error("This owner does not exist - " + new_owner_id)
	}

	// get identity's current state
	identityAsBytes, err := stub.GetState(identity_id)
	if err != nil {
		return shim.Error("Failed to get identity")
	}
	res := Identity{}
	json.Unmarshal(identityAsBytes, &res) //un stringify it aka JSON.parse()

	// check authorizing company
	if res.Owner.Company != authed_by_company {
		return shim.Error("The company '" + authed_by_company + "' cannot authorize transfers for '" + res.Owner.Company + "'.")
	}

	// transfer the identity
	res.Owner.Id = new_owner_id //change the owner
	res.Owner.Username = owner.Username
	res.Owner.Company = owner.Company
	jsonAsBytes, _ := json.Marshal(res)       //convert to array of bytes
	err = stub.PutState(args[0], jsonAsBytes) //rewrite the identity with id as key
	if err != nil {
		return shim.Error(err.Error())
	}

	fmt.Println("- end set owner")
	return shim.Success(nil)
}

/////////////////////////////////////////////////////COPY OF LIB.GO////////////////////////////////////////////////////////////

// ============================================================================================================================
// Get Identity - get an identity asset from ledger
// ============================================================================================================================
func get_identity(stub shim.ChaincodeStubInterface, id string) (Identity, error) {
	var identity Identity
	identityAsBytes, err := stub.GetState(id) //getState retreives a key/value from the ledger
	if err != nil {                           //this seems to always succeed, even if key didn't exist
		return identity, errors.New("Failed to find identity - " + id)
	}
	json.Unmarshal(identityAsBytes, &identity) //un stringify it aka JSON.parse()

	if identity.Id != id { //test if identity is actually here or just nil
		return identity, errors.New("Identity does not exist - " + id)
	}

	return identity, nil
}

// ============================================================================================================================
// Get Owner - get the owner asset from ledger
// ============================================================================================================================
func get_owner(stub shim.ChaincodeStubInterface, id string) (Owner, error) {
	var owner Owner
	ownerAsBytes, err := stub.GetState(id) //getState retreives a key/value from the ledger
	if err != nil {                        //this seems to always succeed, even if key didn't exist
		return owner, errors.New("Failed to get owner - " + id)
	}
	json.Unmarshal(ownerAsBytes, &owner) //un stringify it aka JSON.parse()

	if len(owner.Username) == 0 { //test if owner is actually here or just nil
		return owner, errors.New("Owner does not exist - " + id + ", '" + owner.Username + "' '" + owner.Company + "'")
	}

	return owner, nil
}

// ============================================================================================================================
// get Attribute By Identity - read 1 specific attribute of 1 identity (based on Identity.id). Returning Identity.IDAttribute[i]
// args[0] = identity.id
// args[1] = identity.IDAttribute.IDKey
//
// output = Identity.IDAttribute[iFound]
// ============================================================================================================================

func get_attribute(stub shim.ChaincodeStubInterface, args []string) (IDAttribute, error) {
	var idAttribute IDAttribute
	iFound := -999
	fmt.Println("starting get_attribute")

	if len(args) != 2 {
		return idAttribute, errors.New("Wrong argument count, expecting 2")
	}

	identityId := args[0]
	idKey := args[1]

	//Getting identity by ID
	fmt.Println("getting identity by id " + identityId)
	identity, err := get_identity(stub, identityId)

 	if err!=nil {
		return idAttribute, errors.New("Error on get_identity")
 	}
	//Getting attribute args[2] based on fetched identity
	fmt.Println("Reading identity attribute on " + identity.Id)
	for i := range identity.IDAttribute {
		if identity.IDAttribute[i].IDKey == idKey {
			fmt.Println("Found matching idKey on args[" + strconv.Itoa(i) +"]")
			iFound = i
		}
	}

	if iFound != -999 {
		idAttribute = identity.IDAttribute[iFound]
	} else {
		return idAttribute, errors.New("IDKey not found in array list")
	}

	fmt.Println("Returning results ...")
	return idAttribute, nil
}

// ============================================================================================================================
// Update Attribute By Identity - Update 1 specific attribute of 1 identity (based on Identity.id). Accept parameter [isIssuer] to validate if the invoker is truly issuer
// args[0] = identity.id
// args[1] = identity.IDAttribute.IDKey
// args[2] = new value of args[1]
// args[3] = isIssuer
// ============================================================================================================================
func update_attribute(stub shim.ChaincodeStubInterface, args []string) pb.Response {
	var err error
	fmt.Println("starting update_attribute")

	if len(args) != 4 {
		return shim.Error("Incorrect number of arguments. Expecting 4")
	}

	identityId := args[0]
	idKey := args[1]
	newValue := args[2]
	isIssuer := args[3]

	fmt.Println("Changing value of " + idKey + " on identity " + identityId + " to " + newValue)

	var identity Identity

	//getting requested identity
	identity, err = get_identity(stub, identityId)
	if err!=nil {
	 	fmt.Println("Error on get_identity")
	 	return shim.Error(err.Error())
 	}

	// get the relevant [i] using idKey matching
	iFound := -999
	fmt.Println("Reading identity attribute on " + identity.Id)
	for i := range identity.IDAttribute {
		if identity.IDAttribute[i].IDKey == idKey {
			// return identity.IDAttribute[i], nil
			fmt.Println("Found matching idKey on i = " + strconv.Itoa(i))
			iFound = i
		}
	}

	if iFound != -999 {
		if isIssuer == "true" {
			fmt.Println("Changing value of IDValue from " + identity.IDAttribute[iFound].IDValue + " to " + newValue)
			identity.IDAttribute[iFound].IDValue = newValue
			jsonAsBytes, _ := json.Marshal(identity)
			err = stub.PutState(args[0], jsonAsBytes)
			if err != nil {
				return shim.Error(err.Error())
			}
		} else {  //not an issuer
			fmt.Println("Request rejected, not an issuer")
			return shim.Error(err.Error())
		} //endif isIssuer

	} else { //IDKey not found
		fmt.Println("IDKey not found on array list")
		return shim.Error(err.Error())
	}

	fmt.Println("- end update_attribute")
	return shim.Success(nil)
}

// ============================================================================================================================
// Sign Attribute By Identity - Sign 1 specific attribute of 1 identity (based on Identity.id). Accept parameter [isIssuer] to validate if the invoker is truly issuer
// args[0] = identity.id
// args[1] = identity.IDAttribute.IDKey
// args[2] = issuer name
// args[3] = issuer company
// ============================================================================================================================
func sign_attribute (stub shim.ChaincodeStubInterface, args []string) pb.Response {
	fmt.Println("starting sign_attribute")

  if len(args) != 4 {
 	 return shim.Error("Incorrect number of arguments. Expecting 4")
  }

	identityId := args[0]
	idKey := args[1]
	issuerName := args[2]
	issuerCompany := args[3]

	//getting requested identity
	var identity Identity
	identity, err := get_identity(stub, identityId)
	if err!=nil {
		fmt.Println("Error on get_identity")
		return shim.Error(err.Error())
	}

	// get the relevant [i] using idKey matching
	iFound := -999
	fmt.Println("Reading identity attribute on " + identity.Id)
	for i := range identity.IDAttribute {
		if identity.IDAttribute[i].IDKey == idKey {
			fmt.Println("Found matching idKey on i = " + strconv.Itoa(i))
			iFound = i
		}
	}

	signature := "Signed by " + issuerName + " from " + issuerCompany
	if iFound != -999 {
		identity.IDAttribute[iFound].IDSignature = signature
		jsonAsBytes, _ := json.Marshal(identity)
		err = stub.PutState(args[0], jsonAsBytes)
		if err != nil {
			return shim.Error(err.Error())
		}
	} else {
		fmt.Println("IDKey not found on array list")
		return shim.Error(err.Error())
	}

	fmt.Println("- end sign_attribute")
	return shim.Success(nil)
}

// ========================================================
// Input Sanitation - dumb input checking, look for empty strings
// ========================================================
func sanitize_arguments(strs []string) error {
	for i, val := range strs {
		if len(val) <= 0 {
			return errors.New("Argument " + strconv.Itoa(i) + " must be a non-empty string")
		}
		if len(val) > 32 {
			return errors.New("Argument " + strconv.Itoa(i) + " must be <= 32 characters")
		}
	}
	return nil
}

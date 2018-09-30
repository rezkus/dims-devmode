echo "GET query Block by Block Number"
echo
curl -s -X GET http://localhost:4000/channels/mychannel/blocks/1 \
  -H "authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJleHAiOjE1MzcxOTQ3NTksInVzZXJuYW1lIjoiSmltIiwib3JnTmFtZSI6Ik9yZzEiLCJpYXQiOjE1MzcxNTg3NTl9.b-ocNTkuQ1rYlRba3utGfVeDyTarezg3q90bLIOFFmw" \
  -H "content-type: application/json"
echo
echo

echo "포트를 입력해주세요 :"
read port
docker run --name ai_test --rm  -p $port:4080 ai_test  

var imgNode = document.getElementById("img");
var da;
//이미지를 불러와서 ai를 통해 분류하고 결과 값을 화면에 보이게 하는 코드
fetch("/image")
    .then((response) => response.json())
    .then((data) => {
        console.log(data);
        if (data.length != 0) {
            fetch("/ai") //서버에 ai 분류결과를 요청하는 코드
                .then((response) => response.json()) 
                .then((d) => {
                    if (d) {
                        var s;
                        console.log(d);
                        //console.log(d[0][2]);
                        /*if (d[0][1] > d[0][2]) {
                            s = "현무암";
                        } else if (d[0][1] < d[0][2]) {
                            s = "화강암";
                        }*/

                        var h2Node = document.getElementById("h2");
                        //h2Node.textContent = s;
                        console.log(d);
                    }
                });
        }
    });

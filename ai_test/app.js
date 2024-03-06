const express = require("express");
const app = express();
const http = require("http");
const port = 4080;
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const tf = require("@tensorflow/tfjs-node");
const { Z_FULL_FLUSH } = require("zlib");
var model;

(async function start() {
    //모델 불러오는 함수
    try {
        model = await tf.loadLayersModel(
            "file://" + __dirname + "/public/model_json/model.json"
        ); //모델 불러오기
    } catch (error) {
        console.error("E:", error);
    }
    console.log("Model loaded successfully:", model.summary());
})();

async function predictWithModel(models, imagePath, targetWidth, targetHeight) {
    //imagePath에 있는 이미지를 불러와서 모델을 통해 분류하는 함수
    try {
        // 이미지 불러오기
        const imageBuffer = fs.readFileSync(imagePath);
        const image = await tf.node.decodeImage(imageBuffer, 3);

        // 이미지 크기 변경 및 정규화
        const resizedImage = tf.image.resizeBilinear(image, [
            targetHeight,
            targetWidth,
        ]);
        const normalizedImage = resizedImage.div(255.0);

        // 배치 차원 추가
        const batchedImage = normalizedImage.expandDims(0);

        // 모델에 예측 요청
        const predictions = await models.predict(batchedImage);
        console.log(predictions.arraySync());
        return predictions.arraySync();
    } catch (error) {
        throw error;
    }
}

const upload = multer({
    storage: multer.diskStorage({
        filename(req, file, done) {
            done(null, file.originalname);
        },
        destination(req, file, done) {
            clearDestination(() => {
                done(null, path.join(__dirname, "files"));
            });
        },
    }),
});
function clearDestination(callback) {
    const destinationDir = path.join(__dirname, "files");
    fs.readdir(destinationDir, (err, files) => {
        if (err) {
            console.error("목적지 디렉터리 읽기 오류:", err);
            return;
        }

        files.forEach((file) => {
            const filePath = path.join(destinationDir, file);
            try {
                fs.unlinkSync(filePath);
            } catch (err) {
                console.error("e", err);
            }
        });

        callback();
    });
}

const uploadMiddleware = upload.single("myFile");
app.use(uploadMiddleware);

app.use("/public", express.static(__dirname + "/public"));

app.get("/", function (req, res) {
    res.sendFile(__dirname + "/public/index.html");
});

app.post("/upload", (req, res) => {
    console.log("a");
    console.log(req.file);
    res.status(200).send('uploaded<script>location.href="/";</script>');
});

app.get("/image", (req, res) => {
    const destinationDir = path.join(__dirname, "files");
    fs.readdir(destinationDir, (err, files) => {
        if (err) {
            console.error("목적지 디렉터리 읽기 오류:", err);
            res.end();
        }

        res.json(files);
    });
});

app.get("/getimage", (req, res) => {
    const destinationDir = path.join(__dirname, "files");
    fs.readdir(destinationDir, (err, files) => {
        if (err) {
            console.error("목적지 디렉터리 읽기 오류:", err);
            res.end();
        }
        console.log(files);
        try {
            fs.readFile(
                path.join(__dirname, "files", files[0]),
                (err, data) => {
                    if (err) {
                        console.log("이미지 읽기 오류", err);
                        res.end();
                    }
                    res.end(data);
                }
            );
        } catch (error) {
            console.log("e", error);
        }
    });
});
app.get("/ai", (req, res) => {
    var imagePath;
    const destinationDir = path.join(__dirname, "files");
    fs.readdir(destinationDir, (err, files) => {
        if (err) {
            console.error("목적지 디렉터리 읽기 오류:", err);
            return;
        }
        imagePath = path.join(__dirname, "files", files[0]);
        (async () => {
            const predictions = await predictWithModel(
                model,
                imagePath,
                512,
                512
            );
            return predictions;
        })().then((predictions) => {
            res.json(predictions);
        });
    });
});

app.listen(port, () => {
    console.log("start_s");
});

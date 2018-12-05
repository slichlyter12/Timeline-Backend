const mongoose = require("mongoose");
const express = require("express");
const path = require("path");
const fs = require("fs");
const bodyParser = require("body-parser");
const logger = require("morgan");
const fileUpload = require("express-fileupload");
const cors = require("cors");
const Zip = require("adm-zip");

const Upload = require("./upload");

const PORT = 3001
const app = express();
const router = express.Router();

const dbUrl = "mongodb://127.0.0.1:27017/uploads";

mongoose.connect(
	dbUrl,
	{ useNewUrlParser: true },
);

let db = mongoose.connection;

db.once("open", () => console.log("connected to database"));
db.on("error", console.error.bind(console, "MongoDB connection error:"));

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(logger("common"));
app.use(cors());
app.use(fileUpload());
app.use('/public', express.static(__dirname + '/public'));

/*********** HELPER METHODS *********/
function moveFile(file, filename) {
	const path = `${__dirname}/public/${filename}`;
	file.mv(path, err => {
		if (err) {
			console.log("Error: ", err);
			return err;
		}
		return path;
	});
}

function unzip(path) {
	zip = new Zip(path);
	if (zip.extractEntryTo("Location History/Location History.json", `${__dirname}/public/`, false, true)) {
		fs.unlink(path);
		return true;
	} else {
		return false;
	}
}

/*********** SERVER METHODS *********/
router.get("/", (req, res) => {
	Upload.find({}, (err, uploads) => {
		res.send(uploads);
	});
});

router.post("/", (req, res) => {
	let CompressedFile = req.files.file;
	const path = `${__dirname}/public/${CompressedFile.name}`;
	CompressedFile.mv(path, err => {
		if (err) {
			return res.status(500).send(err);
		}

		let upload = new Upload();
		let url = req.protocol + '://' + req.get('host') + req.originalUrl + '/public/' + CompressedFile.name;
		upload.filename = CompressedFile.name;
		upload.save(err => {
			if (err) return res.status(500).send(err);
			res.json({url});
		});
	});
});

app.use("/api", router);

app.listen(PORT, () => console.log(`listening on port ${PORT}`));
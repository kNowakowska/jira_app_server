var express = require('express');
var router = express.Router();

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

router.route()
.get("/", (req, res) => {

})
.get("/:id", (req, res) => {
  console.log(req.params)

})
.post("/", (req, res) => {

})
.put("/:id", (req, res) => {

})
.delete("/:id",(req, res) => {

})

module.exports = router;

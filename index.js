const express = require("express");
const app = express();
const terraformRouter = require('./src/routes/terraform.routes')
const awsRouter = require('./src/routes/aws.routes')
const cors = require('cors')

app.use(cors())
// app.use(express.urlencoded({extended: true}));
app.use(express.json())

app.use('/terraform', terraformRouter)
app.use('/aws', awsRouter)


app.listen(3005, () => {
  console.log("listening on port 3005")
})
require("dotenv/config");
const express = require("express");
const exphbs = require("express-handlebars");
const port = process.env.PORT || 3000;
const MercadoPago = require("mercadopago");
const uuid = require("uuid");
const cors = require("cors");

const app = express();

MercadoPago.configure({
  integrator_id: process.env.MP_INTEGRATOR_ID,
  access_token: process.env.MP_ACCESS_TOKEN,
});

app.use(cors());
app.engine("handlebars", exphbs());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.set("view engine", "handlebars");

app.use(express.static("assets"));

app.use("/assets", express.static(__dirname + "/assets"));

app.get("/", function (req, res) {
  res.render("home", { viewName: "home" });
});

app.get("/detail", function (req, res) {
  res.render("detail", { viewName: "item", query: req.query });
});

app.get("/payment/approved", async function (req, res) {
  res.render("payments/approved", { viewName: "", query: req.query });
});
app.get("/payment/pending", async function (req, res) {
  res.render("payments/pending", { viewName: "", query: req.query });
});
app.get("/payment/fail", async function (req, res) {
  res.render("payments/failed", { viewName: "", query: req.query });
});

app.post("/newPurchase", async function (req, res) {
  const { name, price, unit, img } = req.body;

  const order = {
    items: [
      {
        id: "1234",
        title: name,
        currency_id: "BRL",
        picture_url: img,
        description: "Celular de Tienda e-commerce",
        category_id: "art",
        quantity: +unit,
        unit_price: parseFloat(price),
        external_reference: "andre.contiero@yahoo.com.br",
      },
    ],
    payer: {
      name: "Lalo",
      surname: "Landa",
      email: "test_user_92801501@testuser.com",
      phone: {
        area_code: "55",
        number: 985298743,
      },
      address: {
        street_name: "Insurgentes Sur",
        street_number: 1602,
        zip_code: "78134190",
      },
    },
    back_urls: {
      success: process.env.APP_URL + "/payment/approved",
      failure: process.env.APP_URL + "/payment/fail",
      pending: process.env.APP_URL + "/payment/pending",
    },
    auto_return: "approved",
    payment_methods: {
      excluded_payment_methods: [
        {
          id: "amex",
        },
      ],
      installments: 6,
    },
    notification_url: process.env.APP_URL + "/webhook?source_news=webhook",
    statement_descriptor: "Teste",
    external_reference: "andre.contiero@yahoo.com.br",
  };

  const preference = await MercadoPago.preferences.create(order);

  res.json({ redirect: preference.body.init_point });
});

app.post("/webhook", async function (req, res) {
  console.log(req.body);
  console.log(req.query);
  return res.status(200);
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

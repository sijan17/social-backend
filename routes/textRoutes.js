const router = require("express").Router();
const Text = require("../models/textModel");

router.get("/", async (req, res, next) => {
  try {
    const text = await Text.findOne({ id: 1 });
    res.json({ success: true, text });
  } catch (ex) {
    // return res.json({ success: false });
    next(ex);
  }
});

router.post("/", async (req, res, next) => {
  try {
    const text = req.body.text;

    if (text !== "") {
      const text = await Text.updateOne(
        { id: 1 },
        { $set: { text: req.body.text } }
      );

      res.json({ success: true });
    } else {
      res.json({ success: false });
    }
  } catch (ex) {
    next(ex);
  }
});

module.exports = router;

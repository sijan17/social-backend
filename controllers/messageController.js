const Message = require("../models/messageModel");
module.exports.addMessage = async (req, res, next) => {
  try {
    const { from, to, message } = req.body;
    const data = await Message.create({
      message: { text: message },
      users: [from, to],
      sender: from,
    });
    if (data) {
      return res.json({ success: true });
    } else {
      return res.json({ success: false });
    }
  } catch (ex) {
    next(ex);
  }
};
module.exports.getMessages = async (req, res, next) => {
  try {
    const { from, to } = req.body;

    const messages = await Message.find({
      users: {
        $all: [from, to],
      },
    }).sort({ updatedAt: 1 });

    const projectedMessages = messages.map((msg) => {
      return {
        fromSelf: msg.sender.toString() === from,
        message: msg.message.text,
      };
    });
    return res.json({ success: true, messages: projectedMessages });
  } catch (ex) {
    next(ex);
  }
};

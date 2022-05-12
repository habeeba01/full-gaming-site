const Chat = require("../models/Chat");
const { StatusCodes } = require("http-status-codes");

const createChat = async (req, res) => {
   const { receiverId } = req.params;
   const existingConversations = await Chat.find({ members: { $in: [req.user.id] } });
   if (existingConversations) {
      //La méthode filter() crée et retourne un nouveau tableau contenant tous les éléments du tableau d'origine
      const doesExist = existingConversations.filter(chat =>
         chat.members.includes(receiverId)
      );
      if (doesExist.length) {
         res.status(StatusCodes.OK).json({ cid: doesExist[0]._id });
         return;
      }
   }
   const chat = await Chat.create({ members: [req.user.id, receiverId] });
   res.status(StatusCodes.CREATED).json({ cid: chat._id });
};
//display chat between 2 users
const getChats = async (req, res) => {
   const chat = await Chat.find({ members: { $in: [req.user.id] } });
   res.status(StatusCodes.OK).json({ chat });
};
//Module exports are the instructions that tell Node. js which bits of code (functions, objects, strings, etc.) to export from a given file so that other files are allowed to access the exported code.
module.exports = { createChat, getChats };
